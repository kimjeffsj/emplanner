import prisma from "./client";
import { getWeekSchedule } from "../google-sheets";
import { upsertWeekSchedule, cleanupOldWeeks, updateCurrentWeekFlag } from "./schedule";
import { getWeekStart, getThreeWeekRange } from "../date-utils";
import type { ScheduleEntry } from "@/types/schedule";

/**
 * 동기화 결과 타입
 */
export interface SyncResult {
  success: boolean;
  message: string;
  weeksProcessed: number;
  entriesSynced: number;
  weeksDeleted: number;
  durationMs: number;
}

/**
 * Google Sheets에서 현재 주 데이터를 DB로 동기화
 * Cron job에서 호출됨
 */
export async function syncCurrentWeekFromSheets(): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    // 양쪽 로케이션에서 스케줄 가져오기
    const [no3Schedule, westminsterSchedule] = await Promise.all([
      getWeekSchedule("No.3"),
      getWeekSchedule("Westminster"),
    ]);

    // 주차 정보 확인
    const weekStart = no3Schedule.weekStart || westminsterSchedule.weekStart;

    if (!weekStart) {
      return {
        success: false,
        message: "No week start date found in Google Sheets",
        weeksProcessed: 0,
        entriesSynced: 0,
        weeksDeleted: 0,
        durationMs: Date.now() - startTime,
      };
    }

    // 모든 엔트리 합치기
    const allEntries: ScheduleEntry[] = [
      ...no3Schedule.entries,
      ...westminsterSchedule.entries,
    ];

    // DB에 저장
    const result = await upsertWeekSchedule(weekStart, allEntries);

    // 현재 주 플래그 업데이트
    const currentWeekStart = getWeekStart(new Date());
    await updateCurrentWeekFlag(currentWeekStart);

    // 로그 기록
    await logSync("full", "success", `Synced week ${weekStart}`, result.entriesCount, Date.now() - startTime);

    return {
      success: true,
      message: `Successfully synced week ${weekStart}`,
      weeksProcessed: 1,
      entriesSynced: result.entriesCount,
      weeksDeleted: 0,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await logSync("full", "error", message, 0, Date.now() - startTime);

    return {
      success: false,
      message,
      weeksProcessed: 0,
      entriesSynced: 0,
      weeksDeleted: 0,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * 주간 동기화 (금요일 자정 Cron job)
 * - 현재 주 데이터 동기화
 * - 3주 이상 된 데이터 정리
 */
export async function weeklySync(): Promise<SyncResult> {
  const startTime = Date.now();
  let totalEntriesSynced = 0;
  let weeksProcessed = 0;

  try {
    // 1. 현재 주 데이터 동기화
    const syncResult = await syncCurrentWeekFromSheets();

    if (syncResult.success) {
      totalEntriesSynced += syncResult.entriesSynced;
      weeksProcessed += syncResult.weeksProcessed;
    }

    // 2. 오래된 주 정리 (3주 이상)
    const deletedCount = await cleanupOldWeeks(3);

    // 3. 현재 주 플래그 업데이트
    const currentWeekStart = getWeekStart(new Date());
    await updateCurrentWeekFlag(currentWeekStart);

    // 로그 기록
    await logSync(
      "full",
      "success",
      `Weekly sync completed. Synced: ${weeksProcessed} weeks, Deleted: ${deletedCount} old weeks`,
      totalEntriesSynced,
      Date.now() - startTime
    );

    return {
      success: true,
      message: `Weekly sync completed. Synced: ${weeksProcessed} weeks, Deleted: ${deletedCount} old weeks`,
      weeksProcessed,
      entriesSynced: totalEntriesSynced,
      weeksDeleted: deletedCount,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await logSync("full", "error", message, 0, Date.now() - startTime);

    return {
      success: false,
      message,
      weeksProcessed,
      entriesSynced: totalEntriesSynced,
      weeksDeleted: 0,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * 특정 주 데이터만 동기화 (수동 트리거용)
 * @param weekStart - 동기화할 주 시작일 (YYYY-MM-DD)
 */
export async function syncSpecificWeek(weekStart: string): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    // Google Sheets에서 데이터 가져오기
    const [no3Schedule, westminsterSchedule] = await Promise.all([
      getWeekSchedule("No.3"),
      getWeekSchedule("Westminster"),
    ]);

    // 시트의 주차가 요청된 주차와 일치하는지 확인
    const sheetWeekStart = no3Schedule.weekStart || westminsterSchedule.weekStart;

    if (sheetWeekStart !== weekStart) {
      return {
        success: false,
        message: `Sheet week (${sheetWeekStart}) does not match requested week (${weekStart})`,
        weeksProcessed: 0,
        entriesSynced: 0,
        weeksDeleted: 0,
        durationMs: Date.now() - startTime,
      };
    }

    // 모든 엔트리 합치기
    const allEntries: ScheduleEntry[] = [
      ...no3Schedule.entries,
      ...westminsterSchedule.entries,
    ];

    // DB에 저장
    const result = await upsertWeekSchedule(weekStart, allEntries);

    await logSync("incremental", "success", `Synced specific week ${weekStart}`, result.entriesCount, Date.now() - startTime);

    return {
      success: true,
      message: `Successfully synced week ${weekStart}`,
      weeksProcessed: 1,
      entriesSynced: result.entriesCount,
      weeksDeleted: 0,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await logSync("incremental", "error", message, 0, Date.now() - startTime);

    return {
      success: false,
      message,
      weeksProcessed: 0,
      entriesSynced: 0,
      weeksDeleted: 0,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * 동기화 로그 기록
 */
async function logSync(
  syncType: string,
  status: string,
  message: string,
  recordsSynced: number,
  durationMs: number
): Promise<void> {
  try {
    await prisma.syncLog.create({
      data: {
        syncType,
        status,
        message,
        recordsSynced,
        durationMs,
      },
    });
  } catch (error) {
    // 로그 실패는 무시 (메인 작업에 영향 주지 않음)
    console.error("Failed to log sync:", error);
  }
}

/**
 * 최근 동기화 로그 조회
 * @param limit - 조회할 로그 수
 */
export async function getRecentSyncLogs(limit: number = 10) {
  return prisma.syncLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

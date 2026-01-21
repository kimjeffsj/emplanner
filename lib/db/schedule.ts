import prisma from "./client";
import { WeekSchedule, ScheduleEntry, Location, ShiftType, TimeNote } from "@/types/schedule";
import { getWeekEnd } from "../date-utils";

/**
 * 특정 주의 스케줄 조회
 * @param weekStart - 주 시작일 (YYYY-MM-DD, 일요일)
 * @returns 양쪽 로케이션의 WeekSchedule 또는 null
 */
export async function getScheduleByWeek(weekStart: string): Promise<{
  no3Schedule: WeekSchedule;
  westminsterSchedule: WeekSchedule;
} | null> {
  const weekDate = new Date(weekStart);

  const week = await prisma.week.findUnique({
    where: { weekStart: weekDate },
    include: {
      entries: {
        orderBy: [{ date: "asc" }, { shift: "asc" }],
      },
    },
  });

  if (!week) {
    return null;
  }

  const weekEnd = getWeekEnd(new Date(weekStart));

  // 엔트리를 로케이션별로 분리
  const no3Entries = week.entries
    .filter((e) => e.location === "No.3")
    .map(dbEntryToScheduleEntry);

  const westminsterEntries = week.entries
    .filter((e) => e.location === "Westminster")
    .map(dbEntryToScheduleEntry);

  return {
    no3Schedule: {
      weekStart,
      weekEnd,
      location: "No.3",
      entries: no3Entries,
    },
    westminsterSchedule: {
      weekStart,
      weekEnd,
      location: "Westminster",
      entries: westminsterEntries,
    },
  };
}

/**
 * 특정 로케이션의 주간 스케줄 조회
 * @param weekStart - 주 시작일 (YYYY-MM-DD)
 * @param location - 로케이션 (No.3 또는 Westminster)
 */
export async function getWeekScheduleByLocation(
  weekStart: string,
  location: Location
): Promise<WeekSchedule | null> {
  const weekDate = new Date(weekStart);

  const week = await prisma.week.findUnique({
    where: { weekStart: weekDate },
    include: {
      entries: {
        where: { location },
        orderBy: [{ date: "asc" }, { shift: "asc" }],
      },
    },
  });

  if (!week) {
    return null;
  }

  const weekEnd = getWeekEnd(new Date(weekStart));

  return {
    weekStart,
    weekEnd,
    location,
    entries: week.entries.map(dbEntryToScheduleEntry),
  };
}

/**
 * 사용 가능한 모든 주차 목록 조회
 * @returns 주차 시작일 배열 (최신순)
 */
export async function getAvailableWeeks(): Promise<string[]> {
  const weeks = await prisma.week.findMany({
    select: { weekStart: true },
    orderBy: { weekStart: "desc" },
  });

  return weeks.map((w) => formatDateToString(w.weekStart));
}

/**
 * 주차 데이터 존재 여부 확인
 * @param weekStart - 주 시작일 (YYYY-MM-DD)
 */
export async function weekExists(weekStart: string): Promise<boolean> {
  const weekDate = new Date(weekStart);
  const count = await prisma.week.count({
    where: { weekStart: weekDate },
  });
  return count > 0;
}

/**
 * 새 주차 및 스케줄 엔트리 저장 (upsert)
 * @param weekStart - 주 시작일
 * @param entries - 스케줄 엔트리 배열
 */
export async function upsertWeekSchedule(
  weekStart: string,
  entries: ScheduleEntry[]
): Promise<{ weekId: number; entriesCount: number }> {
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(getWeekEnd(new Date(weekStart)));

  // 트랜잭션으로 처리
  const result = await prisma.$transaction(async (tx) => {
    // 주차 upsert
    const week = await tx.week.upsert({
      where: { weekStart: weekStartDate },
      update: {
        syncedAt: new Date(),
      },
      create: {
        weekStart: weekStartDate,
        weekEnd: weekEndDate,
        isCurrent: false,
      },
    });

    // 기존 엔트리 삭제
    await tx.scheduleEntry.deleteMany({
      where: { weekId: week.id },
    });

    // 새 엔트리 삽입
    if (entries.length > 0) {
      await tx.scheduleEntry.createMany({
        data: entries.map((entry) => ({
          weekId: week.id,
          employeeName: entry.name,
          date: new Date(entry.date),
          dayOfWeek: entry.dayOfWeek,
          shift: entry.shift,
          location: entry.location,
          noteType: entry.note?.type || null,
          noteTime: entry.note?.time || null,
        })),
      });
    }

    return { weekId: week.id, entriesCount: entries.length };
  });

  return result;
}

/**
 * 오래된 주차 데이터 삭제 (3주 이상)
 * @param keepWeeks - 유지할 주 수 (기본: 3)
 * @returns 삭제된 주차 수
 */
export async function cleanupOldWeeks(keepWeeks: number = 3): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - keepWeeks * 7);

  const result = await prisma.week.deleteMany({
    where: {
      weekStart: { lt: cutoffDate },
    },
  });

  return result.count;
}

/**
 * 현재 주 플래그 업데이트
 * @param currentWeekStart - 현재 주 시작일
 */
export async function updateCurrentWeekFlag(currentWeekStart: string): Promise<void> {
  const currentDate = new Date(currentWeekStart);

  await prisma.$transaction([
    // 모든 주의 is_current를 false로
    prisma.week.updateMany({
      data: { isCurrent: false },
    }),
    // 현재 주만 true로
    prisma.week.updateMany({
      where: { weekStart: currentDate },
      data: { isCurrent: true },
    }),
  ]);
}

// === Helper Functions ===

/**
 * DB 엔트리를 ScheduleEntry 타입으로 변환
 */
function dbEntryToScheduleEntry(entry: {
  employeeName: string;
  date: Date;
  dayOfWeek: string;
  shift: string;
  location: string;
  noteType: string | null;
  noteTime: string | null;
}): ScheduleEntry {
  const note: TimeNote | undefined =
    entry.noteType && entry.noteTime
      ? { type: entry.noteType as "until" | "from", time: entry.noteTime }
      : undefined;

  return {
    name: entry.employeeName,
    date: formatDateToString(entry.date),
    dayOfWeek: entry.dayOfWeek,
    shift: entry.shift as ShiftType,
    location: entry.location as Location,
    note,
  };
}

/**
 * Date 객체를 YYYY-MM-DD 문자열로 변환 (UTC 기준)
 * DB에서 가져온 날짜는 UTC 자정이므로 UTC 메서드 사용
 */
function formatDateToString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

import { NextRequest, NextResponse } from "next/server";
import { getScheduleByWeek } from "@/lib/db/schedule";
import { getWeekSchedule } from "@/lib/google-sheets";
import { isValidDateString, isSunday } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/schedule/[weekStart]
 * 특정 주의 스케줄 데이터 조회
 *
 * @param weekStart - 주 시작일 (YYYY-MM-DD, 일요일)
 * @returns 양쪽 로케이션의 스케줄 데이터
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weekStart: string }> }
) {
  try {
    const { weekStart } = await params;

    // 날짜 형식 검증
    if (!isValidDateString(weekStart)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // 일요일인지 확인
    if (!isSunday(weekStart)) {
      return NextResponse.json(
        { error: "Week start must be a Sunday" },
        { status: 400 }
      );
    }

    // DB에서 먼저 조회
    const dbSchedule = await getScheduleByWeek(weekStart);

    if (dbSchedule) {
      return NextResponse.json({
        source: "database",
        weekStart,
        weekEnd: dbSchedule.no3Schedule.weekEnd,
        no3Schedule: dbSchedule.no3Schedule,
        westminsterSchedule: dbSchedule.westminsterSchedule,
        syncedAt: dbSchedule.syncedAt?.toISOString() || null,
      });
    }

    // DB에 없으면 Google Sheets에서 직접 조회 (폴백)
    try {
      const [no3Schedule, westminsterSchedule] = await Promise.all([
        getWeekSchedule("No.3"),
        getWeekSchedule("Westminster"),
      ]);

      // 시트의 주차가 요청된 주차와 일치하는지 확인
      const sheetWeekStart = no3Schedule.weekStart || westminsterSchedule.weekStart;

      if (sheetWeekStart !== weekStart) {
        return NextResponse.json(
          { error: `Schedule not found for week ${weekStart}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        source: "sheets",
        weekStart,
        weekEnd: no3Schedule.weekEnd || westminsterSchedule.weekEnd,
        no3Schedule,
        westminsterSchedule,
        syncedAt: null,
      });
    } catch {
      return NextResponse.json(
        { error: `Schedule not found for week ${weekStart}` },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

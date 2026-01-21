import { NextResponse } from "next/server";
import { getAvailableWeeks } from "@/lib/db/schedule";
import { getWeekStart, getAdjacentWeeks } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/schedule/available-weeks
 * DB에 저장된 모든 주차 목록 조회
 *
 * @returns 사용 가능한 주차 시작일 배열
 */
export async function GET() {
  try {
    // DB에서 저장된 주차 조회
    const dbWeeks = await getAvailableWeeks();

    // 현재 주 정보
    const currentWeekStart = getWeekStart(new Date());
    const { previousWeek, nextWeek } = getAdjacentWeeks(currentWeekStart);

    return NextResponse.json({
      weeks: dbWeeks,
      currentWeek: currentWeekStart,
      weekRange: {
        previous: previousWeek,
        current: currentWeekStart,
        next: nextWeek,
      },
    });
  } catch (error) {
    console.error("Error fetching available weeks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

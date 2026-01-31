import { Suspense } from "react";
import { getAvailableWeeks, getScheduleByWeek } from "@/lib/db/schedule";
import { getWeekStart, getAppDate, getWeekEnd } from "@/lib/date-utils";
import ScheduleViewer from "@/components/ScheduleViewer";
import ThemeToggle from "@/components/ThemeToggle";

// ISR: 5분마다 revalidate (DB에서 조회, cron이 15분마다 동기화)
export const revalidate = 300;

export default async function Home() {
  // 현재 주 시작일 계산 (밴쿠버 시간대 기준)
  const currentWeekStart = getWeekStart(getAppDate());

  // DB에서 사용 가능한 주차 목록 조회
  let availableWeeks: string[] = [];
  try {
    availableWeeks = await getAvailableWeeks();
  } catch (error) {
    console.error("Failed to get available weeks from DB:", error);
  }

  // DB에서 스케줄 데이터 조회
  let no3Schedule, westminsterSchedule;
  let syncedAt: Date | null = null;

  // 현재 주 또는 가장 최근 주차 사용
  const targetWeek = availableWeeks.includes(currentWeekStart)
    ? currentWeekStart
    : availableWeeks[0] || currentWeekStart;

  try {
    const dbSchedule = await getScheduleByWeek(targetWeek);

    if (dbSchedule) {
      no3Schedule = dbSchedule.no3Schedule;
      westminsterSchedule = dbSchedule.westminsterSchedule;
      syncedAt = dbSchedule.syncedAt;
    } else {
      // DB에 데이터 없음 - 빈 스케줄
      no3Schedule = {
        weekStart: targetWeek,
        weekEnd: getWeekEnd(new Date(targetWeek)),
        location: "No.3" as const,
        entries: [],
      };
      westminsterSchedule = {
        weekStart: targetWeek,
        weekEnd: getWeekEnd(new Date(targetWeek)),
        location: "Westminster" as const,
        entries: [],
      };
    }
  } catch (error) {
    console.error("Failed to fetch from DB:", error);
    // 빈 스케줄로 초기화
    no3Schedule = {
      weekStart: targetWeek,
      weekEnd: getWeekEnd(new Date(targetWeek)),
      location: "No.3" as const,
      entries: [],
    };
    westminsterSchedule = {
      weekStart: targetWeek,
      weekEnd: getWeekEnd(new Date(targetWeek)),
      location: "Westminster" as const,
      entries: [],
    };
  }

  // availableWeeks가 비어있으면 현재 주 추가
  if (availableWeeks.length === 0) {
    availableWeeks = [currentWeekStart];
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Schedule
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Employee work schedule
            </p>
          </div>
          <ThemeToggle />
        </header>

        <Suspense fallback={<div className="loading">Loading...</div>}>
          <ScheduleViewer
            initialNo3Schedule={no3Schedule}
            initialWestminsterSchedule={westminsterSchedule}
            initialWeekStart={targetWeek}
            availableWeeks={availableWeeks}
            initialSyncedAt={syncedAt?.toISOString() || null}
          />
        </Suspense>
      </div>
    </main>
  );
}

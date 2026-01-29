import { Suspense } from "react";
import { getWeekSchedule } from "@/lib/google-sheets";
import { getAvailableWeeks } from "@/lib/db/schedule";
import { getWeekStart, getAppDate } from "@/lib/date-utils";
import ScheduleViewer from "@/components/ScheduleViewer";
import ThemeToggle from "@/components/ThemeToggle";

// ISR: 15분마다 revalidate (Google Sheets 실시간 반영)
export const revalidate = 900;

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

  // 스케줄 데이터 조회 (항상 Google Sheets에서 가져옴, 15분마다 revalidate)
  let no3Schedule, westminsterSchedule;
  let weekStart = currentWeekStart;

  try {
    [no3Schedule, westminsterSchedule] = await Promise.all([
      getWeekSchedule("No.3"),
      getWeekSchedule("Westminster"),
    ]);
    weekStart = no3Schedule.weekStart || westminsterSchedule.weekStart || currentWeekStart;

    // Sheets에서 가져온 주차를 availableWeeks에 추가 (없으면)
    if (weekStart && !availableWeeks.includes(weekStart)) {
      availableWeeks = [weekStart, ...availableWeeks];
    }
  } catch (error) {
    console.error("Failed to fetch from Google Sheets:", error);
    // 빈 스케줄로 초기화
    no3Schedule = {
      weekStart: currentWeekStart,
      weekEnd: "",
      location: "No.3" as const,
      entries: [],
    };
    westminsterSchedule = {
      weekStart: currentWeekStart,
      weekEnd: "",
      location: "Westminster" as const,
      entries: [],
    };
  }

  // availableWeeks가 비어있으면 현재 주 추가
  if (availableWeeks.length === 0) {
    availableWeeks = [weekStart];
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
            initialWeekStart={weekStart}
            availableWeeks={availableWeeks}
          />
        </Suspense>
      </div>
    </main>
  );
}

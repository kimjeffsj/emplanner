import { Suspense } from "react";
import {
  getEmployees,
  getWeekSchedule,
  getEmployeeSchedule,
} from "@/lib/google-sheets";
import ScheduleViewer from "@/components/ScheduleViewer";
import ThemeToggle from "@/components/ThemeToggle";
import { EmployeeWeekSchedule } from "@/types/schedule";

// ISR: 60초마다 revalidate
export const revalidate = 60;

export default async function Home() {
  // 오늘 날짜 (YYYY-MM-DD) - 로컬 시간 기준
  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // 데이터 fetching (Server Component에서 실행)
  const [employees, no3Schedule, westminsterSchedule] = await Promise.all([
    getEmployees(),
    getWeekSchedule("No.3"),
    getWeekSchedule("Westminster"),
  ]);

  // 각 직원의 개인 스케줄 미리 fetch (클라이언트에서 추가 요청 없이 즉시 표시)
  const employeeSchedulesArray = await Promise.all(
    employees.map((emp) => getEmployeeSchedule(emp.name))
  );

  // Record<string, EmployeeWeekSchedule> 형태로 변환
  const employeeSchedules: Record<string, EmployeeWeekSchedule> = {};
  employeeSchedulesArray.forEach((schedule) => {
    employeeSchedules[schedule.employeeName] = schedule;
  });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
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
            employees={employees}
            no3Schedule={no3Schedule}
            westminsterSchedule={westminsterSchedule}
            employeeSchedules={employeeSchedules}
            todayDate={todayDate}
          />
        </Suspense>
      </div>
    </main>
  );
}

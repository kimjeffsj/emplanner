import { Suspense } from "react";
import {
  getEmployees,
  getWeekSchedule,
  getEmployeeSchedule,
} from "@/lib/google-sheets";
import ScheduleViewer from "@/components/ScheduleViewer";
import { EmployeeWeekSchedule } from "@/types/schedule";

// ISR: 60초마다 revalidate
export const revalidate = 3600;

export default async function Home() {
  // 오늘 날짜 (YYYY-MM-DD)
  const todayDate = new Date().toISOString().split("T")[0];

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
    <main className="main-container">
      <header className="header">
        <h1 className="title">📅 Schedule Viewer</h1>
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
    </main>
  );
}

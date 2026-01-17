"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Location,
  WeekSchedule,
  EmployeeWeekSchedule,
  Employee,
} from "@/types/schedule";

const EmployeeSelector = dynamic(() => import("./EmployeeSelector"), {
  ssr: false,
  loading: () => (
    <div className="h-14 w-55 rounded-xl border bg-white dark:bg-gray-800 animate-pulse" />
  ),
});
import LocationTabs from "./LocationTabs";
import WeeklyGrid from "./WeeklyGrid";
import PersonalScheduleModal from "./PersonalScheduleModal";
// import WeekNavigation from "./WeekNavigation"; // 임시 비활성화 - Phase 5 추후 구현
import { Calendar } from "lucide-react";

interface ScheduleViewerProps {
  employees: Employee[];
  no3Schedule: WeekSchedule;
  westminsterSchedule: WeekSchedule;
  employeeSchedules: Record<string, EmployeeWeekSchedule>;
  todayDate: string;
}

export default function ScheduleViewer({
  employees,
  no3Schedule,
  westminsterSchedule,
  employeeSchedules,
  todayDate,
}: ScheduleViewerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL에서 초기값 읽기
  const initialEmployee = searchParams.get("employee");

  // 상태 관리: 선택된 직원 (null = 전체 보기, 하이라이트 용)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
    initialEmployee && employees.some((e) => e.name === initialEmployee)
      ? initialEmployee
      : null
  );

  // 상태 관리: 선택된 탭 (기본: No.3)
  const [selectedLocation, setSelectedLocation] = useState<Location>("No.3");

  // 상태 관리: 모달 (이름 클릭 시 열림)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] = useState<string | null>(null);

  // 직원 이름 목록 추출
  const employeeNames = employees.map((e) => e.name);

  // 현재 선택된 로케이션의 스케줄
  const currentSchedule =
    selectedLocation === "No.3" ? no3Schedule : westminsterSchedule;

  // 모달용 개인 스케줄
  const modalSchedule = modalEmployee ? employeeSchedules[modalEmployee] : null;

  // 직원 선택 변경 시 URL 업데이트 (드롭다운에서 선택)
  const handleEmployeeChange = (employee: string | null) => {
    setSelectedEmployee(employee);

    // URL 쿼리 파라미터 업데이트
    if (employee) {
      router.replace(`?employee=${encodeURIComponent(employee)}`, {
        scroll: false,
      });
    } else {
      router.replace("/", { scroll: false });
    }
  };

  // 그리드에서 직원 이름 클릭 시 모달 열기
  const handleEmployeeClick = (employeeName: string) => {
    setModalEmployee(employeeName);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalEmployee(null);
  };

  // URL 파라미터 변경 감지 (브라우저 뒤로/앞으로 버튼)
  useEffect(() => {
    const employeeFromUrl = searchParams.get("employee");
    if (employeeFromUrl && employees.some((e) => e.name === employeeFromUrl)) {
      setSelectedEmployee(employeeFromUrl);
    } else if (!employeeFromUrl) {
      setSelectedEmployee(null);
    }
  }, [searchParams, employees]);

  // 주간 날짜 범위 계산
  const weekStart =
    currentSchedule.weekStart || new Date().toISOString().split("T")[0];

  const getWeekRange = (): string => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="schedule-viewer">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <EmployeeSelector
          employees={employeeNames}
          selectedEmployee={selectedEmployee}
          onChange={handleEmployeeChange}
        />
        {/* 주간 이동 임시 비활성화 - 날짜 범위만 표시 */}
        {/* <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getWeekRange()}
          </span>
        </div> */}
      </div>

      {/* 로케이션 탭 + 주간 그리드 (선택된 직원 하이라이트) */}
      <LocationTabs
        selectedLocation={selectedLocation}
        onChange={setSelectedLocation}
      />
      <WeeklyGrid
        schedule={currentSchedule}
        todayDate={todayDate}
        selectedEmployee={selectedEmployee}
        onEmployeeClick={handleEmployeeClick}
      />

      {/* PersonalSchedule 모달 */}
      <PersonalScheduleModal
        schedule={modalSchedule}
        todayDate={todayDate}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Location,
  WeekSchedule,
  EmployeeWeekSchedule,
} from "@/types/schedule";

const EmployeeSearchBar = dynamic(() => import("./EmployeeSearchBar"), {
  ssr: false,
  loading: () => (
    <div className="h-14 w-55 rounded-xl border bg-white dark:bg-gray-800 animate-pulse" />
  ),
});
import LocationTabs from "./LocationTabs";
import WeeklyGrid from "./WeeklyGrid";
import PersonalScheduleModal from "./PersonalScheduleModal";

interface ScheduleViewerProps {
  no3Schedule: WeekSchedule;
  westminsterSchedule: WeekSchedule;
  todayDate: string;
}

export default function ScheduleViewer({
  no3Schedule,
  westminsterSchedule,
  todayDate,
}: ScheduleViewerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 두 스케줄에서 직원 이름 추출 (중복 제거, 알파벳 순)
  const employeeNames = useMemo(() => {
    const namesSet = new Set<string>();
    no3Schedule.entries.forEach((entry) => namesSet.add(entry.name));
    westminsterSchedule.entries.forEach((entry) => namesSet.add(entry.name));
    return Array.from(namesSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }, [no3Schedule.entries, westminsterSchedule.entries]);

  // URL에서 초기값 읽기
  const initialEmployee = searchParams.get("employee");

  // 상태 관리: 선택된 직원 (null = 전체 보기, 필터링 용)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
    initialEmployee && employeeNames.includes(initialEmployee)
      ? initialEmployee
      : null
  );

  // 상태 관리: 선택된 탭 (기본: No.3)
  const [selectedLocation, setSelectedLocation] = useState<Location>("No.3");

  // 상태 관리: 모달 (이름 클릭 시 열림)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] = useState<string | null>(null);

  // 현재 선택된 로케이션의 스케줄
  const currentSchedule =
    selectedLocation === "No.3" ? no3Schedule : westminsterSchedule;

  // 모달용 개인 스케줄 생성 함수 (클라이언트 사이드에서 필터링)
  const createEmployeeSchedule = (
    employeeName: string
  ): EmployeeWeekSchedule => {
    const no3Entries = no3Schedule.entries.filter(
      (entry) => entry.name === employeeName
    );
    const westminsterEntries = westminsterSchedule.entries.filter(
      (entry) => entry.name === employeeName
    );

    const schedules = [];

    if (no3Entries.length > 0) {
      schedules.push({
        location: "No.3" as Location,
        entries: no3Entries,
      });
    }

    if (westminsterEntries.length > 0) {
      schedules.push({
        location: "Westminster" as Location,
        entries: westminsterEntries,
      });
    }

    return {
      employeeName,
      weekStart: no3Schedule.weekStart || westminsterSchedule.weekStart,
      weekEnd: no3Schedule.weekEnd || westminsterSchedule.weekEnd,
      schedules,
    };
  };

  // 모달용 개인 스케줄
  const modalSchedule = modalEmployee
    ? createEmployeeSchedule(modalEmployee)
    : null;

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
    if (employeeFromUrl && employeeNames.includes(employeeFromUrl)) {
      setSelectedEmployee(employeeFromUrl);
    } else if (!employeeFromUrl) {
      setSelectedEmployee(null);
    }
  }, [searchParams, employeeNames]);

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
      {/* Controls Bar: 로케이션 탭 (좌측) + 직원 드롭다운 (우측) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <LocationTabs
          selectedLocation={selectedLocation}
          onChange={setSelectedLocation}
        />
        <EmployeeSearchBar
          employees={employeeNames}
          selectedEmployee={selectedEmployee}
          onChange={handleEmployeeChange}
        />
      </div>

      {/* 주간 그리드 (선택된 직원 하이라이트) */}
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

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Location,
  WeekSchedule,
  EmployeeWeekSchedule,
} from "@/types/schedule";
import { getTodayDate } from "./TodayHighlight";
import WeekNavigation from "./WeekNavigation";

const EmployeeSearchBar = dynamic(() => import("./EmployeeSearchBar"), {
  ssr: false,
  loading: () => (
    <div className="h-14 w-55 rounded-xl border bg-white dark:bg-gray-800 animate-pulse" />
  ),
});
import LocationTabs from "./LocationTabs";
import WeeklyGrid from "./WeeklyGrid";
import PersonalScheduleModal from "./PersonalScheduleModal";
import ScheduleSkeleton from "./ScheduleSkeleton";

interface ScheduleViewerProps {
  initialNo3Schedule: WeekSchedule;
  initialWestminsterSchedule: WeekSchedule;
  initialWeekStart: string;
  availableWeeks: string[];
}

export default function ScheduleViewer({
  initialNo3Schedule,
  initialWestminsterSchedule,
  initialWeekStart,
  availableWeeks,
}: ScheduleViewerProps) {
  // 클라이언트에서 오늘 날짜 계산 (사용자 로컬 타임존 기준)
  const todayDate = getTodayDate();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 주간 스케줄 상태
  const [currentWeekStart, setCurrentWeekStart] = useState(initialWeekStart);
  const [no3Schedule, setNo3Schedule] = useState(initialNo3Schedule);
  const [westminsterSchedule, setWestminsterSchedule] = useState(initialWestminsterSchedule);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);

  // 무한 루프 방지를 위한 ref
  const isNavigatingRef = useRef(false);
  const currentWeekRef = useRef(currentWeekStart); // 현재 주차 추적용 ref

  // currentWeekStart 변경 시 ref도 업데이트
  useEffect(() => {
    currentWeekRef.current = currentWeekStart;
  }, [currentWeekStart]);

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

  // 주간 네비게이션 가능 여부 계산
  const canNavigatePrevious = useMemo(() => {
    const currentIndex = availableWeeks.indexOf(currentWeekStart);
    return currentIndex < availableWeeks.length - 1; // 배열이 최신순이므로
  }, [currentWeekStart, availableWeeks]);

  const canNavigateNext = useMemo(() => {
    const currentIndex = availableWeeks.indexOf(currentWeekStart);
    return currentIndex > 0; // 배열이 최신순이므로
  }, [currentWeekStart, availableWeeks]);

  // 주간 변경 핸들러 (currentWeekStart 의존성 제거하여 무한 루프 방지)
  const handleWeekChange = useCallback(async (newWeekStart: string) => {
    if (!availableWeeks.includes(newWeekStart)) return;
    if (isNavigatingRef.current) return; // 이미 네비게이션 중이면 무시

    isNavigatingRef.current = true;
    setIsLoadingWeek(true);
    try {
      const response = await fetch(`/api/schedule/${newWeekStart}`);
      if (!response.ok) {
        throw new Error("Failed to fetch schedule");
      }
      const data = await response.json();

      setNo3Schedule(data.no3Schedule);
      setWestminsterSchedule(data.westminsterSchedule);
      setCurrentWeekStart(newWeekStart);

      // URL 업데이트 (week 파라미터 추가)
      const params = new URLSearchParams(searchParams.toString());
      params.set("week", newWeekStart);
      router.replace(`?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    } finally {
      setIsLoadingWeek(false);
      // 약간의 딜레이 후 플래그 해제 (URL 변경 이벤트가 처리된 후)
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }
  }, [availableWeeks, searchParams, router]);

  // 이전 주로 이동 (ref 사용하여 의존성 최소화)
  const handlePreviousWeek = useCallback(() => {
    const currentIndex = availableWeeks.indexOf(currentWeekRef.current);
    if (currentIndex < availableWeeks.length - 1) {
      handleWeekChange(availableWeeks[currentIndex + 1]);
    }
  }, [availableWeeks, handleWeekChange]);

  // 다음 주로 이동 (ref 사용하여 의존성 최소화)
  const handleNextWeek = useCallback(() => {
    const currentIndex = availableWeeks.indexOf(currentWeekRef.current);
    if (currentIndex > 0) {
      handleWeekChange(availableWeeks[currentIndex - 1]);
    }
  }, [availableWeeks, handleWeekChange]);

  // 각 로케이션별 필터된 스케줄 개수 계산 (선택된 직원이 있을 때만)
  const locationCounts = useMemo(() => {
    if (!selectedEmployee) return undefined;
    return {
      "No.3": no3Schedule.entries.filter(
        (entry) => entry.name === selectedEmployee
      ).length,
      Westminster: westminsterSchedule.entries.filter(
        (entry) => entry.name === selectedEmployee
      ).length,
    } as Record<Location, number>;
  }, [no3Schedule.entries, westminsterSchedule.entries, selectedEmployee]);

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
    const params = new URLSearchParams(searchParams.toString());
    if (employee) {
      params.set("employee", employee);
    } else {
      params.delete("employee");
    }

    if (currentWeekStart !== initialWeekStart) {
      params.set("week", currentWeekStart);
    }

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : "/", { scroll: false });
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

  // 주간 URL 파라미터 변경 감지 (별도 effect로 분리하여 무한 루프 방지)
  useEffect(() => {
    // 네비게이션 중이면 무시 (버튼 클릭으로 인한 URL 변경)
    if (isNavigatingRef.current) return;

    const weekFromUrl = searchParams.get("week");
    if (weekFromUrl && availableWeeks.includes(weekFromUrl) && weekFromUrl !== currentWeekStart) {
      handleWeekChange(weekFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, availableWeeks]); // currentWeekStart, handleWeekChange 제외하여 무한 루프 방지

  return (
    <div className="schedule-viewer">
      {/* Controls Bar: 로케이션 탭 (좌측) + 주간 네비게이션 (중앙) + 직원 검색 (우측) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        <LocationTabs
          selectedLocation={selectedLocation}
          onChange={setSelectedLocation}
          counts={locationCounts}
        />
        <WeekNavigation
          weekStart={currentWeekStart}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          canNavigatePrevious={canNavigatePrevious}
          canNavigateNext={canNavigateNext}
          isLoading={isLoadingWeek}
        />
        <EmployeeSearchBar
          employees={employeeNames}
          selectedEmployee={selectedEmployee}
          onChange={handleEmployeeChange}
        />
      </div>

      {/* 주간 그리드 (선택된 직원 하이라이트) */}
      {isLoadingWeek ? (
        <ScheduleSkeleton variant="grid" />
      ) : (
        <WeeklyGrid
          schedule={currentSchedule}
          todayDate={todayDate}
          selectedEmployee={selectedEmployee}
          onEmployeeClick={handleEmployeeClick}
        />
      )}

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

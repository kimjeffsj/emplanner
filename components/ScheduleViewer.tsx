// components/ScheduleViewer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Location, WeekSchedule, EmployeeWeekSchedule, Employee } from '@/types/schedule';
import EmployeeSelector from './EmployeeSelector';
import LocationTabs from './LocationTabs';
import WeeklyGrid from './WeeklyGrid';
import PersonalSchedule from './PersonalSchedule';

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
  const initialEmployee = searchParams.get('employee');

  // 상태 관리: 선택된 직원 (null = 전체 보기)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
    initialEmployee && employees.some((e) => e.name === initialEmployee)
      ? initialEmployee
      : null
  );

  // 상태 관리: 선택된 탭 (기본: No.3)
  const [selectedLocation, setSelectedLocation] = useState<Location>('No.3');

  // 직원 이름 목록 추출
  const employeeNames = employees.map((e) => e.name);

  // 현재 선택된 로케이션의 스케줄
  const currentSchedule = selectedLocation === 'No.3' ? no3Schedule : westminsterSchedule;

  // 선택된 직원의 개인 스케줄
  const personalSchedule = selectedEmployee ? employeeSchedules[selectedEmployee] : null;

  // 직원 선택 변경 시 URL 업데이트
  const handleEmployeeChange = (employee: string | null) => {
    setSelectedEmployee(employee);

    // URL 쿼리 파라미터 업데이트
    if (employee) {
      router.replace(`?employee=${encodeURIComponent(employee)}`, { scroll: false });
    } else {
      router.replace('/', { scroll: false });
    }
  };

  // URL 파라미터 변경 감지 (브라우저 뒤로/앞으로 버튼)
  useEffect(() => {
    const employeeFromUrl = searchParams.get('employee');
    if (employeeFromUrl && employees.some((e) => e.name === employeeFromUrl)) {
      setSelectedEmployee(employeeFromUrl);
    } else if (!employeeFromUrl) {
      setSelectedEmployee(null);
    }
  }, [searchParams, employees]);

  return (
    <div className="schedule-viewer">
      {/* 직원 선택 드롭다운 */}
      <div className="selector-container">
        <EmployeeSelector
          employees={employeeNames}
          selectedEmployee={selectedEmployee}
          onChange={handleEmployeeChange}
        />
      </div>

      {/* 조건부 렌더링: 전체 보기 vs 개인 스케줄 */}
      {selectedEmployee === null ? (
        // 전체 보기: 로케이션 탭 + 주간 그리드
        <>
          <LocationTabs
            selectedLocation={selectedLocation}
            onChange={setSelectedLocation}
          />
          <WeeklyGrid schedule={currentSchedule} todayDate={todayDate} />
        </>
      ) : (
        // 개인 스케줄: PersonalSchedule 컴포넌트
        personalSchedule && (
          <PersonalSchedule schedule={personalSchedule} todayDate={todayDate} />
        )
      )}
    </div>
  );
}

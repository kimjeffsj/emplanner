/**
 * 시프트 타입 정의
 * - '*': All day (8시간 풀타임)
 * - '11:00': 오전 시프트
 * - '15:30': 오후 시프트
 */
export type ShiftType = "*" | "11:00" | "15:30";

/**
 * 로케이션 타입
 * - 'No.3': No.3 지점
 * - 'Westminster': Westminster 지점
 */
export type Location = "No.3" | "Westminster";

/**
 * 근무 시간 비고 (until/from)
 * @example
 * { type: "until", time: "17:00" } // ~17:00까지 근무
 * { type: "from", time: "17:30" }  // 17:30부터 근무
 */
export interface TimeNote {
  type: "until" | "from";
  time: string; // "HH:MM" format
}

/**
 * 개별 스케줄 엔트리
 * 한 명의 직원이 특정 날짜/시프트에 일하는 정보
 */
export interface ScheduleEntry {
  name: string; // 직원 이름
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Sunday, Monday, ...
  shift: ShiftType; // *, 11:00, 15:30
  location: Location; // No3 또는 Westminster
  note?: TimeNote; // until/from 비고 (optional)
}

/**
 * 한 주(일~토)의 특정 로케이션 스케줄
 */
export interface WeekSchedule {
  weekStart: string; // YYYY-MM-DD (Sunday)
  weekEnd: string; // YYYY-MM-DD (Saturday)
  location: Location;
  entries: ScheduleEntry[];
}

/**
 * 특정 직원의 한 주 스케줄 (양쪽 로케이션 포함)
 */
export interface EmployeeWeekSchedule {
  employeeName: string;
  weekStart: string; // YYYY-MM-DD (Sunday)
  weekEnd: string; // YYYY-MM-DD (Saturday)
  schedules: {
    location: Location;
    entries: ScheduleEntry[];
  }[];
}

/**
 * 직원 정보
 */
export interface Employee {
  name: string;
}

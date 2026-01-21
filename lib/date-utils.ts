/**
 * 주차 계산 유틸리티 함수
 * 일요일을 주의 시작으로 사용
 */

/**
 * 주어진 날짜가 속한 주의 일요일 날짜를 반환
 * @param date - 기준 날짜
 * @returns YYYY-MM-DD 형식의 일요일 날짜
 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return formatDate(d);
}

/**
 * 주어진 날짜가 속한 주의 토요일 날짜를 반환
 * @param date - 기준 날짜
 * @returns YYYY-MM-DD 형식의 토요일 날짜
 */
export function getWeekEnd(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() + (6 - day));
  return formatDate(d);
}

/**
 * 주어진 주차 시작일 기준으로 이전/다음 주 시작일을 반환
 * @param weekStart - 기준 주 시작일 (YYYY-MM-DD)
 * @returns 이전 주, 다음 주 시작일
 */
export function getAdjacentWeeks(weekStart: string): {
  previousWeek: string;
  nextWeek: string;
} {
  const current = new Date(weekStart);

  const previous = new Date(current);
  previous.setDate(previous.getDate() - 7);

  const next = new Date(current);
  next.setDate(next.getDate() + 7);

  return {
    previousWeek: formatDate(previous),
    nextWeek: formatDate(next),
  };
}

/**
 * 현재 날짜 기준 3주 범위 (이전주, 현재주, 다음주) 반환
 * @param today - 기준 날짜 (기본: 오늘)
 * @returns 3주의 시작일 배열
 */
export function getThreeWeekRange(today: Date = new Date()): string[] {
  const currentWeekStart = getWeekStart(today);
  const { previousWeek, nextWeek } = getAdjacentWeeks(currentWeekStart);

  return [previousWeek, currentWeekStart, nextWeek];
}

/**
 * Date 객체를 YYYY-MM-DD 문자열로 변환
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM-DD 형식 문자열
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 문자열을 Date 객체로 변환
 * @param dateString - YYYY-MM-DD 형식 문자열
 * @returns Date 객체
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00");
}

/**
 * 주어진 날짜가 유효한 YYYY-MM-DD 형식인지 확인
 * @param dateString - 검증할 문자열
 * @returns 유효 여부
 */
export function isValidDateString(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * 주어진 날짜가 일요일인지 확인
 * @param dateString - YYYY-MM-DD 형식 문자열
 * @returns 일요일 여부
 */
export function isSunday(dateString: string): boolean {
  const date = parseDate(dateString);
  return date.getDay() === 0;
}

/**
 * 두 날짜 사이의 주 수 계산
 * @param date1 - 첫 번째 날짜 (YYYY-MM-DD)
 * @param date2 - 두 번째 날짜 (YYYY-MM-DD)
 * @returns 주 수 (음수 가능)
 */
export function getWeekDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

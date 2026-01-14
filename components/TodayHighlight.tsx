'use client';

import { useMemo } from 'react';

interface TodayHighlightProps {
  children: (todayDate: string) => React.ReactNode;
}

/**
 * TodayHighlight - 오늘 날짜를 감지하여 자식 컴포넌트에 전달
 *
 * 사용법:
 * <TodayHighlight>
 *   {(todayDate) => <WeeklyGrid schedule={schedule} todayDate={todayDate} />}
 * </TodayHighlight>
 */
export default function TodayHighlight({ children }: TodayHighlightProps) {
  const todayDate = useMemo(() => getTodayDate(), []);

  return <>{children(todayDate)}</>;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 주어진 날짜가 오늘인지 확인
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDate();
}

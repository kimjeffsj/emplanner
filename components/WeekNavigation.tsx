"use client";

import { ChevronLeft, ChevronRight, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekNavigationProps {
  weekStart: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  canNavigatePrevious?: boolean;
  canNavigateNext?: boolean;
  isLoading?: boolean;
  hasWeekMismatch?: boolean;
}

export default function WeekNavigation({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  canNavigatePrevious = true,
  canNavigateNext = true,
  isLoading = false,
  hasWeekMismatch = false,
}: WeekNavigationProps) {
  const getWeekRange = () => {
    // UTC 대신 로컬 시간으로 파싱하기 위해 T00:00:00 추가
    const startDate = new Date(weekStart + "T00:00:00");
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const formatDate = (date: Date) => {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 shadow-sm">
      <button
        onClick={onPreviousWeek}
        disabled={!canNavigatePrevious || isLoading}
        className={cn(
          "p-2 rounded-lg transition-all",
          canNavigatePrevious && !isLoading
            ? "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            : "opacity-40 cursor-not-allowed"
        )}
        aria-label="이전 주"
      >
        <ChevronLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      </button>

      <div className="flex items-center gap-2 px-3 min-w-[180px] justify-center">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
        ) : hasWeekMismatch ? (
          <span title="두 매장의 스케줄 주차가 다릅니다">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </span>
        ) : (
          <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        )}
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
          {getWeekRange()}
        </span>
      </div>

      <button
        onClick={onNextWeek}
        disabled={!canNavigateNext || isLoading}
        className={cn(
          "p-2 rounded-lg transition-all",
          canNavigateNext && !isLoading
            ? "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            : "opacity-40 cursor-not-allowed"
        )}
        aria-label="다음 주"
      >
        <ChevronRight className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      </button>
    </div>
  );
}

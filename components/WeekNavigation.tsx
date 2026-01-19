"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface WeekNavigationProps {
  weekStart: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export default function WeekNavigation({
  weekStart,
  onPreviousWeek,
  onNextWeek,
}: WeekNavigationProps) {
  const getWeekRange = () => {
    const startDate = new Date(weekStart);
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
        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        aria-label="이전 주"
      >
        <ChevronLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      </button>

      <div className="flex items-center gap-2 px-3">
        <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
          {getWeekRange()}
        </span>
      </div>

      <button
        onClick={onNextWeek}
        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        aria-label="다음 주"
      >
        <ChevronRight className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      </button>
    </div>
  );
}

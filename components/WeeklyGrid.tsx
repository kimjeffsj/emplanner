"use client";

import {
  WeekSchedule,
  ScheduleEntry,
  ShiftType,
  TimeNote,
} from "@/types/schedule";
import { cn } from "@/lib/utils";

interface WeeklyGridProps {
  schedule: WeekSchedule;
  todayDate?: string;
  selectedEmployee?: string | null;
  onEmployeeClick?: (employeeName: string) => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHIFTS: { type: ShiftType; label: string }[] = [
  { type: "*", label: "All day" },
  { type: "11:00", label: "11:00~" },
  { type: "15:30", label: "15:30~" },
];

// Sub-row interface for grouping entries by "from" time
interface SubRow {
  fromTime: string | null; // null = main row (no "from" note)
  label: string; // "15:30~" or "17:00~"
  isSubRow: boolean;
}

export default function WeeklyGrid({
  schedule,
  todayDate,
  selectedEmployee,
  onEmployeeClick,
}: WeeklyGridProps) {
  // Generate array of 7 dates for the week
  const weekDates = generateWeekDates(schedule.weekStart);

  // Format date string to MM/DD
  const formatDate = (dateStr: string): string => {
    const [, month, day] = dateStr.split("-");
    return `${month}/${day}`;
  };

  // Format note string
  const formatNote = (note: TimeNote): string => {
    if (note.type === "until") return `~${note.time}`;
    if (note.type === "from") return `${note.time}~`;
    return note.time;
  };

  // Check if a date matches today
  const isToday = (date: string): boolean => {
    return todayDate === date;
  };

  // Check if employee should be highlighted
  const shouldHighlight = (employeeName: string): boolean => {
    return selectedEmployee !== null && selectedEmployee === employeeName;
  };

  // Handle employee name click
  const handleEmployeeClick = (employeeName: string) => {
    if (onEmployeeClick) {
      onEmployeeClick(employeeName);
    }
  };

  return (
    <div
      className="weekly-grid w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
      role="region"
      aria-label="주간 스케줄 표"
    >
      {/* Scrollable inner container with minimum width for mobile */}
      <div
        className="min-w-[840px] sm:min-w-0 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600"
        role="table"
        aria-label="주간 근무 스케줄"
      >
        {/* Header row with days and dates */}
        <div
          className="grid grid-cols-8 border-b border-gray-300 dark:border-gray-600"
          role="row"
        >
          {/* Empty corner cell */}
          <div
            className="bg-gray-50 dark:bg-gray-800 p-3 border-r border-gray-200 dark:border-gray-700"
            role="columnheader"
            aria-label="시프트 유형"
          />
          {weekDates.map((date, index) => (
            <div
              key={date}
              role="columnheader"
              aria-label={`${DAYS[index]} ${formatDate(date)}${isToday(date) ? " (오늘)" : ""}`}
              className={cn(
                "flex flex-col items-center p-3 text-center transition-colors",
                "border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                isToday(date)
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              )}
            >
              <span className="font-semibold text-sm">{DAYS[index]}</span>
              <span
                className={cn(
                  "text-xs",
                  isToday(date)
                    ? "text-gray-300 dark:text-gray-600"
                    : "text-gray-500 dark:text-gray-400"
                )}
              >
                {formatDate(date)}
              </span>
            </div>
          ))}
        </div>

        {/* Rows for each shift type */}
        {SHIFTS.map((shift, shiftIndex) => {
          const subRows = buildSubRows(
            schedule.entries,
            shift.type,
            shift.label
          );

          return subRows.map((subRow, subRowIndex) => {
            const isLastSubRow = subRowIndex === subRows.length - 1;
            const isLastShift = shiftIndex === SHIFTS.length - 1;

            return (
              <div
                key={`${shift.type}-${subRow.fromTime ?? "main"}`}
                className={cn(
                  "grid grid-cols-8",
                  // Border between sub-rows
                  subRow.isSubRow && "border-t border-gray-200 dark:border-gray-700",
                  // Border between shifts (only after last sub-row of non-last shift)
                  isLastSubRow &&
                    !isLastShift &&
                    "border-b border-gray-300 dark:border-gray-600"
                )}
                role="row"
                aria-label={
                  subRow.isSubRow
                    ? `${shift.label} 시프트, ${subRow.label}부터 시작`
                    : `${shift.label} 시프트`
                }
              >
                {/* Shift/Sub-row label cell */}
                <div
                  className={cn(
                    "flex items-center justify-center border-r border-gray-200 dark:border-gray-700",
                    subRow.isSubRow
                      ? "bg-gray-100 dark:bg-gray-800 p-2 text-sm text-gray-500 dark:text-gray-400"
                      : "bg-gray-50 dark:bg-gray-800 font-medium text-sm p-3 text-gray-700 dark:text-gray-300"
                  )}
                  role="rowheader"
                >
                  {subRow.label}
                </div>

                {/* Day cells */}
                {weekDates.map((date, dayIndex) => {
                  const entries = getEntriesForSubRow(
                    schedule.entries,
                    date,
                    shift.type,
                    subRow.fromTime
                  );
                  const cellLabel =
                    entries.length > 0
                      ? `${DAYS[dayIndex]} ${subRow.label}: ${entries.map((e) => e.name).join(", ")}`
                      : `${DAYS[dayIndex]} ${subRow.label}: 근무자 없음`;
                  const today = isToday(date);

                  return (
                    <div
                      key={`${date}-${shift.type}-${subRow.fromTime ?? "main"}`}
                      role="cell"
                      aria-label={cellLabel}
                      className={cn(
                        "p-3 transition-colors",
                        "border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                        subRow.isSubRow ? "min-h-[60px]" : "min-h-[80px]",
                        today
                          ? subRow.isSubRow
                            ? "bg-gray-700 dark:bg-gray-300"
                            : "bg-gray-800 dark:bg-gray-200"
                          : subRow.isSubRow
                            ? "bg-gray-50 dark:bg-gray-850"
                            : "bg-white dark:bg-gray-900"
                      )}
                    >
                      <div className="flex flex-col gap-1.5">
                        {entries.map((entry, idx) => {
                          const highlighted = shouldHighlight(entry.name);
                          // Show note only for "until" type (from is shown in row label)
                          const showNote = entry.note?.type === "until";

                          return (
                            <button
                              key={`${entry.name}-${idx}`}
                              onClick={() => handleEmployeeClick(entry.name)}
                              className={cn(
                                "employee-badge flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap",
                                "hover:shadow-md active:scale-95",
                                highlighted
                                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md scale-105"
                                  : today
                                    ? "bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 hover:bg-gray-500 dark:hover:bg-gray-500"
                                    : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                              )}
                              aria-label={`${entry.name} 클릭하여 상세 스케줄 보기`}
                              aria-pressed={highlighted}
                            >
                              <span>{entry.name}</span>
                              {showNote && entry.note && (
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "dot-indicator",
                                      "dot-afternoon"
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "text-xs font-mono",
                                      highlighted || today
                                        ? "text-gray-300 dark:text-gray-600"
                                        : "text-gray-500 dark:text-gray-400"
                                    )}
                                  >
                                    {formatNote(entry.note)}
                                  </span>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}

// Helper: Generate 7 dates starting from weekStart
function generateWeekDates(weekStart: string): string[] {
  let startDate: Date;

  if (!weekStart || weekStart.trim() === "") {
    const today = new Date();
    startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());
  } else {
    startDate = new Date(weekStart);
    if (isNaN(startDate.getTime())) {
      const today = new Date();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
    }
  }

  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}

// Helper: Get unique "from" times for a shift across all entries
function getFromTimesForShift(
  entries: ScheduleEntry[],
  shiftType: ShiftType
): string[] {
  const fromTimes = new Set<string>();

  entries.forEach((entry) => {
    if (entry.shift === shiftType && entry.note?.type === "from") {
      fromTimes.add(entry.note.time);
    }
  });

  return Array.from(fromTimes).sort();
}

// Helper: Build sub-rows for a shift (main row + from time sub-rows)
function buildSubRows(
  entries: ScheduleEntry[],
  shiftType: ShiftType,
  shiftLabel: string
): SubRow[] {
  const fromTimes = getFromTimesForShift(entries, shiftType);

  const subRows: SubRow[] = [
    { fromTime: null, label: shiftLabel, isSubRow: false },
  ];

  fromTimes.forEach((time) => {
    subRows.push({ fromTime: time, label: `${time}~`, isSubRow: true });
  });

  return subRows;
}

// Helper: Get entries for a specific sub-row
function getEntriesForSubRow(
  entries: ScheduleEntry[],
  date: string,
  shiftType: ShiftType,
  fromTime: string | null
): ScheduleEntry[] {
  return entries.filter((entry) => {
    if (entry.date !== date || entry.shift !== shiftType) return false;

    if (fromTime === null) {
      // Main row: entries without "from" note
      return entry.note?.type !== "from";
    } else {
      // Sub-row: entries with matching "from" time
      return entry.note?.type === "from" && entry.note.time === fromTime;
    }
  });
}

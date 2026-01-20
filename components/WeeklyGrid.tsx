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

interface SubRow {
  fromTime: string | null;
  label: string;
  isSubRow: boolean;
}

export default function WeeklyGrid({
  schedule,
  todayDate,
  selectedEmployee,
  onEmployeeClick,
}: WeeklyGridProps) {
  const weekDates = generateWeekDates(schedule.weekStart);

  const formatDate = (dateStr: string): string => {
    const [, month, day] = dateStr.split("-");
    return `${month}/${day}`;
  };

  const formatNote = (note: TimeNote): string => {
    if (note.type === "until") return `~${note.time}`;
    if (note.type === "from") return `${note.time}~`;
    return note.time;
  };

  const isToday = (date: string): boolean => todayDate === date;

  // Filter entries based on selected employee
  const filterEntriesByEmployee = (entries: ScheduleEntry[]): ScheduleEntry[] => {
    if (!selectedEmployee) return entries;
    return entries.filter((entry) => entry.name === selectedEmployee);
  };

  const handleEmployeeClick = (employeeName: string) => {
    if (onEmployeeClick) onEmployeeClick(employeeName);
  };

  return (
    <div
      className="mobile-scroll-container w-full -mx-4 sm:mx-0"
      role="region"
      aria-label="Weekly schedule table"
    >
      <div className="mobile-scroll-content w-full overflow-x-auto px-4 sm:px-0">
        <div
          // [DESIGN] 테두리와 배경을 Zinc 톤으로 변경하여 차분하고 고급스러운 느낌 (눈의 피로 감소)
          className="min-w-[840px] sm:min-w-0 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm"
          role="table"
          aria-label="Weekly work schedule"
        >
          {/* Header Row */}
          <div
            className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800"
            role="row"
          >
            <div
              className="bg-zinc-50 dark:bg-zinc-900/50 p-3 border-r border-zinc-200 dark:border-zinc-800"
              role="columnheader"
            />
            {weekDates.map((date, index) => (
              <div
                key={date}
                role="columnheader"
                aria-label={`${DAYS[index]} ${formatDate(date)}${isToday(date) ? " (오늘)" : ""}`}
                className={cn(
                  "flex flex-col items-center p-3 text-center transition-colors border-r border-zinc-200 dark:border-zinc-800 last:border-r-0",
                  // [DESIGN] 오늘 날짜 헤더: 다크모드에서 너무 쨍하지 않게 Zinc-800 + 채도 낮은 Blue 사용
                  isToday(date)
                    ? "bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-300 ring-inset ring-b-4 ring-blue-500/80"
                    : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400"
                )}
              >
                <span
                  className={cn(
                    "font-semibold text-sm",
                    isToday(date) && "text-blue-700 dark:text-blue-200"
                  )}
                >
                  {DAYS[index]}
                </span>
                <span
                  className={cn(
                    "text-xs mt-0.5",
                    isToday(date)
                      ? "text-blue-600/70 dark:text-blue-300/70"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {formatDate(date)}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
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
                    subRow.isSubRow &&
                      "border-t border-dashed border-zinc-200 dark:border-zinc-800", // Sub-row 경계선은 점선으로 은은하게
                    isLastSubRow &&
                      !isLastShift &&
                      "border-b border-zinc-200 dark:border-zinc-800"
                  )}
                  role="row"
                >
                  {/* Row Label (11:00~ etc) */}
                  <div
                    className={cn(
                      "flex items-center justify-center border-r border-zinc-200 dark:border-zinc-800",
                      subRow.isSubRow
                        ? "bg-zinc-50/50 dark:bg-zinc-900/30 p-2 text-xs text-zinc-400 dark:text-zinc-600 font-mono" // 배경색 차이를 거의 없애고 텍스트로만 구분
                        : "bg-zinc-50 dark:bg-zinc-900/80 font-medium text-sm p-3 text-zinc-600 dark:text-zinc-300"
                    )}
                    role="rowheader"
                  >
                    {subRow.label}
                  </div>

                  {/* Cells */}
                  {weekDates.map((date, dayIndex) => {
                    const rawEntries = getEntriesForSubRow(
                      schedule.entries,
                      date,
                      shift.type,
                      subRow.fromTime
                    );
                    const entries = filterEntriesByEmployee(rawEntries);
                    const today = isToday(date);

                    return (
                      <div
                        key={`${date}-${shift.type}-${subRow.fromTime ?? "main"}`}
                        role="cell"
                        className={cn(
                          "p-2 sm:p-3 transition-colors",
                          "border-r border-zinc-200 dark:border-zinc-800 last:border-r-0",
                          subRow.isSubRow ? "min-h-[60px]" : "min-h-[80px]",
                          today
                            ? "bg-blue-50/40 dark:bg-blue-900/10" // 파란빛을 아주 연하게 (투명도 조절)
                            : "bg-white dark:bg-zinc-950" // 서브행과 메인행 배경 통일
                        )}
                      >
                        <div className="flex flex-col gap-2">
                          {entries.map((entry, idx) => {
                            const showNote =
                              entry.note?.type === "until" ||
                              entry.note?.type === "from";

                            return (
                              <button
                                key={`${entry.name}-${idx}`}
                                onClick={() => handleEmployeeClick(entry.name)}
                                className={cn(
                                  "group flex items-center justify-between w-full px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer border",
                                  "hover:shadow-sm active:scale-[0.98]",
                                  today
                                    ? "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500"
                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300"
                                )}
                              >
                                <span className="truncate">{entry.name}</span>
                                {/* Dot Indicator (Time Note exists) */}
                                {showNote && entry.note && (
                                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full ring-1 ring-inset ring-black/5 dark:ring-white/10 bg-amber-500 dark:bg-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
                                    <span
                                      className={cn(
                                        "hidden sm:inline-block text-[10px] font-mono leading-none",
                                        "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                                      )}
                                    >
                                      {formatNote(entry.note)}
                                    </span>
                                  </div>
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
    </div>
  );
}

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

function getEntriesForSubRow(
  entries: ScheduleEntry[],
  date: string,
  shiftType: ShiftType,
  fromTime: string | null
): ScheduleEntry[] {
  return entries.filter((entry) => {
    if (entry.date !== date || entry.shift !== shiftType) return false;
    if (fromTime === null) {
      return entry.note?.type !== "from";
    } else {
      return entry.note?.type === "from" && entry.note.time === fromTime;
    }
  });
}

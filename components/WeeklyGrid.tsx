'use client';

import { WeekSchedule, ScheduleEntry, ShiftType } from '@/types/schedule';
import { cn } from '@/lib/utils';

interface WeeklyGridProps {
  schedule: WeekSchedule;
  todayDate?: string;
  selectedEmployee?: string | null;
  onEmployeeClick?: (employeeName: string) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHIFTS: { type: ShiftType; label: string }[] = [
  { type: '*', label: 'All day' },
  { type: '11:00', label: '11:00~' },
  { type: '15:30', label: '15:30~' },
];

export default function WeeklyGrid({
  schedule,
  todayDate,
  selectedEmployee,
  onEmployeeClick
}: WeeklyGridProps) {
  // Generate array of 7 dates for the week
  const weekDates = generateWeekDates(schedule.weekStart);

  // Group entries by date and shift
  const entriesByDateAndShift = groupEntries(schedule.entries);

  // Format date string to MM/DD
  const formatDate = (dateStr: string): string => {
    const [, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  };

  // Check if a date matches today
  const isToday = (date: string): boolean => {
    return todayDate === date;
  };

  // Check if employee should be highlighted
  const shouldHighlight = (employeeName: string): boolean => {
    return selectedEmployee !== null && selectedEmployee === employeeName;
  };

  // Get entries for specific date and shift
  const getEntries = (date: string, shift: ShiftType): ScheduleEntry[] => {
    const key = `${date}-${shift}`;
    return entriesByDateAndShift[key] || [];
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
        className="min-w-[840px] sm:min-w-0 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden"
        role="table"
        aria-label="주간 근무 스케줄"
      >
        {/* Header row with days and dates */}
        <div className="grid grid-cols-8 gap-px border-b border-gray-300 dark:border-gray-600" role="row">
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
              aria-label={`${DAYS[index]} ${formatDate(date)}${isToday(date) ? ' (오늘)' : ''}`}
              className={cn(
                'flex flex-col items-center p-3 text-center transition-colors',
                'border-r border-gray-200 dark:border-gray-700 last:border-r-0',
                isToday(date)
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              )}
            >
              <span className="font-semibold text-sm">{DAYS[index]}</span>
              <span className={cn(
                'text-xs',
                isToday(date)
                  ? 'text-gray-300 dark:text-gray-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}>
                {formatDate(date)}
              </span>
            </div>
          ))}
        </div>

        {/* Rows for each shift type */}
        {SHIFTS.map((shift, shiftIndex) => (
          <div key={shift.type} className={cn(
            "grid grid-cols-8 gap-px",
            shiftIndex < SHIFTS.length - 1 && "border-b border-gray-300 dark:border-gray-600"
          )} role="row">
            {/* Shift label cell */}
            <div
              className="bg-gray-50 dark:bg-gray-800 flex items-center justify-center font-medium text-sm p-3 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700"
              role="rowheader"
            >
              {shift.label}
            </div>

            {/* Day cells */}
            {weekDates.map((date, index) => {
              const entries = getEntries(date, shift.type);
              const cellLabel = entries.length > 0
                ? `${DAYS[index]} ${shift.label}: ${entries.map(e => e.name).join(', ')}`
                : `${DAYS[index]} ${shift.label}: 근무자 없음`;
              const today = isToday(date);

              return (
                <div
                  key={`${date}-${shift.type}`}
                  role="cell"
                  aria-label={cellLabel}
                  className={cn(
                    'min-h-[80px] p-3 transition-colors',
                    'border-r border-gray-200 dark:border-gray-700 last:border-r-0',
                    today
                      ? 'bg-gray-800 dark:bg-gray-200'
                      : 'bg-white dark:bg-gray-900'
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    {entries.map((entry, idx) => {
                      const highlighted = shouldHighlight(entry.name);
                      return (
                        <button
                          key={`${entry.name}-${idx}`}
                          onClick={() => handleEmployeeClick(entry.name)}
                          className={cn(
                            'employee-badge px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap',
                            'hover:shadow-md active:scale-95',
                            highlighted
                              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md scale-105'
                              : today
                                ? 'bg-gray-700 dark:bg-gray-300 text-white dark:text-gray-900 hover:bg-gray-600 dark:hover:bg-gray-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
                          )}
                          aria-label={`${entry.name} 클릭하여 상세 스케줄 보기`}
                          aria-pressed={highlighted}
                        >
                          {entry.name}
                          {entry.note && (
                            <span className={cn(
                              'ml-1 text-xs',
                              highlighted || today
                                ? 'text-gray-300 dark:text-gray-600'
                                : 'text-gray-500 dark:text-gray-400'
                            )}>
                              ({entry.note.type} {entry.note.time})
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
        ))}
      </div>
    </div>
  );
}

// Helper: Generate 7 dates starting from weekStart
function generateWeekDates(weekStart: string): string[] {
  let startDate: Date;

  if (!weekStart || weekStart.trim() === '') {
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
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

// Helper: Group entries by date-shift key
function groupEntries(
  entries: ScheduleEntry[]
): Record<string, ScheduleEntry[]> {
  const grouped: Record<string, ScheduleEntry[]> = {};

  entries.forEach((entry) => {
    const key = `${entry.date}-${entry.shift}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(entry);
  });

  return grouped;
}

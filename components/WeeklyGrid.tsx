import { WeekSchedule, ScheduleEntry, ShiftType } from '@/types/schedule';
import { cn } from '@/lib/utils';

interface WeeklyGridProps {
  schedule: WeekSchedule;
  todayDate?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHIFTS: { type: ShiftType; label: string }[] = [
  { type: '*', label: 'All day' },
  { type: '11:00', label: '11:00~' },
  { type: '15:30', label: '15:30~' },
];

export default function WeeklyGrid({ schedule, todayDate }: WeeklyGridProps) {
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

  // Get entries for specific date and shift
  const getEntries = (date: string, shift: ShiftType): ScheduleEntry[] => {
    const key = `${date}-${shift}`;
    return entriesByDateAndShift[key] || [];
  };

  return (
    <div className="weekly-grid w-full overflow-x-auto">
      {/* Header row with days and dates */}
      <div className="grid-header grid grid-cols-8 gap-1 mb-2">
        <div className="shift-label-cell" />
        {weekDates.map((date, index) => (
          <div
            key={date}
            className={cn(
              'day-column flex flex-col items-center p-2 rounded-lg text-center',
              isToday(date) && 'today bg-blue-50 border-2 border-blue-500'
            )}
          >
            <span className="day-name font-semibold text-sm">{DAYS[index]}</span>
            <span className="day-date text-xs text-muted-foreground">{formatDate(date)}</span>
          </div>
        ))}
      </div>

      {/* Rows for each shift type */}
      {SHIFTS.map((shift) => (
        <div key={shift.type} className="shift-row grid grid-cols-8 gap-1 mb-1">
          <div className="shift-label flex items-center justify-center font-medium text-sm bg-muted rounded-lg p-2">
            {shift.label}
          </div>
          {weekDates.map((date) => (
            <div
              key={`${date}-${shift.type}`}
              className={cn(
                'grid-cell min-h-[60px] p-2 border rounded-lg',
                isToday(date) && 'today bg-blue-50'
              )}
            >
              {getEntries(date, shift.type).map((entry, idx) => (
                <div key={`${entry.name}-${idx}`} className="entry-item mb-1">
                  <span className="employee-name text-sm font-medium">{entry.name}</span>
                  {entry.note && (
                    <span className="entry-note text-xs text-muted-foreground ml-1">
                      ({entry.note.type} {entry.note.time})
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Helper: Generate 7 dates starting from weekStart
function generateWeekDates(weekStart: string): string[] {
  // 빈 문자열이면 오늘 기준 주의 일요일로 fallback
  let startDate: Date;

  if (!weekStart || weekStart.trim() === '') {
    const today = new Date();
    startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay()); // 이번 주 일요일
  } else {
    startDate = new Date(weekStart);
    // Invalid Date 체크
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

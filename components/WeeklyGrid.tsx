import { WeekSchedule, ScheduleEntry, ShiftType } from '@/types/schedule';

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
    <div className="weekly-grid">
      {/* Header row with days and dates */}
      <div className="grid-header">
        <div className="shift-label-cell" />
        {weekDates.map((date, index) => (
          <div
            key={date}
            className={`day-column ${isToday(date) ? 'today' : ''}`}
          >
            <span className="day-name">{DAYS[index]}</span>
            <span className="day-date">{formatDate(date)}</span>
          </div>
        ))}
      </div>

      {/* Rows for each shift type */}
      {SHIFTS.map((shift) => (
        <div key={shift.type} className="shift-row">
          <div className="shift-label">{shift.label}</div>
          {weekDates.map((date) => (
            <div
              key={`${date}-${shift.type}`}
              className={`grid-cell ${isToday(date) ? 'today' : ''}`}
            >
              {getEntries(date, shift.type).map((entry, idx) => (
                <div key={`${entry.name}-${idx}`} className="entry-item">
                  <span className="employee-name">{entry.name}</span>
                  {entry.note && (
                    <span className="entry-note">
                      {entry.note.type} {entry.note.time}
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
  const dates: string[] = [];
  const start = new Date(weekStart);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
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

import { ScheduleEntry } from '@/types/schedule';
import ShiftBadge from './ShiftBadge';

interface ScheduleCardProps {
  entry: ScheduleEntry;
  isToday?: boolean;
}

export default function ScheduleCard({ entry, isToday = false }: ScheduleCardProps) {
  // Format date as MM/DD
  const formatDate = (dateStr: string): string => {
    const [, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  };

  // Format note display
  const formatNote = (): string | null => {
    if (!entry.note) return null;
    return `${entry.note.type} ${entry.note.time}`;
  };

  const noteText = formatNote();

  return (
    <div className={`schedule-card ${isToday ? 'today' : ''}`}>
      <div className="schedule-card-date">
        <span className="date">{formatDate(entry.date)}</span>
        <span className="day-of-week">{entry.dayOfWeek}</span>
      </div>
      <div className="schedule-card-content">
        <span className="employee-name">{entry.name}</span>
        <ShiftBadge shift={entry.shift} />
        {noteText && <span className="schedule-note">{noteText}</span>}
      </div>
    </div>
  );
}

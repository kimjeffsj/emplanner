import { ScheduleEntry } from '@/types/schedule';
import ShiftBadge from './ShiftBadge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

  // Generate accessible label for the card
  const getAriaLabel = (): string => {
    const shiftText = entry.shift === '*' ? '종일' : `${entry.shift}부터`;
    const noteText = entry.note ? `, ${entry.note.type} ${entry.note.time}` : '';
    const todayText = isToday ? ' (오늘)' : '';
    return `${formatDate(entry.date)} ${entry.dayOfWeek}${todayText}, ${entry.name}, ${shiftText} 근무${noteText}`;
  };

  const noteText = formatNote();

  return (
    <Card
      className={cn(
        'schedule-card py-3',
        isToday && 'today'
      )}
      role="article"
      aria-label={getAriaLabel()}
    >
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="schedule-card-date flex flex-col">
          <span className="date font-semibold">{formatDate(entry.date)}</span>
          <span className="day-of-week text-sm text-muted-foreground">{entry.dayOfWeek}</span>
        </div>
        <div className="schedule-card-content flex items-center gap-2">
          <span className="employee-name font-medium">{entry.name}</span>
          <ShiftBadge shift={entry.shift} />
          {noteText && <span className="schedule-note text-sm text-muted-foreground">({noteText})</span>}
        </div>
      </CardContent>
    </Card>
  );
}

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

  const noteText = formatNote();

  return (
    <Card className={cn(
      'schedule-card py-3',
      isToday && 'today bg-blue-50 border-l-4 border-l-blue-500'
    )}>
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

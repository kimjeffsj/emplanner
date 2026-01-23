import { ScheduleEntry, ShiftType } from "@/types/schedule";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScheduleCardProps {
  entry: ScheduleEntry;
  isToday?: boolean;
}

// Get shift label for display
function getShiftLabel(shiftType: ShiftType): string {
  switch (shiftType) {
    case "*":
      return "All day";
    case "11:00":
      return "11:00~";
    case "15:30":
      return "15:30~";
    default:
      return shiftType;
  }
}

export default function ScheduleCard({
  entry,
  isToday = false,
}: ScheduleCardProps) {
  // Format date as MM/DD
  const formatDate = (dateStr: string): string => {
    const [, month, day] = dateStr.split("-");
    return `${month}/${day}`;
  };

  // Generate accessible label for the card
  const getAriaLabel = (): string => {
    const shiftText = entry.shift === "*" ? "종일" : `from ${entry.shift}`;
    const noteText = entry.note
      ? `, ${entry.note.type} ${entry.note.time}`
      : "";
    const todayText = isToday ? " (today)" : "";
    return `${formatDate(entry.date)} ${entry.dayOfWeek}${todayText}, ${entry.name}, ${shiftText} 근무${noteText}`;
  };

  // Dot indicator component
  const DotIndicator = ({
    dotClass,
    label,
  }: {
    dotClass: string;
    label: string;
  }) => (
    <span className="schedule-note flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <span className={cn("dot-indicator", dotClass)} />
      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
        {label}
      </span>
    </span>
  );

  // Render time indicators based on note type
  // Color coding: shift times = green (dot-morning), time notes = orange (dot-afternoon)
  const renderTimeIndicators = () => {
    // Case 1: from note - show only from time (shift time is redundant)
    if (entry.note?.type === "from") {
      return (
        <DotIndicator dotClass="dot-afternoon" label={`${entry.note.time}~`} />
      );
    }

    // Case 2: no note or until note - show shift time first
    return (
      <>
        <DotIndicator
          dotClass="dot-morning"
          label={getShiftLabel(entry.shift)}
        />
        {/* Case 3: until note - additionally show until time */}
        {entry.note?.type === "until" && (
          <DotIndicator
            dotClass="dot-afternoon"
            label={`~${entry.note.time}`}
          />
        )}
      </>
    );
  };

  return (
    <Card
      className={cn("schedule-card py-3", isToday && "today")}
      role="article"
      aria-label={getAriaLabel()}
    >
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="schedule-card-date flex flex-col">
          <span className="date font-semibold">{formatDate(entry.date)}</span>
          <span className="day-of-week text-sm text-muted-foreground">
            {entry.dayOfWeek}
          </span>
        </div>
        <div className="schedule-card-content flex items-center gap-2">
          <span className="employee-name font-medium">{entry.name}</span>
          {renderTimeIndicators()}
        </div>
      </CardContent>
    </Card>
  );
}

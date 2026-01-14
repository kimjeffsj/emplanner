
import { ShiftType } from '@/types/schedule';

interface ShiftBadgeProps {
  shift: ShiftType;
}

export default function ShiftBadge({ shift }: ShiftBadgeProps) {
  // Determine display text
  const displayText = shift === '*' ? 'All day' : `${shift}~`;

  // Determine CSS class based on shift type
  const getShiftClass = (): string => {
    if (shift === '*') {
      return 'all-day';
    } else if (shift === '11:00') {
      return 'morning';
    } else {
      return 'evening';
    }
  };

  const shiftClass = getShiftClass();

  return (
    <span className={`shift-badge ${shiftClass}`}>
      {displayText}
    </span>
  );
}
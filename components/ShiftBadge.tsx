import { ShiftType } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';

interface ShiftBadgeProps {
  shift: ShiftType;
}

export default function ShiftBadge({ shift }: ShiftBadgeProps) {
  // Determine display text and accessible label
  const displayText = shift === '*' ? 'All day' : `${shift}~`;
  const ariaLabel = shift === '*'
    ? '종일 근무'
    : shift === '11:00'
      ? '오전 11시부터 근무'
      : '오후 3시 30분부터 근무';

  // Determine variant based on shift type (using schedule-specific variants)
  const getVariant = (): 'allday' | 'morning' | 'afternoon' => {
    if (shift === '*') {
      return 'allday';
    } else if (shift === '11:00') {
      return 'morning';
    } else {
      return 'afternoon';
    }
  };

  return (
    <Badge variant={getVariant()} className="shift-badge" aria-label={ariaLabel}>
      {displayText}
    </Badge>
  );
}
import { ShiftType } from '@/types/schedule';
import { Badge } from '@/components/ui/badge';

interface ShiftBadgeProps {
  shift: ShiftType;
}

export default function ShiftBadge({ shift }: ShiftBadgeProps) {
  // Determine display text
  const displayText = shift === '*' ? 'All day' : `${shift}~`;

  // Determine variant based on shift type
  const getVariant = (): 'default' | 'secondary' | 'outline' => {
    if (shift === '*') {
      return 'default';
    } else if (shift === '11:00') {
      return 'secondary';
    } else {
      return 'outline';
    }
  };

  return (
    <Badge variant={getVariant()} className="shift-badge">
      {displayText}
    </Badge>
  );
}
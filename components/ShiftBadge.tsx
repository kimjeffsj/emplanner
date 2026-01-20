import { ShiftType } from "@/types/schedule";
import { Badge } from "@/components/ui/badge";

interface ShiftBadgeProps {
  shift: ShiftType;
}

export default function ShiftBadge({ shift }: ShiftBadgeProps) {
  // Determine display text and accessible label
  const displayText = shift === "*" ? "*" : `${shift}~`;
  const ariaLabel =
    shift === "*"
      ? "All day shift"
      : shift === "11:00"
        ? "Shift from 11:00 AM"
        : "Shift from 3:30 PM";

  // Determine variant based on shift type (using schedule-specific variants)
  const getVariant = (): "allday" | "morning" | "afternoon" => {
    if (shift === "*") {
      return "allday";
    } else if (shift === "11:00") {
      return "morning";
    } else {
      return "afternoon";
    }
  };

  return (
    <Badge
      variant={getVariant()}
      className="shift-badge"
      aria-label={ariaLabel}
    >
      {displayText}
    </Badge>
  );
}

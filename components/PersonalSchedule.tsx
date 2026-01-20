import { EmployeeWeekSchedule } from '@/types/schedule';
import ScheduleCard from './ScheduleCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PersonalScheduleProps {
  schedule: EmployeeWeekSchedule;
  todayDate?: string;
}

export default function PersonalSchedule({
  schedule,
  todayDate,
}: PersonalScheduleProps) {
  // Filter out locations with no entries
  const activeSchedules = schedule.schedules.filter(
    (s) => s.entries.length > 0
  );

  // Calculate total work days
  const totalWorkDays = activeSchedules.reduce(
    (sum, s) => sum + s.entries.length,
    0
  );

  // Format date string to MM/DD
  const formatDate = (dateStr: string): string => {
    const [, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  };

  // Check if all locations have no schedules
  const hasNoSchedules = activeSchedules.length === 0;

  return (
    <section
      className="personal-schedule space-y-4"
      aria-label={`${schedule.employeeName}'s weekly schedule`}
    >
      {/* Header with employee name */}
      <Card className="personal-header">
        <CardHeader className="pb-2">
          <CardTitle className="employee-name text-xl" id="schedule-title">
            {schedule.employeeName}
          </CardTitle>
          <CardDescription className="week-range">
            {formatDate(schedule.weekStart)} ~ {formatDate(schedule.weekEnd)}
          </CardDescription>
        </CardHeader>
        {!hasNoSchedules && (
          <CardContent className="total-days pt-0">
            Total <span className="day-count font-bold text-primary">{totalWorkDays}</span> days
          </CardContent>
        )}
      </Card>

      {/* Empty state */}
      {hasNoSchedules && (
        <Card className="empty-state" role="status" aria-live="polite">
          <CardContent className="text-center py-8 text-muted-foreground">
            No schedule this week
          </CardContent>
        </Card>
      )}

      {/* Location sections */}
      {activeSchedules.map((locationSchedule) => (
        <section
          key={locationSchedule.location}
          className="location-section space-y-2"
          aria-label={`${locationSchedule.location} schedule`}
        >
          <div className="location-header flex items-center justify-between px-2">
            <h3 className="location-name font-semibold text-lg">{locationSchedule.location}</h3>
            <span className="location-days text-sm text-muted-foreground" aria-label={`${locationSchedule.entries.length} days`}>
              {locationSchedule.entries.length} days
            </span>
          </div>
          <div className="entries-list space-y-2" role="list" aria-label="Schedule list">
            {locationSchedule.entries.map((entry, idx) => (
              <div key={`${entry.date}-${entry.shift}-${idx}`} role="listitem">
                <ScheduleCard
                  entry={entry}
                  isToday={todayDate === entry.date}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

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
    <div className="personal-schedule space-y-4">
      {/* Header with employee name */}
      <Card className="personal-header">
        <CardHeader className="pb-2">
          <CardTitle className="employee-name text-xl">{schedule.employeeName}</CardTitle>
          <CardDescription className="week-range">
            {formatDate(schedule.weekStart)} ~ {formatDate(schedule.weekEnd)}
          </CardDescription>
        </CardHeader>
        {!hasNoSchedules && (
          <CardContent className="total-days pt-0">
            총 <span className="day-count font-bold text-primary">{totalWorkDays}</span>일
          </CardContent>
        )}
      </Card>

      {/* Empty state */}
      {hasNoSchedules && (
        <Card className="empty-state">
          <CardContent className="text-center py-8 text-muted-foreground">
            이번 주 스케줄이 없습니다
          </CardContent>
        </Card>
      )}

      {/* Location sections */}
      {activeSchedules.map((locationSchedule) => (
        <div key={locationSchedule.location} className="location-section space-y-2">
          <div className="location-header flex items-center justify-between px-2">
            <h3 className="location-name font-semibold text-lg">{locationSchedule.location}</h3>
            <span className="location-days text-sm text-muted-foreground">
              {locationSchedule.entries.length}일
            </span>
          </div>
          <div className="entries-list space-y-2">
            {locationSchedule.entries.map((entry, idx) => (
              <ScheduleCard
                key={`${entry.date}-${entry.shift}-${idx}`}
                entry={entry}
                isToday={todayDate === entry.date}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

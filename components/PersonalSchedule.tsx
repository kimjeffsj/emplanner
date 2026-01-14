import { EmployeeWeekSchedule } from '@/types/schedule';
import ScheduleCard from './ScheduleCard';

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
    <div className="personal-schedule">
      {/* Header with employee name */}
      <div className="personal-header">
        <h2 className="employee-name">{schedule.employeeName}</h2>
        <div className="week-range">
          {formatDate(schedule.weekStart)} ~ {formatDate(schedule.weekEnd)}
        </div>
        {!hasNoSchedules && (
          <div className="total-days">
            총 <span className="day-count">{totalWorkDays}</span>일
          </div>
        )}
      </div>

      {/* Empty state */}
      {hasNoSchedules && (
        <div className="empty-state">이번 주 스케줄이 없습니다</div>
      )}

      {/* Location sections */}
      {activeSchedules.map((locationSchedule) => (
        <div key={locationSchedule.location} className="location-section">
          <div className="location-header">
            <h3 className="location-name">{locationSchedule.location}</h3>
            <span className="location-days">
              {locationSchedule.entries.length}일
            </span>
          </div>
          <div className="entries-list">
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

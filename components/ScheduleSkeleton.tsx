import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ScheduleSkeletonProps {
  variant?: 'grid' | 'personal';
}

export default function ScheduleSkeleton({ variant = 'grid' }: ScheduleSkeletonProps) {
  if (variant === 'personal') {
    return <PersonalScheduleSkeleton />;
  }
  return <WeeklyGridSkeleton />;
}

function WeeklyGridSkeleton() {
  return (
    <div className="weekly-grid-skeleton w-full space-y-4" data-testid="weekly-grid-skeleton">
      {/* Header row skeleton */}
      <div className="grid grid-cols-8 gap-2">
        <div className="h-10" /> {/* Empty cell for shift label column */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>

      {/* Rows skeleton - 3 shift types */}
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-8 gap-2">
          {/* Shift label */}
          <Skeleton className="h-16 rounded-lg" />
          {/* Day cells */}
          {Array.from({ length: 7 }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-16 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

function PersonalScheduleSkeleton() {
  return (
    <div className="personal-schedule-skeleton space-y-4" data-testid="personal-schedule-skeleton">
      {/* Header card skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40 mt-1" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-5 w-20" />
        </CardContent>
      </Card>

      {/* Location section skeleton - 2 locations */}
      {Array.from({ length: 2 }).map((_, locationIndex) => (
        <div key={locationIndex} className="space-y-2">
          {/* Location header */}
          <div className="flex items-center justify-between px-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-10" />
          </div>
          {/* Schedule cards - 3 per location */}
          {Array.from({ length: 3 }).map((_, cardIndex) => (
            <Card key={cardIndex} className="py-3">
              <CardContent className="flex items-center justify-between gap-3 p-3">
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}

export { WeeklyGridSkeleton, PersonalScheduleSkeleton };

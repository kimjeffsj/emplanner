'use client';

import { EmployeeWeekSchedule } from '@/types/schedule';
import PersonalSchedule from './PersonalSchedule';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface PersonalScheduleModalProps {
  schedule: EmployeeWeekSchedule | null;
  todayDate?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonalScheduleModal({
  schedule,
  todayDate,
  isOpen,
  onClose,
}: PersonalScheduleModalProps) {
  if (!schedule) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-bold">
            {schedule.employeeName}&apos;s Schedule
          </SheetTitle>
          <SheetDescription>
            View this week&apos;s work schedule
          </SheetDescription>
        </SheetHeader>
        <PersonalSchedule schedule={schedule} todayDate={todayDate} />
      </SheetContent>
    </Sheet>
  );
}

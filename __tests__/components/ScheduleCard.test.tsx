import { render, screen } from '@testing-library/react';
import ScheduleCard from '@/components/ScheduleCard';
import { ScheduleEntry } from '@/types/schedule';

describe('ScheduleCard', () => {
  const baseEntry: ScheduleEntry = {
    name: 'Jenny',
    date: '2024-01-15',
    dayOfWeek: 'Monday',
    shift: '*',
    location: 'No.3',
  };

  describe('날짜 및 요일 표시', () => {
    it('날짜를 MM/DD 형식으로 표시한다', () => {
      render(<ScheduleCard entry={baseEntry} />);
      expect(screen.getByText('01/15')).toBeInTheDocument();
    });

    it('요일을 표시한다', () => {
      render(<ScheduleCard entry={baseEntry} />);
      expect(screen.getByText('Monday')).toBeInTheDocument();
    });

    it('다른 날짜도 올바르게 표시한다', () => {
      const entry: ScheduleEntry = {
        ...baseEntry,
        date: '2024-12-25',
        dayOfWeek: 'Wednesday',
      };
      render(<ScheduleCard entry={entry} />);
      expect(screen.getByText('12/25')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
    });
  });

  describe('ShiftBadge 렌더링', () => {
    it('All day 시프트를 표시한다', () => {
      render(<ScheduleCard entry={baseEntry} />);
      expect(screen.getByText('All day')).toBeInTheDocument();
    });

    it('오전 시프트(11:00)를 표시한다', () => {
      const entry: ScheduleEntry = { ...baseEntry, shift: '11:00' };
      render(<ScheduleCard entry={entry} />);
      expect(screen.getByText('11:00~')).toBeInTheDocument();
    });

    it('오후 시프트(15:30)를 표시한다', () => {
      const entry: ScheduleEntry = { ...baseEntry, shift: '15:30' };
      render(<ScheduleCard entry={entry} />);
      expect(screen.getByText('15:30~')).toBeInTheDocument();
    });
  });

  describe('직원 이름 표시', () => {
    it('직원 이름을 표시한다', () => {
      render(<ScheduleCard entry={baseEntry} />);
      expect(screen.getByText('Jenny')).toBeInTheDocument();
    });
  });

  describe('note 표시', () => {
    it('until note를 표시한다', () => {
      const entry: ScheduleEntry = {
        ...baseEntry,
        note: { type: 'until', time: '17:00' },
      };
      render(<ScheduleCard entry={entry} />);
      expect(screen.getByText(/until 17:00/)).toBeInTheDocument();
    });

    it('from note를 표시한다', () => {
      const entry: ScheduleEntry = {
        ...baseEntry,
        note: { type: 'from', time: '17:30' },
      };
      render(<ScheduleCard entry={entry} />);
      expect(screen.getByText(/from 17:30/)).toBeInTheDocument();
    });

    it('note가 없으면 note 영역을 표시하지 않는다', () => {
      render(<ScheduleCard entry={baseEntry} />);
      expect(screen.queryByText(/until/)).not.toBeInTheDocument();
      expect(screen.queryByText(/from/)).not.toBeInTheDocument();
    });
  });

  describe('오늘 날짜 강조', () => {
    it('isToday가 true면 today 클래스가 적용된다', () => {
      const { container } = render(<ScheduleCard entry={baseEntry} isToday />);
      expect(container.firstChild).toHaveClass('today');
    });

    it('isToday가 false면 today 클래스가 없다', () => {
      const { container } = render(<ScheduleCard entry={baseEntry} isToday={false} />);
      expect(container.firstChild).not.toHaveClass('today');
    });

    it('isToday prop이 없으면 today 클래스가 없다', () => {
      const { container } = render(<ScheduleCard entry={baseEntry} />);
      expect(container.firstChild).not.toHaveClass('today');
    });
  });
});

import { render, screen } from '@testing-library/react';
import ScheduleSkeleton, { WeeklyGridSkeleton, PersonalScheduleSkeleton } from '@/components/ScheduleSkeleton';

describe('ScheduleSkeleton', () => {
  describe('default (grid variant)', () => {
    it('renders weekly grid skeleton by default', () => {
      render(<ScheduleSkeleton />);
      expect(screen.getByTestId('weekly-grid-skeleton')).toBeInTheDocument();
    });

    it('renders with variant="grid"', () => {
      render(<ScheduleSkeleton variant="grid" />);
      expect(screen.getByTestId('weekly-grid-skeleton')).toBeInTheDocument();
    });
  });

  describe('personal variant', () => {
    it('renders personal schedule skeleton with variant="personal"', () => {
      render(<ScheduleSkeleton variant="personal" />);
      expect(screen.getByTestId('personal-schedule-skeleton')).toBeInTheDocument();
    });
  });
});

describe('WeeklyGridSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<WeeklyGridSkeleton />);
    expect(screen.getByTestId('weekly-grid-skeleton')).toBeInTheDocument();
  });

  it('renders 7 day column skeletons in header', () => {
    const { container } = render(<WeeklyGridSkeleton />);
    // 8 columns: 1 empty + 7 days, each day has 2 skeleton elements
    const headerSkeletons = container.querySelectorAll('.grid-cols-8:first-child [data-slot="skeleton"]');
    expect(headerSkeletons.length).toBe(14); // 7 days × 2 skeletons each
  });

  it('renders 3 shift row skeletons', () => {
    const { container } = render(<WeeklyGridSkeleton />);
    // Each row has 8 cells (1 label + 7 days)
    const rows = container.querySelectorAll('.grid-cols-8');
    expect(rows.length).toBe(4); // 1 header + 3 shift rows
  });
});

describe('PersonalScheduleSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<PersonalScheduleSkeleton />);
    expect(screen.getByTestId('personal-schedule-skeleton')).toBeInTheDocument();
  });

  it('renders header card skeleton', () => {
    const { container } = render(<PersonalScheduleSkeleton />);
    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders location sections with schedule cards', () => {
    const { container } = render(<PersonalScheduleSkeleton />);
    // 1 header card + 2 locations × 3 cards each = 7 cards total
    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards.length).toBe(7);
  });
});

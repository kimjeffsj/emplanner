import { render, screen } from '@testing-library/react';
import TodayHighlight, {
  getTodayDate,
  isToday,
} from '@/components/TodayHighlight';

describe('TodayHighlight', () => {
  describe('getTodayDate', () => {
    it('오늘 날짜를 YYYY-MM-DD 형식으로 반환한다', () => {
      const result = getTodayDate();

      // YYYY-MM-DD 형식 검증
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // 실제 오늘 날짜와 일치하는지 검증
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });

    it('월과 일이 한 자리수일 때 0을 패딩한다', () => {
      const result = getTodayDate();

      // 형식이 항상 2자리씩 유지되는지 확인
      const [year, month, day] = result.split('-');
      expect(year.length).toBe(4);
      expect(month.length).toBe(2);
      expect(day.length).toBe(2);
    });
  });

  describe('isToday', () => {
    it('오늘 날짜면 true를 반환한다', () => {
      const today = getTodayDate();
      expect(isToday(today)).toBe(true);
    });

    it('오늘이 아닌 날짜면 false를 반환한다', () => {
      expect(isToday('2000-01-01')).toBe(false);
      expect(isToday('2099-12-31')).toBe(false);
    });

    it('잘못된 형식의 날짜면 false를 반환한다', () => {
      expect(isToday('invalid')).toBe(false);
      expect(isToday('')).toBe(false);
    });
  });

  describe('TodayHighlight 컴포넌트', () => {
    it('자식에게 오늘 날짜를 전달한다', () => {
      render(
        <TodayHighlight>
          {(todayDate) => <div data-testid="child">{todayDate}</div>}
        </TodayHighlight>
      );

      const child = screen.getByTestId('child');
      const today = getTodayDate();
      expect(child).toHaveTextContent(today);
    });

    it('render prop 패턴으로 자식을 렌더링한다', () => {
      render(
        <TodayHighlight>
          {(todayDate) => (
            <div>
              <span data-testid="date">{todayDate}</span>
              <span data-testid="label">Today</span>
            </div>
          )}
        </TodayHighlight>
      );

      expect(screen.getByTestId('date')).toBeInTheDocument();
      expect(screen.getByTestId('label')).toHaveTextContent('Today');
    });
  });
});

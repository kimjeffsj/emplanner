import { render, screen } from "@testing-library/react";
import WeeklyGrid from "@/components/WeeklyGrid";
import { WeekSchedule, ScheduleEntry } from "@/types/schedule";

describe("WeeklyGrid", () => {
  const mockEntries: ScheduleEntry[] = [
    {
      name: "Jenny",
      date: "2024-01-14", // Sunday
      dayOfWeek: "Sunday",
      shift: "*",
      location: "No.3",
    },
    {
      name: "Ryan",
      date: "2024-01-15", // Monday
      dayOfWeek: "Monday",
      shift: "11:00",
      location: "No.3",
    },
    {
      name: "Minji",
      date: "2024-01-15", // Monday
      dayOfWeek: "Monday",
      shift: "15:30",
      location: "No.3",
      note: { type: "from", time: "17:30" },
    },
    {
      name: "Yuran",
      date: "2024-01-16", // Tuesday
      dayOfWeek: "Tuesday",
      shift: "*",
      location: "No.3",
    },
  ];

  const mockWeekSchedule: WeekSchedule = {
    weekStart: "2024-01-14",
    weekEnd: "2024-01-20",
    location: "No.3",
    entries: mockEntries,
  };

  describe("요일 컬럼 렌더링", () => {
    it("7개의 요일 헤더를 렌더링한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      days.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it("각 컬럼에 날짜를 표시한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);

      // Check first and last dates
      expect(screen.getByText("01/14")).toBeInTheDocument();
      expect(screen.getByText("01/20")).toBeInTheDocument();
    });
  });

  describe("시프트별 섹션 렌더링", () => {
    it("All day 섹션을 렌더링한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText("All day")).toBeInTheDocument();
    });

    it("오전(11:00~) 섹션을 렌더링한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText("11:00~")).toBeInTheDocument();
    });

    it("오후(15:30~) 섹션을 렌더링한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText("15:30~")).toBeInTheDocument();
    });
  });

  describe("데이터 표시", () => {
    it("All day 시프트 직원을 해당 날짜 셀에 표시한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText("Jenny")).toBeInTheDocument();
      expect(screen.getByText("Yuran")).toBeInTheDocument();
    });

    it("오전 시프트 직원을 해당 날짜 셀에 표시한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText("Ryan")).toBeInTheDocument();
    });

    it("오후 시프트 직원을 해당 날짜 셀에 표시한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText("Minji")).toBeInTheDocument();
    });

    it("note가 있는 직원은 note를 함께 표시한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText(/from 17:30/)).toBeInTheDocument();
    });
  });

  describe("빈 데이터 처리", () => {
    it("데이터가 없는 날짜에는 직원이 표시되지 않는다", () => {
      const emptySchedule: WeekSchedule = {
        weekStart: "2024-01-14",
        weekEnd: "2024-01-20",
        location: "No.3",
        entries: [],
      };

      render(<WeeklyGrid schedule={emptySchedule} />);

      // Headers should still be there
      expect(screen.getByText("Sun")).toBeInTheDocument();
      // But no employee names
      expect(screen.queryByText("Jenny")).not.toBeInTheDocument();
    });
  });

  describe("오늘 날짜 강조", () => {
    it("todayDate prop과 일치하는 컬럼에 today 클래스가 적용된다", () => {
      const { container } = render(
        <WeeklyGrid schedule={mockWeekSchedule} todayDate="2024-01-15" />
      );

      const todayColumn = container.querySelector(".day-column.today");
      expect(todayColumn).toBeInTheDocument();
    });

    it("todayDate가 주 범위에 없으면 today 클래스가 없다", () => {
      const { container } = render(
        <WeeklyGrid schedule={mockWeekSchedule} todayDate="2024-01-25" />
      );

      const todayColumn = container.querySelector(".day-column.today");
      expect(todayColumn).not.toBeInTheDocument();
    });

    it("todayDate가 없으면 today 클래스가 없다", () => {
      const { container } = render(<WeeklyGrid schedule={mockWeekSchedule} />);

      const todayColumn = container.querySelector(".day-column.today");
      expect(todayColumn).not.toBeInTheDocument();
    });
  });

  describe("같은 날 같은 시프트 복수 직원", () => {
    it("같은 날 같은 시프트에 여러 직원이 있으면 모두 표시한다", () => {
      const multipleEntries: ScheduleEntry[] = [
        {
          name: "Jenny",
          date: "2024-01-14",
          dayOfWeek: "Sunday",
          shift: "*",
          location: "No.3",
        },
        {
          name: "Ryan",
          date: "2024-01-14",
          dayOfWeek: "Sunday",
          shift: "*",
          location: "No.3",
        },
      ];

      const schedule: WeekSchedule = {
        weekStart: "2024-01-14",
        weekEnd: "2024-01-20",
        location: "No.3",
        entries: multipleEntries,
      };

      render(<WeeklyGrid schedule={schedule} />);

      expect(screen.getByText("Jenny")).toBeInTheDocument();
      expect(screen.getByText("Ryan")).toBeInTheDocument();
    });
  });
});

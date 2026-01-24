import { render, screen } from "@testing-library/react";
import WeeklyGrid from "@/components/WeeklyGrid";
import { WeekSchedule, ScheduleEntry } from "@/types/schedule";

describe("WeeklyGrid", () => {
  const mockEntries: ScheduleEntry[] = [
    {
      name: "Jane",
      date: "2024-01-14", // Sunday
      dayOfWeek: "Sunday",
      shift: "*",
      location: "No.3",
    },
    {
      name: "John",
      date: "2024-01-15", // Monday
      dayOfWeek: "Monday",
      shift: "11:00",
      location: "No.3",
    },
    {
      name: "Alice",
      date: "2024-01-15", // Monday
      dayOfWeek: "Monday",
      shift: "15:30",
      location: "No.3",
      note: { type: "from", time: "17:30" },
    },
    {
      name: "Bob",
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
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    it("오전 시프트 직원을 해당 날짜 셀에 표시한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("오후 시프트 직원을 해당 날짜 셀에 표시한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("from note가 있는 직원은 서브행에 표시된다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);
      // from note는 서브행 라벨로 표시됨 (예: "17:30~")
      // 서브행 헤더와 뱃지 인라인 두 곳에서 표시될 수 있음
      const timeNotes = screen.getAllByText("17:30~");
      expect(timeNotes.length).toBeGreaterThanOrEqual(1);
      // 직원 이름은 버튼으로 표시됨
      expect(screen.getByRole("button", { name: /Alice/ })).toBeInTheDocument();
    });

    it("until note가 있는 직원은 인라인으로 시간 표시", () => {
      const entriesWithUntil: ScheduleEntry[] = [
        {
          name: "Jason",
          date: "2024-01-15",
          dayOfWeek: "Monday",
          shift: "11:00",
          location: "No.3",
          note: { type: "until", time: "15:30" },
        },
      ];

      const scheduleWithUntil: WeekSchedule = {
        weekStart: "2024-01-14",
        weekEnd: "2024-01-20",
        location: "No.3",
        entries: entriesWithUntil,
      };

      render(<WeeklyGrid schedule={scheduleWithUntil} />);
      // until note는 인라인으로 표시됨 (예: "~15:30")
      expect(screen.getByText("~15:30")).toBeInTheDocument();
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
    it("todayDate prop과 일치하는 컬럼에 오늘 표시가 있다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} todayDate="2024-01-15" />);

      // aria-label에 (Today) 표시 확인
      const todayColumn = screen.getByRole("columnheader", {
        name: /Mon 01\/15 \(Today\)/,
      });
      expect(todayColumn).toBeInTheDocument();
    });

    it("todayDate가 주 범위에 없으면 오늘 표시가 없다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} todayDate="2024-01-25" />);

      // (Today) 표시가 있는 컬럼이 없어야 함
      const todayColumn = screen.queryByRole("columnheader", {
        name: /\(Today\)/,
      });
      expect(todayColumn).not.toBeInTheDocument();
    });

    it("todayDate가 없으면 오늘 표시가 없다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);

      // (Today) 표시가 있는 컬럼이 없어야 함
      const todayColumn = screen.queryByRole("columnheader", {
        name: /\(Today\)/,
      });
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

  describe("직원 필터링", () => {
    it("selectedEmployee가 null이면 모든 직원을 표시한다", () => {
      render(
        <WeeklyGrid schedule={mockWeekSchedule} selectedEmployee={null} />
      );

      // 모든 직원이 표시되어야 함
      expect(screen.getByRole("button", { name: /Jane/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /John/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Alice/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Bob/ })).toBeInTheDocument();
    });

    it("selectedEmployee가 지정되면 해당 직원만 표시한다", () => {
      render(
        <WeeklyGrid schedule={mockWeekSchedule} selectedEmployee="John" />
      );

      // John만 표시되어야 함
      expect(screen.getByRole("button", { name: /John/ })).toBeInTheDocument();
      // 다른 직원은 표시되지 않아야 함
      expect(
        screen.queryByRole("button", { name: /Jane/ })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Alice/ })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Bob/ })
      ).not.toBeInTheDocument();
    });

    it("selectedEmployee가 undefined이면 모든 직원을 표시한다", () => {
      render(<WeeklyGrid schedule={mockWeekSchedule} />);

      // 모든 직원이 표시되어야 함 (버튼으로 렌더링됨)
      expect(screen.getByRole("button", { name: /Jane/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /John/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Alice/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Bob/ })).toBeInTheDocument();
    });

    it("필터링된 직원의 모든 날짜 스케줄이 표시된다", () => {
      // Jenny는 일요일에 All day 근무
      const multiDayEntries: ScheduleEntry[] = [
        {
          name: "Jenny",
          date: "2024-01-14", // Sunday
          dayOfWeek: "Sunday",
          shift: "*",
          location: "No.3",
        },
        {
          name: "Jenny",
          date: "2024-01-15", // Monday
          dayOfWeek: "Monday",
          shift: "11:00",
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
        entries: multiDayEntries,
      };

      render(<WeeklyGrid schedule={schedule} selectedEmployee="Jenny" />);

      // Jenny의 버튼이 2개 있어야 함 (일요일, 월요일)
      const jennyButtons = screen.getAllByText("Jenny");
      expect(jennyButtons).toHaveLength(2);
      // Ryan은 표시되지 않아야 함
      expect(screen.queryByText("Ryan")).not.toBeInTheDocument();
    });
  });
});

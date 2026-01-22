import { render, screen } from "@testing-library/react";
import PersonalSchedule from "@/components/PersonalSchedule";
import { EmployeeWeekSchedule, ScheduleEntry } from "@/types/schedule";

describe("PersonalSchedule", () => {
  const createEntry = (
    date: string,
    dayOfWeek: string,
    location: "No.3" | "Westminster",
    shift: "*" | "11:00" | "15:30" = "*"
  ): ScheduleEntry => ({
    name: "Jane",
    date,
    dayOfWeek,
    shift,
    location,
  });

  const mockSchedule: EmployeeWeekSchedule = {
    employeeName: "Jane",
    weekStart: "2024-01-14",
    weekEnd: "2024-01-20",
    schedules: [
      {
        location: "No.3",
        entries: [
          createEntry("2024-01-14", "Sunday", "No.3"),
          createEntry("2024-01-15", "Monday", "No.3", "11:00"),
          createEntry("2024-01-16", "Tuesday", "No.3"),
        ],
      },
      {
        location: "Westminster",
        entries: [
          createEntry("2024-01-17", "Wednesday", "Westminster"),
          createEntry("2024-01-18", "Thursday", "Westminster", "15:30"),
        ],
      },
    ],
  };

  describe("직원 이름 표시", () => {
    it("직원 이름을 헤더에 표시한다", () => {
      const { container } = render(
        <PersonalSchedule schedule={mockSchedule} />
      );
      // CardTitle은 div로 렌더링되므로 data-slot으로 찾기
      const header = container.querySelector('[data-slot="card-title"]');
      expect(header).toHaveTextContent("Jane");
    });
  });

  describe("로케이션별 그룹핑", () => {
    it("No.3 로케이션 섹션을 표시한다", () => {
      render(<PersonalSchedule schedule={mockSchedule} />);
      expect(screen.getByText("No.3")).toBeInTheDocument();
    });

    it("Westminster 로케이션 섹션을 표시한다", () => {
      render(<PersonalSchedule schedule={mockSchedule} />);
      expect(screen.getByText("Westminster")).toBeInTheDocument();
    });

    it("각 로케이션별로 스케줄을 그룹화하여 표시한다", () => {
      render(<PersonalSchedule schedule={mockSchedule} />);

      // No.3 entries
      expect(screen.getByText("01/14")).toBeInTheDocument();
      expect(screen.getByText("01/15")).toBeInTheDocument();
      expect(screen.getByText("01/16")).toBeInTheDocument();

      // Westminster entries
      expect(screen.getByText("01/17")).toBeInTheDocument();
      expect(screen.getByText("01/18")).toBeInTheDocument();
    });
  });

  describe("스케줄 없는 로케이션 처리", () => {
    it("스케줄이 없는 로케이션은 표시하지 않는다", () => {
      const scheduleWithOneLocation: EmployeeWeekSchedule = {
        employeeName: "Ryan",
        weekStart: "2024-01-14",
        weekEnd: "2024-01-20",
        schedules: [
          {
            location: "No.3",
            entries: [createEntry("2024-01-14", "Sunday", "No.3")],
          },
          {
            location: "Westminster",
            entries: [], // 빈 배열
          },
        ],
      };

      render(<PersonalSchedule schedule={scheduleWithOneLocation} />);

      expect(screen.getByText("No.3")).toBeInTheDocument();
      expect(screen.queryByText("Westminster")).not.toBeInTheDocument();
    });

    it("모든 로케이션에 스케줄이 없으면 빈 상태 메시지를 표시한다", () => {
      const emptySchedule: EmployeeWeekSchedule = {
        employeeName: "Minji",
        weekStart: "2024-01-14",
        weekEnd: "2024-01-20",
        schedules: [
          { location: "No.3", entries: [] },
          { location: "Westminster", entries: [] },
        ],
      };

      render(<PersonalSchedule schedule={emptySchedule} />);

      expect(screen.getByText(/No schedule this week/)).toBeInTheDocument();
    });
  });

  describe("총 근무일 수 표시", () => {
    it("전체 근무일 수를 표시한다", () => {
      const { container } = render(
        <PersonalSchedule schedule={mockSchedule} />
      );
      // 5일 (No.3: 3일, Westminster: 2일)
      const totalDays = container.querySelector(".total-days");
      expect(totalDays).toHaveTextContent("5");
      expect(totalDays).toHaveTextContent("days");
    });

    it("로케이션별 근무일 수를 표시한다", () => {
      render(<PersonalSchedule schedule={mockSchedule} />);

      // No.3: 3일, Westminster: 2일
      const no3Section = screen.getByText("No.3").closest(".location-section");
      const westSection = screen
        .getByText("Westminster")
        .closest(".location-section");

      expect(no3Section).toHaveTextContent("3");
      expect(westSection).toHaveTextContent("2");
    });
  });

  describe("주간 정보 표시", () => {
    it("주간 날짜 범위를 표시한다", () => {
      const { container } = render(
        <PersonalSchedule schedule={mockSchedule} />
      );
      const weekRange = container.querySelector(".week-range");
      expect(weekRange).toHaveTextContent("01/14");
      expect(weekRange).toHaveTextContent("01/20");
    });
  });

  describe("시프트 정보 표시", () => {
    it("각 엔트리의 시프트 타입을 표시한다", () => {
      render(<PersonalSchedule schedule={mockSchedule} />);

      expect(screen.getAllByText("종일").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("11:00~")).toBeInTheDocument();
      expect(screen.getByText("15:30~")).toBeInTheDocument();
    });
  });

  describe("오늘 날짜 강조", () => {
    it("todayDate와 일치하는 엔트리에 today 클래스가 적용된다", () => {
      const { container } = render(
        <PersonalSchedule schedule={mockSchedule} todayDate="2024-01-15" />
      );

      const todayCard = container.querySelector(".schedule-card.today");
      expect(todayCard).toBeInTheDocument();
    });

    it("todayDate가 없으면 today 클래스가 없다", () => {
      const { container } = render(
        <PersonalSchedule schedule={mockSchedule} />
      );

      const todayCard = container.querySelector(".schedule-card.today");
      expect(todayCard).not.toBeInTheDocument();
    });
  });
});

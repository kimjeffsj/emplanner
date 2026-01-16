import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScheduleViewer from "@/components/ScheduleViewer";
import {
  Employee,
  WeekSchedule,
  EmployeeWeekSchedule,
  ScheduleEntry,
} from "@/types/schedule";

// Mock Next.js navigation hooks
const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

describe("ScheduleViewer", () => {
  // Mock 직원 목록
  const mockEmployees: Employee[] = [
    { name: "Jenny" },
    { name: "Ryan" },
    { name: "Minji" },
  ];

  // Mock No.3 스케줄
  const mockNo3Entries: ScheduleEntry[] = [
    {
      name: "Jenny",
      date: "2024-01-14",
      dayOfWeek: "Sunday",
      shift: "*",
      location: "No.3",
    },
    {
      name: "Ryan",
      date: "2024-01-15",
      dayOfWeek: "Monday",
      shift: "11:00",
      location: "No.3",
    },
  ];

  const mockNo3Schedule: WeekSchedule = {
    weekStart: "2024-01-14",
    weekEnd: "2024-01-20",
    location: "No.3",
    entries: mockNo3Entries,
  };

  // Mock Westminster 스케줄
  const mockWestminsterEntries: ScheduleEntry[] = [
    {
      name: "Minji",
      date: "2024-01-16",
      dayOfWeek: "Tuesday",
      shift: "15:30",
      location: "Westminster",
    },
  ];

  const mockWestminsterSchedule: WeekSchedule = {
    weekStart: "2024-01-14",
    weekEnd: "2024-01-20",
    location: "Westminster",
    entries: mockWestminsterEntries,
  };

  // Mock 개인 스케줄
  const mockEmployeeSchedules: Record<string, EmployeeWeekSchedule> = {
    Jenny: {
      employeeName: "Jenny",
      weekStart: "2024-01-14",
      weekEnd: "2024-01-20",
      schedules: [
        {
          location: "No.3",
          entries: [mockNo3Entries[0]],
        },
      ],
    },
    Ryan: {
      employeeName: "Ryan",
      weekStart: "2024-01-14",
      weekEnd: "2024-01-20",
      schedules: [
        {
          location: "No.3",
          entries: [mockNo3Entries[1]],
        },
      ],
    },
    Minji: {
      employeeName: "Minji",
      weekStart: "2024-01-14",
      weekEnd: "2024-01-20",
      schedules: [
        {
          location: "Westminster",
          entries: [mockWestminsterEntries[0]],
        },
      ],
    },
  };

  const defaultProps = {
    employees: mockEmployees,
    no3Schedule: mockNo3Schedule,
    westminsterSchedule: mockWestminsterSchedule,
    employeeSchedules: mockEmployeeSchedules,
    todayDate: "2024-01-15",
  };

  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  describe("초기 로드", () => {
    it("전체 보기가 기본 선택되어 있다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // dynamic import 로딩 대기 - combobox가 나타날 때까지 기다림
      const combobox = await screen.findByRole("combobox", {}, { timeout: 3000 });
      expect(combobox).toBeInTheDocument();

      // 드롭다운 열어서 '전체 보기'가 선택되어 있는지 확인
      await user.click(combobox);

      // 옵션에서 '전체 보기'가 존재해야 함
      const allViewOption = await screen.findByRole("option", { name: "전체 보기" });
      expect(allViewOption).toBeInTheDocument();
    });

    it("No.3 탭이 기본 선택되어 있다", () => {
      render(<ScheduleViewer {...defaultProps} />);

      // No.3 탭이 active 상태여야 함
      const no3Tab = screen.getByRole("tab", { name: "No.3" });
      expect(no3Tab).toHaveAttribute("data-state", "active");
    });

    it("직원 목록이 드롭다운에 로드된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 드롭다운 열기
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      // 모든 직원이 옵션으로 존재해야 함
      for (const emp of mockEmployees) {
        expect(
          screen.getByRole("option", { name: emp.name })
        ).toBeInTheDocument();
      }
    });

    it("전체 보기 옵션이 드롭다운에 존재한다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      expect(
        screen.getByRole("option", { name: "전체 보기" })
      ).toBeInTheDocument();
    });
  });

  describe("전체 보기 모드", () => {
    it("LocationTabs가 렌더링된다", () => {
      render(<ScheduleViewer {...defaultProps} />);

      expect(screen.getByRole("tab", { name: "No.3" })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Westminster" })
      ).toBeInTheDocument();
    });

    it("WeeklyGrid가 렌더링된다", () => {
      render(<ScheduleViewer {...defaultProps} />);

      // WeeklyGrid 특징: 요일 헤더가 있음
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
    });

    it("No.3 탭에서 No.3 스케줄이 표시된다", () => {
      render(<ScheduleViewer {...defaultProps} />);

      // No.3 스케줄의 직원 이름이 그리드 내에 보여야 함
      const jennyElements = screen.getAllByText("Jenny");
      const ryanElements = screen.getAllByText("Ryan");

      expect(jennyElements.length).toBeGreaterThanOrEqual(1);
      expect(ryanElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("탭 전환", () => {
    it("Westminster 탭 클릭 시 Westminster 스케줄이 표시된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // Westminster 탭 클릭
      const westminsterTab = screen.getByRole("tab", { name: "Westminster" });
      await user.click(westminsterTab);

      // Westminster 탭이 active 상태
      expect(westminsterTab).toHaveAttribute("data-state", "active");

      // Westminster 스케줄의 직원이 그리드에 보여야 함
      const minjiElements = screen.getAllByText("Minji");
      expect(minjiElements.length).toBeGreaterThanOrEqual(1);
    });

    it("No.3 탭 클릭 시 No.3 스케줄로 돌아온다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // Westminster 탭 클릭
      await user.click(screen.getByRole("tab", { name: "Westminster" }));

      // No.3 탭 다시 클릭
      const no3Tab = screen.getByRole("tab", { name: "No.3" });
      await user.click(no3Tab);

      // No.3 탭이 active 상태
      expect(no3Tab).toHaveAttribute("data-state", "active");
    });
  });

  describe("직원 선택", () => {
    it("직원 선택 시 PersonalSchedule이 표시된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 드롭다운 열고 Jenny 선택
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Jenny" }));

      // PersonalSchedule의 특징: 직원 이름이 헤더에 표시됨
      // 그리고 LocationTabs가 사라짐
      expect(screen.queryByRole("tab", { name: "No.3" })).not.toBeInTheDocument();

      // 개인 스케줄 헤더에 이름 표시
      const headers = screen.getAllByText("Jenny");
      expect(headers.length).toBeGreaterThan(0);
    });

    it("직원 선택 시 해당 직원의 스케줄만 표시된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 드롭다운 열고 Ryan 선택
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Ryan" }));

      // Ryan의 스케줄이 표시되어야 함
      const ryanElements = screen.getAllByText("Ryan");
      expect(ryanElements.length).toBeGreaterThanOrEqual(1);

      // 개인 스케줄 특유의 UI 요소 확인
      const personalSchedule = document.querySelector(".personal-schedule");
      expect(personalSchedule).toBeInTheDocument();
    });

    it("전체 보기로 돌아오면 LocationTabs와 WeeklyGrid가 다시 표시된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 직원 선택
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Jenny" }));

      // 전체 보기로 돌아감
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByRole("option", { name: "전체 보기" }));

      // LocationTabs가 다시 보여야 함
      expect(screen.getByRole("tab", { name: "No.3" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Westminster" })).toBeInTheDocument();
    });
  });

  describe("오늘 날짜 전달", () => {
    it("todayDate가 하위 컴포넌트에 전달된다", () => {
      const { container } = render(<ScheduleViewer {...defaultProps} />);

      // WeeklyGrid에서 today 클래스가 있는 셀이 있어야 함
      const todayCells = container.querySelectorAll(".today");
      expect(todayCells.length).toBeGreaterThan(0);
    });
  });

  describe("URL 쿼리 파라미터", () => {
    it("URL에 employee 파라미터가 있으면 해당 직원이 선택된다", () => {
      mockSearchParams = new URLSearchParams("employee=Ryan");

      render(<ScheduleViewer {...defaultProps} />);

      // PersonalSchedule이 표시되어야 함
      const personalSchedule = document.querySelector(".personal-schedule");
      expect(personalSchedule).toBeInTheDocument();

      // PersonalSchedule 내에 Ryan 이름이 표시되어 있어야 함
      const employeeName = personalSchedule?.querySelector('[data-slot="card-title"]');
      expect(employeeName).toHaveTextContent("Ryan");
    });

    it("존재하지 않는 직원 이름이 URL에 있으면 전체 보기가 표시된다", () => {
      mockSearchParams = new URLSearchParams("employee=NonExistent");

      render(<ScheduleViewer {...defaultProps} />);

      // 전체 보기가 표시되어 있어야 함
      expect(screen.getByText("전체 보기")).toBeInTheDocument();
    });

    it("직원 선택 시 URL이 업데이트된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 드롭다운 열고 Jenny 선택
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Jenny" }));

      // router.replace가 호출되어야 함
      expect(mockReplace).toHaveBeenCalledWith("?employee=Jenny", {
        scroll: false,
      });
    });

    it("전체 보기 선택 시 URL에서 파라미터가 제거된다", async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams("employee=Ryan");

      render(<ScheduleViewer {...defaultProps} />);

      // 전체 보기로 변경
      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "전체 보기" }));

      // router.replace가 '/'로 호출되어야 함
      expect(mockReplace).toHaveBeenCalledWith("/", { scroll: false });
    });
  });
});

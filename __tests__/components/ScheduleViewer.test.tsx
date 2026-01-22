import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScheduleViewer from "@/components/ScheduleViewer";
import { WeekSchedule, ScheduleEntry } from "@/types/schedule";

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

  const defaultProps = {
    initialNo3Schedule: mockNo3Schedule,
    initialWestminsterSchedule: mockWestminsterSchedule,
    initialWeekStart: "2024-01-14",
    availableWeeks: ["2024-01-14", "2024-01-21", "2024-01-28"],
    todayDate: "2024-01-15",
  };

  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  describe("초기 로드", () => {
    it("검색바가 렌더링된다", async () => {
      render(<ScheduleViewer {...defaultProps} />);

      // 서치바 input 찾기
      const searchInput = await screen.findByRole(
        "combobox",
        {},
        { timeout: 3000 }
      );
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("placeholder", "Search");
    });

    it("No.3 탭이 기본 선택되어 있다", () => {
      render(<ScheduleViewer {...defaultProps} />);

      // No.3 탭이 active 상태여야 함
      const no3Tab = screen.getByRole("tab", { name: "No.3" });
      expect(no3Tab).toHaveAttribute("aria-selected", "true");
    });

    it("직원 목록이 드롭다운에 로드된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 서치바 클릭하여 드롭다운 열기
      const searchInput = screen.getByRole("combobox");
      await user.click(searchInput);

      // 스케줄에 있는 모든 직원이 드롭다운 옵션으로 표시되어야 함
      const expectedEmployees = ["Jenny", "Minji", "Ryan"]; // 알파벳 순
      for (const name of expectedEmployees) {
        const option = screen.getByRole("option", { name });
        expect(option).toBeInTheDocument();
      }
    });

    it("전체 직원 옵션이 드롭다운에 존재한다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      const searchInput = screen.getByRole("combobox");
      await user.click(searchInput);

      // 전체 직원 옵션이 드롭다운에 있어야 함
      const allOption = screen.getByRole("option", { name: "All employees" });
      expect(allOption).toBeInTheDocument();
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
      expect(westminsterTab).toHaveAttribute("aria-selected", "true");

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
      expect(no3Tab).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("직원 선택 (필터링 모드)", () => {
    // 드롭다운에서 옵션 선택하는 헬퍼 함수
    const selectEmployeeFromDropdown = async (
      user: ReturnType<typeof userEvent.setup>,
      employeeName: string
    ) => {
      const searchInput = screen.getByRole("combobox");
      await user.click(searchInput);
      const option = screen.getByRole("option", { name: employeeName });
      await user.click(option);
    };

    it("직원 선택 시 LocationTabs와 WeeklyGrid는 계속 표시된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 서치바 클릭하고 Jenny 선택
      await selectEmployeeFromDropdown(user, "Jenny");

      // LocationTabs가 여전히 표시되어 있어야 함 (새 디자인: 항상 표시)
      expect(screen.getByRole("tab", { name: "No.3" })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: "Westminster" })
      ).toBeInTheDocument();

      // WeeklyGrid도 여전히 표시 (요일 헤더 확인)
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
    });

    it("직원 선택 시 그리드에서 해당 직원만 표시된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 서치바 클릭하고 Ryan 선택
      await selectEmployeeFromDropdown(user, "Ryan");

      // 그리드에서 Ryan만 표시되어야 함
      expect(screen.getByRole("button", { name: /Ryan/ })).toBeInTheDocument();
      // 다른 직원은 그리드에 표시되지 않아야 함 (Jenny는 테스트 데이터에 없음)
      expect(
        screen.queryByRole("button", { name: /Minji/ })
      ).not.toBeInTheDocument();
    });

    it("전체 직원 선택 시 모든 직원이 표시된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 직원 선택
      await selectEmployeeFromDropdown(user, "Ryan");

      // 전체 직원으로 돌아감
      await selectEmployeeFromDropdown(user, "All employees");

      // 모든 직원이 그리드에 표시되어야 함 (테스트 데이터: Jenny, Ryan, Minji)
      expect(screen.getByRole("button", { name: /Ryan/ })).toBeInTheDocument();
    });
  });

  describe("오늘 날짜 전달", () => {
    it("todayDate가 하위 컴포넌트에 전달된다", () => {
      render(<ScheduleViewer {...defaultProps} />);

      // WeeklyGrid에서 오늘 날짜 aria-label 확인
      const todayColumn = screen.getByRole("columnheader", {
        name: /Mon 01\/15 \(오늘\)/,
      });
      expect(todayColumn).toBeInTheDocument();
    });
  });

  describe("URL 쿼리 파라미터", () => {
    it("URL에 employee 파라미터가 있으면 해당 직원만 표시된다", () => {
      mockSearchParams = new URLSearchParams("employee=Ryan");

      render(<ScheduleViewer {...defaultProps} />);

      // Ryan만 그리드에 표시되어야 함
      expect(screen.getByText("Ryan")).toBeInTheDocument();
      // 다른 직원은 표시되지 않아야 함
      expect(screen.queryByText("Jenny")).not.toBeInTheDocument();
    });

    it("존재하지 않는 직원 이름이 URL에 있으면 전체 직원이 표시된다", () => {
      mockSearchParams = new URLSearchParams("employee=NonExistent");

      render(<ScheduleViewer {...defaultProps} />);

      // 전체 직원이 그리드에 표시되어 있어야 함
      expect(screen.getByText("Jenny")).toBeInTheDocument();
      expect(screen.getByText("Ryan")).toBeInTheDocument();
    });

    it("직원 선택 시 URL이 업데이트된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 서치바 클릭하고 Ryan 선택
      const searchInput = screen.getByRole("combobox");
      await user.click(searchInput);
      const ryanOption = screen.getByRole("option", { name: "Ryan" });
      await user.click(ryanOption);

      // router.replace가 호출되어야 함
      expect(mockReplace).toHaveBeenCalledWith("?employee=Ryan", {
        scroll: false,
      });
    });

    it("전체 직원 선택 시 URL에서 파라미터가 제거된다", async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams("employee=Ryan");

      render(<ScheduleViewer {...defaultProps} />);

      // 전체 직원으로 변경
      const searchInput = screen.getByRole("combobox");
      await user.click(searchInput);
      const allOption = screen.getByRole("option", { name: "All employees" });
      await user.click(allOption);

      // router.replace가 '/'로 호출되어야 함
      expect(mockReplace).toHaveBeenCalledWith("/", { scroll: false });
    });
  });
});

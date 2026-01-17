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
    it("전체 직원이 기본 선택되어 있다", async () => {
      render(<ScheduleViewer {...defaultProps} />);

      // 직원 선택 버튼 찾기
      const trigger = await screen.findByRole("button", { name: "직원 선택" }, { timeout: 3000 });
      expect(trigger).toBeInTheDocument();

      // 트리거에 '전체 직원' 텍스트가 표시되어 있어야 함
      expect(screen.getByText("전체 직원")).toBeInTheDocument();
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

      // 드롭다운 열기
      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);

      // 모든 직원이 표시되어야 함 (드롭다운 + 그리드에 표시될 수 있음)
      for (const emp of mockEmployees) {
        const elements = screen.getAllByText(emp.name);
        expect(elements.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("전체 직원 옵션이 드롭다운에 존재한다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);

      // 전체 직원 옵션이 드롭다운에 있어야 함 (trigger + option = 2개)
      const allTexts = screen.getAllByText("전체 직원");
      expect(allTexts.length).toBeGreaterThanOrEqual(2);
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

  describe("직원 선택 (드롭다운 하이라이트 모드)", () => {
    // 드롭다운에서 옵션 선택하는 헬퍼 함수
    const selectEmployeeFromDropdown = async (user: ReturnType<typeof userEvent.setup>, employeeName: string) => {
      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);
      // 드롭다운 내의 옵션들은 span.font-medium 안에 있음
      const options = screen.getAllByText(employeeName);
      // 드롭다운 옵션은 span 태그 안에 있고, 부모가 button임
      const dropdownOption = options.find(el =>
        el.tagName === 'SPAN' && el.closest('button')?.classList.contains('w-full')
      );
      if (dropdownOption) {
        await user.click(dropdownOption);
      }
    };

    it("직원 선택 시 LocationTabs와 WeeklyGrid는 계속 표시된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 드롭다운 열고 Jenny 선택
      await selectEmployeeFromDropdown(user, "Jenny");

      // LocationTabs가 여전히 표시되어 있어야 함 (새 디자인: 항상 표시)
      expect(screen.getByRole("tab", { name: "No.3" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Westminster" })).toBeInTheDocument();

      // WeeklyGrid도 여전히 표시 (요일 헤더 확인)
      expect(screen.getByText("Sun")).toBeInTheDocument();
      expect(screen.getByText("Mon")).toBeInTheDocument();
    });

    it("직원 선택 시 그리드에서 해당 직원이 하이라이트된다", async () => {
      const user = userEvent.setup();
      const { container } = render(<ScheduleViewer {...defaultProps} />);

      // 드롭다운 열고 Jenny 선택
      await selectEmployeeFromDropdown(user, "Jenny");

      // 그리드에서 Jenny 뱃지가 하이라이트 스타일(scale-105)을 가져야 함
      const jennyBadges = container.querySelectorAll('.employee-badge');
      const highlightedBadge = Array.from(jennyBadges).find(
        badge => badge.textContent?.includes('Jenny') && badge.classList.contains('scale-105')
      );
      expect(highlightedBadge).toBeInTheDocument();
    });

    it("전체 직원 선택 시 하이라이트가 해제된다", async () => {
      const user = userEvent.setup();
      const { container } = render(<ScheduleViewer {...defaultProps} />);

      // 직원 선택
      await selectEmployeeFromDropdown(user, "Jenny");

      // 전체 직원으로 돌아감
      await selectEmployeeFromDropdown(user, "전체 직원");

      // 하이라이트된 뱃지가 없어야 함 (scale-105 클래스 없음)
      const highlightedBadges = container.querySelectorAll('.employee-badge.scale-105');
      expect(highlightedBadges.length).toBe(0);
    });
  });

  describe("오늘 날짜 전달", () => {
    it("todayDate가 하위 컴포넌트에 전달된다", () => {
      render(<ScheduleViewer {...defaultProps} />);

      // WeeklyGrid에서 오늘 날짜 aria-label 확인
      const todayColumn = screen.getByRole("columnheader", { name: /Mon 01\/15 \(오늘\)/ });
      expect(todayColumn).toBeInTheDocument();
    });
  });

  describe("URL 쿼리 파라미터", () => {
    it("URL에 employee 파라미터가 있으면 해당 직원이 하이라이트된다", () => {
      mockSearchParams = new URLSearchParams("employee=Ryan");

      const { container } = render(<ScheduleViewer {...defaultProps} />);

      // Ryan이 그리드에서 하이라이트 되어 있어야 함 (scale-105 클래스)
      const ryanBadges = container.querySelectorAll('.employee-badge');
      const highlightedBadge = Array.from(ryanBadges).find(
        badge => badge.textContent?.includes('Ryan') && badge.classList.contains('scale-105')
      );
      expect(highlightedBadge).toBeInTheDocument();
    });

    it("존재하지 않는 직원 이름이 URL에 있으면 전체 직원이 표시된다", () => {
      mockSearchParams = new URLSearchParams("employee=NonExistent");

      render(<ScheduleViewer {...defaultProps} />);

      // 전체 직원이 표시되어 있어야 함
      expect(screen.getByText("전체 직원")).toBeInTheDocument();
    });

    it("직원 선택 시 URL이 업데이트된다", async () => {
      const user = userEvent.setup();
      render(<ScheduleViewer {...defaultProps} />);

      // 드롭다운 열고 Jenny 선택
      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);
      // 드롭다운 내의 Jenny 옵션 선택
      const jennyOptions = screen.getAllByText("Jenny");
      const dropdownOption = jennyOptions.find(el =>
        el.tagName === 'SPAN' && el.closest('button')?.classList.contains('w-full')
      );
      if (dropdownOption) {
        await user.click(dropdownOption);
      }

      // router.replace가 호출되어야 함
      expect(mockReplace).toHaveBeenCalledWith("?employee=Jenny", {
        scroll: false,
      });
    });

    it("전체 직원 선택 시 URL에서 파라미터가 제거된다", async () => {
      const user = userEvent.setup();
      mockSearchParams = new URLSearchParams("employee=Ryan");

      render(<ScheduleViewer {...defaultProps} />);

      // 전체 직원으로 변경
      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);
      // 드롭다운 내의 전체 직원 옵션 선택
      const allOptions = screen.getAllByText("전체 직원");
      const dropdownOption = allOptions.find(el =>
        el.tagName === 'SPAN' && el.closest('button')?.classList.contains('w-full')
      );
      if (dropdownOption) {
        await user.click(dropdownOption);
      }

      // router.replace가 '/'로 호출되어야 함
      expect(mockReplace).toHaveBeenCalledWith("/", { scroll: false });
    });
  });
});

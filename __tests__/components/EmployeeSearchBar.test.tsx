import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeSearchBar from "@/components/EmployeeSearchBar";

describe("EmployeeSearchBar", () => {
  const mockEmployees = ["Ryan", "Jenny", "Minji", "Hyeonwoo", "Rachel"];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Initial rendering", () => {
    it("should render search input with placeholder", () => {
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "직원 검색...");
    });

    it("should show dropdown when input is focused", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);

      // 드롭다운이 열려야 함
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      // 전체 직원 옵션
      expect(screen.getByText("전체 직원")).toBeInTheDocument();
      // 모든 직원이 표시되어야 함
      expect(screen.getByText("Ryan")).toBeInTheDocument();
      expect(screen.getByText("Jenny")).toBeInTheDocument();
      expect(screen.getByText("Minji")).toBeInTheDocument();
      expect(screen.getByText("Hyeonwoo")).toBeInTheDocument();
      expect(screen.getByText("Rachel")).toBeInTheDocument();
    });

    it("should display selected employee name in input when provided", () => {
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee="Jenny"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      expect(input).toHaveValue("Jenny");
    });

    it("should show clear button when employee is selected", () => {
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee="Jenny"
          onChange={mockOnChange}
        />
      );

      const clearButton = screen.getByRole("button", { name: "선택 해제" });
      expect(clearButton).toBeInTheDocument();
    });

    it("should not show clear button when no employee is selected", () => {
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      expect(
        screen.queryByRole("button", { name: "선택 해제" })
      ).not.toBeInTheDocument();
    });
  });

  describe("Search filtering", () => {
    it("should filter dropdown options while typing", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);
      await user.type(input, "R");

      // "R"로 시작하는 직원만 표시
      expect(screen.getByText("Ryan")).toBeInTheDocument();
      expect(screen.getByText("Rachel")).toBeInTheDocument();
      expect(screen.queryByText("Jenny")).not.toBeInTheDocument();
      expect(screen.queryByText("Minji")).not.toBeInTheDocument();
    });

    it("should filter case-insensitively", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);
      await user.type(input, "ryan");

      expect(screen.getByText("Ryan")).toBeInTheDocument();
    });

    it("should show all employees when search is empty", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);
      await user.type(input, "R");
      await user.clear(input);

      // 모든 직원이 다시 표시되어야 함
      expect(screen.getByText("Ryan")).toBeInTheDocument();
      expect(screen.getByText("Jenny")).toBeInTheDocument();
      expect(screen.getByText("Minji")).toBeInTheDocument();
    });

    it("should NOT trigger onChange while typing", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);
      await user.type(input, "Ryan");

      // 타이핑 중에는 onChange 호출 안됨
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("Selection behavior", () => {
    it("should call onChange when clicking dropdown option", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);

      const ryanOption = screen.getByRole("option", { name: "Ryan" });
      await user.click(ryanOption);

      expect(mockOnChange).toHaveBeenCalledWith("Ryan");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("should call onChange when pressing Enter with exact match", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);
      await user.type(input, "Ryan");
      await user.keyboard("{Enter}");

      expect(mockOnChange).toHaveBeenCalledWith("Ryan");
    });

    it("should NOT call onChange when pressing Enter without exact match", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);
      await user.type(input, "Rya"); // 불완전 매치
      await user.keyboard("{Enter}");

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should call onChange with null when clicking clear button", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee="Ryan"
          onChange={mockOnChange}
        />
      );

      const clearButton = screen.getByRole("button", { name: "선택 해제" });
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('should call onChange with null when selecting "전체 직원"', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee="Ryan"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);

      const allOption = screen.getByRole("option", { name: "전체 직원" });
      await user.click(allOption);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it("should close dropdown after selection", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);

      const ryanOption = screen.getByRole("option", { name: "Ryan" });
      await user.click(ryanOption);

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("Keyboard navigation", () => {
    it("should close dropdown when pressing Escape", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);

      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty employee list", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={[]}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);

      // 전체 직원 옵션만 있어야 함
      expect(screen.getByText("전체 직원")).toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(1);
    });

    it("should show no results message when no match found", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox");
      await user.click(input);
      await user.type(input, "xyz");

      expect(screen.getByText("검색 결과 없음")).toBeInTheDocument();
    });
  });
});

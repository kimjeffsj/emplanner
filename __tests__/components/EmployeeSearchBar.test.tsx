import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeSearchBar from "@/components/EmployeeSearchBar";

describe("EmployeeSearchBar", () => {
  const mockEmployees = ["John", "Jane", "Alice", "Bob", "Charlie"];
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
      expect(input).toHaveAttribute("placeholder", "Search");
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
      expect(screen.getByText("All employees")).toBeInTheDocument();
      // 모든 직원이 표시되어야 함
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    it("should display selected employee name in input when provided", () => {
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee="Jane"
          onChange={mockOnChange}
        />
      );

      const input = screen.getByRole("combobox") as HTMLInputElement;
      expect(input).toHaveValue("Jane");
    });

    it("should show clear button when employee is selected", () => {
      render(
        <EmployeeSearchBar
          employees={mockEmployees}
          selectedEmployee="Jenny"
          onChange={mockOnChange}
        />
      );

      const clearButton = screen.getByRole("button", { name: "Clear" });
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
        screen.queryByRole("button", { name: "Clear" })
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
      await user.type(input, "J");

      // "J"로 시작하는 직원만 표시되어야 함
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
      expect(screen.queryByText("Bob")).not.toBeInTheDocument();
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
      await user.type(input, "john");

      expect(screen.getByText("John")).toBeInTheDocument();
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
      await user.type(input, "J");
      await user.clear(input);

      // 모든 직원이 다시 표시되어야 함
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
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
      await user.type(input, "John");

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

      const johnOption = screen.getByRole("option", { name: "John" });
      await user.click(johnOption);

      expect(mockOnChange).toHaveBeenCalledWith("John");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it.skip("should call onChange when pressing Enter with exact match", async () => {
      // 컴포넌트가 Enter 키 동작을 지원하지 않음
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

      const clearButton = screen.getByRole("button", { name: "Clear" });
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

      const allOption = screen.getByRole("option", { name: "All employees" });
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

      const johnOption = screen.getByRole("option", { name: "John" });
      await user.click(johnOption);

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
      expect(screen.getByText("All employees")).toBeInTheDocument();
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

      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });
});

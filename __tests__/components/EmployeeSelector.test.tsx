import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmployeeSelector from "@/components/EmployeeSelector";

describe("EmployeeSelector", () => {
  const mockEmployees = ["Ryan", "Jenny", "Minji", "Hyeonwoo"];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Initial rendering", () => {
    it('should display "전체 직원" as default value', () => {
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole("button", { name: "직원 선택" });
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText("전체 직원")).toBeInTheDocument();
    });
  });

  describe("Employee list rendering", () => {
    it("should render all employee names when dropdown is opened", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);

      // 전체 직원 옵션과 모든 직원이 표시되어야 함
      expect(screen.getAllByText("전체 직원")).toHaveLength(2); // trigger + option
      expect(screen.getByText("Ryan")).toBeInTheDocument();
      expect(screen.getByText("Jenny")).toBeInTheDocument();
      expect(screen.getByText("Minji")).toBeInTheDocument();
      expect(screen.getByText("Hyeonwoo")).toBeInTheDocument();
    });
  });

  describe("Selection behavior", () => {
    it("should call onChange with employee name when selecting an employee", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);

      const ryanOption = screen.getByText("Ryan");
      await user.click(ryanOption);

      expect(mockOnChange).toHaveBeenCalledWith("Ryan");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with null when selecting "전체 직원"', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee="Ryan"
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);

      // 드롭다운 내의 "전체 직원" 옵션 클릭 (두 번째 "전체 직원" 텍스트)
      const allOptions = screen.getAllByText("전체 직원");
      // trigger에 있는 건 "Ryan"이 표시되므로 드롭다운에서만 "전체 직원" 찾음
      await user.click(allOptions[0]);

      expect(mockOnChange).toHaveBeenCalledWith(null);
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("should display selected employee when provided", () => {
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee="Jenny"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("Jenny")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty employee list", async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSelector
          employees={[]}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole("button", { name: "직원 선택" });
      await user.click(trigger);

      // 전체 직원 옵션만 있어야 함 (trigger + dropdown option)
      const allEmployeeTexts = screen.getAllByText("전체 직원");
      expect(allEmployeeTexts).toHaveLength(2);
    });
  });
});

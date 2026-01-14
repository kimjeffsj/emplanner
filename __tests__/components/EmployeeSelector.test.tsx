import { render, screen, fireEvent } from "@testing-library/react";
import EmployeeSelector from "@/components/EmployeeSelector";

describe("EmployeeSelector", () => {
  const mockEmployees = ["Ryan", "Jenny", "Minji", "Hyeonwoo"];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Initial rendering", () => {
    it('should display "전체 보기" as default value', () => {
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("all");
      expect(screen.getByText("전체 보기")).toBeInTheDocument();
    });
  });

  describe("Employee list rendering", () => {
    it("should render all employee names in the dropdown", () => {
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole("combobox");
      const options = Array.from(select.querySelectorAll("option"));
      const optionTexts = options.map((opt) => opt.textContent);

      expect(optionTexts).toContain("전체 보기");
      expect(optionTexts).toContain("Ryan");
      expect(optionTexts).toContain("Jenny");
      expect(optionTexts).toContain("Minji");
      expect(optionTexts).toContain("Hyeonwoo");
    });

    it('should render "전체 보기" option with value "all"', () => {
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const allOption = screen.getByText("전체 보기");
      expect(allOption).toHaveAttribute("value", "all");
    });
  });

  describe("Selection behavior", () => {
    it("should call onChange with employee name when selecting an employee", () => {
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "Ryan" } });

      expect(mockOnChange).toHaveBeenCalledWith("Ryan");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with null when selecting "전체 보기"', () => {
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee="Ryan"
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "all" } });

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

      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("Jenny");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty employee list", () => {
      render(
        <EmployeeSelector
          employees={[]}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      const select = screen.getByRole("combobox");
      const options = Array.from(select.querySelectorAll("option"));

      expect(options).toHaveLength(1);
      expect(options[0].textContent).toBe("전체 보기");
    });
  });
});

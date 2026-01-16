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
    it('should display "전체 보기" as default value', () => {
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("전체 보기")).toBeInTheDocument();
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

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      expect(screen.getByRole("option", { name: "전체 보기" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Ryan" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Jenny" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Minji" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Hyeonwoo" })).toBeInTheDocument();
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

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const ryanOption = screen.getByRole("option", { name: "Ryan" });
      await user.click(ryanOption);

      expect(mockOnChange).toHaveBeenCalledWith("Ryan");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with null when selecting "전체 보기"', async () => {
      const user = userEvent.setup();
      render(
        <EmployeeSelector
          employees={mockEmployees}
          selectedEmployee="Ryan"
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const allOption = screen.getByRole("option", { name: "전체 보기" });
      await user.click(allOption);

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

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(screen.getByRole("option", { name: "전체 보기" })).toBeInTheDocument();
    });
  });
});

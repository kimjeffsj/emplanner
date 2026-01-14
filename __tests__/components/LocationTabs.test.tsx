import { render, screen, fireEvent } from "@testing-library/react";
import LocationTabs from "@/components/LocationTabs";

describe("LocationTabs", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe("Tab rendering", () => {
    it("should render two location tabs", () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      expect(screen.getByText("No.3")).toBeInTheDocument();
      expect(screen.getByText("Westminster")).toBeInTheDocument();
    });

    it("should render tabs as buttons", () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });
  });

  describe("Active tab styling", () => {
    it("should apply active class to No.3 tab when selected", () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const no3Tab = screen.getByText("No.3");
      expect(no3Tab).toHaveClass("active");
    });

    it("should apply active class to Westminster tab when selected", () => {
      render(
        <LocationTabs selectedLocation="Westminster" onChange={mockOnChange} />
      );

      const westminsterTab = screen.getByText("Westminster");
      expect(westminsterTab).toHaveClass("active");
    });

    it("should not apply active class to non-selected tab", () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const westminsterTab = screen.getByText("Westminster");
      expect(westminsterTab).not.toHaveClass("active");
    });
  });

  describe("Click behavior", () => {
    it('should call onChange with "No.3" when No.3 tab is clicked', () => {
      render(
        <LocationTabs selectedLocation="Westminster" onChange={mockOnChange} />
      );

      const no3Tab = screen.getByText("No.3");
      fireEvent.click(no3Tab);

      expect(mockOnChange).toHaveBeenCalledWith("No.3");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with "Westminster" when Westminster tab is clicked', () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const westminsterTab = screen.getByText("Westminster");
      fireEvent.click(westminsterTab);

      expect(mockOnChange).toHaveBeenCalledWith("Westminster");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("should allow clicking the already active tab", () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const no3Tab = screen.getByText("No.3");
      fireEvent.click(no3Tab);

      expect(mockOnChange).toHaveBeenCalledWith("No.3");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });
});

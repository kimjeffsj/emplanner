import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

    it("should render tabs with tab role", () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
    });
  });

  describe("Active tab styling", () => {
    it("should mark No.3 tab as active when selected", () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const no3Tab = screen.getByRole("tab", { name: "No.3" });
      expect(no3Tab).toHaveAttribute("aria-selected", "true");
    });

    it("should mark Westminster tab as active when selected", () => {
      render(
        <LocationTabs selectedLocation="Westminster" onChange={mockOnChange} />
      );

      const westminsterTab = screen.getByRole("tab", { name: "Westminster" });
      expect(westminsterTab).toHaveAttribute("aria-selected", "true");
    });

    it("should not mark non-selected tab as active", () => {
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const westminsterTab = screen.getByRole("tab", { name: "Westminster" });
      expect(westminsterTab).toHaveAttribute("aria-selected", "false");
    });
  });

  describe("Click behavior", () => {
    it('should call onChange with "No.3" when No.3 tab is clicked', async () => {
      const user = userEvent.setup();
      render(
        <LocationTabs selectedLocation="Westminster" onChange={mockOnChange} />
      );

      const no3Tab = screen.getByRole("tab", { name: "No.3" });
      await user.click(no3Tab);

      expect(mockOnChange).toHaveBeenCalledWith("No.3");
    });

    it('should call onChange with "Westminster" when Westminster tab is clicked', async () => {
      const user = userEvent.setup();
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const westminsterTab = screen.getByRole("tab", { name: "Westminster" });
      await user.click(westminsterTab);

      expect(mockOnChange).toHaveBeenCalledWith("Westminster");
    });

    it("should call onChange when clicking the already active tab", async () => {
      // Custom tabs component triggers onChange even for already active tab
      const user = userEvent.setup();
      render(<LocationTabs selectedLocation="No.3" onChange={mockOnChange} />);

      const no3Tab = screen.getByRole("tab", { name: "No.3" });
      await user.click(no3Tab);

      expect(mockOnChange).toHaveBeenCalledWith("No.3");
    });
  });
});

import { render, screen } from "@testing-library/react";
import ShiftBadge from "@/components/ShiftBadge";

describe("ShiftBadge", () => {
  describe("All day shift", () => {
    it('should display "*" for "*" shift type', () => {
      render(<ShiftBadge shift="*" />);

      const badge = screen.getByText("*");
      expect(badge).toBeInTheDocument();
    });

    it('should have shift-badge class for "*" shift type', () => {
      render(<ShiftBadge shift="*" />);

      const badge = screen.getByText("*");
      expect(badge).toHaveClass("shift-badge");
    });
  });

  describe("Morning shift", () => {
    it('should display "11:00~" for morning shift', () => {
      render(<ShiftBadge shift="11:00" />);

      const badge = screen.getByText("11:00~");
      expect(badge).toBeInTheDocument();
    });

    it('should have shift-badge class for "11:00" shift', () => {
      render(<ShiftBadge shift="11:00" />);

      const badge = screen.getByText("11:00~");
      expect(badge).toHaveClass("shift-badge");
    });
  });

  describe("Evening shift", () => {
    it('should display "15:30~" for evening shift', () => {
      render(<ShiftBadge shift="15:30" />);

      const badge = screen.getByText("15:30~");
      expect(badge).toBeInTheDocument();
    });

    it('should have shift-badge class for "15:30" shift', () => {
      render(<ShiftBadge shift="15:30" />);

      const badge = screen.getByText("15:30~");
      expect(badge).toHaveClass("shift-badge");
    });
  });
});

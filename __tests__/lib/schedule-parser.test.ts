import {
  parseTimeNote,
  parseEmployees,
  getShiftType,
  parseScheduleSheet,
} from "@/lib/schedule-parser";
import type { Location, ScheduleEntry } from "@/types/schedule";

describe("parseTimeNote", () => {
  it('should parse name with "until" time note', () => {
    const result = parseTimeNote("Jane(until 17:00)");

    expect(result).toEqual({
      name: "Jane",
      note: {
        type: "until",
        time: "17:00",
      },
    });
  });

  it('should parse name with "from" time note', () => {
    const result = parseTimeNote("Alice(from 17:30)");

    expect(result).toEqual({
      name: "Alice",
      note: {
        type: "from",
        time: "17:30",
      },
    });
  });

  it("should parse name without time note", () => {
    const result = parseTimeNote("John");

    expect(result).toEqual({
      name: "John",
      note: undefined,
    });
  });

  // Edge cases
  it("should handle name with extra spaces", () => {
    const result = parseTimeNote("  Jane  (until 17:00)  ");

    expect(result).toEqual({
      name: "Jane",
      note: {
        type: "until",
        time: "17:00",
      },
    });
  });

  it("should handle empty string", () => {
    const result = parseTimeNote("");

    expect(result).toEqual({
      name: "",
      note: undefined,
    });
  });
});

describe("parseEmployees", () => {
  it("should parse employee list from 2D array", () => {
    const mockData = [
      ["Name"], // 헤더
      ["John"],
      ["Jane"],
      ["Alice"],
      ["Bob"],
    ];

    const result = parseEmployees(mockData);

    expect(result).toEqual(["John", "Jane", "Alice", "Bob"]);
  });

  it("should skip header row", () => {
    const mockData = [
      ["Name"], // 헤더는 스킵되어야 함
      ["John"],
    ];

    const result = parseEmployees(mockData);

    expect(result).toEqual(["John"]);
    expect(result).not.toContain("Name");
  });

  it("should filter out empty rows", () => {
    const mockData = [
      ["Name"],
      ["John"],
      [""], // 빈 문자열
      ["Jane"],
      [" "], // 공백만
    ];

    const result = parseEmployees(mockData);

    expect(result).toEqual(["John", "Jane"]);
  });

  it("should trim whitespace from names", () => {
    const mockData = [["Name"], ["  John  "], [" Jane "]];

    const result = parseEmployees(mockData);

    expect(result).toEqual(["John", "Jane"]);
  });

  it("should handle empty input", () => {
    const mockData = [["Name"]];

    const result = parseEmployees(mockData);

    expect(result).toEqual([]);
  });
});

describe("getShiftType", () => {
  it('should return "*" for all day shift', () => {
    const result = getShiftType("*");

    expect(result).toBe("*");
  });

  it('should return "11:00" for morning shift', () => {
    const result = getShiftType("11:00");

    expect(result).toBe("11:00");
  });

  it('should return "15:30" for afternoon shift', () => {
    const result = getShiftType("15:30");

    expect(result).toBe("15:30");
  });

  it("should return null for empty string", () => {
    const result = getShiftType("");

    expect(result).toBeNull();
  });

  it("should return null for whitespace only", () => {
    const result = getShiftType("   ");

    expect(result).toBeNull();
  });

  it("should return null for invalid shift time", () => {
    const result = getShiftType("12:00");

    expect(result).toBeNull();
  });

  it("should return null for non-shift values", () => {
    expect(getShiftType("Yuran")).toBeNull();
    expect(getShiftType("Sunday")).toBeNull();
    expect(getShiftType("2025-01-04")).toBeNull();
  });

  it("should handle shift type with extra spaces", () => {
    expect(getShiftType("  *  ")).toBe("*");
    expect(getShiftType(" 11:00 ")).toBe("11:00");
    expect(getShiftType("  15:30  ")).toBe("15:30");
  });
});

describe("parseScheduleSheet", () => {
  const location: Location = "No.3";

  it("should parse basic schedule with all shift types", () => {
    const mockData = [
      [
        "No.3",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      [
        "",
        "2025-01-05",
        "2025-01-06",
        "2025-01-07",
        "2025-01-08",
        "2025-01-09",
        "2025-01-10",
        "2025-01-11",
      ],
      ["*", "", "John", "Jane", "Alice", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["11:00", "Bob", "K", "", "", "", "", ""],
      ["", "Charlie", "B", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["15:30", "Mina", "Ari", "", "", "", "", ""],
      ["", "Jenny", "Gahee", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    // All day shift entries
    expect(result).toContainEqual({
      name: "John",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "*",
      location: "No.3",
    });

    expect(result).toContainEqual({
      name: "Jane",
      date: "2025-01-07",
      dayOfWeek: "Tuesday",
      shift: "*",
      location: "No.3",
    });

    // Morning shift entries
    expect(result).toContainEqual({
      name: "Bob",
      date: "2025-01-05",
      dayOfWeek: "Sunday",
      shift: "11:00",
      location: "No.3",
    });

    expect(result).toContainEqual({
      name: "K",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "11:00",
      location: "No.3",
    });

    // Afternoon shift entries
    expect(result).toContainEqual({
      name: "Mina",
      date: "2025-01-05",
      dayOfWeek: "Sunday",
      shift: "15:30",
      location: "No.3",
    });

    expect(result).toContainEqual({
      name: "Ari",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "15:30",
      location: "No.3",
    });
  });

  it("should parse names with time notes (until/from)", () => {
    const mockData = [
      [
        "No.3",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      [
        "",
        "2025-01-05",
        "2025-01-06",
        "2025-01-07",
        "2025-01-08",
        "2025-01-09",
        "2025-01-10",
        "2025-01-11",
      ],
      ["11:00", "", "", "Jenny(until 17:00)", "", "", "", ""],
      ["15:30", "", "Alice(from 17:30)", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    expect(result).toContainEqual({
      name: "Jenny",
      date: "2025-01-07",
      dayOfWeek: "Tuesday",
      shift: "11:00",
      location: "No.3",
      note: {
        type: "until",
        time: "17:00",
      },
    });

    expect(result).toContainEqual({
      name: "Minji",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "15:30",
      location: "No.3",
      note: {
        type: "from",
        time: "17:30",
      },
    });
  });

  it("should skip empty cells", () => {
    const mockData = [
      [
        "No.3",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      [
        "",
        "2025-01-05",
        "2025-01-06",
        "2025-01-07",
        "2025-01-08",
        "2025-01-09",
        "2025-01-10",
        "2025-01-11",
      ],
      ["*", "", "John", "", "Alice", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["11:00", "", "", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    // Should only have 2 entries (Hyeonwoo and Ryan)
    expect(result).toHaveLength(2);
    expect(result.map((e: ScheduleEntry) => e.name)).toEqual([
      "Hyeonwoo",
      "Ryan",
    ]);
  });

  it("should handle multiple rows within same shift", () => {
    const mockData = [
      [
        "No.3",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      [
        "",
        "2025-01-05",
        "2025-01-06",
        "2025-01-07",
        "2025-01-08",
        "2025-01-09",
        "2025-01-10",
        "2025-01-11",
      ],
      ["11:00", "Yuran", "K", "", "", "", "", ""],
      ["", "Hyeonwoo", "B", "", "", "", "", ""],
      ["", "", "Jeff", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    // All should be 11:00 shift
    expect(result.every((e: ScheduleEntry) => e.shift === "11:00")).toBe(true);

    // Check Monday has 3 people
    const mondayEntries = result.filter(
      (e: ScheduleEntry) => e.dayOfWeek === "Monday"
    );
    expect(mondayEntries).toHaveLength(3);
    expect(mondayEntries.map((e: ScheduleEntry) => e.name).sort()).toEqual([
      "B",
      "Jeff",
      "K",
    ]);
  });

  it("should handle Westminster location", () => {
    const mockData = [
      [
        "Westminster",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      [
        "",
        "2025-01-05",
        "2025-01-06",
        "2025-01-07",
        "2025-01-08",
        "2025-01-09",
        "2025-01-10",
        "2025-01-11",
      ],
      ["*", "", "Ryan", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, "Westminster");

    expect(result).toContainEqual({
      name: "Ryan",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "*",
      location: "Westminster",
    });
  });

  it("should handle empty schedule", () => {
    const mockData = [
      [
        "No.3",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      [
        "",
        "2025-01-05",
        "2025-01-06",
        "2025-01-07",
        "2025-01-08",
        "2025-01-09",
        "2025-01-10",
        "2025-01-11",
      ],
      ["*", "", "", "", "", "", "", ""],
      ["11:00", "", "", "", "", "", "", ""],
      ["15:30", "", "", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    expect(result).toEqual([]);
  });

  it("should skip rows without shift type in column A", () => {
    const mockData = [
      [
        "No.3",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      [
        "",
        "2025-01-05",
        "2025-01-06",
        "2025-01-07",
        "2025-01-08",
        "2025-01-09",
        "2025-01-10",
        "2025-01-11",
      ],
      ["*", "", "Hyeonwoo", "", "", "", "", ""],
      ["InvalidShift", "ShouldBeSkipped", "", "", "", "", "", ""],
      ["11:00", "Yuran", "", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    expect(result).toHaveLength(2);
    expect(result.map((e: ScheduleEntry) => e.name)).toEqual([
      "Hyeonwoo",
      "Yuran",
    ]);
    expect(result).not.toContainEqual(
      expect.objectContaining({ name: "ShouldBeSkipped" })
    );
  });
});

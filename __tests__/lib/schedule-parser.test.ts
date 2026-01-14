import {
  parseTimeNote,
  parseEmployees,
  getShiftType,
  parseScheduleSheet,
} from "@/lib/schedule-parser";
import type { Location, ScheduleEntry } from "@/types/schedule";

describe("parseTimeNote", () => {
  it('should parse name with "until" time note', () => {
    const result = parseTimeNote("Jenny(until 17:00)");

    expect(result).toEqual({
      name: "Jenny",
      note: {
        type: "until",
        time: "17:00",
      },
    });
  });

  it('should parse name with "from" time note', () => {
    const result = parseTimeNote("Minji(from 17:30)");

    expect(result).toEqual({
      name: "Minji",
      note: {
        type: "from",
        time: "17:30",
      },
    });
  });

  it("should parse name without time note", () => {
    const result = parseTimeNote("Ryan");

    expect(result).toEqual({
      name: "Ryan",
      note: undefined,
    });
  });

  // Edge cases
  it("should handle name with extra spaces", () => {
    const result = parseTimeNote("  Jenny  (until 17:00)  ");

    expect(result).toEqual({
      name: "Jenny",
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
      ["Yuran"],
      ["Hyeonwoo"],
      ["Jenny"],
      ["Minji"],
    ];

    const result = parseEmployees(mockData);

    expect(result).toEqual(["Yuran", "Hyeonwoo", "Jenny", "Minji"]);
  });

  it("should skip header row", () => {
    const mockData = [
      ["Name"], // 헤더는 스킵되어야 함
      ["Ryan"],
    ];

    const result = parseEmployees(mockData);

    expect(result).toEqual(["Ryan"]);
    expect(result).not.toContain("Name");
  });

  it("should filter out empty rows", () => {
    const mockData = [
      ["Name"],
      ["Yuran"],
      [""], // 빈 문자열
      ["Hyeonwoo"],
      [" "], // 공백만
    ];

    const result = parseEmployees(mockData);

    expect(result).toEqual(["Yuran", "Hyeonwoo"]);
  });

  it("should trim whitespace from names", () => {
    const mockData = [["Name"], ["  Yuran  "], [" Hyeonwoo "]];

    const result = parseEmployees(mockData);

    expect(result).toEqual(["Yuran", "Hyeonwoo"]);
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
  const location: Location = "No3";

  it("should parse basic schedule with all shift types", () => {
    const mockData = [
      [
        "No3",
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
      ["*", "", "Hyeonwoo", "Min", "Ryan", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["11:00", "Yuran", "K", "", "", "", "", ""],
      ["", "Hyeonwoo", "B", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["15:30", "Mina", "Ari", "", "", "", "", ""],
      ["", "Jenny", "Gahee", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    // All day shift entries
    expect(result).toContainEqual({
      name: "Hyeonwoo",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "*",
      location: "No3",
    });

    expect(result).toContainEqual({
      name: "Min",
      date: "2025-01-07",
      dayOfWeek: "Tuesday",
      shift: "*",
      location: "No3",
    });

    // Morning shift entries
    expect(result).toContainEqual({
      name: "Yuran",
      date: "2025-01-05",
      dayOfWeek: "Sunday",
      shift: "11:00",
      location: "No3",
    });

    expect(result).toContainEqual({
      name: "K",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "11:00",
      location: "No3",
    });

    // Afternoon shift entries
    expect(result).toContainEqual({
      name: "Mina",
      date: "2025-01-05",
      dayOfWeek: "Sunday",
      shift: "15:30",
      location: "No3",
    });

    expect(result).toContainEqual({
      name: "Ari",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "15:30",
      location: "No3",
    });
  });

  it("should parse names with time notes (until/from)", () => {
    const mockData = [
      [
        "No3",
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
      ["15:30", "", "Minji(from 17:30)", "", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    expect(result).toContainEqual({
      name: "Jenny",
      date: "2025-01-07",
      dayOfWeek: "Tuesday",
      shift: "11:00",
      location: "No3",
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
      location: "No3",
      note: {
        type: "from",
        time: "17:30",
      },
    });
  });

  it("should skip empty cells", () => {
    const mockData = [
      [
        "No3",
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
      ["*", "", "Hyeonwoo", "", "Ryan", "", "", ""],
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
        "No3",
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
        "No3",
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
        "No3",
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

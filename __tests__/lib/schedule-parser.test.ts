import {
  parseTimeNote,
  parseEmployees,
  getShiftType,
  parseScheduleSheet,
  normalizeName,
  normalizeTime,
  consolidateToAllDay,
} from "@/lib/schedule-parser";
import type { Location, ScheduleEntry } from "@/types/schedule";

describe("normalizeName", () => {
  it("should capitalize first letter and lowercase rest", () => {
    expect(normalizeName("hyeonwoo")).toBe("Hyeonwoo");
    expect(normalizeName("JENNY")).toBe("Jenny");
    expect(normalizeName("jOHN")).toBe("John");
  });

  it("should handle single letter names", () => {
    expect(normalizeName("k")).toBe("K");
    expect(normalizeName("B")).toBe("B");
    expect(normalizeName("b")).toBe("B");
  });

  it("should handle already normalized names", () => {
    expect(normalizeName("John")).toBe("John");
    expect(normalizeName("Jane")).toBe("Jane");
  });

  it("should handle empty string", () => {
    expect(normalizeName("")).toBe("");
    expect(normalizeName("  ")).toBe("");
  });

  it("should trim whitespace", () => {
    expect(normalizeName("  john  ")).toBe("John");
  });
});

describe("normalizeTime", () => {
  it("should convert 1-10 hours to PM (add 12)", () => {
    expect(normalizeTime(4, 0)).toBe("16:00");
    expect(normalizeTime(5, 30)).toBe("17:30");
    expect(normalizeTime(1, 0)).toBe("13:00");
    expect(normalizeTime(10, 0)).toBe("22:00");
  });

  it("should keep 11+ hours as is", () => {
    expect(normalizeTime(11, 0)).toBe("11:00");
    expect(normalizeTime(17, 0)).toBe("17:00");
    expect(normalizeTime(23, 30)).toBe("23:30");
  });

  it("should pad single digit hours and minutes", () => {
    expect(normalizeTime(4, 0)).toBe("16:00");
    expect(normalizeTime(5, 5)).toBe("17:05");
  });
});

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

  // Short format patterns
  it("should parse until short format (~HH:MM)", () => {
    const result = parseTimeNote("Ryan(~16:00)");

    expect(result).toEqual({
      name: "Ryan",
      note: {
        type: "until",
        time: "16:00",
      },
    });
  });

  it("should parse until short format with 12h time (~H:MM) and convert to 24h", () => {
    const result = parseTimeNote("Ryan(~4:00)");

    expect(result).toEqual({
      name: "Ryan",
      note: {
        type: "until",
        time: "16:00", // 4:00 → 16:00
      },
    });
  });

  it("should parse from short format (HH:MM~)", () => {
    const result = parseTimeNote("Minji(17:00~)");

    expect(result).toEqual({
      name: "Minji",
      note: {
        type: "from",
        time: "17:00",
      },
    });
  });

  it("should parse from short format with 12h time (H:MM~) and convert to 24h", () => {
    const result = parseTimeNote("Minji(5:00~)");

    expect(result).toEqual({
      name: "Minji",
      note: {
        type: "from",
        time: "17:00", // 5:00 → 17:00
      },
    });
  });

  it("should parse from short format with minutes (5:30~)", () => {
    const result = parseTimeNote("Minji(5:30~)");

    expect(result).toEqual({
      name: "Minji",
      note: {
        type: "from",
        time: "17:30", // 5:30 → 17:30
      },
    });
  });

  it("should keep 11+ hours as is in formal format", () => {
    const result = parseTimeNote("Jane(until 11:00)");

    expect(result).toEqual({
      name: "Jane",
      note: {
        type: "until",
        time: "11:00",
      },
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
      name: "Alice",
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

    // Should only have 2 entries (John and Alice)
    expect(result).toHaveLength(2);
    expect(result.map((e: ScheduleEntry) => e.name)).toEqual([
      "John",
      "Alice",
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

  it("should normalize lowercase names to capitalize first letter", () => {
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
      ["11:00", "hyeonwoo", "JENNY", "k", "", "", "", ""],
    ];

    const result = parseScheduleSheet(mockData, location);

    expect(result.map((e: ScheduleEntry) => e.name)).toEqual([
      "Hyeonwoo",
      "Jenny",
      "K",
    ]);
  });
});

describe("consolidateToAllDay", () => {
  it("should merge 11:00 and 15:30 shifts into All day (*)", () => {
    const entries: ScheduleEntry[] = [
      {
        name: "Hyeonwoo",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "11:00",
        location: "No.3",
      },
      {
        name: "Hyeonwoo",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "15:30",
        location: "No.3",
      },
    ];

    const result = consolidateToAllDay(entries);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: "Hyeonwoo",
      date: "2025-01-06",
      dayOfWeek: "Monday",
      shift: "*",
      location: "No.3",
    });
  });

  it("should NOT merge if entry has note (partial shift)", () => {
    const entries: ScheduleEntry[] = [
      {
        name: "Ryan",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "11:00",
        location: "No.3",
        note: { type: "until", time: "16:00" },
      },
      {
        name: "Ryan",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "15:30",
        location: "No.3",
      },
    ];

    const result = consolidateToAllDay(entries);

    // Should keep both entries, not merge
    expect(result).toHaveLength(2);
    expect(result.find((e) => e.shift === "11:00")).toBeDefined();
    expect(result.find((e) => e.shift === "15:30")).toBeDefined();
  });

  it("should keep existing All day (*) entries unchanged", () => {
    const entries: ScheduleEntry[] = [
      {
        name: "John",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "*",
        location: "No.3",
      },
    ];

    const result = consolidateToAllDay(entries);

    expect(result).toHaveLength(1);
    expect(result[0].shift).toBe("*");
  });

  it("should NOT merge entries from different dates", () => {
    const entries: ScheduleEntry[] = [
      {
        name: "Hyeonwoo",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "11:00",
        location: "No.3",
      },
      {
        name: "Hyeonwoo",
        date: "2025-01-07",
        dayOfWeek: "Tuesday",
        shift: "15:30",
        location: "No.3",
      },
    ];

    const result = consolidateToAllDay(entries);

    expect(result).toHaveLength(2);
  });

  it("should NOT merge entries from different locations", () => {
    const entries: ScheduleEntry[] = [
      {
        name: "Hyeonwoo",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "11:00",
        location: "No.3",
      },
      {
        name: "Hyeonwoo",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "15:30",
        location: "Westminster",
      },
    ];

    const result = consolidateToAllDay(entries);

    expect(result).toHaveLength(2);
  });

  it("should handle mixed scenarios correctly", () => {
    const entries: ScheduleEntry[] = [
      // Hyeonwoo: 11:00 + 15:30 (no notes) → should merge
      {
        name: "Hyeonwoo",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "11:00",
        location: "No.3",
      },
      {
        name: "Hyeonwoo",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "15:30",
        location: "No.3",
      },
      // Ryan: 11:00 with note → should NOT merge
      {
        name: "Ryan",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "11:00",
        location: "No.3",
        note: { type: "until", time: "16:00" },
      },
      // Jenny: only 15:30 → keep as is
      {
        name: "Jenny",
        date: "2025-01-06",
        dayOfWeek: "Monday",
        shift: "15:30",
        location: "No.3",
      },
    ];

    const result = consolidateToAllDay(entries);

    // Hyeonwoo merged to *, Ryan keeps 11:00, Jenny keeps 15:30
    expect(result).toHaveLength(3);
    expect(result.find((e) => e.name === "Hyeonwoo")?.shift).toBe("*");
    expect(result.find((e) => e.name === "Ryan")?.shift).toBe("11:00");
    expect(result.find((e) => e.name === "Jenny")?.shift).toBe("15:30");
  });
});

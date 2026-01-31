import type {
  TimeNote,
  ShiftType,
  Location,
  ScheduleEntry,
} from "@/types/schedule";

/**
 * 이름 정규화 - 첫 글자 대문자, 나머지 소문자
 * @param name - 정규화할 이름
 * @returns 정규화된 이름
 *
 * @example
 * normalizeName("john") // "John"
 * normalizeName("jane")    // "Jane"
 * normalizeName("k")        // "K"
 * normalizeName("B")        // "B"
 */
export function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  // 첫 글자 대문자 + 나머지 소문자
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * 12시간 형식 시간을 24시간 형식으로 변환 (비즈니스 시간대 고려)
 * - 가게 운영 시간: 11:00~ 이므로
 * - 1:00~10:59 → PM으로 해석 (+12)
 * - 11:00~23:59 → 그대로
 *
 * @param hour - 시간 (0-23 또는 1-12)
 * @param minute - 분 (0-59)
 * @returns "HH:MM" 형식 문자열
 */
export function normalizeTime(hour: number, minute: number): string {
  let normalizedHour = hour;

  // 1~10시는 PM으로 해석 (가게가 11시부터이므로)
  if (hour >= 1 && hour <= 10) {
    normalizedHour = hour + 12;
  }

  return `${normalizedHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

/**
 * 직원 Name과 시간 비고를 파싱
 * 다양한 시간 표기 패턴을 지원:
 * - (until 17:00), (from 17:00) - 정식 표기
 * - (~16:00), (~4:00) - until 약식
 * - (17:00~), (5:00~) - from 약식
 *
 * @param input - 파싱할 문자열
 * @returns Name과 비고 객체
 *
 * @example
 * parseTimeNote("Jane(until 17:00)")  // { name: "Jane", note: { type: "until", time: "17:00" } }
 * parseTimeNote("Ryan(~4:00)")        // { name: "Ryan", note: { type: "until", time: "16:00" } }
 * parseTimeNote("Minji(5:00~)")       // { name: "Minji", note: { type: "from", time: "17:00" } }
 * parseTimeNote("John")               // { name: "John", note: undefined }
 */
export function parseTimeNote(input: string): {
  name: string;
  note?: TimeNote;
} {
  // 공백 제거
  const trimmed = input.trim();

  // 비고가 없는 경우
  if (!trimmed.includes("(")) {
    return {
      name: trimmed,
      note: undefined,
    };
  }

  // 패턴 1: 정식 표기 - Name(until|from HH:MM) 또는 Name(until|from H:MM)
  const formalRegex = /^(.+?)\((until|from)\s+(\d{1,2}):(\d{2})\)$/;
  const formalMatch = trimmed.match(formalRegex);

  if (formalMatch) {
    const [, name, type, hourStr, minuteStr] = formalMatch;
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const time = normalizeTime(hour, minute);

    return {
      name: name.trim(),
      note: {
        type: type as "until" | "from",
        time,
      },
    };
  }

  // 패턴 2: until 약식 - Name(~HH:MM) 또는 Name(~H:MM)
  const untilShortRegex = /^(.+?)\(~(\d{1,2}):(\d{2})\)$/;
  const untilShortMatch = trimmed.match(untilShortRegex);

  if (untilShortMatch) {
    const [, name, hourStr, minuteStr] = untilShortMatch;
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const time = normalizeTime(hour, minute);

    return {
      name: name.trim(),
      note: {
        type: "until",
        time,
      },
    };
  }

  // 패턴 3: from 약식 - Name(HH:MM~) 또는 Name(H:MM~)
  const fromShortRegex = /^(.+?)\((\d{1,2}):(\d{2})~\)$/;
  const fromShortMatch = trimmed.match(fromShortRegex);

  if (fromShortMatch) {
    const [, name, hourStr, minuteStr] = fromShortMatch;
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const time = normalizeTime(hour, minute);

    return {
      name: name.trim(),
      note: {
        type: "from",
        time,
      },
    };
  }

  // 매칭 실패 시 전체를 Name으로 처리
  return {
    name: trimmed,
    note: undefined,
  };
}

/**
 * 직원 목록 파싱
 * @param rows - Google Sheets에서 가져온 2D 배열 (예: [["Name"], ["John"], ["Jane"]])
 * @returns 직원 Name 배열
 *
 * @example
 * parseEmployees([["Name"], ["John"], ["Jane"]])
 * // ["John", "Jane"]
 */
export function parseEmployees(rows: string[][]): string[] {
  // 첫 번째 행은 헤더이므로 스킵
  return rows
    .slice(1)
    .map((row) => row[0]?.trim())
    .filter((name) => name && name.length > 0);
}

/**
 * A열 값을 보고 ShiftType 판별
 * @param value - A열의 셀 값 (예: "*", "11:00", "15:30", "" 등)
 * @returns ShiftType 또는 null
 *
 * @example
 * getShiftType("*")      // "*"
 * getShiftType("11:00")  // "11:00"
 * getShiftType("15:30")  // "15:30"
 * getShiftType("")       // null
 * getShiftType("John")  // null
 */
export function getShiftType(value: string): ShiftType | null {
  const trimmed = value.trim();

  // 빈 문자열은 null
  if (!trimmed) {
    return null;
  }

  // ShiftType에 해당하는 값만 반환
  if (trimmed === "*" || trimmed === "11:00" || trimmed === "15:30") {
    return trimmed as ShiftType;
  }

  // 그 외는 null
  return null;
}

/**
 * 구글 시트 2D 배열을 ScheduleEntry 배열로 파싱
 * @param rows - Google Sheets에서 가져온 2D 배열
 * @param location - 로케이션 (No.3 또는 Westminster)
 * @returns ScheduleEntry 배열
 *
 * @example
 * const mockData = [
 *   ["No.3", "Sunday", "Monday", ...],
 *   ["", "2025-01-05", "2025-01-06", ...],
 *   ["*", "", "John", ...],
 *   ["11:00", "Jane", "K", ...],
 * ];
 * parseScheduleSheet(mockData, "No.3")
 * // [{ name: "John", date: "2025-01-06", dayOfWeek: "Monday", shift: "*", location: "No.3" }, ...]
 */
export function parseScheduleSheet(
  rows: string[][],
  location: Location
): ScheduleEntry[] {
  const result: ScheduleEntry[] = [];

  // 첫 번째 행: 요일 (Sunday, Monday, ...)
  const dayOfWeekRow = rows[0] || [];
  // 두 번째 행: 날짜 (2025-01-05, 2025-01-06, ...)
  const dateRow = rows[1] || [];

  // 현재 시프트 타입을 추적
  let currentShift: ShiftType | null = null;

  // 3번째 행부터 파싱 (row index 2부터)
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const cellA = row[0]?.trim() || ""; // A열 값

    // A열에 값이 있는 경우
    if (cellA) {
      // ShiftType인지 확인
      const shiftType = getShiftType(cellA);

      if (shiftType) {
        // 유효한 ShiftType이면 currentShift 업데이트
        currentShift = shiftType;
      } else {
        // A열에 값이 있지만 유효한 ShiftType이 아니면 이 행은 스킵
        continue;
      }
    }

    // currentShift가 없으면 이 행은 스킵
    if (!currentShift) {
      continue;
    }

    // B열부터 H열까지 순회 (Sunday ~ Saturday, column index 1~7)
    for (let colIndex = 1; colIndex <= 7; colIndex++) {
      const cellValue = row[colIndex]?.trim() || "";

      // 빈 셀은 스킵
      if (!cellValue) {
        continue;
      }

      // Name과 비고 파싱
      const { name: rawName, note } = parseTimeNote(cellValue);

      // Name이 없으면 스킵
      if (!rawName) {
        continue;
      }

      // 이름 정규화 (첫 글자 대문자)
      const name = normalizeName(rawName);

      // 날짜와 요일 가져오기
      const date = dateRow[colIndex]?.trim() || "";
      const dayOfWeek = dayOfWeekRow[colIndex]?.trim() || "";

      // ScheduleEntry 생성
      const entry: ScheduleEntry = {
        name,
        date,
        dayOfWeek,
        shift: currentShift,
        location,
      };

      // note가 있으면 추가
      if (note) {
        entry.note = note;
      }

      result.push(entry);
    }
  }

  return result;
}

/**
 * 11:00과 15:30 시프트 둘 다 있는 직원을 All day (*)로 병합
 * - note가 있는 엔트리는 병합 대상에서 제외 (부분 근무자)
 *
 * @param entries - 원본 ScheduleEntry 배열
 * @returns All day 병합이 적용된 ScheduleEntry 배열
 *
 * @example
 * // Hyeonwoo가 11:00과 15:30 둘 다 있으면 → "*" 하나로 병합
 * // Ryan(~16:00)은 note가 있으므로 병합 안 함
 */
export function consolidateToAllDay(entries: ScheduleEntry[]): ScheduleEntry[] {
  // 날짜+로케이션+이름 기준으로 그룹핑
  const groupKey = (e: ScheduleEntry) => `${e.date}|${e.location}|${e.name}`;

  // 그룹별로 엔트리 모음
  const groups = new Map<string, ScheduleEntry[]>();

  for (const entry of entries) {
    const key = groupKey(entry);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entry);
  }

  const result: ScheduleEntry[] = [];

  for (const [, groupEntries] of groups) {
    // 이미 All day (*) 엔트리가 있으면 그대로 유지
    const allDayEntry = groupEntries.find((e) => e.shift === "*");
    if (allDayEntry) {
      result.push(allDayEntry);
      continue;
    }

    // 11:00과 15:30 엔트리 찾기
    const shift1100 = groupEntries.find((e) => e.shift === "11:00");
    const shift1530 = groupEntries.find((e) => e.shift === "15:30");

    // 둘 다 있고, 둘 다 note가 없으면 All day로 병합
    if (shift1100 && shift1530 && !shift1100.note && !shift1530.note) {
      result.push({
        name: shift1100.name,
        date: shift1100.date,
        dayOfWeek: shift1100.dayOfWeek,
        shift: "*",
        location: shift1100.location,
      });
    } else {
      // 병합 조건 안 맞으면 원본 그대로 추가
      result.push(...groupEntries);
    }
  }

  return result;
}

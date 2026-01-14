import type {
  TimeNote,
  ShiftType,
  Location,
  ScheduleEntry,
} from "@/types/schedule";

/**
 * 직원 Name과 시간 비고를 파싱
 * @param input - 파싱할 문자열 (예: "Jenny(until 17:00)" 또는 "Ryan")
 * @returns Name과 비고 객체
 *
 * @example
 * parseTimeNote("Jenny(until 17:00)")
 * // { name: "Jenny", note: { type: "until", time: "17:00" } }
 *
 * parseTimeNote("Ryan")
 * // { name: "Ryan", note: undefined }
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

  // 정규식: Name(until|from 시간) 형태 파싱
  // 예: "Jenny(until 17:00)" → ["Jenny(until 17:00)", "Jenny", "until", "17:00"]
  const regex = /^(.+?)\((until|from)\s+(\d{2}:\d{2})\)$/;
  const match = trimmed.match(regex);

  if (!match) {
    // 매칭 실패 시 전체를 Name으로 처리
    return {
      name: trimmed,
      note: undefined,
    };
  }

  const [, name, type, time] = match;

  return {
    name: name.trim(),
    note: {
      type: type as "until" | "from",
      time: time,
    },
  };
}

/**
 * 직원 목록 파싱
 * @param rows - Google Sheets에서 가져온 2D 배열 (예: [["Name"], ["Yuran"], ["Hyeonwoo"]])
 * @returns 직원 Name 배열
 *
 * @example
 * parseEmployees([["Name"], ["Yuran"], ["Hyeonwoo"]])
 * // ["Yuran", "Hyeonwoo"]
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
 * getShiftType("Yuran")  // null
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
 *   ["*", "", "Hyeonwoo", ...],
 *   ["11:00", "Yuran", "K", ...],
 * ];
 * parseScheduleSheet(mockData, "No.3")
 * // [{ name: "Hyeonwoo", date: "2025-01-06", dayOfWeek: "Monday", shift: "*", location: "No.3" }, ...]
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
      const { name, note } = parseTimeNote(cellValue);

      // Name이 없으면 스킵
      if (!name) {
        continue;
      }

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


import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import type { Employee, Location, WeekSchedule, EmployeeWeekSchedule } from '@/types/schedule';
import { parseEmployees, parseScheduleSheet } from './schedule-parser';

/**
 * Google Sheets에 연결하고 인증된 GoogleSpreadsheet 객체를 반환합니다.
 * @returns {Promise<GoogleSpreadsheet>} 인증된 GoogleSpreadsheet 객체
 * @throws {Error} 환경변수가 없거나 연결 실패 시
 */
export async function connectToSheet(): Promise<GoogleSpreadsheet> {
  // 환경변수 검증
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountEmail || !privateKey || !sheetId) {
    throw new Error(
      'Missing required environment variables: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, or GOOGLE_SHEET_ID'
    );
  }

  // JWT 인증 설정
  const serviceAccountAuth = new JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // GoogleSpreadsheet 객체 생성
  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

  // 스프레드시트 정보 로드
  await doc.loadInfo();

  return doc;
}

/**
 * 직원 목록을 가져옵니다.
 * @returns {Promise<Employee[]>} 직원 목록 배열
 * @throws {Error} 시트를 찾을 수 없거나 데이터 로드 실패 시
 */
export async function getEmployees(): Promise<Employee[]> {
  const doc = await connectToSheet();

  // Employees 시트 찾기 (대소문자 구분 없이)
  const employeesSheet = doc.sheetsByIndex.find(
    (sheet) => sheet.title.toLowerCase() === 'employees'
  );

  if (!employeesSheet) {
    throw new Error('Employees sheet not found');
  }

  // 시트의 모든 행 가져오기
  await employeesSheet.loadCells();
  const rows = await employeesSheet.getRows();

  // 헤더 + 데이터를 2D 배열로 변환
  const data: string[][] = [['이름']]; // 헤더 행

  rows.forEach((row) => {
    const name = row.get('이름') || row.get('Name') || row.get('name') || '';
    if (name && name.trim()) {
      data.push([name.trim()]);
    }
  });

  // 파싱 함수 사용
  const employeeNames = parseEmployees(data);

  // Employee 객체 배열로 변환
  return employeeNames.map((name) => ({ name }));
}

/**
 * 특정 로케이션의 주간 스케줄을 가져옵니다.
 * @param {Location} location - 로케이션 (No3 또는 Westminster)
 * @returns {Promise<WeekSchedule>} 주간 스케줄 객체
 * @throws {Error} 시트를 찾을 수 없거나 데이터 로드 실패 시
 */
export async function getWeekSchedule(location: Location): Promise<WeekSchedule> {
  const doc = await connectToSheet();

  // 시트 이름 결정 (대소문자 구분 없이 찾기)
  const sheetName = location === 'No3' ? 'no3_schedule' : 'westminster_schedule';
  const sheet = doc.sheetsByIndex.find(
    (s) => s.title.toLowerCase() === sheetName
  );

  if (!sheet) {
    throw new Error(`Sheet not found for location: ${location}`);
  }

  // 시트의 모든 셀 로드
  await sheet.loadCells();

  // 2D 배열로 변환
  const data: string[][] = [];

  // 헤더 행 (요일)
  const headerRow: string[] = [];
  for (let col = 0; col < sheet.columnCount; col++) {
    const cell = sheet.getCell(0, col);
    headerRow.push(cell.value?.toString() || '');
  }
  data.push(headerRow);

  // 날짜 행
  const dateRow: string[] = [];
  for (let col = 0; col < sheet.columnCount; col++) {
    const cell = sheet.getCell(1, col);
    dateRow.push(cell.value?.toString() || '');
  }
  data.push(dateRow);

  // 나머지 데이터 행들
  for (let row = 2; row < sheet.rowCount; row++) {
    const rowData: string[] = [];
    for (let col = 0; col < sheet.columnCount; col++) {
      const cell = sheet.getCell(row, col);
      rowData.push(cell.value?.toString() || '');
    }
    data.push(rowData);
  }

  // parseScheduleSheet 함수로 파싱
  const entries = parseScheduleSheet(data, location);

  // 주차 정보 추출 (날짜 행에서 첫 번째와 마지막 날짜)
  const dates = dateRow.filter((d) => d && d.match(/^\d{4}-\d{2}-\d{2}$/));
  const weekStart = dates[0] || '';
  const weekEnd = dates[dates.length - 1] || '';

  return {
    weekStart,
    weekEnd,
    location,
    entries,
  };
}

/**
 * 특정 직원의 양쪽 로케이션 스케줄을 가져옵니다.
 * @param {string} name - 직원 이름
 * @returns {Promise<EmployeeWeekSchedule>} 직원의 주간 스케줄 객체
 * @throws {Error} 데이터 로드 실패 시
 */
export async function getEmployeeSchedule(name: string): Promise<EmployeeWeekSchedule> {
  // 양쪽 로케이션 스케줄 가져오기 (병렬 처리)
  const [no3Schedule, westminsterSchedule] = await Promise.all([
    getWeekSchedule('No3'),
    getWeekSchedule('Westminster'),
  ]);

  // 직원 이름으로 필터링
  const no3Entries = no3Schedule.entries.filter((entry) => entry.name === name);
  const westminsterEntries = westminsterSchedule.entries.filter(
    (entry) => entry.name === name
  );

  // 주차 정보 (No3 기준, 없으면 Westminster)
  const weekStart = no3Schedule.weekStart || westminsterSchedule.weekStart;
  const weekEnd = no3Schedule.weekEnd || westminsterSchedule.weekEnd;

  // 로케이션별로 그룹핑
  const schedules = [];

  if (no3Entries.length > 0) {
    schedules.push({
      location: 'No3' as Location,
      entries: no3Entries,
    });
  }

  if (westminsterEntries.length > 0) {
    schedules.push({
      location: 'Westminster' as Location,
      entries: westminsterEntries,
    });
  }

  return {
    employeeName: name,
    weekStart,
    weekEnd,
    schedules,
  };
}
/**
 * Google Sheets API 통합 테스트 스크립트
 *
 * 실행 방법:
 * npx tsx scripts/test-integration.ts
 */

import dotenv from "dotenv";
import path from "path";
import {
  connectToSheet,
  getEmployees,
  getWeekSchedule,
  getEmployeeSchedule,
} from "../lib/google-sheets";

// 환경변수 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runIntegrationTests() {
  console.log("🚀 Google Sheets API 통합 테스트 시작...\n");
  console.log("=" .repeat(60));

  try {
    // ===== TEST 1: 연결 테스트 =====
    console.log("\n📋 TEST 1: Google Sheets 연결");
    console.log("-".repeat(60));

    const doc = await connectToSheet();
    console.log(`✅ 연결 성공`);
    console.log(`   📄 스프레드시트: ${doc.title}`);
    console.log(`   🆔 ID: ${doc.spreadsheetId}`);
    console.log(`   📊 시트 수: ${doc.sheetsByIndex.length}개`);

    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`      ${index + 1}. ${sheet.title}`);
    });

    // ===== TEST 2: 직원 목록 조회 =====
    console.log("\n📋 TEST 2: 직원 목록 조회");
    console.log("-".repeat(60));

    const employees = await getEmployees();
    console.log(`✅ 조회 성공: 총 ${employees.length}명`);

    employees.forEach((employee, index) => {
      console.log(`   ${index + 1}. ${employee.name}`);
    });

    // ===== TEST 3: No3 스케줄 조회 =====
    console.log("\n📋 TEST 3: No3 스케줄 조회");
    console.log("-".repeat(60));

    const no3Schedule = await getWeekSchedule("No3");
    console.log(`✅ 조회 성공`);
    console.log(`   📅 주간: ${no3Schedule.weekStart} ~ ${no3Schedule.weekEnd}`);
    console.log(`   📊 엔트리: ${no3Schedule.entries.length}개`);

    if (no3Schedule.entries.length > 0) {
      console.log(`   📝 샘플 (처음 3개):`);
      no3Schedule.entries.slice(0, 3).forEach((entry) => {
        const noteStr = entry.note
          ? ` (${entry.note.type} ${entry.note.time})`
          : "";
        console.log(
          `      - ${entry.name}: ${entry.dayOfWeek} ${entry.date}, ${entry.shift}${noteStr}`
        );
      });
    } else {
      console.log(`   ℹ️  데이터 없음 (시트가 비어있음)`);
    }

    // ===== TEST 4: Westminster 스케줄 조회 =====
    console.log("\n📋 TEST 4: Westminster 스케줄 조회");
    console.log("-".repeat(60));

    const westminsterSchedule = await getWeekSchedule("Westminster");
    console.log(`✅ 조회 성공`);
    console.log(
      `   📅 주간: ${westminsterSchedule.weekStart} ~ ${westminsterSchedule.weekEnd}`
    );
    console.log(`   📊 엔트리: ${westminsterSchedule.entries.length}개`);

    if (westminsterSchedule.entries.length > 0) {
      console.log(`   📝 샘플 (처음 3개):`);
      westminsterSchedule.entries.slice(0, 3).forEach((entry) => {
        const noteStr = entry.note
          ? ` (${entry.note.type} ${entry.note.time})`
          : "";
        console.log(
          `      - ${entry.name}: ${entry.dayOfWeek} ${entry.date}, ${entry.shift}${noteStr}`
        );
      });
    } else {
      console.log(`   ℹ️  데이터 없음 (시트가 비어있음)`);
    }

    // ===== TEST 5: 개인 스케줄 조회 =====
    if (employees.length > 0) {
      const testEmployee = employees[0].name;
      console.log(`\n📋 TEST 5: 개인 스케줄 조회 (${testEmployee})`);
      console.log("-".repeat(60));

      const employeeSchedule = await getEmployeeSchedule(testEmployee);
      console.log(`✅ 조회 성공`);
      console.log(`   👤 직원: ${employeeSchedule.employeeName}`);
      console.log(
        `   📅 주간: ${employeeSchedule.weekStart} ~ ${employeeSchedule.weekEnd}`
      );
      console.log(`   📍 로케이션 수: ${employeeSchedule.schedules.length}개`);

      employeeSchedule.schedules.forEach((locationSchedule) => {
        console.log(`   📍 ${locationSchedule.location}:`);
        console.log(`      총 ${locationSchedule.entries.length}개 엔트리`);

        locationSchedule.entries.forEach((entry) => {
          const noteStr = entry.note
            ? ` (${entry.note.type} ${entry.note.time})`
            : "";
          console.log(
            `      - ${entry.dayOfWeek} ${entry.date}, ${entry.shift}${noteStr}`
          );
        });
      });

      if (employeeSchedule.schedules.length === 0) {
        console.log(`   ℹ️  이번 주 스케줄 없음`);
      }
    }

    // ===== 최종 결과 =====
    console.log("\n" + "=".repeat(60));
    console.log("🎉 모든 통합 테스트 통과!");
    console.log("=".repeat(60));
    console.log("\n✅ Phase 2 완료 조건 확인:");
    console.log("   ✅ 실제 구글 시트에서 데이터 fetch 성공");
    console.log("   ✅ 콘솔에 파싱된 데이터 출력 확인");
    console.log(
      "\n📌 다음 단계: 구글 시트에 스케줄 데이터를 입력하면 자동으로 파싱됩니다."
    );
  } catch (error) {
    console.error("\n❌ 에러 발생:");
    console.error(error);
    process.exit(1);
  }
}

runIntegrationTests();

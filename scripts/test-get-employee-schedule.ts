/**
 * getEmployeeSchedule() 함수 테스트 스크립트
 *
 * 실행 방법:
 * npx tsx scripts/test-get-employee-schedule.ts
 */

import dotenv from "dotenv";
import path from "path";
import { getEmployeeSchedule } from "../lib/google-sheets";

// 환경변수 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGetEmployeeSchedule() {
  console.log("🔄 getEmployeeSchedule() 테스트 시작...\n");

  try {
    // John 스케줄 조회
    const employeeName = "John";
    console.log(`📋 ${employeeName} 스케줄 조회 중...`);
    const schedule = await getEmployeeSchedule(employeeName);

    console.log(`\n✅ ${employeeName} 스케줄 조회 성공!`);
    console.log(`  👤 직원: ${schedule.employeeName}`);
    console.log(`  📅 주간: ${schedule.weekStart} ~ ${schedule.weekEnd}`);
    console.log(`  📍 로케이션 수: ${schedule.schedules.length}개\n`);

    // 로케이션별 스케줄 출력
    schedule.schedules.forEach((locationSchedule) => {
      console.log(`  📍 ${locationSchedule.location}:`);
      console.log(`     총 ${locationSchedule.entries.length}개 엔트리`);

      locationSchedule.entries.forEach((entry, index) => {
        const noteStr = entry.note
          ? ` (${entry.note.type} ${entry.note.time})`
          : "";
        console.log(
          `     ${index + 1}. ${entry.dayOfWeek} ${entry.date}, ${entry.shift}${noteStr}`
        );
      });
      console.log("");
    });

    if (schedule.schedules.length === 0) {
      console.log("  ℹ️  이번 주 스케줄이 없습니다.\n");
    }

    console.log("🎉 테스트 통과!");
  } catch (error) {
    console.error("\n❌ 에러 발생:");
    console.error(error);
    process.exit(1);
  }
}

testGetEmployeeSchedule();

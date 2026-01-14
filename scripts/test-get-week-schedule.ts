/**
 * getWeekSchedule() 함수 테스트 스크립트
 *
 * 실행 방법:
 * npx tsx scripts/test-get-week-schedule.ts
 */

import dotenv from "dotenv";
import path from "path";
import { getWeekSchedule } from "../lib/google-sheets";

// 환경변수 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGetWeekSchedule() {
  console.log("🔄 getWeekSchedule() 테스트 시작...\n");

  try {
    // No3 스케줄 조회
    console.log("📋 No3 스케줄 조회 중...");
    const no3Schedule = await getWeekSchedule("No3");

    console.log(`\n✅ No3 스케줄 조회 성공!`);
    console.log(`  📅 주간: ${no3Schedule.weekStart} ~ ${no3Schedule.weekEnd}`);
    console.log(`  📍 로케이션: ${no3Schedule.location}`);
    console.log(`  📊 총 엔트리: ${no3Schedule.entries.length}개\n`);

    // 처음 5개 엔트리 출력
    console.log("📝 첫 5개 엔트리:");
    no3Schedule.entries.slice(0, 5).forEach((entry, index) => {
      const noteStr = entry.note
        ? ` (${entry.note.type} ${entry.note.time})`
        : "";
      console.log(
        `  ${index + 1}. ${entry.name} - ${entry.dayOfWeek} ${entry.date}, ${entry.shift}${noteStr}`
      );
    });

    // Westminster 스케줄 조회
    console.log("\n📋 Westminster 스케줄 조회 중...");
    const westminsterSchedule = await getWeekSchedule("Westminster");

    console.log(`\n✅ Westminster 스케줄 조회 성공!`);
    console.log(
      `  📅 주간: ${westminsterSchedule.weekStart} ~ ${westminsterSchedule.weekEnd}`
    );
    console.log(`  📍 로케이션: ${westminsterSchedule.location}`);
    console.log(`  📊 총 엔트리: ${westminsterSchedule.entries.length}개\n`);

    console.log("🎉 모든 테스트 통과!");
  } catch (error) {
    console.error("\n❌ 에러 발생:");
    console.error(error);
    process.exit(1);
  }
}

testGetWeekSchedule();

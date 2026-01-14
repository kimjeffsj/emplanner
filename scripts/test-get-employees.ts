/**
 * getEmployees() 함수 테스트 스크립트
 *
 * 실행 방법:
 * npx tsx scripts/test-get-employees.ts
 */

import dotenv from "dotenv";
import path from "path";
import { getEmployees } from "../lib/google-sheets";

// 환경변수 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testGetEmployees() {
  console.log("🔄 getEmployees() 테스트 시작...\n");

  try {
    // 직원 목록 가져오기
    console.log("📋 직원 목록 조회 중...");
    const employees = await getEmployees();

    console.log(`\n✅ 조회 성공! 총 ${employees.length}명\n`);

    // 직원 목록 출력
    console.log("👥 직원 목록:");
    employees.forEach((employee, index) => {
      console.log(`  ${index + 1}. ${employee.name}`);
    });

    console.log("\n🎉 테스트 통과!");
  } catch (error) {
    console.error("\n❌ 에러 발생:");
    console.error(error);
    process.exit(1);
  }
}

testGetEmployees();

/**
 * Google Sheets API 실제 연결 테스트 스크립트
 *
 * 실행 방법:
 * npx tsx scripts/test-google-sheets.ts
 */

import dotenv from "dotenv";
import path from "path";
import { connectToSheet } from "../lib/google-sheets";

// 환경변수 로드
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testConnection() {
  console.log("🔄 Google Sheets API 연결 테스트 시작...\n");

  try {
    // 환경변수 확인
    console.log("📋 환경변수 확인:");
    console.log(
      `  ✅ GOOGLE_SERVICE_ACCOUNT_EMAIL: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`
    );
    console.log(
      `  ✅ GOOGLE_PRIVATE_KEY: ${process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50)}...`
    );
    console.log(`  ✅ GOOGLE_SHEET_ID: ${process.env.GOOGLE_SHEET_ID}\n`);

    // Google Sheets 연결
    console.log("🔗 Google Sheets 연결 중...");
    const doc = await connectToSheet();
    console.log(`  ✅ 연결 성공!`);
    console.log(`  📄 스프레드시트 제목: ${doc.title}`);
    console.log(`  🆔 스프레드시트 ID: ${doc.spreadsheetId}\n`);

    // 시트 목록 확인
    console.log("📊 시트 목록:");
    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.title}`);
    });

    // 필수 시트 확인
    const requiredSheets = [
      "Employees",
      "No3_Schedule",
      "Westminster_Schedule",
    ];
    console.log("\n✅ 필수 시트 확인:");
    requiredSheets.forEach((sheetName) => {
      const exists = doc.sheetsByIndex.some((s) => s.title === sheetName);
      console.log(`  ${exists ? "✅" : "❌"} ${sheetName}`);
    });

    console.log("\n🎉 모든 테스트 통과!");
  } catch (error) {
    console.error("\n❌ 에러 발생:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();

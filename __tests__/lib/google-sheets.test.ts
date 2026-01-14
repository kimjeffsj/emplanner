/**
 * @jest-environment node
 */
import { connectToSheet } from "@/lib/google-sheets";

// Mock google-spreadsheet to avoid ESM issues in Jest
jest.mock("google-spreadsheet", () => {
  return {
    GoogleSpreadsheet: jest.fn().mockImplementation((sheetId) => {
      return {
        spreadsheetId: sheetId,
        title: "Chicko Schedule",
        sheetsByIndex: [
          { title: "Employees" },
          { title: "No3_Schedule" },
          { title: "Westminster_Schedule" },
        ],
        loadInfo: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

jest.mock("google-auth-library", () => {
  return {
    JWT: jest.fn().mockImplementation(() => {
      return {};
    }),
  };
});

describe("Google Sheets API Integration", () => {
  // 환경변수 검증
  describe("Environment Variables", () => {
    it("should have GOOGLE_SERVICE_ACCOUNT_EMAIL", () => {
      expect(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL).toBeDefined();
      expect(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL).toContain("@");
    });

    it("should have GOOGLE_PRIVATE_KEY", () => {
      expect(process.env.GOOGLE_PRIVATE_KEY).toBeDefined();
      expect(process.env.GOOGLE_PRIVATE_KEY).toContain("BEGIN PRIVATE KEY");
    });

    it("should have GOOGLE_SHEET_ID", () => {
      expect(process.env.GOOGLE_SHEET_ID).toBeDefined();
      expect(process.env.GOOGLE_SHEET_ID?.length).toBeGreaterThan(0);
    });
  });

  // 연결 테스트 (mocked)
  describe("connectToSheet()", () => {
    it("should connect to Google Sheets successfully", async () => {
      const doc = await connectToSheet();

      // GoogleSpreadsheet 객체 반환 확인
      expect(doc).toBeDefined();
      expect(doc.spreadsheetId).toBe(process.env.GOOGLE_SHEET_ID);
    });

    it("should load spreadsheet info", async () => {
      const doc = await connectToSheet();

      // 시트 정보 로드 확인
      expect(doc.title).toBeDefined();
      expect(doc.sheetsByIndex).toBeDefined();
    });

    it("should have required sheets", async () => {
      const doc = await connectToSheet();

      const sheetTitles = doc.sheetsByIndex.map((sheet: any) => sheet.title);

      // 필수 시트 존재 확인
      expect(sheetTitles).toContain("Employees");
      expect(sheetTitles).toContain("No3_Schedule");
      expect(sheetTitles).toContain("Westminster_Schedule");
    });

    it("should throw error if environment variables are missing", async () => {
      // 환경변수 백업
      const backup = {
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY,
        id: process.env.GOOGLE_SHEET_ID,
      };

      // 환경변수 제거
      delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

      // 에러 발생 확인
      await expect(connectToSheet()).rejects.toThrow(
        "Missing required environment variables"
      );

      // 환경변수 복원
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = backup.email;
      process.env.GOOGLE_PRIVATE_KEY = backup.key;
      process.env.GOOGLE_SHEET_ID = backup.id;
    });
  });
});

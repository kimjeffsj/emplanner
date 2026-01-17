import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }

    const serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();

    // No3_Schedule 시트 찾기
    const sheet = doc.sheetsByIndex.find(
      (s) => s.title.toLowerCase() === 'no3_schedule'
    );

    if (!sheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }

    await sheet.loadCells();

    // 처음 12행, 9열의 raw 데이터 가져오기
    const rawData: { row: number; col: number; value: unknown; formatted: string }[] = [];

    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = sheet.getCell(row, col);
        rawData.push({
          row,
          col,
          value: cell.value,
          formatted: cell.formattedValue || '',
        });
      }
    }

    // 2D 배열로도 정리
    const grid: string[][] = [];
    for (let row = 0; row < 12; row++) {
      const rowData: string[] = [];
      for (let col = 0; col < 9; col++) {
        const cell = sheet.getCell(row, col);
        rowData.push(cell.value?.toString() || '');
      }
      grid.push(rowData);
    }

    return NextResponse.json({
      sheetTitle: sheet.title,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
      grid,
      sample: rawData.slice(0, 20),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

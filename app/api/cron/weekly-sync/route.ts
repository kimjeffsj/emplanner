import { NextRequest, NextResponse } from "next/server";
import { weeklySync, syncCurrentWeekFromSheets } from "@/lib/db/sync";

/**
 * GET /api/cron/weekly-sync
 * Vercel Cron Job에서 호출되는 주간 동기화 엔드포인트
 *
 * 보안: CRON_SECRET 헤더 검증 필수
 */
export async function GET(request: NextRequest) {
  try {
    // Cron 인증 확인
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // 프로덕션에서만 인증 필수
    if (process.env.NODE_ENV === "production") {
      if (!cronSecret) {
        console.error("CRON_SECRET not configured");
        return NextResponse.json(
          { error: "Server configuration error" },
          { status: 500 }
        );
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    // 주간 동기화 실행
    const result = await weeklySync();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        weeksProcessed: result.weeksProcessed,
        entriesSynced: result.entriesSynced,
        weeksDeleted: result.weeksDeleted,
        durationMs: result.durationMs,
        syncedAt: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          durationMs: result.durationMs,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/weekly-sync
 * 수동 동기화 트리거 (관리자용)
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 현재 주만 동기화 (수동 트리거)
    const result = await syncCurrentWeekFromSheets();

    return NextResponse.json({
      success: result.success,
      message: result.message,
      entriesSynced: result.entriesSynced,
      durationMs: result.durationMs,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Manual sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

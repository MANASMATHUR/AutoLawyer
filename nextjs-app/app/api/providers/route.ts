import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/ai-service';

/**
 * GET /api/providers - Get status of all AI providers
 */
export async function GET(request: NextRequest) {
  try {
    const status = aiService.getProviderStatus();

    return NextResponse.json({
      providers: status,
      summary: {
        total: status.length,
        available: status.filter(p => p.available).length,
        active: status.find(p => p.active)?.name || 'None',
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/providers/test - Test a specific provider
 */
export async function POST(request: NextRequest) {
  try {
    const { clause, policy } = await request.json();

    const result = await aiService.analyzeClauseRisk(
      clause || "The Supplier shall indemnify the Client for all losses.",
      policy || "Standard commercial terms"
    );

    return NextResponse.json({
      success: true,
      result,
      provider: aiService.getProviderStatus().find(p => p.active)?.name
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

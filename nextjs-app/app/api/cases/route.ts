import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { RiskEngine } from '@/lib/services/risk-engine'
import { aiService } from '@/lib/services/ai-service'
import os from 'os'
import dbConnect from '@/lib/db/mongodb'
import Case from '@/lib/db/models/Case'

export async function POST(request: NextRequest) {
  try {
    try {
      await dbConnect();
    } catch (dbError: any) {
      console.warn('MongoDB connection failed, continuing without persistence:', dbError.message);
      // Continue without DB - results will still be returned to user
    }
    const formData = await request.formData()
    const primaryDocs = formData.getAll('primary_docs') as File[]
    const instructions = formData.get('instructions') as string || 'Standard commercial terms'

    if (primaryDocs.length === 0) {
      return NextResponse.json(
        { error: 'At least one primary document is required' },
        { status: 400 }
      )
    }

    const caseId = `case-${uuidv4()}`
    const tmpDir = join(os.tmpdir(), caseId)
    await mkdir(tmpDir, { recursive: true })

    // Process first document only for MVP
    const doc = primaryDocs[0];
    const bytes = await doc.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(tmpDir, doc.name)
    await writeFile(filePath, buffer)

    let result;
    const useDeepAnalysis = formData.get('deep_analysis') === 'true';

    if (useDeepAnalysis) {
      console.log('🚀 Triggering Deep Analysis (GPU)...');
      // We need to pass the file object directly or re-read it. 
      // Since aiService expects a File object (which we have in primaryDocs[0]), we can pass it.
      // However, aiService.analyzeWithPythonBackend expects a File, but we might need to ensure it's compatible with FormData in Node.
      // Actually, in Node environment, `File` object from `request.formData()` is compatible with `fetch` body if we use `form-data` package or similar, 
      // but here we are in Next.js Edge/Node runtime.
      // Let's try passing the file directly.
      result = await aiService.analyzeWithPythonBackend(doc, instructions);
    } else {
      // Run Node.js Risk Engine
      result = await RiskEngine.analyzeDocument(filePath, caseId, instructions);
    }

    // Normalize result structure
    let finalClauses = result.clauses;
    let finalRisks = result.risks;
    let finalRedlines = result.redlines;
    let finalReports = result.reports;
    let finalSummary = result.summary;

    // If coming from RiskEngine (local), we need to construct risks/redlines/reports from clauses
    if (!useDeepAnalysis) {
      finalRisks = result.clauses.map((c: any) => ({
        clause_id: c.clause_id,
        risk_score: c.risk_score,
        severity: c.severity,
        rationale: c.rationale,
        negotiation_scenarios: c.negotiation_scenarios
      }));

      finalRedlines = {
        patches: result.clauses.filter((c: any) => c.redline).map((c: any) => ({
          clause_id: c.clause_id,
          patch: c.redline,
          rationale: c.recommendation
        }))
      };

      finalReports = {
        executive_summary: {
          headline: `Analyzed ${result.clauses.length} clauses. Found ${result.summary.critical} critical risks.`,
          risk_counts: result.summary,
          top_issues: result.clauses.filter((c: any) => c.severity === 'critical' || c.severity === 'high').map((c: any) => c.rationale),
          remediation_plan: ["Review critical redlines", "Escalate high risks to legal counsel"]
        }
      };
    } else {
      // If coming from Python, summary might be nested in reports
      if (!finalSummary && result.reports?.executive_summary?.risk_counts) {
        finalSummary = result.reports.executive_summary.risk_counts;
      }
    }

    // Save to MongoDB (if available)
    let savedCase;
    try {
      savedCase = await Case.create({
        case_id: caseId,
        title: doc.name,
        type: 'Contract',
        status: 'completed',
        instructions,
        clauses: finalClauses,
        risks: finalRisks,
        redlines: finalRedlines,
        reports: finalReports,
        summary: finalSummary
      });
    } catch (dbError: any) {
      console.warn('Failed to save to MongoDB, returning result without persistence:', dbError.message);
      // Return result even if DB save fails
      savedCase = {
        case_id: caseId,
        title: doc.name,
        type: 'Contract',
        status: 'completed',
        instructions,
        clauses: finalClauses,
        risks: finalRisks,
        redlines: finalRedlines,
        reports: finalReports,
        summary: finalSummary
      };
    }

    return NextResponse.json(savedCase)
  } catch (error: any) {
    console.error('Case creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create case' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    try {
      await dbConnect();
    } catch (dbError: any) {
      console.warn('MongoDB connection failed:', dbError.message);
      return NextResponse.json(
        { error: 'Database connection unavailable', cases: [] },
        { status: 503 }
      );
    }
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('case_id')

    if (!caseId) {
      // Return all cases
      const cases = await Case.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ cases })
    }

    const result = await Case.findOne({ case_id: caseId });

    if (!result) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Case fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    )
  }
}

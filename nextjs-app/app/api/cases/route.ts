import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { RiskEngine } from '@/lib/services/risk-engine'
import os from 'os'

// In-memory mock DB for demo persistence
const MOCK_DB: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
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

    // Run Node.js Risk Engine
    const result = await RiskEngine.analyzeDocument(filePath, caseId, instructions);

    // Save to Mock DB
    MOCK_DB[caseId] = result;

    return NextResponse.json({
      case_id: caseId,
      status: 'completed',
      clauses: result.clauses,
      risks: result.clauses.map(c => ({
        clause_id: c.clause_id,
        risk_score: c.risk_score,
        severity: c.severity,
        rationale: c.rationale,
        negotiation_scenarios: c.negotiation_scenarios
      })),
      redlines: {
        patches: result.clauses.filter(c => c.redline).map(c => ({
          clause_id: c.clause_id,
          patch: c.redline,
          rationale: c.recommendation
        }))
      },
      reports: {
        executive_summary: {
          headline: `Analyzed ${result.clauses.length} clauses. Found ${result.summary.critical} critical risks.`,
          risk_counts: result.summary,
          top_issues: result.clauses.filter(c => c.severity === 'critical' || c.severity === 'high').map(c => c.rationale),
          remediation_plan: ["Review critical redlines", "Escalate high risks to legal counsel"]
        }
      }
    })
  } catch (error: any) {
    console.error('Case creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create case' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get('case_id')

  if (!caseId || !MOCK_DB[caseId]) {
    return NextResponse.json(
      { error: 'Case not found' },
      { status: 404 }
    )
  }

  const result = MOCK_DB[caseId];
  return NextResponse.json({
    case_id: caseId,
    status: 'completed',
    clauses: result.clauses,
    risks: result.clauses.map((c: any) => ({
      clause_id: c.clause_id,
      risk_score: c.risk_score,
      severity: c.severity,
      rationale: c.rationale
    })),
    redlines: {
      patches: result.clauses.filter((c: any) => c.redline).map((c: any) => ({
        clause_id: c.clause_id,
        patch: c.redline,
        rationale: c.recommendation
      }))
    },
    reports: {
      executive_summary: {
        headline: `Analyzed ${result.clauses.length} clauses. Found ${result.summary.critical} critical risks.`,
        risk_counts: result.summary,
        top_issues: result.clauses.filter((c: any) => c.severity === 'critical' || c.severity === 'high').map((c: any) => c.rationale),
        remediation_plan: ["Review critical redlines", "Escalate high risks to legal counsel"]
      }
    }
  })
}

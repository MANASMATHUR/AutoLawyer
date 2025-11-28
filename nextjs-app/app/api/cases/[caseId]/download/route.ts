import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const { join } = await import('path')
    const projectRoot = join(process.cwd(), '..', '..')
    const pythonScript = join(projectRoot, 'autolawyer-mcp', 'services', 'get_exec_summary.py')
    const { stdout } = await execAsync(
      `python "${pythonScript}" '${params.caseId}'`,
      { cwd: projectRoot }
    )
    const summary = stdout

    return new NextResponse(summary, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="exec-summary-${params.caseId}.txt"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Executive summary not found' },
      { status: 404 }
    )
  }
}


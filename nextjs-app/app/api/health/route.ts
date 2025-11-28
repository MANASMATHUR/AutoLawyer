import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Call Python service to check health
    const { join } = await import('path')
    const projectRoot = join(process.cwd(), '..')
    const pythonScript = join(projectRoot, 'autolawyer-mcp', 'services', 'health_check.py')
    const { stdout } = await execAsync(
      `python "${pythonScript}"`,
      { cwd: projectRoot }
    )
    const health = JSON.parse(stdout)
    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: 'healthy',
        providers_available: 0,
        offline_mode: true,
        error: 'Python service not available',
      },
      { status: 200 }
    )
  }
}


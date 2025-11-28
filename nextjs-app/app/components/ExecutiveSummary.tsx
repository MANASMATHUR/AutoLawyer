'use client'

import { Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react'

interface ExecutiveSummaryProps {
  reports: any
  caseId: string
}

export default function ExecutiveSummary({ reports, caseId }: ExecutiveSummaryProps) {
  const summary = reports.executive_summary || {}
  const riskCounts = summary.risk_counts || {}

  const downloadSummary = async () => {
    const response = await fetch(`/api/cases/${caseId}/download`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exec-summary-${caseId}.txt`
    a.click()
  }

  return (
    <div className="executive-summary">
      <div className="summary-header">
        <h2 className="summary-title">Executive Summary</h2>
        <button onClick={downloadSummary} className="download-btn">
          <Download size={16} />
          Download PDF
        </button>
      </div>

      <div className="summary-content">
        <div className="summary-hero">
          <h1 className="summary-headline">{summary.headline || 'Contract Risk Analysis'}</h1>
          <p className="summary-subtitle">Comprehensive risk assessment and remediation plan</p>
        </div>

        <div className="risk-overview">
          <div className="risk-card critical">
            <AlertTriangle size={32} />
            <div className="risk-info">
              <h3>{riskCounts.critical || 0}</h3>
              <p>Critical Risks</p>
            </div>
          </div>
          <div className="risk-card high">
            <AlertTriangle size={32} />
            <div className="risk-info">
              <h3>{riskCounts.high || 0}</h3>
              <p>High Risks</p>
            </div>
          </div>
          <div className="risk-card medium">
            <AlertTriangle size={32} />
            <div className="risk-info">
              <h3>{riskCounts.medium || 0}</h3>
              <p>Medium Risks</p>
            </div>
          </div>
          <div className="risk-card low">
            <CheckCircle size={32} />
            <div className="risk-info">
              <h3>{riskCounts.low || 0}</h3>
              <p>Low Risks</p>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="section-title">Top Issues</h3>
          <ul className="issues-list">
            {(summary.top_issues || []).map((issue: string, index: number) => (
              <li key={index} className="issue-item">
                <AlertTriangle size={16} />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="summary-section">
          <h3 className="section-title">Remediation Plan</h3>
          <ol className="remediation-list">
            {(summary.remediation_plan || []).map((item: string, index: number) => (
              <li key={index} className="remediation-item">
                <CheckCircle size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}


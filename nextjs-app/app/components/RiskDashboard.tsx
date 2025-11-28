'use client'

import { useMemo } from 'react'
import { AlertTriangle, TrendingUp, BarChart3, PieChart } from 'lucide-react'

interface Risk {
  clause_id: string
  heading: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  risk_score: number
  explanation: string
  source_document?: string
}

interface RiskDashboardProps {
  risks: Risk[]
  reports: any
}

export default function RiskDashboard({ risks, reports }: RiskDashboardProps) {
  const riskStats = useMemo(() => {
    const stats = {
      critical: risks.filter(r => r.severity === 'critical').length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      low: risks.filter(r => r.severity === 'low').length,
      total: risks.length,
      avgScore: risks.length > 0 
        ? risks.reduce((sum, r) => sum + r.risk_score, 0) / risks.length 
        : 0,
    }
    return stats
  }, [risks])

  const severityColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#eab308',
    low: '#22c55e',
  }

  const topRisks = useMemo(() => {
    return [...risks]
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10)
  }, [risks])

  return (
    <div className="risk-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Risk Analysis Dashboard</h2>
      </div>

      {/* Risk Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card critical">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{riskStats.critical}</h3>
            <p className="stat-label">Critical Risks</p>
          </div>
        </div>
        <div className="stat-card high">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{riskStats.high}</h3>
            <p className="stat-label">High Risks</p>
          </div>
        </div>
        <div className="stat-card medium">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{riskStats.medium}</h3>
            <p className="stat-label">Medium Risks</p>
          </div>
        </div>
        <div className="stat-card low">
          <div className="stat-icon">
            <PieChart size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{riskStats.low}</h3>
            <p className="stat-label">Low Risks</p>
          </div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="chart-container">
        <h3 className="chart-title">Risk Distribution</h3>
        <div className="risk-chart">
          {['critical', 'high', 'medium', 'low'].map((severity) => {
            const count = riskStats[severity as keyof typeof riskStats] as number
            const percentage = riskStats.total > 0 ? (count / riskStats.total) * 100 : 0
            return (
              <div key={severity} className="chart-bar">
                <div className="chart-bar-label">
                  <span className="severity-dot" style={{ backgroundColor: severityColors[severity as keyof typeof severityColors] }} />
                  <span className="severity-name">{severity.toUpperCase()}</span>
                  <span className="severity-count">{count}</span>
                </div>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: severityColors[severity as keyof typeof severityColors],
                    }}
                  />
                </div>
                <span className="chart-bar-percentage">{percentage.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Risks Table */}
      <div className="risks-table-container">
        <h3 className="table-title">Top 10 Highest Risk Clauses</h3>
        <div className="risks-table">
          <div className="table-header">
            <div className="table-col">Rank</div>
            <div className="table-col">Clause</div>
            <div className="table-col">Severity</div>
            <div className="table-col">Risk Score</div>
            <div className="table-col">Explanation</div>
          </div>
          {topRisks.map((risk, index) => (
            <div key={risk.clause_id} className="table-row">
              <div className="table-col rank">{index + 1}</div>
              <div className="table-col clause">{risk.heading || 'Untitled'}</div>
              <div className="table-col">
                <span
                  className="severity-badge"
                  style={{ backgroundColor: severityColors[risk.severity] }}
                >
                  {risk.severity}
                </span>
              </div>
              <div className="table-col score">{risk.risk_score.toFixed(2)}</div>
              <div className="table-col explanation">{risk.explanation}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


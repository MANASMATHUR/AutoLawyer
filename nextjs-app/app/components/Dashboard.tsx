'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BarChart3, Settings, Upload, History, Download, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react'
import FileUploader from './FileUploader'
import ClauseViewer from './ClauseViewer'
import RiskDashboard from './RiskDashboard'
import AgentLogs from './AgentLogs'
import RedlineViewer from './RedlineViewer'
import ExecutiveSummary from './ExecutiveSummary'

type Tab = 'upload' | 'clauses' | 'risks' | 'redlines' | 'summary' | 'logs'

interface DashboardProps {
  caseData: any
  onNewCase: () => void
}

export default function Dashboard({ caseData, onNewCase }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [isProcessing, setIsProcessing] = useState(false)

  const tabs = [
    { id: 'upload' as Tab, label: 'Upload', icon: Upload },
    { id: 'clauses' as Tab, label: 'Clauses', icon: FileText },
    { id: 'risks' as Tab, label: 'Risk Analysis', icon: BarChart3 },
    { id: 'redlines' as Tab, label: 'Redlines', icon: AlertTriangle },
    { id: 'summary' as Tab, label: 'Summary', icon: CheckCircle },
    { id: 'logs' as Tab, label: 'Agent Logs', icon: Clock },
  ]

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7000FF] to-[#00F0FF] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold font-['Outfit'] tracking-tight text-white">DocuIntel 2.0</h1>
          </div>
          <p className="tagline pl-10">AI Legal Assistant</p>
        </div>
        <nav className="sidebar-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-full bg-[#00F0FF]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <button onClick={onNewCase} className="new-case-btn">
            <Upload size={16} />
            New Case
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          {caseData && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="case-info"
            >
              <h2>Case: {caseData.case_id}</h2>
              <div className="case-stats">
                <span className="stat">
                  <FileText size={16} />
                  {caseData.clauses?.length || 0} Clauses
                </span>
                <span className="stat">
                  <AlertTriangle size={16} className="text-[#ff0055]" />
                  <span className="text-[#ff0055] font-bold">{caseData.risks?.filter((r: any) => r.severity === 'critical').length || 0} Critical</span>
                </span>
                <span className="stat">
                  <CheckCircle size={16} className="text-[#00ff9d]" />
                  <span className="text-[#00ff9d]">{caseData.risks?.filter((r: any) => r.severity === 'low').length || 0} Low Risk</span>
                </span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="content-body relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'upload' && (
                <FileUploader onProcessingChange={setIsProcessing} onCaseCreated={onNewCase} />
              )}
              {activeTab === 'clauses' && caseData && (
                <ClauseViewer clauses={caseData.clauses || []} />
              )}
              {activeTab === 'risks' && caseData && (
                <RiskDashboard risks={caseData.risks || []} reports={caseData.reports || {}} />
              )}
              {activeTab === 'redlines' && caseData && (
                <RedlineViewer redlines={caseData.redlines || {}} />
              )}
              {activeTab === 'summary' && caseData && (
                <ExecutiveSummary reports={caseData.reports || {}} caseId={caseData.case_id} />
              )}
              {activeTab === 'logs' && caseData && (
                <AgentLogs logs={caseData.logs || []} />
              )}
              {!caseData && activeTab !== 'upload' && (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <h3>No Case Data</h3>
                  <p>Upload a contract to get started</p>
                  <button onClick={() => setActiveTab('upload')} className="btn-primary">
                    Upload Contract
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}


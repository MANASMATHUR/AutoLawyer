'use client'

import { useEffect, useRef } from 'react'
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react'

interface LogEntry {
  task: string
  role: string
  model: string
  prompt?: string
  result_preview?: string
  timestamp: number
  status?: 'completed' | 'failed' | 'pending'
}

interface AgentLogsProps {
  logs: LogEntry[]
}

export default function AgentLogs({ logs }: AgentLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />
      case 'failed':
        return <XCircle size={16} className="status-icon failed" />
      default:
        return <Loader size={16} className="status-icon pending spin" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString()
  }

  return (
    <div className="agent-logs">
      <div className="logs-header">
        <h2 className="logs-title">Agent Execution Logs</h2>
        <div className="logs-stats">
          <span>Total Steps: {logs.length}</span>
          <span>Completed: {logs.filter(l => l.status === 'completed').length}</span>
        </div>
      </div>

      <div className="logs-container">
        {logs.map((log, index) => (
          <div key={index} className="log-entry">
            <div className="log-timestamp">
              <Clock size={14} />
              {formatTimestamp(log.timestamp)}
            </div>
            <div className="log-content">
              <div className="log-header">
                {getStatusIcon(log.status)}
                <span className="log-role">{log.role}</span>
                <span className="log-task">{log.task}</span>
                <span className="log-model">{log.model}</span>
              </div>
              {log.result_preview && (
                <div className="log-preview">
                  <pre>{log.result_preview.substring(0, 200)}...</pre>
                </div>
              )}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="empty-logs">
            <Clock size={48} />
            <p>No logs available</p>
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}


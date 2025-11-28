'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, FileText, ChevronDown, ChevronUp } from 'lucide-react'

interface Clause {
  clause_id: string
  heading: string
  body: string
  source_document?: string
}

interface ClauseViewerProps {
  clauses: Clause[]
}

export default function ClauseViewer({ clauses }: ClauseViewerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set())
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const filteredClauses = useMemo(() => {
    return clauses.filter(clause => {
      const matchesSearch = clause.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           clause.body.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [clauses, searchQuery])

  const toggleClause = (clauseId: string) => {
    setExpandedClauses(prev => {
      const next = new Set(prev)
      if (next.has(clauseId)) {
        next.delete(clauseId)
      } else {
        next.add(clauseId)
      }
      return next
    })
  }

  return (
    <div className="clause-viewer">
      <div className="viewer-header">
        <h2 className="viewer-title">Clause Viewer</h2>
        <div className="viewer-controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search clauses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <Filter size={20} />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Clauses</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="clause-stats">
        <span className="stat-badge">Total: {clauses.length}</span>
        <span className="stat-badge">Filtered: {filteredClauses.length}</span>
      </div>

      <div className="clause-list">
        {filteredClauses.map((clause, index) => {
          const isExpanded = expandedClauses.has(clause.clause_id)
          return (
            <div key={clause.clause_id} className="clause-card">
              <div className="clause-header" onClick={() => toggleClause(clause.clause_id)}>
                <div className="clause-info">
                  <span className="clause-number">#{index + 1}</span>
                  <h3 className="clause-title">{clause.heading || 'Untitled Clause'}</h3>
                  {clause.source_document && (
                    <span className="clause-source">{clause.source_document}</span>
                  )}
                </div>
                <button className="expand-btn">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              {isExpanded && (
                <div className="clause-body">
                  <p className="clause-text">{clause.body}</p>
                </div>
              )}
            </div>
          )
        })}
        {filteredClauses.length === 0 && (
          <div className="empty-clauses">
            <FileText size={48} />
            <p>No clauses found</p>
          </div>
        )}
      </div>
    </div>
  )
}


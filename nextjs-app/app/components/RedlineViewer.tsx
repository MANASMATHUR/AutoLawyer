'use client'

import { useState } from 'react'
import { FileDiff, Download, Eye } from 'lucide-react'

interface Patch {
  clause_id: string
  patch: string
  rationale: string
  original?: string
  modified?: string
}

interface RedlineViewerProps {
  redlines: {
    patches?: Patch[]
  }
}

export default function RedlineViewer({ redlines }: RedlineViewerProps) {
  const [selectedPatch, setSelectedPatch] = useState<number | null>(null)
  const patches = redlines.patches || []

  const downloadPatch = (patch: Patch) => {
    const content = `Clause ID: ${patch.clause_id}\n\nPatch:\n${patch.patch}\n\nRationale:\n${patch.rationale}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `redline-${patch.clause_id}.txt`
    a.click()
  }

  return (
    <div className="redline-viewer">
      <div className="viewer-header">
        <h2 className="viewer-title">Redline Patches</h2>
        <div className="viewer-stats">
          <span>{patches.length} patches generated</span>
        </div>
      </div>

      <div className="patches-list">
        {patches.map((patch, index) => (
          <div key={index} className="patch-card">
            <div className="patch-header">
              <div className="patch-id">
                <FileDiff size={20} />
                <span>{patch.clause_id}</span>
              </div>
              <div className="patch-actions">
                <button
                  onClick={() => setSelectedPatch(selectedPatch === index ? null : index)}
                  className="action-btn"
                >
                  <Eye size={16} />
                  {selectedPatch === index ? 'Hide' : 'View'}
                </button>
                <button onClick={() => downloadPatch(patch)} className="action-btn">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
            {selectedPatch === index && (
              <div className="patch-content">
                <div className="patch-section">
                  <h4>Patch</h4>
                  <pre className="patch-code">{patch.patch}</pre>
                </div>
                <div className="patch-section">
                  <h4>Rationale</h4>
                  <p className="patch-rationale">{patch.rationale}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        {patches.length === 0 && (
          <div className="empty-patches">
            <FileDiff size={48} />
            <p>No redline patches generated</p>
          </div>
        )}
      </div>
    </div>
  )
}


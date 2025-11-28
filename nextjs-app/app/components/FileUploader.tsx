'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X, AlertCircle, Loader } from 'lucide-react'

interface FileUploaderProps {
  onProcessingChange: (processing: boolean) => void
  onCaseCreated: () => void
}

export default function FileUploader({ onProcessingChange, onCaseCreated }: FileUploaderProps) {
  const [primaryFiles, setPrimaryFiles] = useState<File[]>([])
  const [secondaryFiles, setSecondaryFiles] = useState<File[]>([])
  const [instructions, setInstructions] = useState('Tighten liability + privacy terms. Ensure data protection compliance.')
  const [policyJson, setPolicyJson] = useState('{"keywords": {"liability": ["cap", "limit"], "privacy": ["gdpr", "ccpa"]}}')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, type: 'primary' | 'secondary') => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => 
      f.type === 'application/pdf' || 
      f.name.endsWith('.docx') || 
      f.name.endsWith('.txt')
    )
    if (type === 'primary') {
      setPrimaryFiles(prev => [...prev, ...files])
    } else {
      setSecondaryFiles(prev => [...prev, ...files])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'primary' | 'secondary') => {
    const files = Array.from(e.target.files || [])
    if (type === 'primary') {
      setPrimaryFiles(prev => [...prev, ...files])
    } else {
      setSecondaryFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index: number, type: 'primary' | 'secondary') => {
    if (type === 'primary') {
      setPrimaryFiles(prev => prev.filter((_, i) => i !== index))
    } else {
      setSecondaryFiles(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (primaryFiles.length === 0) {
      setError('Please upload at least one primary document')
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress(0)
    onProcessingChange(true)

    const formData = new FormData()
    primaryFiles.forEach(file => formData.append('primary_docs', file))
    secondaryFiles.forEach(file => formData.append('secondary_docs', file))
    formData.append('instructions', instructions)
    formData.append('policy_json', policyJson)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch('/api/cases', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Request failed')
      }

      const data = await response.json()
      // Store in sessionStorage for dashboard
      sessionStorage.setItem('currentCase', JSON.stringify(data))
      onCaseCreated()
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      setProgress(0)
    } finally {
      setIsProcessing(false)
      onProcessingChange(false)
    }
  }

  return (
    <div className="file-uploader">
      <div className="upload-section">
        <h2 className="section-title">Upload Contracts</h2>
        
        {/* Primary Documents */}
        <div className="upload-area">
          <label className="upload-label">Primary Contracts *</label>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'primary')}
          >
            <Upload size={48} className="upload-icon" />
            <p className="upload-text">Drag & drop files here or click to browse</p>
            <p className="upload-hint">PDF, DOCX, or TXT files</p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleFileSelect(e, 'primary')}
              className="file-input"
            />
          </div>
          {primaryFiles.length > 0 && (
            <div className="file-list">
              {primaryFiles.map((file, i) => (
                <div key={i} className="file-item">
                  <FileText size={16} />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => removeFile(i, 'primary')} className="remove-btn">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Secondary Documents */}
        <div className="upload-area">
          <label className="upload-label">Counterparty / Comparator Docs (Optional)</label>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'secondary')}
          >
            <Upload size={48} className="upload-icon" />
            <p className="upload-text">Drag & drop files here or click to browse</p>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleFileSelect(e, 'secondary')}
              className="file-input"
            />
          </div>
          {secondaryFiles.length > 0 && (
            <div className="file-list">
              {secondaryFiles.map((file, i) => (
                <div key={i} className="file-item">
                  <FileText size={16} />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => removeFile(i, 'secondary')} className="remove-btn">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="config-section">
          <div className="config-item">
            <label className="config-label">Redline Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              className="config-input"
              placeholder="Describe how you want contracts to be modified..."
            />
          </div>
          <div className="config-item">
            <label className="config-label">Policy JSON</label>
            <textarea
              value={policyJson}
              onChange={(e) => setPolicyJson(e.target.value)}
              rows={6}
              className="config-input code-input"
              placeholder='{"keywords": {"liability": ["cap"]}}'
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-text">Processing... {progress}%</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isProcessing || primaryFiles.length === 0}
          className="submit-button"
        >
          {isProcessing ? (
            <>
              <Loader className="spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <Upload size={20} />
              Run AutoLawyer Agent
            </>
          )}
        </button>
      </div>
    </div>
  )
}


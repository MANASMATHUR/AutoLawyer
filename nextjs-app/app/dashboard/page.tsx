'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { RiskChart } from '@/components/ui/risk-chart';
import { DiffViewer } from '@/components/ui/diff-viewer';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeContract = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('primary_docs', file);
    formData.append('instructions', 'Strict liability caps and mutual indemnification');

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              Contract Analysis
            </h1>
            <p className="text-gray-400">Upload a contract to detect risks and generate redlines.</p>
          </div>
          {result && (
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                Export Report
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                Start Negotiation
              </button>
            </div>
          )}
        </div>

        {/* Upload Section */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-blue-500/50 transition-colors bg-white/5"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Contract</h3>
            <p className="text-gray-400 mb-6">Drag & drop PDF or DOCX, or click to browse</p>

            <input
              type="file"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.docx,.txt"
            />

            {!file ? (
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium cursor-pointer transition-all hover:scale-105"
              >
                Select File
              </label>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>{file.name}</span>
                  <button onClick={() => setFile(null)} className="text-gray-400 hover:text-white ml-2">×</button>
                </div>
                <button
                  onClick={analyzeContract}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Run Analysis
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Stats & Summary */}
              <div className="space-y-6">
                <RiskChart data={result?.reports?.executive_summary?.risk_counts || { critical: 0, high: 0, medium: 0, low: 0 }} />

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Executive Summary
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {result?.reports?.executive_summary?.headline || 'Analysis complete'}
                  </p>
                  <div className="space-y-2">
                    {(result?.reports?.executive_summary?.top_issues || []).map((issue: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Redlines & Scenarios */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-semibold mb-4">Clause Analysis</h3>

                {(result?.risks || []).map((risk: any) => (
                  <div key={risk.clause_id} className="space-y-4">
                    <DiffViewer
                      original={result.clauses.find((c: any) => c.clause_id === risk.clause_id)?.text || ''}
                      proposed={result.redlines.patches.find((p: any) => p.clause_id === risk.clause_id)?.patch || 'No changes proposed.'}
                      rationale={risk.rationale}
                    />

                    {/* Negotiation Scenarios */}
                    {risk.negotiation_scenarios && risk.negotiation_scenarios.length > 0 && (
                      <div className="ml-4 pl-4 border-l-2 border-purple-500/30">
                        <h4 className="text-sm font-semibold text-purple-400 mb-3">Negotiation Simulation</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {risk.negotiation_scenarios.map((scenario: any) => (
                            <div key={scenario.scenario_id} className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-purple-300">{scenario.name}</span>
                                <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                                  {scenario.probability}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mb-2">{scenario.explanation}</p>
                              <div className="text-xs font-mono text-gray-500">
                                Impact: ${scenario.financial_impact.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

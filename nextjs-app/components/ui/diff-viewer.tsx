'use client';

import { motion } from 'framer-motion';
import { diffWords } from 'diff'; // Need to install 'diff' package or implement simple diff
import { useState } from 'react';

// Simple diff implementation since we might not have 'diff' package installed yet
// For now, we'll just show side-by-side. In a real app, use 'diff' package.

interface DiffViewerProps {
    original: string;
    proposed: string;
    rationale: string;
}

export function DiffViewer({ original, proposed, rationale }: DiffViewerProps) {
    const [mode, setMode] = useState<'side-by-side' | 'unified'>('side-by-side');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-6"
        >
            <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-300">Redline Suggestion</h4>
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('side-by-side')}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${mode === 'side-by-side' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}
                    >
                        Side-by-Side
                    </button>
                    <button
                        onClick={() => setMode('unified')}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${mode === 'unified' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}
                    >
                        Unified
                    </button>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {mode === 'side-by-side' ? (
                    <>
                        <div className="space-y-2">
                            <span className="text-xs uppercase tracking-wider text-red-400 font-semibold">Original</span>
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                {original}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs uppercase tracking-wider text-green-400 font-semibold">Proposed</span>
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                {proposed}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="col-span-2 space-y-2">
                        <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Unified View</span>
                        <div className="p-3 bg-black/20 border border-white/10 rounded-lg text-sm font-mono whitespace-pre-wrap">
                            <span className="text-red-400 line-through mr-2">{original}</span>
                            <span className="text-green-400">{proposed}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-blue-500/5 border-t border-white/10">
                <p className="text-sm text-blue-200">
                    <span className="font-semibold mr-2">🤖 AI Rationale:</span>
                    {rationale}
                </p>
            </div>
        </motion.div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, MoreVertical, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface Case {
    case_id: string;
    title: string;
    status: string;
    risk?: 'High' | 'Medium' | 'Low';
    date: string;
    type: string;
    summary?: {
        critical?: number;
        high?: number;
        medium?: number;
        low?: number;
    };
}

export default function CasesPage() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await fetch('/api/cases');
            const data = await res.json();
            if (data.cases) {
                // Compute risk level from summary for each case
                const casesWithRisk = data.cases.map((c: Case) => {
                    let risk: 'High' | 'Medium' | 'Low' = 'Low';
                    if (c.summary) {
                        const { critical = 0, high = 0, medium = 0 } = c.summary;
                        if (critical > 0 || high > 2) {
                            risk = 'High';
                        } else if (high > 0 || medium > 2) {
                            risk = 'Medium';
                        }
                    }
                    return { ...c, risk };
                });
                setCases(casesWithRisk);
            }
        } catch (error) {
            console.error('Failed to fetch cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || c.risk === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Cases</h1>
                    <p className="text-gray-400">Manage and track your document analysis cases</p>
                </div>
                <Link href="/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Plus size={20} />
                    New Case
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search cases..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
                <div className="relative group">
                    <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                        <Filter size={20} />
                        {filter} Risk
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-10">
                        {['All', 'High', 'Medium', 'Low'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cases List */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading cases...</div>
            ) : filteredCases.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <FileText className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                    <p>No cases found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredCases.map((caseItem, index) => (
                        <motion.div
                            key={caseItem.case_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5">
                                        <FileText className="text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {caseItem.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {caseItem.date ? new Date(caseItem.date).toLocaleDateString() : 'N/A'}
                                            </span>
                                            <span>•</span>
                                            <span>{caseItem.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${caseItem.risk === 'High'
                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                            : caseItem.risk === 'Medium'
                                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                : 'bg-green-500/10 text-green-400 border-green-500/20'
                                        }`}>
                                        {caseItem.risk} Risk
                                    </div>
                                    <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

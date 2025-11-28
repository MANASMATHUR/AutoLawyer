'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Activity, Settings } from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            AutoLawyer
                        </span>
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    <NavItem href="/dashboard" icon={<Activity />} label="Overview" active />
                    <NavItem href="/dashboard/cases" icon={<FileText />} label="Cases" />
                    <NavItem href="/dashboard/settings" icon={<Settings />} label="Settings" />
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500" />
                        <div>
                            <p className="text-sm font-medium">Demo User</p>
                            <p className="text-xs text-gray-400">Pro Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pl-64 min-h-screen">
                <div className="max-w-7xl mx-auto p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: ReactNode; label: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <span className={`group-hover:scale-110 transition-transform ${active ? 'text-blue-400' : ''}`}>
                {icon}
            </span>
            <span className="font-medium">{label}</span>
            {active && (
                <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                />
            )}
        </Link>
    );
}

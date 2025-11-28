'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, FileText, BarChart3, Lock, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'

const floatingVariants: Variants = {
    animate: {
        y: [0, -15, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut' as const,
        },
    },
}

const fadeInUp = (delay = 0) => ({
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay },
})

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#030014] overflow-hidden text-white selection:bg-[#7000FF] selection:text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#7000FF] opacity-20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#00F0FF] opacity-20 blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7000FF] to-[#00F0FF] flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold font-['Outfit'] tracking-tight">DocuIntel 2.0</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <a href="#features" className="hover:text-white transition-colors">
                        Features
                    </a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">
                        How it Works
                    </a>
                    <a href="#pricing" className="hover:text-white transition-colors">
                        Pricing
                    </a>
                </div>
                <Link href="/dashboard">
                    <button className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md font-medium text-sm flex items-center gap-2 group">
                        Launch App
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-16 sm:pt-20 pb-20 sm:pb-32 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div {...fadeInUp(0.1)}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 sm:mb-8">
                            <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse" />
                            <span className="text-sm font-medium text-[#00ff9d]">AI-Powered Legal Analysis</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-['Outfit'] leading-tight mb-6 sm:mb-8">
                            <span className="block">Legal Intelligence</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#FF0080]">
                                Reimagined
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed px-2">
                            Transform complex legal documents into actionable insights with our advanced AI agent. Risk analysis, clause extraction, and
                            compliance checking in seconds—powered by multi-model orchestration.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/dashboard">
                                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-[#7000FF] to-[#FF0080] text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(112,0,255,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    Start Analyzing Now
                                </button>
                            </Link>
                            <a href="#how-it-works" className="w-full sm:w-auto">
                                <button className="w-full px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md">
                                    See How It Works
                                </button>
                            </a>
                        </div>
                    </motion.div>

                    {/* Floating Cards */}
                    <div className="relative mt-20 sm:mt-32 h-[320px] sm:h-[400px]">
                        <motion.div
                            className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-4xl h-full"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <div className="relative w-full h-full">
                                {/* Main Dashboard Preview */}
                                <div className="absolute inset-0 bg-[#0a0a23] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                                    <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <div className="p-6 grid grid-cols-3 gap-6">
                                        <div className="col-span-1 space-y-4">
                                            <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
                                            <div className="h-24 rounded-lg bg-white/5 animate-pulse delay-100" />
                                            <div className="h-24 rounded-lg bg-white/5 animate-pulse delay-200" />
                                        </div>
                                        <div className="col-span-2 h-full rounded-lg bg-white/5 border border-white/10 p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-[#7000FF]/20 flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-[#7000FF]" />
                                                </div>
                                                <div>
                                                    <div className="h-2 w-24 bg-white/20 rounded mb-1" />
                                                    <div className="h-2 w-16 bg-white/10 rounded" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-white/10 rounded" />
                                                <div className="h-2 w-[90%] bg-white/10 rounded" />
                                                <div className="h-2 w-[95%] bg-white/10 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <motion.div
                                    variants={floatingVariants}
                                    animate="animate"
                                    className="absolute -right-6 sm:-right-12 -top-10 sm:-top-12 p-4 rounded-xl bg-[#0a0a23]/90 backdrop-blur-xl border border-[#00F0FF]/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/20 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-[#00F0FF]" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Risk Detected</div>
                                            <div className="text-xs text-[#00F0FF]">High Severity Clause</div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    variants={floatingVariants}
                                    animate="animate"
                                    className="absolute -left-6 sm:-left-12 bottom-8 sm:bottom-12 p-4 rounded-xl bg-[#0a0a23]/90 backdrop-blur-xl border border-[#FF0080]/30 shadow-[0_0_30px_rgba(255,0,128,0.2)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#FF0080]/20 flex items-center justify-center">
                                            <Zap className="w-6 h-6 text-[#FF0080]" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Analysis Complete</div>
                                            <div className="text-xs text-[#FF0080]">0.4s Processing Time</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section id="features" className="relative z-10 py-20 sm:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold font-['Outfit'] mb-6">
                            Supercharged <span className="text-[#7000FF]">Capabilities</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Built for modern legal teams who demand speed, accuracy, and depth in their document analysis.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FileText className="w-8 h-8 text-[#00F0FF]" />,
                                title: 'Smart Extraction',
                                desc: 'Automatically identifies and extracts key clauses, definitions, and obligations from any legal document.',
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-[#7000FF]" />,
                                title: 'Risk Assessment',
                                desc: 'AI-driven risk scoring system that highlights potential liabilities and non-compliant terms instantly.',
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8 text-[#FF0080]" />,
                                title: 'Visual Analytics',
                                desc: 'Interactive dashboards that visualize document health, risk distribution, and key metrics.',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4 font-['Outfit']">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="relative z-10 py-20 px-6">
                <div className="max-w-6xl mx-auto glass-panel rounded-3xl border border-white/10 p-8 sm:p-12">
                    <div className="text-center mb-12">
                        <p className="text-sm font-semibold text-[#00F0FF] uppercase tracking-[0.3em] mb-3">Workflow</p>
                        <h2 className="text-4xl font-bold font-['Outfit'] mb-4">Planner → Worker → Reviewer</h2>
                        <p className="text-gray-400 max-w-3xl mx-auto">
                            Autonomous MCP loop with Modal-powered compute. Every step logged with provider, model, tokens, and rationale.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                title: 'Planner',
                                desc: 'Creates the case-specific plan, chooses tools, and orchestrates model routing.',
                                accent: 'from-[#00F0FF] to-transparent',
                            },
                            {
                                title: 'Worker',
                                desc: 'Executes clause extraction, risk scoring, redline generation, and comparisons.',
                                accent: 'from-[#FF0080] to-transparent',
                            },
                            {
                                title: 'Reviewer',
                                desc: 'Verifies every artifact, enforces policies, and triggers replanning if needed.',
                                accent: 'from-[#7000FF] to-transparent',
                            },
                        ].map((step, i) => (
                            <div key={step.title} className="relative p-6 rounded-2xl bg-white/3 border border-white/10 overflow-hidden">
                                <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${step.accent}`} />
                                <div className="relative flex flex-col gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                                        {`0${i + 1}`}
                                    </div>
                                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing / CTA */}
            <section id="pricing" className="relative z-10 py-20 px-6">
                <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-2">
                    <motion.div {...fadeInUp()}>
                        <div className="glass-panel rounded-3xl p-10 border border-white/10">
                            <span className="text-sm font-semibold text-[#00F0FF] uppercase tracking-[0.3em]">Launch Offer</span>
                            <h2 className="text-4xl font-bold mt-3 mb-6 font-['Outfit']">Pilot-ready within hours</h2>
                            <p className="text-gray-300 mb-8">
                                Deploy the full AutoLawyer autonomy stack with Next.js frontend, Python MCP backend, Modal acceleration, and MongoDB
                                persistence. Optimized for hackathons and enterprise pilots.
                            </p>
                            <ul className="space-y-4 text-gray-300 mb-10">
                                {[
                                    'Clause viewer, risk dashboard, redline diffing',
                                    'Planner → Worker → Reviewer audit trail',
                                    'Multi-model routing (OpenAI, Nebius, SambaNova, Modal)',
                                    'Next.js App Router + Tailwind UI kit',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-[#00F0FF]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/dashboard" className="flex-1">
                                    <button className="w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7000FF] to-[#FF0080] font-semibold">
                                        Launch Dashboard
                                    </button>
                                </Link>
                                <a href="mailto:team@docuintel.com" className="flex-1">
                                    <button className="w-full px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition">
                                        Talk to Us
                                    </button>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div {...fadeInUp(0.2)} className="glass-panel rounded-3xl p-10 border border-white/10 space-y-6">
                        <div className="flex items-center gap-4">
                            <Sparkles className="w-10 h-10 text-[#FF0080]" />
                            <div>
                                <h3 className="text-xl font-semibold">Compute-Ready Stack</h3>
                                <p className="text-gray-400">Modal GPU functions, LiteLLM router, offline heuristics fallback</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Lock className="w-10 h-10 text-[#00F0FF]" />
                            <div>
                                <h3 className="text-xl font-semibold">Security Modes</h3>
                                <p className="text-gray-400">`AUTO_LAWYER_OFFLINE` flag, local processing, soon: redaction mode</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <TrendingUp className="w-10 h-10 text-[#00ff9d]" />
                            <div>
                                <h3 className="text-xl font-semibold">Evaluation Workflow</h3>
                                <p className="text-gray-400">Samples, notebooks, and metrics baked in for judge demos</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-10 px-6 text-center text-sm text-gray-400">
                Built for hackathons & enterprise pilots · DocuIntel 2.0 · Planner → Worker → Reviewer autonomy loop
            </footer>
        </div>
    )
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

export default function RoadmapPage() {
    const [showToast, setShowToast] = useState(true);

    return (
        <>
            <TopHeader title="Career Roadmap (Stage 5)" />

            {/* AI Mentor Stage 7 Toast */}
            {showToast && (
                <div className="absolute top-20 right-8 z-50 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl shadow-2xl p-4 flex items-start gap-4 max-w-sm">
                    <span className="material-symbols-outlined text-3xl shrink-0 mt-1">smart_toy</span>
                    <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-sm">Markhub Intelligence (Velocity Adaptation)</h4>
                        <p className="text-xs leading-relaxed opacity-90">
                            Sam, you&apos;ve logged 18 hours on your Cloud Architect track this week against a 10 hr goal. Incredible pace, but let&apos;s watch out for burnout. I&apos;ve re-calculated your roadmap—we&apos;re now tracking 3 weeks ahead of schedule!
                        </p>
                    </div>
                    <button onClick={() => setShowToast(false)} className="text-white/70 hover:text-white shrink-0">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-8 relative z-10">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Your Pathway to Cloud Architect</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">23 Weeks Remaining • Targeting 35 LPA</p>
                    </div>

                    {/* Roadmap Timeline */}
                    <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {/* Phase 1 - Complete */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10">
                                <span className="material-symbols-outlined font-bold">check</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Phase 1: Foundations</span>
                                    <span className="text-xs font-medium text-emerald-600">Complete</span>
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-1">C++ Core Syntaxes</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">40 Hours logged. Mastered memory management.</p>
                            </div>
                        </div>

                        {/* Phase 2 - Active */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-primary text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10 animate-pulse">
                                <span className="material-symbols-outlined font-bold">play_arrow</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border-2 border-primary bg-white dark:bg-slate-900 shadow-lg relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/5"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Phase 2: Core Competencies</span>
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">In Progress</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">Docker & Containerization</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">You are currently crushing your 10 hr goal. Jump back into the freeCodeCamp module.</p>
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-4">
                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: "75%" }}></div>
                                    </div>
                                    <a href="https://youtu.be/3c-iBn73dDE" target="_blank" rel="noopener noreferrer" className="w-full block text-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition">Resume Course</a>
                                </div>
                            </div>
                        </div>

                        {/* Phase 3 - Locked */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 dark:border-slate-900 bg-slate-200 dark:bg-slate-800 text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                <span className="material-symbols-outlined font-bold">lock</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm opacity-60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phase 3: Advanced Architectures</span>
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-1">Kubernetes Clusters</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Locked. Requires Docker completion.</p>
                            </div>
                        </div>

                        {/* Phase 4 - Locked */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 dark:border-slate-900 bg-slate-200 dark:bg-slate-800 text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                <span className="material-symbols-outlined font-bold">lock</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-sm opacity-60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phase 4: Capstone</span>
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-1">AI Chatbot with RAG</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">System Design & PyTorch projects.</p>
                            </div>
                        </div>
                    </div>

                    {/* Next Stage CTA */}
                    <div className="flex justify-end pt-4 pb-10 relative z-10 mt-4">
                        <Link href="/portfolio" className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-lg shadow-emerald-600/30">
                            Skip to Stage 6: Publish Portfolio <span className="material-symbols-outlined">public</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

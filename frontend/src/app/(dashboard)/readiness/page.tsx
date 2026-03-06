import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

const dimensions = [
    { name: "Skills Completion", score: 70, weight: "30%", icon: "school", color: "text-primary" },
    { name: "Projects Built", score: 60, weight: "25%", icon: "code", color: "text-emerald-500" },
    { name: "Simulations Passed", score: 80, weight: "20%", icon: "science", color: "text-violet-500" },
    { name: "Portfolio Quality", score: 75, weight: "15%", icon: "folder", color: "text-amber-500" },
    { name: "Mock Interviews", score: 40, weight: "10%", icon: "mic", color: "text-rose-500" },
];

const finalScore = 72;

export default function ReadinessPage() {
    return (
        <>
            <TopHeader title="Job Readiness Score (Stage 7)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Job Readiness Assessment</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Your composite readiness score for <strong>AI Engineer</strong> — based on skills, projects, simulations, portfolio, and interviews.</p>
                    </div>

                    {/* Main Score */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-center gap-10">
                        <div className="relative h-44 w-44 shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle className="text-slate-700" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                                <circle className="text-primary" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray={`${finalScore} ${100 - finalScore}`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-primary">{finalScore}%</span>
                                <span className="text-xs font-bold text-slate-400 uppercase mt-1">Ready</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 text-center md:text-left">
                            <h2 className="text-2xl font-black">Almost There!</h2>
                            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                                You need <strong className="text-primary">70%</strong> to unlock job matching. You&apos;re at 72% — <strong className="text-emerald-400">Job matching is now unlocked!</strong> Focus on mock interviews to push past 80%.
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                                <span className="text-sm font-bold text-emerald-400">Threshold Reached — Jobs Unlocked</span>
                            </div>
                        </div>
                    </div>

                    {/* Dimension Breakdown */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Score Breakdown</h3>
                        <div className="space-y-5">
                            {dimensions.map((dim) => (
                                <div key={dim.name} className="flex items-center gap-4">
                                    <span className={`material-symbols-outlined ${dim.color} text-2xl w-8`}>{dim.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{dim.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-slate-400">Weight: {dim.weight}</span>
                                                <span className="text-sm font-black text-slate-800 dark:text-white">{dim.score}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                                            <div className={`h-2 rounded-full ${dim.score >= 70 ? "bg-emerald-500" : dim.score >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${dim.score}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                            <h3 className="font-bold text-primary">AI Recommendations to Hit 80%</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                            <li className="flex items-start gap-2"><span className="material-symbols-outlined text-red-500 text-lg mt-0.5">priority_high</span> Complete 2 mock interviews to raise Interview score from 40% → 70%</li>
                            <li className="flex items-start gap-2"><span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">build</span> Finish the &quot;Stock Price Predictor&quot; project to boost Projects from 60% → 75%</li>
                            <li className="flex items-start gap-2"><span className="material-symbols-outlined text-emerald-500 text-lg mt-0.5">check</span> Your simulation scores are excellent — keep it up!</li>
                        </ul>
                    </div>

                    <div className="flex justify-end pt-4 pb-10">
                        <Link href="/jobs" className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-lg shadow-emerald-600/30">
                            View Job Matches <span className="material-symbols-outlined">work</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

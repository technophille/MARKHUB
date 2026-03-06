import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

export default function GapsPage() {
    return (
        <>
            <TopHeader title="Skill Gap Analysis (Stage 4)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Skill Gap Report: Cloud Architect
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">
                            Target Role vs. Your Current Skills — AI-generated gap analysis
                        </p>
                    </div>

                    {/* Readiness Score */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Overall Readiness</p>
                            <div className="relative h-32 w-32 mb-4">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path className="text-slate-200 dark:text-slate-800" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-amber-500" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="23, 100" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-black text-amber-500">23%</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">3 of 13 required skills matched</p>
                        </div>

                        {/* Mentor Diagnosis */}
                        <div className="bg-gradient-to-br from-primary to-blue-500 text-white rounded-xl p-6 shadow-lg flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-3xl">smart_toy</span>
                                <div>
                                    <h4 className="font-bold text-sm">Markhub Intelligence Diagnosis</h4>
                                    <p className="text-xs opacity-80">AI Mentor Summary</p>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed opacity-90">
                                Your profile shows strong foundational programming skills (Python, REST APIs), but you are missing 10 critical
                                Cloud Architect competencies. The biggest gaps are in <strong>Kubernetes</strong>, <strong>Terraform</strong>,
                                and <strong>System Design</strong> — all high-weight skills for this role. Your estimated time to close these
                                gaps at 15 hrs/week is <strong>23 weeks</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Critical Gaps */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Critical Priority Gaps</h3>
                        <p className="text-xs text-slate-500 mb-4">These skills have the highest weight for your target role.</p>
                        <div className="space-y-3">
                            {[
                                { skill: "Kubernetes", weight: 0.95, hours: 60 },
                                { skill: "Terraform", weight: 0.90, hours: 40 },
                                { skill: "System Design", weight: 0.88, hours: 50 },
                                { skill: "CI/CD Pipelines", weight: 0.85, hours: 30 },
                                { skill: "Monitoring (Prometheus/Grafana)", weight: 0.80, hours: 25 },
                            ].map((gap) => (
                                <div key={gap.skill} className="flex items-center gap-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                    <span className="material-symbols-outlined text-red-500">error</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{gap.skill}</p>
                                        <p className="text-xs text-slate-500">~{gap.hours} hours to proficiency</p>
                                    </div>
                                    <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">Weight: {gap.weight}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Gaps */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Secondary Gaps</h3>
                        <p className="text-xs text-slate-500 mb-4">Important but lower-weight skills for your target role.</p>
                        <div className="space-y-3">
                            {[
                                { skill: "Networking (VPC, DNS)", weight: 0.70, hours: 20 },
                                { skill: "Security Best Practices", weight: 0.65, hours: 15 },
                                { skill: "Cost Optimization", weight: 0.55, hours: 10 },
                                { skill: "Serverless (Lambda)", weight: 0.50, hours: 15 },
                                { skill: "IaC Testing", weight: 0.45, hours: 10 },
                            ].map((gap) => (
                                <div key={gap.skill} className="flex items-center gap-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                    <span className="material-symbols-outlined text-amber-500">warning</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{gap.skill}</p>
                                        <p className="text-xs text-slate-500">~{gap.hours} hours to proficiency</p>
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">Weight: {gap.weight}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next Stage CTA */}
                    <div className="flex justify-end pt-4 pb-10">
                        <Link href="/roadmap" className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-primary/30">
                            Generate 52-Week Roadmap <span className="material-symbols-outlined">map</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

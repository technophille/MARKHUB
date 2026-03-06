import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

export default function CareersPage() {
    const careers = [
        { rank: 1, title: "AI Engineer", match: 92, salary: "15–25 LPA", skills: ["Python", "ML", "Deep Learning", "TensorFlow"], icon: "smart_toy", color: "from-violet-500 to-purple-600" },
        { rank: 2, title: "Data Scientist", match: 85, salary: "12–22 LPA", skills: ["Python", "Statistics", "SQL", "Pandas"], icon: "analytics", color: "from-blue-500 to-cyan-500" },
        { rank: 3, title: "ML Engineer", match: 78, salary: "14–24 LPA", skills: ["Python", "MLOps", "Docker", "AWS"], icon: "model_training", color: "from-emerald-500 to-teal-500" },
        { rank: 4, title: "Data Analyst", match: 72, salary: "8–15 LPA", skills: ["Python", "SQL", "Excel", "Tableau"], icon: "bar_chart", color: "from-amber-500 to-orange-500" },
        { rank: 5, title: "Backend Developer", match: 65, salary: "10–20 LPA", skills: ["Python", "APIs", "PostgreSQL", "Docker"], icon: "dns", color: "from-rose-500 to-pink-500" },
    ];

    return (
        <>
            <TopHeader title="Career Path Discovery (Stage 2)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Your Top Career Paths</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Based on your skills, interests, and market demand — AI-ranked career recommendations.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {careers.map((career) => (
                            <div key={career.title} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${career.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                                        <span className="material-symbols-outlined text-3xl">{career.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">#{career.rank}</span>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{career.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3">Salary Range: {career.salary}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {career.skills.map((skill) => (
                                                <span key={skill} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        <div className="relative h-16 w-16">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle className="text-slate-200 dark:text-slate-800" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
                                                <circle className="text-primary" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${career.match} ${100 - career.match}`} strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-sm font-black text-primary">{career.match}%</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Match</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 pb-10">
                        <Link href="/gaps" className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-primary/30">
                            Analyze Skill Gaps for #1 Pick <span className="material-symbols-outlined">track_changes</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

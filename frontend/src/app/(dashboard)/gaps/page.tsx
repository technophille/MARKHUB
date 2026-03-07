"use client";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";
import { useEffect, useState } from "react";

interface CourseItem {
    title: string;
    url: string;
    hours: number;
}

interface GapItem {
    skill: string;
    hours: number;
    weight: number;
    courses: CourseItem[];
}

interface GapsData {
    target_role: string;
    readiness: { percentage: number; matched: number; total: number };
    summary: string;
    critical_gaps: GapItem[];
    secondary_gaps: GapItem[];
    total_hours: number;
    weeks_estimate: number;
    learning_hours_per_week: number;
}

export default function GapsPage() {
    const [data, setData] = useState<GapsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

    const toggleExpand = (skill: string) => {
        setExpandedSkills(prev => {
            const next = new Set(prev);
            if (next.has(skill)) next.delete(skill);
            else next.add(skill);
            return next;
        });
    };

    useEffect(() => {
        const userId = localStorage.getItem("markhub_user_id") || "2";
        const selectedRole = localStorage.getItem("markhub_selected_role");
        const roleParam = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : "";
        fetch(`http://localhost:8000/api/gaps/${userId}${roleParam}`)
            .then(res => res.json())
            .then(result => {
                if (result.status === "success") {
                    setData(result);
                }
            })
            .catch(err => console.error("Failed to fetch gaps:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <TopHeader title="Skill Gap Analysis (Stage 4)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        <p className="text-slate-500 font-semibold">Analyzing your skill gaps...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!data) {
        return (
            <>
                <TopHeader title="Skill Gap Analysis (Stage 4)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-slate-500">No profile data found. Complete the Career Calibration first.</p>
                </div>
            </>
        );
    }

    const readinessColor = data.readiness.percentage >= 60 ? "text-emerald-500" : data.readiness.percentage >= 35 ? "text-amber-500" : "text-red-500";

    const renderGapCard = (gap: GapItem, type: "critical" | "secondary") => {
        const isExpanded = expandedSkills.has(gap.skill);
        const bgColor = type === "critical" ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20" : "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20";
        const iconColor = type === "critical" ? "text-red-500" : "text-amber-500";
        const icon = type === "critical" ? "error" : "warning";
        const badgeColor = type === "critical" ? "text-red-600 bg-red-100 dark:bg-red-900/30" : "text-amber-600 bg-amber-100 dark:bg-amber-900/30";

        return (
            <div key={gap.skill} className={`rounded-lg border ${bgColor} overflow-hidden transition-all`}>
                <button
                    onClick={() => toggleExpand(gap.skill)}
                    className="w-full flex items-center gap-4 p-3 cursor-pointer hover:opacity-80 transition"
                >
                    <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{gap.skill}</p>
                        <p className="text-xs text-slate-500">~{gap.hours} hours to proficiency</p>
                    </div>
                    <span className={`text-xs font-bold ${badgeColor} px-2 py-1 rounded`}>Weight: {gap.weight}</span>
                    <span className={`material-symbols-outlined text-slate-400 text-sm transition-transform ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                </button>

                {isExpanded && gap.courses && gap.courses.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            <span className="material-symbols-outlined text-xs align-middle mr-1">school</span>
                            Recommended Courses ({gap.courses.length})
                        </p>
                        <div className="space-y-2">
                            {gap.courses.map((course, i) => (
                                <a
                                    key={i}
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:border-primary/30 border border-slate-100 dark:border-slate-700 transition-all group"
                                >
                                    <span className="material-symbols-outlined text-primary text-lg">play_circle</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-700 dark:text-white group-hover:text-primary transition">{course.title}</p>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{course.hours}h</span>
                                    <span className="material-symbols-outlined text-slate-400 text-sm group-hover:text-primary transition">open_in_new</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <TopHeader title="Skill Gap Analysis (Stage 4)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Skill Gap Report: {data.target_role}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">
                            Target Role vs. Your Current Skills — AI-generated gap analysis with course recommendations
                        </p>
                    </div>

                    {/* Readiness + Mentor Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Overall Readiness</p>
                            <div className="relative h-32 w-32 mb-4">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path className="text-slate-200 dark:text-slate-800" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className={readinessColor} d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${data.readiness.percentage}, 100`} strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-3xl font-black ${readinessColor}`}>{data.readiness.percentage}%</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">{data.readiness.matched} of {data.readiness.total} required skills matched</p>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-blue-500 text-white rounded-xl p-6 shadow-lg flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-3xl">smart_toy</span>
                                <div>
                                    <h4 className="font-bold text-sm">Markhub Intelligence Diagnosis</h4>
                                    <p className="text-xs opacity-80">AI Mentor Summary</p>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed opacity-90">{data.summary}</p>
                        </div>
                    </div>

                    {/* Critical Gaps with Courses */}
                    {data.critical_gaps.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Critical Priority Gaps</h3>
                            <p className="text-xs text-slate-500 mb-4">Click any skill to see recommended courses. These skills have the highest weight for {data.target_role}.</p>
                            <div className="space-y-3">
                                {data.critical_gaps.map((gap) => renderGapCard(gap, "critical"))}
                            </div>
                        </div>
                    )}

                    {/* Secondary Gaps with Courses */}
                    {data.secondary_gaps.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Secondary Gaps</h3>
                            <p className="text-xs text-slate-500 mb-4">Click any skill to see recommended courses. Important but lower-weight skills for {data.target_role}.</p>
                            <div className="space-y-3">
                                {data.secondary_gaps.map((gap) => renderGapCard(gap, "secondary"))}
                            </div>
                        </div>
                    )}

                    {/* Time Estimate Summary */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">Total estimated learning: ~{data.total_hours} hours</p>
                                <p className="text-xs text-slate-500">At {data.learning_hours_per_week} hrs/week → ~{data.weeks_estimate} weeks to close all gaps</p>
                            </div>
                        </div>
                    </div>

                    {/* Next Stage CTA */}
                    <div className="flex justify-end pt-4 pb-10">
                        <Link href="/roadmap" className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-primary/30">
                            Generate {data.weeks_estimate}-Week Roadmap <span className="material-symbols-outlined">map</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

interface Course {
    title: string;
    url: string;
    hours: number;
}

interface SkillItem {
    name: string;
    hours: number;
    courses: Course[];
}

interface Phase {
    phase: number;
    title: string;
    skills: SkillItem[];
    total_hours: number;
    weeks: number;
    status: string;
}

interface Cert {
    name: string;
    provider: string;
    url: string;
}

interface RoadmapData {
    target_role: string;
    salary_range: string;
    total_weeks: number;
    total_hours: number;
    learning_hours_per_week: number;
    phases: Phase[];
    certifications: Cert[];
}

export default function RoadmapPage() {
    const [data, setData] = useState<RoadmapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem("markhub_user_id") || "2";
        const selectedRole = localStorage.getItem("markhub_selected_role");
        const roleParam = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : "";
        fetch(`http://localhost:8000/api/roadmap/${userId}${roleParam}`)
            .then(res => res.json())
            .then(result => {
                if (result.status === "success") {
                    setData(result);
                    // Auto-expand active phase
                    const activeIdx = result.phases.findIndex((p: Phase) => p.status === "active");
                    if (activeIdx >= 0) setExpandedPhase(activeIdx);
                }
            })
            .catch(err => console.error("Failed to fetch roadmap:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <TopHeader title="Career Roadmap (Stage 5)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        <p className="text-slate-500 font-semibold">Generating your personalized roadmap...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!data) {
        return (
            <>
                <TopHeader title="Career Roadmap (Stage 5)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-slate-500">No profile data found.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <TopHeader title="Career Roadmap (Stage 5)" />
            <div className="flex-1 overflow-y-auto p-8 relative z-10">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Your Pathway to {data.target_role}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">
                            {data.total_weeks} Weeks • {data.total_hours} Hours • {data.learning_hours_per_week} hrs/week • Targeting {data.salary_range}
                        </p>
                    </div>

                    {/* Roadmap Timeline */}
                    <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {data.phases.map((phase, idx) => {
                            const isActive = phase.status === "active";
                            const isLocked = phase.status === "locked";
                            const isExpanded = expandedPhase === idx;

                            return (
                                <div key={idx} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    {/* Timeline dot */}
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10 ${isActive ? "bg-primary text-white animate-pulse" : isLocked ? "bg-slate-200 dark:bg-slate-800 text-slate-400" : "bg-emerald-500 text-white"
                                        }`}>
                                        <span className="material-symbols-outlined font-bold">
                                            {isActive ? "play_arrow" : isLocked ? "lock" : "check"}
                                        </span>
                                    </div>

                                    {/* Phase card */}
                                    <div
                                        className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] rounded-xl shadow-sm cursor-pointer transition-all ${isActive ? "p-4 border-2 border-primary bg-white dark:bg-slate-900 shadow-lg" : isLocked ? "p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-70" : "p-4 border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10"
                                            }`}
                                        onClick={() => setExpandedPhase(isExpanded ? null : idx)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-primary" : isLocked ? "text-slate-500" : "text-emerald-600"}`}>
                                                Phase {phase.phase}: {phase.title}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-slate-500">{phase.total_hours}h • {phase.weeks}w</span>
                                                {isActive && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Active</span>}
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-slate-800 dark:text-white mb-1">
                                            {phase.skills.map(s => s.name).join(" + ")}
                                        </h3>

                                        {/* Expanded: show courses for each skill */}
                                        {isExpanded && (
                                            <div className="mt-4 space-y-4">
                                                {phase.skills.map((skill, sIdx) => (
                                                    <div key={sIdx} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{skill.name}</span>
                                                            <span className="text-xs text-slate-500">~{skill.hours}h</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {skill.courses.map((course, cIdx) => (
                                                                <a
                                                                    key={cIdx}
                                                                    href={course.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-sm transition-all text-sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <span className="material-symbols-outlined text-primary text-lg shrink-0">play_circle</span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-slate-700 dark:text-slate-300 font-medium truncate">{course.title}</p>
                                                                        <p className="text-xs text-slate-400">{course.hours}h course</p>
                                                                    </div>
                                                                    <span className="material-symbols-outlined text-slate-400 text-sm shrink-0">open_in_new</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!isExpanded && (
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">expand_more</span>
                                                Click to view {phase.skills.reduce((sum, s) => sum + s.courses.length, 0)} recommended courses
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Master Certifications */}
                    {data.certifications.length > 0 && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
                                <div>
                                    <h3 className="text-xl font-black">Master Certifications for {data.target_role}</h3>
                                    <p className="text-xs text-slate-400">Industry-recognized credentials to validate your expertise</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {data.certifications.map((cert, idx) => (
                                    <a
                                        key={idx}
                                        href={cert.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-primary hover:bg-slate-700/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-400 text-xl">verified</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase">{cert.provider}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{cert.name}</p>
                                        <span className="text-xs text-primary font-medium flex items-center gap-1 mt-auto">
                                            Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Next Stage CTA */}
                    <div className="flex justify-end pt-4 pb-10 relative z-10 mt-4">
                        <Link href="/simulation" className="flex items-center gap-2 px-8 py-4 bg-violet-600 text-white font-bold text-lg rounded-xl hover:bg-violet-700 hover:-translate-y-1 transition-all shadow-lg shadow-violet-600/30">
                            Start Career Simulation <span className="material-symbols-outlined">science</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

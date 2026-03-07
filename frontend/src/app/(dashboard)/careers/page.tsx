"use client";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";
import { useEffect, useState } from "react";

interface Career {
    rank: number;
    title: string;
    match: number;
    salary: string;
    icon: string;
    color: string;
    matched_skills: string[];
    missing_skills: string[];
    total_required: number;
    total_matched: number;
}

export default function CareersPage() {
    const [careers, setCareers] = useState<Career[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    useEffect(() => {
        const userId = localStorage.getItem("markhub_user_id") || "2";
        // Restore previously selected role
        const saved = localStorage.getItem("markhub_selected_role");
        if (saved) setSelectedRole(saved);

        fetch(`http://localhost:8000/api/careers/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setCareers(data.careers);
                    // Default to #1 if nothing saved
                    if (!saved && data.careers.length > 0) {
                        setSelectedRole(data.careers[0].title);
                        localStorage.setItem("markhub_selected_role", data.careers[0].title);
                    }
                }
            })
            .catch(err => console.error("Failed to fetch careers:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleSelect = (title: string) => {
        setSelectedRole(title);
        localStorage.setItem("markhub_selected_role", title);
    };

    if (loading) {
        return (
            <>
                <TopHeader title="Career Path Discovery (Stage 2)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        <p className="text-slate-500 font-semibold">Computing your career matches...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <TopHeader title="Career Path Discovery (Stage 2)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Your Top Career Paths</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Based on your skills, interests, and market demand — select a career to analyze.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {careers.map((career) => {
                            const isSelected = selectedRole === career.title;
                            return (
                                <div
                                    key={career.title}
                                    onClick={() => handleSelect(career.title)}
                                    className={`rounded-xl border-2 p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group ${isSelected
                                            ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-primary/10"
                                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${career.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                                            <span className="material-symbols-outlined text-3xl">{career.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">#{career.rank}</span>
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{career.title}</h3>
                                                {isSelected && (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span> Selected
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mb-3">Salary Range: {career.salary}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {career.matched_skills.map((skill) => (
                                                    <span key={skill} className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-xs font-medium text-emerald-700 dark:text-emerald-400">{skill}</span>
                                                ))}
                                                {career.missing_skills.map((skill) => (
                                                    <span key={skill} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-400 line-through">{skill}</span>
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
                            );
                        })}
                    </div>

                    {selectedRole && (
                        <div className="flex justify-end pt-4 pb-10">
                            <Link href="/gaps" className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-primary/30">
                                Analyze Skill Gaps for {selectedRole} <span className="material-symbols-outlined">track_changes</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

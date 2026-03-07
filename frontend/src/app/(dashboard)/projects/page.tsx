"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

interface Project {
    title: string;
    difficulty: string;
    tags: string[];
    description: string;
    github_url: string;
}

interface ProjectsData {
    target_role: string;
    projects: Project[];
}

export default function ProjectsPage() {
    const [data, setData] = useState<ProjectsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem("markhub_user_id") || "2";
        const selectedRole = localStorage.getItem("markhub_selected_role");
        const roleParam = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : "";
        fetch(`http://localhost:8000/api/projects/${userId}${roleParam}`)
            .then(res => res.json())
            .then(result => {
                if (result.status === "success") {
                    setData(result);
                }
            })
            .catch(err => console.error("Failed to fetch projects:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <TopHeader title="Project Builder (Stage 6)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        <p className="text-slate-500 font-semibold">Loading project recommendations...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!data || !data.projects || data.projects.length === 0) {
        return (
            <>
                <TopHeader title="Project Builder (Stage 6)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-slate-500">No projects available. Complete the Career Calibration first.</p>
                </div>
            </>
        );
    }

    const difficultyColor = (d: string) => {
        if (d === "Beginner") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        if (d === "Intermediate") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    };

    const difficultyIcon = (d: string) => {
        if (d === "Beginner") return "signal_cellular_alt_1_bar";
        if (d === "Intermediate") return "signal_cellular_alt_2_bar";
        return "signal_cellular_alt";
    };

    return (
        <>
            <TopHeader title="Project Builder (Stage 6)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Build Real Projects
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">
                            Portfolio projects recommended for <strong>{data.target_role}</strong>. Build these to demonstrate real-world skills to employers.
                        </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                            <p className="text-2xl font-black text-primary">{data.projects.length}</p>
                            <p className="text-xs text-slate-500 font-medium">Recommended</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                            <p className="text-2xl font-black text-emerald-500">{data.projects.filter(p => p.difficulty === "Beginner").length}</p>
                            <p className="text-xs text-slate-500 font-medium">Beginner</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                            <p className="text-2xl font-black text-red-500">{data.projects.filter(p => p.difficulty === "Advanced").length}</p>
                            <p className="text-xs text-slate-500 font-medium">Advanced</p>
                        </div>
                    </div>

                    {/* Project Cards */}
                    <div className="flex flex-col gap-4">
                        {data.projects.map((project, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{project.title}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${difficultyColor(project.difficulty)}`}>
                                                {project.difficulty}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500">{data.target_role} Track</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`material-symbols-outlined text-lg ${project.difficulty === "Beginner" ? "text-emerald-500" : project.difficulty === "Intermediate" ? "text-amber-500" : "text-red-500"}`}>
                                            {difficultyIcon(project.difficulty)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{project.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1.5">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">{tag}</span>
                                        ))}
                                    </div>
                                    <a
                                        href={project.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-4 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        View Examples
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 pb-10">
                        <Link href="/readiness" className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-primary/30">
                            Check Job Readiness Score <span className="material-symbols-outlined">speed</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

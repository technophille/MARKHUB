"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

interface Exercise {
    title: string;
    company: string;
    url: string;
    duration: string;
    difficulty: string;
    icon: string;
    color: string;
    description: string;
}

interface SimData {
    target_role: string;
    exercises: Exercise[];
}

export default function SimulationPage() {
    const [data, setData] = useState<SimData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem("markhub_user_id") || "2";
        const selectedRole = localStorage.getItem("markhub_selected_role");
        const roleParam = selectedRole ? `?role=${encodeURIComponent(selectedRole)}` : "";
        fetch(`http://localhost:8000/api/simulation/${userId}${roleParam}`)
            .then(res => res.json())
            .then(result => {
                if (result.status === "success") {
                    setData(result);
                }
            })
            .catch(err => console.error("Failed to fetch simulations:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <TopHeader title="Career Simulation (Stage 5)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        <p className="text-slate-500 font-semibold">Loading virtual experiences...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!data || !data.exercises || data.exercises.length === 0) {
        return (
            <>
                <TopHeader title="Career Simulation (Stage 5)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-slate-500">No simulations available. Complete the Career Calibration first.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <TopHeader title="Career Simulation (Stage 5)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Experience The Job <span className="text-primary">Before</span> You Get It
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">
                            Real-world virtual experiences from <strong>Forage</strong>, curated for <strong>{data.target_role}</strong>. Complete these to build resume-worthy experience.
                        </p>
                    </div>

                    {/* Forage Badge */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white flex items-center gap-4 shadow-lg">
                        <span className="material-symbols-outlined text-4xl">workspace_premium</span>
                        <div>
                            <h3 className="font-bold text-lg">Powered by Forage Virtual Experiences</h3>
                            <p className="text-sm opacity-90">Industry-designed simulations from top companies. Earn certificates upon completion.</p>
                        </div>
                    </div>

                    {/* Exercise Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {data.exercises.map((exercise, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className={`bg-gradient-to-r ${exercise.color} p-5 text-white`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">{exercise.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-base leading-snug">{exercise.title}</h4>
                                            <p className="text-xs opacity-80">by {exercise.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">{exercise.difficulty}</span>
                                        <span className="text-[10px] opacity-80">⏱ {exercise.duration}</span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col gap-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{exercise.description}</p>
                                    <a
                                        href={exercise.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                                        Start on Forage →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info callout */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl mt-0.5">info</span>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">Why Forage?</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                Forage virtual work experience programs are designed by top employers like JPMorgan, BCG, and Mastercard.
                                They&apos;re free, self-paced, and provide real-world tasks that mirror actual job responsibilities.
                                Completing them earns you verifiable certificates to strengthen your resume.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 pb-10">
                        <Link href="/projects" className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-primary/30">
                            Build Real Projects <span className="material-symbols-outlined">code</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

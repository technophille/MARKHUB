"use client";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";
import { useEffect, useState } from "react";

interface DNAData {
    cognitive_profile: { label: string; description: string; score: number };
    career_trajectory: { role: string; description: string };
    readiness: { percentage: number; label: string; matched_skills: number; total_required: number };
    skills_matrix: string[];
    big5: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number };
    summary: string;
}

export default function DiscoveryPage() {
    const [dna, setDna] = useState<DNAData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem("markhub_user_id") || "2";
        fetch(`http://localhost:8000/api/profile/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setDna(data.dna);
                }
            })
            .catch(err => console.error("Failed to fetch DNA:", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <>
                <TopHeader title="Self-Discovery Dashboard (Stage 2/3)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        <p className="text-slate-500 font-semibold">Loading your Career DNA...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!dna) {
        return (
            <>
                <TopHeader title="Self-Discovery Dashboard (Stage 2/3)" />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">error_outline</span>
                        <p className="text-slate-500">No profile data found. Please complete the Career Calibration first.</p>
                        <Link href="/onboarding/step2" className="mt-4 inline-block text-primary font-bold hover:underline">Go to Calibration →</Link>
                    </div>
                </div>
            </>
        );
    }

    const big5Items = [
        { trait: "Openness", score: dna.big5.openness, color: "bg-blue-500" },
        { trait: "Conscientiousness", score: dna.big5.conscientiousness, color: "bg-emerald-500" },
        { trait: "Extraversion", score: dna.big5.extraversion, color: "bg-amber-500" },
        { trait: "Agreeableness", score: dna.big5.agreeableness, color: "bg-purple-500" },
        { trait: "Neuroticism", score: dna.big5.neuroticism, color: "bg-red-500" },
    ];

    return (
        <>
            <TopHeader title="Self-Discovery Dashboard (Stage 2/3)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Your Career DNA Report</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">AI-generated analysis of your professional identity and cognitive strengths.</p>
                    </div>

                    {/* DNA Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">psychology</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Cognitive Profile</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{dna.cognitive_profile.label}</h3>
                            <p className="text-sm text-slate-500">{dna.cognitive_profile.description}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center gap-2 text-emerald-500">
                                <span className="material-symbols-outlined">trending_up</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Career Trajectory</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{dna.career_trajectory.role}</h3>
                            <p className="text-sm text-slate-500">{dna.career_trajectory.description}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center gap-2 text-amber-500">
                                <span className="material-symbols-outlined">speed</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Readiness Score</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{dna.readiness.percentage}% Match</h3>
                            <p className="text-sm text-slate-500">{dna.readiness.label}</p>
                        </div>
                    </div>

                    {/* Skills Matrix */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Detected Skills Matrix</h3>
                        <div className="flex flex-wrap gap-2">
                            {dna.skills_matrix.length > 0 ? dna.skills_matrix.map((skill) => (
                                <span key={skill} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase">{skill}</span>
                            )) : (
                                <p className="text-sm text-slate-400">No skills detected yet. Upload your resume to get started.</p>
                            )}
                        </div>
                    </div>

                    {/* Big 5 Personality Snapshot */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Big-5 Personality Snapshot</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {big5Items.map((item) => (
                                <div key={item.trait} className="flex flex-col gap-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">{item.trait}</span>
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                                        <div className={`${item.color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${item.score}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DNA Profile Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Markhub Intelligence Summary</p>
                                <h3 className="text-xl font-black">Career DNA Profile</h3>
                            </div>
                            <span className="material-symbols-outlined text-primary text-3xl">dna</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed mb-6">
                            {dna.summary}
                        </p>
                        <div className="mt-auto p-4 bg-slate-800/50 border-t border-slate-700 rounded-b-xl -mx-6 -mb-6 px-6 pb-6">
                            <button className="w-full py-2 text-sm text-primary font-medium hover:underline flex justify-center items-center gap-1">
                                View Full DNA Profile <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Next Stage CTA */}
                    <div className="flex justify-end pt-4 pb-10">
                        <Link href="/careers" className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg shadow-primary/30">
                            Discover Career Paths <span className="material-symbols-outlined">explore</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

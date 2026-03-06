"use client";
import { useState } from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

const simulations = [
    {
        id: "ai-engineer",
        title: "AI Engineer Simulation",
        icon: "smart_toy",
        color: "from-violet-500 to-purple-600",
        difficulty: "Intermediate",
        duration: "45 min",
        task: "Predict Customer Churn",
        description: "You are given a dataset of 10,000 customers with features like tenure, monthly charges, and contract type. Build and evaluate a model to predict customer churn.",
        steps: [
            { name: "Load & Explore Dataset", status: "complete" },
            { name: "Clean & Preprocess Data", status: "complete" },
            { name: "Feature Engineering", status: "active" },
            { name: "Train ML Model", status: "locked" },
            { name: "Evaluate Accuracy", status: "locked" },
            { name: "Submit Results", status: "locked" },
        ],
    },
    {
        id: "product-manager",
        title: "Product Manager Simulation",
        icon: "inventory_2",
        color: "from-amber-500 to-orange-500",
        difficulty: "Beginner",
        duration: "30 min",
        task: "Feature Proposal for Declining Engagement",
        description: "App engagement dropped 15% this quarter. Analyze user feedback data, identify top pain points, and write a feature proposal to reverse the trend.",
        steps: [
            { name: "Analyze Feedback Data", status: "locked" },
            { name: "Identify Pain Points", status: "locked" },
            { name: "Write Feature Proposal", status: "locked" },
            { name: "Present to Stakeholders", status: "locked" },
        ],
    },
    {
        id: "developer",
        title: "Full Stack Developer Simulation",
        icon: "code",
        color: "from-emerald-500 to-teal-500",
        difficulty: "Intermediate",
        duration: "60 min",
        task: "Fix & Extend Login API",
        description: "The login API has a critical bug causing 500 errors. Debug the issue, fix it, then add JWT refresh token support.",
        steps: [
            { name: "Read Bug Report", status: "locked" },
            { name: "Reproduce Error", status: "locked" },
            { name: "Debug Root Cause", status: "locked" },
            { name: "Apply Fix & Test", status: "locked" },
            { name: "Add Refresh Token", status: "locked" },
        ],
    },
];

export default function SimulationPage() {
    const [activeSimIndex, setActiveSimIndex] = useState(0);
    const activeSim = simulations[activeSimIndex];

    return (
        <>
            <TopHeader title="Career Simulation (Stage 5)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Experience The Job <span className="text-primary">Before</span> You Get It
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Real-world simulations that test your skills in actual job scenarios. Complete them to boost your readiness score.</p>
                    </div>

                    {/* Simulation Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {simulations.map((sim, i) => (
                            <button
                                key={sim.id}
                                onClick={() => setActiveSimIndex(i)}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${i === activeSimIndex
                                        ? "border-primary bg-primary/5 shadow-lg"
                                        : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
                                    }`}
                            >
                                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${sim.color} flex items-center justify-center text-white mb-3`}>
                                    <span className="material-symbols-outlined text-xl">{sim.icon}</span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-800 dark:text-white">{sim.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{sim.difficulty}</span>
                                    <span className="text-[10px] text-slate-400">{sim.duration}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Active Simulation Detail */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className={`bg-gradient-to-r ${activeSim.color} p-6 text-white`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-3xl">{activeSim.icon}</span>
                                <div>
                                    <h3 className="text-xl font-black">{activeSim.title}</h3>
                                    <p className="text-sm opacity-80">Task: {activeSim.task}</p>
                                </div>
                            </div>
                            <p className="text-sm opacity-90 leading-relaxed mt-3">{activeSim.description}</p>
                        </div>

                        <div className="p-6">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Simulation Steps</h4>
                            <div className="space-y-3">
                                {activeSim.steps.map((step, i) => (
                                    <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${step.status === "complete" ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20" :
                                            step.status === "active" ? "bg-primary/5 border-2 border-primary" :
                                                "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 opacity-60"
                                        }`}>
                                        {step.status === "complete" ? (
                                            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                        ) : step.status === "active" ? (
                                            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-300">lock</span>
                                        )}
                                        <span className={`text-sm font-semibold ${step.status === "active" ? "text-primary" : "text-slate-700 dark:text-slate-300"}`}>{step.name}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="mt-6 w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">play_arrow</span>
                                {activeSimIndex === 0 ? "Continue Simulation" : "Start Simulation"}
                            </button>
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

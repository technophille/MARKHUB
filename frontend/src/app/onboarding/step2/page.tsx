"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const ROLE_SKILLS: Record<string, string[]> = {
    "AI Engineer": ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP", "Computer Vision", "Statistics", "NumPy", "Pandas", "Scikit-learn", "MLOps", "Docker", "SQL", "Git", "Linux"],
    "Data Scientist": ["Python", "R", "SQL", "Statistics", "Pandas", "NumPy", "Scikit-learn", "Matplotlib", "Seaborn", "Tableau", "Power BI", "Machine Learning", "A/B Testing", "Excel", "Git"],
    "Cloud Architect": ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Docker", "Linux", "Networking", "CI/CD", "Python", "Serverless", "Monitoring", "Security", "Cost Optimization", "IaC"],
    "Product Manager": ["Product Strategy", "User Research", "A/B Testing", "SQL", "Jira", "Roadmapping", "Wireframing", "Data Analysis", "Stakeholder Management", "Agile", "Scrum", "Figma", "Market Analysis"],
    "Full Stack Engineer": ["JavaScript", "TypeScript", "React", "Node.js", "Next.js", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL", "Docker", "Git", "CSS", "HTML", "AWS", "CI/CD"],
    "DevOps Engineer": ["Docker", "Kubernetes", "Terraform", "AWS", "Linux", "CI/CD", "Jenkins", "GitHub Actions", "Prometheus", "Grafana", "Ansible", "Python", "Bash", "Networking", "Git"],
    "ML Engineer": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "MLOps", "Docker", "Kubernetes", "AWS SageMaker", "Feature Engineering", "Model Serving", "SQL", "Git", "Linux", "FastAPI", "Airflow"],
    "Cybersecurity Analyst": ["Networking", "Linux", "Python", "Wireshark", "Nmap", "Penetration Testing", "SIEM", "Firewalls", "Cryptography", "Incident Response", "OWASP", "Bash", "Security Auditing", "Risk Assessment"],
    "Backend Developer": ["Python", "Java", "Node.js", "PostgreSQL", "MongoDB", "REST APIs", "GraphQL", "Docker", "Redis", "Message Queues", "Microservices", "Git", "Linux", "CI/CD", "AWS"],
    "Blockchain Developer": ["Solidity", "Ethereum", "Web3.js", "Smart Contracts", "JavaScript", "TypeScript", "Hardhat", "IPFS", "Cryptography", "DeFi", "NFTs", "Rust", "Go", "Git", "React"],
};

export default function OnboardingStep2() {
    const router = useRouter();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [learningHours, setLearningHours] = useState(15);
    const [softSkills, setSoftSkills] = useState({
        communication: 3,
        leadership: 3,
        teamwork: 3,
        problem_solving: 3,
        adaptability: 3,
        time_management: 3,
        presentation: 3,
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (allowed.includes(file.type) && file.size <= 10 * 1024 * 1024) {
            setUploadedFile(file);
        } else {
            alert("Please upload a PDF or DOCX file under 10MB.");
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const onDragLeave = useCallback(() => setIsDragging(false), []);

    const toggleRole = (role: string) => {
        setSelectedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
    };

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
    };

    const handleSoftSkillChange = (skill: keyof typeof softSkills, rating: number) => {
        setSoftSkills(prev => ({ ...prev, [skill]: rating }));
    };

    // Get suggested skills based on selected roles (deduplicated)
    const suggestedSkills = Array.from(new Set(selectedRoles.flatMap((role) => ROLE_SKILLS[role] || [])));

    const handleSubmit = async () => {
        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            if (uploadedFile) formData.append("resume", uploadedFile);
            formData.append("target_roles", JSON.stringify(selectedRoles));
            formData.append("known_skills", JSON.stringify(selectedSkills));
            formData.append("learning_hours", learningHours.toString());

            // Add soft skills
            formData.append("soft_communication", softSkills.communication.toString());
            formData.append("soft_leadership", softSkills.leadership.toString());
            formData.append("soft_teamwork", softSkills.teamwork.toString());
            formData.append("soft_problem_solving", softSkills.problem_solving.toString());
            formData.append("soft_adaptability", softSkills.adaptability.toString());
            formData.append("soft_time_management", softSkills.time_management.toString());
            formData.append("soft_presentation", softSkills.presentation.toString());

            // Link profile to auth user
            const authUserId = localStorage.getItem("markhub_user_id") || "0";
            formData.append("auth_user_id", authUserId);

            const response = await fetch("http://localhost:8000/api/calibration", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Success:", data);

                // CRITICAL: Update localStorage with the profile ID returned by backend
                // This ensures dashboard pages (discovery, careers, gaps, roadmap)
                // fetch data for the correct user_profiles row
                if (data.user_id) {
                    localStorage.setItem("markhub_user_id", data.user_id.toString());
                }

                // Save dynamic data for Step 3 loading sequence
                if (data.profile && data.profile.extracted_skills) {
                    localStorage.setItem("extractedInsightsCount", data.profile.extracted_skills.length.toString());
                } else {
                    localStorage.setItem("extractedInsightsCount", "12"); // fallback
                }

                router.push("/onboarding/step3");
            } else {
                console.error("Submission failed");
                // Fallback for demo if backend is not reachable
                localStorage.setItem("extractedInsightsCount", "12");
                setTimeout(() => router.push("/onboarding/step3"), 1000);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setTimeout(() => router.push("/onboarding/step3"), 1000);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 md:px-10 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Markhub AI</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">account_circle</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full px-6 md:px-10 lg:px-16 py-10 pb-32">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-3">Career Calibration Form</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">Let&apos;s build your personalized Markhub OS profile. Complete the sections below to get started.</p>
                </div>

                <div className="flex flex-col gap-12 bg-white dark:bg-slate-900/50 p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">

                    {/* 1 — Resume Upload */}
                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</span>
                            <h3 className="text-xl font-bold">Upload Resume / CV</h3>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }} />
                        {!uploadedFile ? (
                            <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={() => fileInputRef.current?.click()}
                                className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer px-6 py-14 transition-all ${isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-primary/50 hover:bg-primary/5"}`}>
                                <span className={`material-symbols-outlined text-5xl mb-4 transition-colors ${isDragging ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}>cloud_upload</span>
                                <p className="text-slate-900 dark:text-slate-200 font-semibold mb-1">{isDragging ? "Drop your resume here" : "Drag and drop your resume"}</p>
                                <p className="text-slate-500 text-sm mb-6">PDF, DOCX up to 10MB</p>
                                <span className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-2 text-sm font-bold shadow-sm hover:shadow-md transition-all">Browse Files</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 p-5 rounded-xl border-2 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10">
                                <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-emerald-600 text-2xl">description</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{uploadedFile.name}</p>
                                    <p className="text-xs text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type === "application/pdf" ? "PDF" : "DOCX"}</p>
                                </div>
                                <span className="material-symbols-outlined text-emerald-500 text-xl mr-2">check_circle</span>
                                <button onClick={() => setUploadedFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* 2 — Target Role */}
                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</span>
                            <h3 className="text-xl font-bold">Target Role</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Select one or more roles you&apos;re targeting <span className="text-xs text-slate-400">(skills will be suggested based on your pick)</span></label>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(ROLE_SKILLS).map((role) => {
                                const selected = selectedRoles.includes(role);
                                return (
                                    <button key={role} onClick={() => toggleRole(role)}
                                        className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${selected ? "bg-primary text-white border border-primary shadow-lg shadow-primary/20" : "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-primary/50"}`}>
                                        {selected && <span className="material-symbols-outlined text-sm mr-1 align-middle">check</span>}
                                        {role}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* 3 — Smart Skill Selection */}
                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
                            <h3 className="text-xl font-bold">Skills You Know</h3>
                        </div>

                        {selectedRoles.length === 0 ? (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                                <span className="material-symbols-outlined text-amber-500">info</span>
                                <p className="text-sm text-amber-700 dark:text-amber-400">Select a target role above to see suggested skills for that career path.</p>
                            </div>
                        ) : (
                            <>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    Tap skills you already know — <span className="text-primary font-bold">{selectedSkills.length}</span> selected
                                </label>
                                <p className="text-xs text-slate-400 mb-4">These skills are curated for: <strong>{selectedRoles.join(", ")}</strong></p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedSkills.map((skill) => {
                                        const picked = selectedSkills.includes(skill);
                                        return (
                                            <button key={skill} onClick={() => toggleSkill(skill)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${picked ? "bg-emerald-500 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary"}`}>
                                                {picked && <span className="material-symbols-outlined text-xs mr-1 align-middle">check</span>}
                                                {skill}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedSkills.length > 0 && (
                                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            You know <strong className="text-primary">{selectedSkills.length}</strong> of <strong>{suggestedSkills.length}</strong> recommended skills ({Math.round((selectedSkills.length / suggestedSkills.length) * 100)}% coverage)
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {/* 4 — Target Salary */}
                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">4</span>
                            <h3 className="text-xl font-bold">Target Salary</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">What salary are you targeting? (LPA)</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary dark:text-slate-200 p-3" placeholder="e.g. 15" type="number" />
                    </section>

                    {/* 5 — GitHub */}
                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">5</span>
                            <h3 className="text-xl font-bold">GitHub / Portfolio</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Link your GitHub or portfolio (optional)</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm">https://</span>
                            <input className="flex-1 rounded-r-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary dark:text-slate-200 p-3" placeholder="github.com/username" type="text" />
                        </div>
                    </section>

                    {/* 6 — Learning Bandwidth */}
                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">6</span>
                            <h3 className="text-xl font-bold">Learning Bandwidth</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">How many hours per week can you dedicate to upskilling?</label>

                        <div className="flex items-center justify-center gap-8 py-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setLearningHours(Math.max(0, learningHours - 1))}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary transition-all text-slate-600 dark:text-slate-400"
                            >
                                <span className="material-symbols-outlined">remove</span>
                            </button>

                            <div className="text-center">
                                <span className="text-5xl font-black text-primary">{learningHours}</span>
                                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Hours / Week</p>
                            </div>

                            <button
                                onClick={() => setLearningHours(Math.min(100, learningHours + 1))}
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary transition-all text-slate-600 dark:text-slate-400"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    </section>

                    {/* 7 — Soft Skills Assessment */}
                    <section className="pb-4">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">7</span>
                            <h3 className="text-xl font-bold">Soft Skills Self-Assessment</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Rate yourself on a scale of 1-5 (1: Beginner, 5: Expert)</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {(Object.entries(softSkills) as [keyof typeof softSkills, number][]).map(([skill, rating]) => (
                                <div key={skill} className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                                            {skill.replace("_", " ")}
                                        </label>
                                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Level {rating}</span>
                                    </div>
                                    <div className="flex justify-between gap-1">
                                        {[1, 2, 3, 4, 5].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => handleSoftSkillChange(skill, val)}
                                                className={`flex-1 h-2.5 rounded-full transition-all ${val <= rating
                                                    ? "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                                                    : "bg-slate-200 dark:bg-slate-800"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Sticky Footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 md:px-10 py-4">
                <div className="flex justify-center">
                    <button onClick={handleSubmit} disabled={isAnalyzing}
                        className="group w-full max-w-2xl flex items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 text-lg font-black text-white shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                        {isAnalyzing ? (
                            <>
                                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                <span>Analyzing your profile...</span>
                            </>
                        ) : (
                            <>
                                <span>Analyze &amp; Generate My Career OS</span>
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">rocket_launch</span>
                            </>
                        )}
                    </button>
                </div>
            </footer>
        </div>
    );
}

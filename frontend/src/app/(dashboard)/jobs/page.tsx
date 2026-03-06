import { TopHeader } from "@/components/layout/TopHeader";

const jobs = [
    {
        title: "AI Engineer Intern",
        company: "Flipkart",
        location: "Bangalore (Remote)",
        salary: "₹40K/month",
        match: 92,
        type: "Internship",
        tags: ["Python", "TensorFlow", "Deep Learning"],
        posted: "2 days ago",
        logo: "🛒",
    },
    {
        title: "Junior Data Scientist",
        company: "Razorpay",
        location: "Bangalore (Hybrid)",
        salary: "12–15 LPA",
        match: 85,
        type: "Full Time",
        tags: ["Python", "SQL", "Machine Learning"],
        posted: "1 week ago",
        logo: "💳",
    },
    {
        title: "ML Intern",
        company: "PhonePe",
        location: "Pune (On-site)",
        salary: "₹35K/month",
        match: 80,
        type: "Internship",
        tags: ["Python", "Scikit-learn", "Pandas"],
        posted: "3 days ago",
        logo: "📱",
    },
    {
        title: "AI/ML Engineer",
        company: "Swiggy",
        location: "Bangalore (Hybrid)",
        salary: "15–20 LPA",
        match: 76,
        type: "Full Time",
        tags: ["Python", "PyTorch", "MLOps", "Docker"],
        posted: "5 days ago",
        logo: "🍔",
    },
    {
        title: "Data Analyst (Freelance)",
        company: "Upwork",
        location: "Remote",
        salary: "$25–40/hr",
        match: 72,
        type: "Freelance",
        tags: ["Python", "SQL", "Tableau", "Excel"],
        posted: "1 day ago",
        logo: "🌐",
    },
];

export default function JobsPage() {
    return (
        <>
            <TopHeader title="Job Matching (Stage 8)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Jobs Matched For You
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">
                            Your readiness score is <strong className="text-emerald-500">72%</strong> — these roles match your verified skills, projects, and simulation results.
                        </p>
                    </div>

                    {/* Unlock Banner */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 text-white flex items-center gap-4">
                        <span className="material-symbols-outlined text-4xl">lock_open</span>
                        <div>
                            <h3 className="font-bold text-lg">Job Matching Unlocked!</h3>
                            <p className="text-sm opacity-90">You passed the 70% readiness threshold. Here are your top matches.</p>
                        </div>
                    </div>

                    {/* Job Cards */}
                    <div className="flex flex-col gap-4">
                        {jobs.map((job) => (
                            <div key={job.title + job.company} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all group">
                                <div className="flex items-start gap-5">
                                    <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shrink-0">
                                        {job.logo}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{job.title}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${job.type === "Internship" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                    job.type === "Freelance" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                                                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                }`}>{job.type}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                                            <span>{job.company}</span>
                                            <span>•</span>
                                            <span>{job.location}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{job.salary}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-wrap gap-1.5">
                                                {job.tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">{tag}</span>
                                                ))}
                                            </div>
                                            <span className="text-xs text-slate-400">{job.posted}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        <div className="relative h-14 w-14">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle className="text-slate-200 dark:text-slate-800" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
                                                <circle className="text-emerald-500" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${job.match} ${100 - job.match}`} strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-black text-emerald-500">{job.match}%</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500">Match</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors">Save</button>
                                    <button className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition">Apply Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

import Link from "next/link";
import { TopHeader } from "@/components/layout/TopHeader";

const projects = [
    {
        title: "Movie Recommendation System",
        track: "AI/ML",
        difficulty: "Intermediate",
        status: "Complete",
        completion: 100,
        quality: "A",
        tags: ["Python", "Scikit-learn", "Pandas", "Cosine Similarity"],
        desc: "Built a content-based recommendation engine using TF-IDF vectorization and cosine similarity on 5000+ movies.",
    },
    {
        title: "Stock Price Predictor",
        track: "AI/ML",
        difficulty: "Advanced",
        status: "In Progress",
        completion: 65,
        quality: "B+",
        tags: ["Python", "TensorFlow", "LSTM", "yfinance"],
        desc: "Predicting stock prices using LSTM neural networks with historical data from Yahoo Finance.",
    },
    {
        title: "AI Chatbot with RAG",
        track: "AI/ML",
        difficulty: "Advanced",
        status: "Not Started",
        completion: 0,
        quality: "—",
        tags: ["LangChain", "ChromaDB", "OpenAI", "FastAPI"],
        desc: "Build a retrieval-augmented chatbot that answers questions from uploaded documents.",
    },
    {
        title: "Full Stack Blog Platform",
        track: "Web Dev",
        difficulty: "Intermediate",
        status: "Complete",
        completion: 100,
        quality: "A-",
        tags: ["Next.js", "PostgreSQL", "Prisma", "Tailwind"],
        desc: "A production-ready blog with authentication, markdown editor, categories, and SEO optimization.",
    },
];

export default function ProjectsPage() {
    return (
        <>
            <TopHeader title="Project Builder (Stage 6)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Build Real Projects</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Hands-on projects tracked by Markhub. Code quality, completion, and complexity are scored automatically.</p>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                            <p className="text-2xl font-black text-emerald-500">2</p>
                            <p className="text-xs text-slate-500 font-medium">Completed</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                            <p className="text-2xl font-black text-primary">1</p>
                            <p className="text-xs text-slate-500 font-medium">In Progress</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                            <p className="text-2xl font-black text-slate-400">1</p>
                            <p className="text-xs text-slate-500 font-medium">Not Started</p>
                        </div>
                    </div>

                    {/* Project Cards */}
                    <div className="flex flex-col gap-4">
                        {projects.map((project) => (
                            <div key={project.title} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{project.title}</h3>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${project.status === "Complete" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                    project.status === "In Progress" ? "bg-primary/10 text-primary" :
                                                        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                                                }`}>{project.status}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">{project.track} • {project.difficulty}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500">Quality</p>
                                            <p className="text-lg font-black text-primary">{project.quality}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{project.desc}</p>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-3">
                                    <div className={`h-1.5 rounded-full ${project.completion === 100 ? "bg-emerald-500" : project.completion > 0 ? "bg-primary" : "bg-slate-300"}`} style={{ width: `${project.completion}%` }}></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1.5">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">{tag}</span>
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">{project.completion}%</span>
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

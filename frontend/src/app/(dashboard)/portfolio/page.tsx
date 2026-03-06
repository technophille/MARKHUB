import { TopHeader } from "@/components/layout/TopHeader";

export default function PortfolioPage() {
    return (
        <>
            <TopHeader title="Verified Portfolio (Stage 6)" />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Markhub Verified Portfolio</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Auto-assembled from your GitHub, roadmap progress, and AI-generated case studies.</p>
                    </div>

                    {/* Portfolio Header Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center gap-8">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full h-24 w-24 border-4 border-primary shadow-xl shrink-0" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDV4MnVFxCRCZ8TLKX3dWQSrD-mF4C7dBzq3-00G72rkMPvTBqu8GYpoyt1qzU8Clazpl9usFy9WZMxWa3B4O-Wezi78apuhQajoCYlnS-Y3c4oN4GqnTfImHNOvoeaN1p3DqzUdrgduSz7GIjKUpzPU2GQegKckJarzO6Aqm91A8m3WHrhxIRDUxNBEZ7k3BCoj6NQfRZQ-rjy0PV9F4DaBmzyw_dqAZzA0Lfb0F1KzpmIehS18YA584_4NAf2XPNV4OWk5-0iu-Y")' }}></div>
                        <div className="flex flex-col gap-2 text-center md:text-left">
                            <h2 className="text-2xl font-black">Nikhil K Menon</h2>
                            <p className="text-sm text-slate-300">Aspiring Cloud Architect • Python & AWS</p>
                            <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                                <span className="flex items-center gap-1 text-xs text-emerald-400"><span className="material-symbols-outlined text-sm">verified</span> Markhub Verified</span>
                                <span className="flex items-center gap-1 text-xs text-slate-400"><span className="material-symbols-outlined text-sm">link</span> github.com/technophille</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Projects Completed", value: "4", icon: "code", color: "text-primary" },
                            { label: "Skills Verified", value: "8", icon: "verified", color: "text-emerald-500" },
                            { label: "Learning Hours", value: "120+", icon: "schedule", color: "text-amber-500" },
                            { label: "Case Studies", value: "2", icon: "description", color: "text-purple-500" },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center gap-2 shadow-sm">
                                <span className={`material-symbols-outlined ${stat.color} text-2xl`}>{stat.icon}</span>
                                <span className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</span>
                                <span className="text-xs text-slate-500 text-center">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Projects */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Featured Projects</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                {
                                    name: "Cloud-Native API Gateway",
                                    desc: "Designed and deployed a scalable API gateway using Docker, Nginx, and AWS ECS with auto-scaling.",
                                    tags: ["Docker", "AWS", "Nginx"],
                                    status: "Verified",
                                },
                                {
                                    name: "Real-Time Log Aggregator",
                                    desc: "Built a log pipeline using Python, Kafka, and Elasticsearch for monitoring microservices.",
                                    tags: ["Python", "Kafka", "Elasticsearch"],
                                    status: "Verified",
                                },
                                {
                                    name: "Infrastructure as Code Lab",
                                    desc: "Provisioned multi-region AWS infrastructure using Terraform modules with CI/CD integration.",
                                    tags: ["Terraform", "AWS", "CI/CD"],
                                    status: "In Progress",
                                },
                                {
                                    name: "Portfolio Website",
                                    desc: "This auto-generated portfolio site built with Next.js and deployed to Vercel.",
                                    tags: ["Next.js", "React", "Vercel"],
                                    status: "Live",
                                },
                            ].map((project) => (
                                <div key={project.name} className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{project.name}</h4>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${project.status === "Verified" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : project.status === "Live" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">{project.desc}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Case Study */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI-Generated Case Study</h3>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">How I Designed a Multi-Region Failover Architecture</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                In this project, I tackled the challenge of ensuring 99.99% uptime for a fintech application. By implementing
                                Route 53 health checks, cross-region RDS replication, and ECS service auto-scaling, I reduced mean time to
                                recovery (MTTR) from 45 minutes to under 3 minutes. The architecture serves 50K concurrent users across
                                3 AWS regions...
                            </p>
                            <button className="mt-4 text-primary text-sm font-bold hover:underline flex items-center gap-1">
                                Read Full Case Study <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    {/* Floating Chat Widget */}
                    <div className="fixed bottom-6 right-6 z-50">
                        <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 hover:scale-105 transform transition-transform">
                            <span className="material-symbols-outlined">forum</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

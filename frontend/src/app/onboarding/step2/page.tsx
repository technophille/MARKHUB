import Link from "next/link";

export default function OnboardingStep2() {
    return (
        <div className="relative flex min-h-screen flex-col items-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Markhub AI</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors overflow-hidden">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">account_circle</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-3xl flex-1 px-6 py-12 pb-32">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-3">Career Calibration Form</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">Let's build your personalized Markhub OS profile. Complete the sections below to get started.</p>
                </div>

                <div className="flex flex-col gap-12 bg-white dark:bg-slate-900/50 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</span>
                            <h3 className="text-xl font-bold">Foundation</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-wider">Upload your latest Resume (PDF)</label>
                        <div className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-6 py-12 transition-all hover:border-primary/50 hover:bg-primary/5">
                            <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors mb-4">cloud_upload</span>
                            <p className="text-slate-900 dark:text-slate-200 font-semibold mb-1">Drag and drop your resume</p>
                            <p className="text-slate-500 text-sm mb-6">PDF, DOCX up to 10MB</p>
                            <button className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-2 text-sm font-bold shadow-sm hover:shadow-md transition-all">Browse Files</button>
                        </div>
                    </section>

                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</span>
                            <h3 className="text-xl font-bold">Discovery</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Describe the most complex problem you recently solved.</label>
                        <textarea className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary dark:text-slate-200 placeholder:text-slate-400" placeholder="I optimized a database query that reduced latency by 40%..." rows={4}></textarea>
                    </section>

                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
                            <h3 className="text-xl font-bold">Exploration</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Select your Target Roles</label>
                        <div className="flex flex-wrap gap-2">
                            <button className="px-4 py-2 rounded-full border border-primary bg-primary text-white text-sm font-medium transition-all">Cloud Architect</button>
                            <button className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm font-medium hover:border-primary/50 transition-all">Product Manager</button>
                            <button className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm font-medium hover:border-primary/50 transition-all">Data Scientist</button>
                            <button className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm font-medium hover:border-primary/50 transition-all">Full Stack Engineer</button>
                        </div>
                    </section>

                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">4</span>
                            <h3 className="text-xl font-bold">Skills</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Current Top Skills</label>
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <input className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary pr-12" placeholder="Add a skill (e.g., Python, AWS)" type="text" />
                                <button className="absolute right-2 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                                    <span className="material-symbols-outlined text-lg">add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase">
                                    Python <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase">
                                    AWS <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase">
                                    Kubernetes <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">5</span>
                            <h3 className="text-xl font-bold">Roadmap</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-8">Learning Bandwidth (Hours/Week)</label>
                        <div className="px-2">
                            <input className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" max="40" min="0" step="5" type="range" defaultValue="15" />
                            <div className="flex justify-between mt-4 text-sm font-bold text-slate-400">
                                <span>0 hrs</span>
                                <span className="text-primary bg-primary/10 px-3 py-1 rounded-full">15 hrs/week</span>
                                <span>40+ hrs</span>
                            </div>
                        </div>
                    </section>

                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">6</span>
                            <h3 className="text-xl font-bold">Projects</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">GitHub Profile or Portfolio Link</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm">
                                https://
                            </span>
                            <input className="flex-1 rounded-r-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary dark:text-slate-200" placeholder="github.com/username" type="text" />
                        </div>
                    </section>

                    <section className="border-b border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">7</span>
                            <h3 className="text-xl font-bold">Interviews</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Biggest Interview Weakness</label>
                        <select className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:border-primary focus:ring-primary dark:text-slate-200 py-3" defaultValue="">
                            <option disabled value="">Select an area</option>
                            <option value="system-design">System Design</option>
                            <option value="behavioral">Behavioral Questions</option>
                            <option value="coding">Data Structures & Algorithms</option>
                            <option value="salary">Salary Negotiation</option>
                            <option value="case-study">Case Studies</option>
                        </select>
                    </section>

                    <section className="pb-4">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">8</span>
                            <h3 className="text-xl font-bold">Job Matching</h3>
                        </div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-6 uppercase tracking-wider">Work Preference</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label className="relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4 transition-all hover:border-primary/50 [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                                <input defaultChecked className="sr-only" name="work_pref" type="radio" />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined">home_work</span>
                                    <span className="font-bold text-sm">Remote</span>
                                </div>
                            </label>
                            <label className="relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4 transition-all hover:border-primary/50 [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                                <input className="sr-only" name="work_pref" type="radio" />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined">domain</span>
                                    <span className="font-bold text-sm">Hybrid</span>
                                </div>
                            </label>
                            <label className="relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4 transition-all hover:border-primary/50 [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                                <input className="sr-only" name="work_pref" type="radio" />
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined">corporate_fare</span>
                                    <span className="font-bold text-sm">On-site</span>
                                </div>
                            </label>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-4">
                <div className="mx-auto max-w-3xl flex justify-center">
                    <Link href="/onboarding/step3" className="group w-full flex items-center justify-center gap-3 rounded-xl bg-primary px-8 py-4 text-lg font-black text-white shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <span>Generate My Markhub OS</span>
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">rocket_launch</span>
                    </Link>
                </div>
            </footer>
        </div>
    );
}

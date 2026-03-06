import Link from "next/link";

export default function OnboardingStep3() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 md:px-20 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="text-primary h-8 w-8">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Markhub</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-10 w-10 overflow-hidden">
                            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4tFmAAlI3yLggFwrbcnw3UUJCWhNLRIMGFqmuEcrzt9DHAxXlMyJ7l0FsUtHs3t_1rZStPf83r0uvYKijHtIkm6-y9plHogvzZyrF9dyACR-mSnj9jgFnR_awLL9lHxDWkqFhI8G0Hdou0izE5Rw3PYzsybrxxMHM9tNfgFPITOWtoDL-xesPUgMdmDQpNNQ2meNaE0j93d6mZoRd-Il0vvPWcFrw1cUYNx2mL_SQrN1r-AMgt4E4d3p3ghOs7C_Dau-RwSv78PA" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex justify-center items-center p-4 md:p-10">
                    <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-primary">Step 3 of 3</span>
                                <span className="text-sm font-medium text-slate-500">100%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-full rounded-full transition-all duration-1000"></div>
                            </div>
                            <p className="mt-3 text-sm text-slate-500 text-center">Finalizing your professional ecosystem...</p>
                        </div>

                        <div className="p-8 md:p-12 flex flex-col items-center text-center">
                            <h1 className="text-2xl md:text-3xl font-bold mb-8 text-slate-900 dark:text-white">Generating Your Career OS...</h1>
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
                                <div className="relative z-10 h-32 w-32 md:h-40 md:w-40 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary to-blue-400 text-white shadow-2xl">
                                    <span className="material-symbols-outlined text-6xl md:text-7xl">psychology</span>
                                </div>
                                <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                                    <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                                </div>
                            </div>

                            <div className="w-full max-w-md space-y-4 text-left">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Analyzing Resume & Portfolio</p>
                                        <p className="text-xs text-slate-500">Extraction complete: 42 key insights identified</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Mapping Skills Graph</p>
                                        <p className="text-xs text-slate-500">Market alignment: 94% match for Senior roles</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Verifying Past Projects</p>
                                        <p className="text-xs text-slate-500">Quantifying impact and technical stack relevance...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent">
                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">pending</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Optimizing Roadmap</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-600">Waiting for data synthesis...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
                            <Link href="/discovery" className="w-full max-w-sm bg-primary text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-primary/90 transition-all">
                                <span>View Your DNA Report</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                            <p className="text-xs text-slate-400 italic">This usually takes less than 30 seconds</p>
                        </div>
                    </div>
                </main>
                <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/5 to-transparent -z-10"></div>
            </div>
        </div>
    );
}

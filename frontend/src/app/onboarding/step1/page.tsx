import Link from "next/link";

export default function OnboardingStep1() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 px-6 lg:px-40 py-4 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="h-8 w-8">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"></path>
                            </svg>
                        </div>
                        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">
                            Markhub
                        </h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-4 items-center">
                        <span className="text-slate-500 text-sm hidden sm:block">Support</span>
                        <div className="bg-primary/10 border border-primary/20 rounded-full h-10 w-10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">person</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-10">
                    <div className="w-full max-w-[640px] bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-primary/5 overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="p-6 lg:p-10 flex flex-col gap-8">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold uppercase tracking-wider">
                                        Step 1 of 3
                                    </span>
                                    <span className="text-primary text-sm font-bold">33%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "33.33%" }}></div>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs">Getting Started: Onboarding Progress</p>
                            </div>

                            <div className="flex flex-col items-center gap-8 text-center">
                                <div
                                    className="w-full aspect-video rounded-xl bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center relative group overflow-hidden border border-primary/10"
                                    style={{
                                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0AHyjVlg8ZFeg1qVlcKF_a-O7Ty5avBwPQjpO9S5gzQuEZXaP3a46wGUpGt-Xp6NuXLVPRze4AdOClTG_FMKHZ4AQPxZbDTOZWAthBB_MUOhW9D16M83bBQLOFiEGWG8HrgRtAuM-dYsNnv495ZlxtfKUy4E5Wb1ysyYQ9cFMNtQKZ0MncwBL1lyfVfxYgzp_l8M-XKMwTjVteMTK-WvlZ2JsJm3rNZ0NuKeBdwk-d7Re_4Owj5dz7phsYov8E6dboLdw8ohoqXw')",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                >
                                    <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]"></div>
                                    <div className="relative z-10 h-24 w-24 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-2xl border border-white dark:border-slate-700">
                                        <span className="material-symbols-outlined text-primary text-5xl">auto_awesome</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <h1 className="text-slate-900 dark:text-slate-100 text-3xl lg:text-4xl font-extrabold tracking-tight">
                                        Welcome to Markhub AI
                                    </h1>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                                        Let's build your professional identity with the world's first AI Career OS.
                                    </p>
                                </div>

                                <div className="w-full flex flex-col gap-4">
                                    <Link
                                        href="/onboarding/step2"
                                        className="w-full py-4 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-full transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                                    >
                                        Begin Calibration
                                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </Link>
                                    <p className="text-slate-400 text-xs">Estimated time: 2 minutes</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex justify-center border-t border-slate-100 dark:border-slate-800">
                            <div className="flex gap-8">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    Secure & Private
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                                    <span className="material-symbols-outlined text-sm">bolt</span>
                                    AI-Powered Insights
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4 text-slate-400">
                        <button className="hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">help_outline</span>
                        </button>
                        <button className="hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">dark_mode</span>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

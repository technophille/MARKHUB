export function TopHeader({ title }: { title: string }) {
    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-8 flex items-center justify-between shrink-0 relative z-20">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
            </div>
        </header>
    );
}

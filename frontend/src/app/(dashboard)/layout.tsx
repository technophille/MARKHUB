import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                {children}
            </main>
        </div>
    );
}

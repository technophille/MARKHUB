"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Discovery (Stage 2/3)", icon: "explore", path: "/discovery" },
    { name: "Skill Gaps (Stage 4)", icon: "track_changes", path: "/gaps" },
    { name: "Roadmap (Stage 5/7)", icon: "map", path: "/roadmap" },
    { name: "Portfolio (Stage 6)", icon: "folder", path: "/portfolio" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-slate-900 dark:bg-slate-950 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary rounded-lg size-10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white">psychology</span>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-white text-lg font-bold leading-tight tracking-tight">Markhub AI</h1>
                    <p className="text-slate-400 text-xs font-medium">Career Platform</p>
                </div>
            </div>
            <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                    ? "bg-primary/20 text-primary hover:bg-primary/30"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 mt-auto">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800 border border-slate-700">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-8"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDV4MnVFxCRCZ8TLKX3dWQSrD-mF4C7dBzq3-00G72rkMPvTBqu8GYpoyt1qzU8Clazpl9usFy9WZMxWa3B4O-Wezi78apuhQajoCYlnS-Y3c4oN4GqnTfImHNOvoeaN1p3DqzUdrgduSz7GIjKUpzPU2GQegKckJarzO6Aqm91A8m3WHrhxIRDUxNBEZ7k3BCoj6NQfRZQ-rjy0PV9F4DaBmzyw_dqAZzA0Lfb0F1KzpmIehS18YA584_4NAf2XPNV4OWk5-0iu-Y")',
                        }}
                    ></div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">Nikhil K Menon</p>
                        <p className="text-slate-400 text-xs truncate">Premium Plan</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">more_vert</span>
                </div>
            </div>
        </aside>
    );
}

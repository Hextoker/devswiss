'use client';

import { JetBrains_Mono } from 'next/font/google';
import { Bell, Command, Terminal } from 'lucide-react';

import { ToolGrid } from '@/components/dashboard/ToolGrid';

const jetBrains = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    display: 'swap',
});

export default function Home() {
    return (
        <div className={`${jetBrains.className} cyber-page cyber-scroll selection:bg-[#00FF41] selection:text-black`}>
            <div className="cyber-scanline" />
            <div className="cyber-vignette" />

            <header className="relative z-50 border-b-2 border-[#00FF41]/20 bg-black/80 backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-6">
                        <div className="flex h-10 w-10 items-center justify-center border-2 border-[#00FF41] transform-[rotate(45deg)]">
                            <Terminal className="h-5 w-5 -rotate-45 text-[#00FF41]" />
                        </div>
                        <div>
                            <h1 className="cyber-glitch-hover text-2xl font-bold uppercase tracking-tight">
                                DevSwiss<span className="text-[#00FF41]">_</span>
                            </h1>
                            <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-500">NEURAL_LINK_ACTIVE</div>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-1 lg:flex">
                        <a className="px-4 py-1 text-xs font-bold uppercase transition-all hover:bg-[#00FF41] hover:text-black" href="#">
                            [01] Tools
                        </a>
                        <a className="px-4 py-1 text-xs font-bold uppercase transition-all hover:bg-[#00FF41] hover:text-black" href="#">
                            [02] Docs
                        </a>
                        <a className="px-4 py-1 text-xs font-bold uppercase transition-all hover:bg-[#00FF41] hover:text-black" href="#">
                            [03] API
                        </a>
                        <a className="px-4 py-1 text-xs font-bold uppercase transition-all hover:bg-[#00FF41] hover:text-black" href="#">
                            [04] Community
                        </a>
                    </nav>

                    <div className="flex items-center gap-6">
                        <div className="hidden text-right sm:block">
                            <div className="text-[10px] font-bold text-[#00FF41]">CORE_TEMP</div>
                            <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-zinc-800">
                                <div className="h-full w-2/3 bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
                            </div>
                        </div>
                        <button className="group relative" type="button" aria-label="Notifications">
                            <Bell className="h-5 w-5 text-[#00FF41] transition-transform group-hover:scale-110" />
                            <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-[#BC00FF]" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative mx-auto w-full max-w-7xl px-6 py-12">
                <div className="fixed left-4 top-1/2 hidden -translate-y-1/2 flex-col gap-8 opacity-40 xl:flex">
                    <div className="h-32 w-px bg-linear-to-b from-transparent via-[#00FF41] to-transparent" />
                    <div className="rotate-180 text-[10px] font-bold uppercase tracking-widest [writing-mode:vertical-rl]">
                        SYSTEM_STABILITY: 98%
                    </div>
                    <div className="h-32 w-px bg-linear-to-t from-transparent via-[#00FF41] to-transparent" />
                </div>

                <ToolGrid />

                <footer className="relative mt-24 border-t-2 border-zinc-800 pt-12">
                    <div className="absolute -top-0.5 left-0 h-1 w-16 bg-[#00FF41]" />
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                                System Version: 2.4.0-STABLE
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                                BUILD: 2026.02.18_CYBER_HUD
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41]" />
                            <p className="text-xs font-bold uppercase tracking-widest text-[#00FF41]">
                                CONNECTED // ENCRYPTION: AES-256-BIT
                            </p>
                        </div>
                        <p className="group cursor-default text-xs font-bold uppercase tracking-widest">
                            © <span className="transition-colors group-hover:text-[#BC00FF]">DEVSWISS_CORE</span>
                        </p>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
                        <Command className="h-3.5 w-3.5" /> Ctrl + K for command palette
                    </div>
                </footer>
            </main>
        </div>
    );
}

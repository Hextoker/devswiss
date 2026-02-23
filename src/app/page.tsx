'use client';

import { JetBrains_Mono } from 'next/font/google';
import { Bell, Command, Terminal } from 'lucide-react';

import { ToolGrid } from '@/components/dashboard/ToolGrid';
import { useUIStore } from '@/store/useUIStore';

const jetBrains = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    display: 'swap',
});

export default function Home() {
    const toggleCommandPalette = useUIStore((state) => state.toggleCommandPalette);

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
                        <a className="px-4 py-1 text-xs font-bold uppercase transition-all hover:bg-[#00FF41] hover:text-black" href="#tools">
                            [01] Tools
                        </a>
                        <a className="px-4 py-1 text-xs font-bold uppercase transition-all hover:bg-[#00FF41] hover:text-black" href="#command">
                            [02] Command
                        </a>
                        <a className="px-4 py-1 text-xs font-bold uppercase transition-all hover:bg-[#00FF41] hover:text-black" href="#filters">
                            [03] Filters
                        </a>
                        <a className="px-4 py-1 text-xs font-bold uppercase transition-all hover:bg-[#00FF41] hover:text-black" href="#system">
                            [04] System
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

                <section className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)]" id="command">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Developer Swiss Army Knife</p>
                        <h2 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
                            Encuentra, ejecuta y aprende en segundos
                        </h2>
                        <p className="max-w-xl text-sm text-zinc-400">
                            DevSwiss organiza utilidades criticas con privacidad local y una Command Palette para ir directo a la accion.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href="#tools"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#00FF41] bg-[#00FF41] px-4 py-2 text-xs font-bold uppercase text-black transition hover:-translate-y-0.5"
                            >
                                Explorar herramientas
                            </a>
                            <button
                                type="button"
                                onClick={toggleCommandPalette}
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-xs font-bold uppercase text-zinc-200 transition hover:border-[#00F0FF] hover:text-[#00F0FF]"
                            >
                                Abrir Command Palette
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ctrl + K</span>
                        </div>
                    </div>
                    <div className="cyber-panel cyber-border-green flex flex-col gap-4 p-5 text-sm text-zinc-300">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#00FF41]">Quick Start</span>
                            <span className="text-[10px] text-zinc-500">Local-first</span>
                        </div>
                        <ul className="space-y-2 text-xs text-zinc-400">
                            <li>1. Busca por herramienta, categoria o keyword.</li>
                            <li>2. Ejecuta sin salir del navegador.</li>
                            <li>3. Guarda favoritos y vuelve con un click.</li>
                        </ul>
                    </div>
                </section>

                <section id="tools">
                    <ToolGrid />
                </section>

                <footer className="relative mt-24 border-t-2 border-zinc-800 pt-12" id="system">
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

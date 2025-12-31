'use client';

import { Sparkles } from 'lucide-react';

import { ToolGrid } from '@/components/dashboard/ToolGrid';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0f] to-black text-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12">
                <header className="flex flex-col items-center gap-4 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        DevSwiss · Toolbelt <Sparkles className="h-4 w-4 text-emerald-200" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">DevSwiss</h1>
                    <p className="max-w-2xl text-base text-zinc-400">
                        Tus utilidades favoritas en un solo lugar. Marca con ⭐ para acceso inmediato desde aquí o el buscador (<kbd className="rounded bg-zinc-800 px-2 py-1 text-xs">⌘K</kbd>).
                    </p>
                </header>

                <ToolGrid />
            </div>
        </div>
    );
}

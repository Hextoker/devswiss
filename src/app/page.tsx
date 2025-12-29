'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Compass, Sparkles, Workflow } from 'lucide-react';

import { FavoriteButton } from '@/components/FavoriteButton';
import { getFavorites } from '@/utils/storage';

type Tool = {
    id: string;
    name: string;
    description: string;
    path: string;
};

export default function Home() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(false);
    const [favoritesIds, setFavoritesIds] = useState<string[]>([]);

    useEffect(() => {
        setFavoritesIds(getFavorites());

        const fetchTools = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/tools');
                if (!res.ok) throw new Error('Failed to load tools');
                const data: Tool[] = await res.json();
                setTools(data);
            } catch (err) {
                console.error('Home failed to load tools', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, []);

    const favorites = useMemo(
        () => tools.filter((tool) => favoritesIds.includes(tool.id)),
        [favoritesIds, tools]
    );
    const nonFavorites = useMemo(
        () => tools.filter((tool) => !favoritesIds.includes(tool.id)),
        [favoritesIds, tools]
    );

    const handleToggleFavorite = (toolId: string, isFav: boolean) => {
        setFavoritesIds((current) => {
            if (isFav) {
                if (current.includes(toolId)) return current;
                return [...current, toolId];
            }
            return current.filter((id) => id !== toolId);
        });
    };

    const renderCard = (tool: Tool) => (
        <div
            key={tool.id}
            className="group relative flex flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/70 via-zinc-950 to-black p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] transition hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_30px_80px_-50px_rgba(16,185,129,0.5)]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                        <Workflow className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-emerald-400/80">DevSwiss</p>
                        <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                    </div>
                </div>
                <FavoriteButton
                    toolId={tool.id}
                    onToggle={(next) => handleToggleFavorite(tool.id, next)}
                />
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2">{tool.description}</p>

            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-200/80">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Zero Friction
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-cyan-100">
                        <Compass className="h-3.5 w-3.5" />
                        Acceso rápido
                    </span>
                </div>
                <Link
                    href={tool.path}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-400"
                >
                    Abrir herramienta
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0f] to-black text-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12">
                <header className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        DevSwiss · Toolbelt
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">DevSwiss</h1>
                    <p className="max-w-2xl text-base text-zinc-400">
                        Tus utilidades favoritas en un solo lugar. Marca con ⭐ para acceso inmediato desde aquí o el buscador (<kbd className="rounded bg-zinc-800 px-2 py-1 text-xs">⌘K</kbd>).
                    </p>
                </header>

                {favorites.length > 0 && (
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-amber-300">⭐ Favoritos</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-amber-400/70 via-amber-400/30 to-transparent" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {favorites.map(renderCard)}
                        </div>
                    </section>
                )}

                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-emerald-200">Todas las herramientas</span>
                        {loading && <span className="text-xs text-zinc-500">Cargando...</span>}
                    </div>
                    {tools.length === 0 && !loading ? (
                        <p className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-6 text-center text-sm text-zinc-500">
                            No hay herramientas disponibles todavía.
                        </p>
                    ) : nonFavorites.length === 0 && favorites.length > 0 ? (
                        <p className="rounded-xl border border-emerald-700/40 bg-emerald-500/5 px-4 py-6 text-center text-sm text-emerald-100/80">
                            Todas tus herramientas están marcadas como favoritas. 🎉
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {(nonFavorites.length ? nonFavorites : tools).map(renderCard)}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

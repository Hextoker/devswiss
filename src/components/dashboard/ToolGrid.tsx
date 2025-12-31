'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowUpRight,
    BadgeCheck,
    Braces,
    Clock3,
    FileJson,
    Filter,
    Fingerprint,
    ShieldCheck,
    Sparkles,
    Star,
    Wand2,
} from 'lucide-react';

import { ToolMeta, tools, ToolCategory, toolCategories } from '@/data/tools';
import { addFavorite, getFavorites, getStorageKey, removeFavorite } from '@/utils/storage';

type FilterKey = 'all' | ToolCategory;

const EMPTY_FAVORITES: string[] = [];

const favoritesStore = {
    cache: EMPTY_FAVORITES,
    listeners: new Set<() => void>(),
    subscribe(callback: () => void) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    },
    notify() {
        this.listeners.forEach((cb) => cb());
    },
    getSnapshot() {
        return this.cache;
    },
    readFromStorage() {
        if (typeof window === 'undefined') return EMPTY_FAVORITES;
        return getFavorites();
    },
    syncFromStorage() {
        this.cache = this.readFromStorage();
    },
};

const iconMap: Record<ToolMeta['icon'], LucideIcon> = {
    shield: ShieldCheck,
    hash: Fingerprint,
    regex: Braces,
    json: FileJson,
    rut: BadgeCheck,
    clock: Clock3,
    glass: Wand2,
};

const accentMap: Record<
    ToolMeta['accent'],
    { border: string; badge: string; text: string; glow?: string }
> = {
    emerald: {
        border: 'border-emerald-500/40',
        badge: 'bg-emerald-500/10 text-emerald-100',
        text: 'text-emerald-100',
        glow: 'shadow-[0_20px_60px_-40px_rgba(16,185,129,0.9)]',
    },
    cyan: {
        border: 'border-cyan-400/40',
        badge: 'bg-cyan-500/10 text-cyan-100',
        text: 'text-cyan-100',
        glow: 'shadow-[0_20px_60px_-40px_rgba(34,211,238,0.65)]',
    },
    amber: {
        border: 'border-amber-400/40',
        badge: 'bg-amber-500/10 text-amber-100',
        text: 'text-amber-100',
        glow: 'shadow-[0_20px_60px_-40px_rgba(251,191,36,0.55)]',
    },
    violet: {
        border: 'border-violet-400/40',
        badge: 'bg-violet-500/10 text-violet-100',
        text: 'text-violet-100',
        glow: 'shadow-[0_20px_60px_-40px_rgba(167,139,250,0.6)]',
    },
    blue: {
        border: 'border-blue-400/40',
        badge: 'bg-blue-500/10 text-blue-100',
        text: 'text-blue-100',
        glow: 'shadow-[0_20px_60px_-40px_rgba(96,165,250,0.6)]',
    },
};

const saveToolVisit = (toolId: string) => {
    if (typeof window === 'undefined') return;
    try {
        const key = 'devswiss_tool_visits';
        const raw = window.localStorage.getItem(key);
        const current = raw ? (JSON.parse(raw) as Record<string, { lastVisited: number; count: number }>) : {};
        const prev = current[toolId] ?? { lastVisited: 0, count: 0 };
        const next = { lastVisited: Date.now(), count: prev.count + 1 };
        window.localStorage.setItem(key, JSON.stringify({ ...current, [toolId]: next }));
    } catch (error) {
        console.warn('DevSwiss: no se pudo guardar la visita', error);
    }
};

export function ToolGrid() {
    const router = useRouter();
    const isBrowser = typeof window !== 'undefined';
    const favorites = useSyncExternalStore(
        favoritesStore.subscribe.bind(favoritesStore),
        () => favoritesStore.getSnapshot(),
        () => EMPTY_FAVORITES
    );
    const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

    useEffect(() => {
        if (!isBrowser) return;
        favoritesStore.syncFromStorage();
        favoritesStore.notify();
        const handleStorage = (event: StorageEvent) => {
            if (event.key === getStorageKey()) {
                favoritesStore.syncFromStorage();
                favoritesStore.notify();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [isBrowser]);

    const filters = useMemo(
        () => [
            { label: 'Todas', value: 'all' as FilterKey },
            ...toolCategories.map((category) => ({ label: category, value: category as FilterKey })),
        ],
        []
    );

    const filteredTools = useMemo(
        () =>
            activeFilter === 'all'
                ? tools
                : tools.filter((tool) => tool.category === activeFilter),
        [activeFilter]
    );

    const orderedTools = useMemo(() => {
        const withFavoritesFirst = [...filteredTools].sort((a, b) => {
            const aFav = favorites.includes(a.id) ? 1 : 0;
            const bFav = favorites.includes(b.id) ? 1 : 0;
            return bFav - aFav;
        });
        return withFavoritesFirst;
    }, [favorites, filteredTools]);

    const handleToggleFavorite = useCallback(
        (toolId: string) => {
            if (!isBrowser) return;
            const isFav = favorites.includes(toolId);
            if (isFav) {
                removeFavorite(toolId);
            } else {
                addFavorite(toolId);
            }
            favoritesStore.syncFromStorage();
            favoritesStore.notify();
        },
        [favorites, isBrowser]
    );

    const handleOpenTool = useCallback(
        (tool: ToolMeta) => {
            saveToolVisit(tool.id);
            router.push(tool.path);
        },
        [router]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                    <Filter className="h-3.5 w-3.5" />
                    Filtros
                </div>
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => {
                        const isActive = filter.value === activeFilter;
                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setActiveFilter(filter.value)}
                                className={`relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                                    isActive
                                        ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-100 shadow-[0_15px_45px_-30px_rgba(16,185,129,0.8)]'
                                        : 'border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-50'
                                }`}
                            >
                                {isActive && <Sparkles className="h-4 w-4 text-emerald-300" />}
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orderedTools.map((tool) => {
                    const Icon = iconMap[tool.icon] ?? Sparkles;
                    const accent = accentMap[tool.accent];
                    const isFavorite = favorites.includes(tool.id);

                    return (
                        <article
                            key={tool.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleOpenTool(tool)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    handleOpenTool(tool);
                                }
                            }}
                            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-zinc-950 via-zinc-950 to-black p-5 transition hover:-translate-y-1 hover:border-emerald-400/60 ${
                                tool.spotlight
                                    ? 'border-emerald-400/70 ring-1 ring-emerald-500/40'
                                    : 'border-zinc-800/80'
                            } ${accent?.glow || ''}`}
                        >
                            {tool.spotlight && (
                                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
                            )}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-black/50 ${accent?.border || 'border-zinc-800'}`}
                                    >
                                        <Icon className={`h-5 w-5 ${accent?.text || 'text-zinc-200'}`} />
                                    </span>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                                            {tool.category}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                                            {tool.spotlight && (
                                                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    aria-pressed={isFavorite}
                                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleToggleFavorite(tool.id);
                                    }}
                                    className={`rounded-full border p-2 transition ${
                                        isFavorite
                                            ? 'border-amber-400/80 bg-amber-500/15 text-amber-200 shadow-[0_10px_30px_-18px_rgba(251,191,36,0.6)]'
                                            : 'border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:border-amber-400/60 hover:text-amber-100'
                                    }`}
                                >
                                    <Star
                                        className="h-4 w-4"
                                        fill={isFavorite ? 'currentColor' : 'none'}
                                        strokeWidth={1.75}
                                    />
                                </button>
                            </div>

                            <p className="mt-3 text-sm text-zinc-400">{tool.description}</p>

                            <div className="mt-5 flex items-center justify-between">
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${accent?.border || 'border-zinc-800'} ${accent?.badge || 'text-zinc-200'}`}
                                >
                                    <Sparkles className={`h-4 w-4 ${accent?.text || 'text-zinc-100'}`} />
                                    {tool.tagline}
                                </span>
                                <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-100 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                                    Abrir herramienta
                                    <ArrowUpRight className="h-4 w-4" />
                                </span>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}

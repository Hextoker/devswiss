'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
    BadgeCheck,
    Braces,
    Clock3,
    Code2,
    FileJson,
    Fingerprint,
    KeyRound,
    Search,
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
    shield: KeyRound,
    hash: Fingerprint,
    regex: Braces,
    json: FileJson,
    rut: BadgeCheck,
    clock: Clock3,
    glass: Wand2,
};

const accentMap: Record<
    ToolMeta['accent'],
    {
        borderClass: string;
        iconBorderClass: string;
        iconTextClass: string;
        labelTextClass: string;
        buttonHoverClass: string;
        actionTextClass: string;
        lineClass: string;
    }
> = {
    emerald: {
        borderClass: 'cyber-border-green',
        iconBorderClass: 'border-[#00FF41]/30 group-hover:border-[#00FF41] group-hover:shadow-[0_0_15px_rgba(0,255,65,0.4)]',
        iconTextClass: 'text-[#00FF41]',
        labelTextClass: 'text-[#00FF41]',
        buttonHoverClass: 'hover:bg-[#00FF41]/5',
        actionTextClass: 'text-[#00FF41]',
        lineClass: 'bg-[#00FF41]/20',
    },
    cyan: {
        borderClass: 'cyber-border-blue',
        iconBorderClass: 'border-[#00F0FF]/30 group-hover:border-[#00F0FF] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]',
        iconTextClass: 'text-[#00F0FF]',
        labelTextClass: 'text-[#00F0FF]',
        buttonHoverClass: 'hover:bg-[#00F0FF]/5',
        actionTextClass: 'text-[#00F0FF]',
        lineClass: 'bg-[#00F0FF]/20',
    },
    amber: {
        borderClass: 'cyber-border-yellow',
        iconBorderClass: 'border-[#FFF000]/30 group-hover:border-[#FFF000] group-hover:shadow-[0_0_15px_rgba(255,240,0,0.4)]',
        iconTextClass: 'text-[#FFF000]',
        labelTextClass: 'text-[#FFF000]',
        buttonHoverClass: 'hover:bg-[#FFF000]/5',
        actionTextClass: 'text-[#FFF000]',
        lineClass: 'bg-[#FFF000]/20',
    },
    violet: {
        borderClass: 'cyber-border-purple',
        iconBorderClass: 'border-[#BC00FF]/30 group-hover:border-[#BC00FF] group-hover:shadow-[0_0_15px_rgba(188,0,255,0.4)]',
        iconTextClass: 'text-[#BC00FF]',
        labelTextClass: 'text-[#BC00FF]',
        buttonHoverClass: 'hover:bg-[#BC00FF]/5',
        actionTextClass: 'text-[#BC00FF]',
        lineClass: 'bg-[#BC00FF]/20',
    },
    blue: {
        borderClass: 'cyber-border-blue',
        iconBorderClass: 'border-[#00F0FF]/30 group-hover:border-[#00F0FF] group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]',
        iconTextClass: 'text-[#00F0FF]',
        labelTextClass: 'text-[#00F0FF]',
        buttonHoverClass: 'hover:bg-[#00F0FF]/5',
        actionTextClass: 'text-[#00F0FF]',
        lineClass: 'bg-[#00F0FF]/20',
    },
};

const filterNameMap: Record<FilterKey, string> = {
    all: 'ALL_TOOLS',
    Seguridad: 'SECURITY',
    Datos: 'FORMATTERS',
    Diseño: 'CONVERTERS',
    Automatización: 'GENERATORS',
    DevTools: 'DEVTOOLS',
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
    const [searchTerm, setSearchTerm] = useState('');

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
            { label: filterNameMap.all, value: 'all' as FilterKey },
            ...toolCategories.map((category) => ({
                label: filterNameMap[category],
                value: category as FilterKey,
            })),
        ],
        []
    );

    const filteredTools = useMemo(() => {
        const normalizedQuery = searchTerm.trim().toLowerCase();
        const scoped = activeFilter === 'all' ? tools : tools.filter((tool) => tool.category === activeFilter);

        if (!normalizedQuery) return scoped;

        return scoped.filter((tool) => {
            const haystack = [tool.name, tool.description, tool.category, ...(tool.keywords ?? [])]
                .join(' ')
                .toLowerCase();
            return haystack.includes(normalizedQuery);
        });
    }, [activeFilter, searchTerm]);

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
        <div className="space-y-10">
            <div className="mb-12">
                <div className="cyber-panel cyber-border-green p-0.5" id="search">
                    <div className="flex flex-col gap-3 bg-black/40 p-4">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                            Search Tools
                            <span className="hidden border border-[#00FF41] px-3 py-1 text-[10px] font-bold text-[#00FF41] sm:block">
                                KEY: CTRL_K
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-[#00FF41]">/&gt;</span>
                            <input
                                className="w-full border-none bg-transparent text-lg uppercase text-zinc-200 placeholder:text-zinc-700 focus:ring-0"
                                placeholder="Busca por herramienta, categoria o keyword"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                type="text"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-3" id="filters">
                    {filters.map((filter, index) => {
                        const isActive = filter.value === activeFilter;
                        const activeClass = isActive
                            ? 'border-[#00FF41] bg-[#00FF41] text-black'
                            : 'border-zinc-700 text-zinc-200 hover:border-[#00F0FF] hover:text-[#00F0FF]';

                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setActiveFilter(filter.value)}
                                className={`px-6 py-2 text-xs font-bold uppercase transition-all ${activeClass}`}
                                style={{ clipPath: index === 0 ? 'polygon(0 0,100% 0,90% 100%,10% 100%)' : undefined }}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mb-10 flex items-center gap-4">
                <div className="h-2 w-2 bg-[#00FF41]" />
                <h2 className="text-xl font-bold uppercase tracking-widest text-[#00FF41]"># POPULAR_UTILITIES</h2>
                <div className="h-px flex-1 bg-linear-to-r from-[#00FF41] to-transparent" />
                <span className="text-[10px] font-bold text-zinc-500">
                    [ {String(orderedTools.length).padStart(2, '0')}_RECORDS_FOUND ]
                </span>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                {orderedTools.map((tool, index) => {
                    const Icon = iconMap[tool.icon] ?? Code2;
                    const accent = accentMap[tool.accent];
                    const isFavorite = favorites.includes(tool.id);

                    const panelTitle = tool.name.replace(/\s+/g, '_').toUpperCase();

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
                            className={`cyber-panel cyber-panel-solid group cursor-pointer p-6 transition-all ${accent.borderClass} ${accent.buttonHoverClass}`}
                        >
                            <div className="mb-8 flex items-start justify-between">
                                <button
                                    type="button"
                                    aria-pressed={isFavorite}
                                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleToggleFavorite(tool.id);
                                    }}
                                    className={`order-last text-zinc-500 transition-all duration-300 ${
                                        isFavorite
                                            ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                            : 'hover:text-emerald-400 hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                    }`}
                                >
                                    <Star className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={1.8} />
                                </button>

                                <div className={`flex h-14 w-14 items-center justify-center border-2 bg-black ${accent.iconBorderClass}`}>
                                    <Icon className={`h-7 w-7 ${accent.iconTextClass}`} />
                                </div>

                                <div className="flex-1 px-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${accent.labelTextClass}`}>
                                            {tool.category.toUpperCase()}
                                        </span>
                                        {tool.spotlight && (
                                            <span className="rounded-full border border-amber-400/60 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-100">
                                                NEW
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 className={`mb-4 text-3xl font-bold uppercase transition-colors ${accent.labelTextClass}`}>
                                {panelTitle}
                            </h3>

                            <p className="mb-6 text-xs leading-relaxed text-zinc-400 group-hover:text-zinc-200">{tool.description}</p>

                            <div className="flex items-center justify-between">
                                <div className={`text-[10px] font-bold uppercase tracking-widest ${accent.actionTextClass}`}>
                                    &gt; OPEN_TOOL
                                </div>
                                <div className={`h-0.5 w-8 ${accent.lineClass}`} />
                            </div>
                        </article>
                    );
                })}
            </div>

            {orderedTools.length === 0 && (
                <div className="cyber-panel cyber-border-green p-8 text-center">
                    <Search className="mx-auto mb-3 h-5 w-5 text-[#00FF41]" />
                    <p className="text-sm uppercase tracking-wider text-zinc-300">NO_RESULTS_FOR_CURRENT_QUERY</p>
                </div>
            )}
        </div>
    );
}

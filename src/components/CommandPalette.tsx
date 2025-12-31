'use client';

import { useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { detectQuickAction, QuickAction } from '@/data/intentions';
import { tools as toolList, ToolMeta } from '@/data/tools';

function CommandGroup({ heading, children }: { heading: string; children: ReactNode }) {
    return (
        <div className="border-b border-zinc-900 bg-zinc-950/70">
            <div className="flex items-center gap-2 border-b border-emerald-500/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.22)]" />
                {heading}
            </div>
            {children}
        </div>
    );
}

export function CommandPalette() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [tools] = useState<ToolMeta[]>(toolList);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => {
                    const next = !open;
                    if (next) {
                        setTimeout(() => inputRef.current?.focus(), 0);
                    }
                    return next;
                });
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return tools;
        return tools.filter((tool) => {
            const haystack = [tool.name, tool.description, ...(tool.keywords || [])]
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [query, tools]);

    const quickAction = useMemo<QuickAction | null>(() => detectQuickAction(query), [query]);

    const closePalette = () => {
        setIsOpen(false);
        setQuery('');
    };

    const handleSelect = (tool: ToolMeta) => {
        closePalette();
        router.push(tool.path);
    };

    const handleQuickAction = () => {
        if (!quickAction) return;
        closePalette();
        router.push(quickAction.path);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (quickAction) {
                                    handleQuickAction();
                                    return;
                                }
                                if (results.length > 0) {
                                    handleSelect(results[0]);
                                }
                            }
                        }}
                        className="flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-600"
                        placeholder="Search tools..."
                        autoFocus
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-400">
                        <span>ESC</span>
                    </kbd>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {results.length === 0 && !quickAction ? (
                        <p className="p-4 text-center text-sm text-zinc-500">
                            No results found. Start typing to search tools.
                        </p>
                    ) : (
                        <>
                            {quickAction && (
                                <CommandGroup heading="Acción Instantánea">
                                    <button
                                        onClick={handleQuickAction}
                                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-emerald-500/10 focus:bg-emerald-500/10"
                                    >
                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-emerald-100">{quickAction.title}</p>
                                            <p className="text-xs text-emerald-200/80">{quickAction.description}</p>
                                        </div>
                                    </button>
                                </CommandGroup>
                            )}
                            <div className="divide-y divide-zinc-900">
                                {results.map((tool) => (
                                    <button
                                        key={tool.id}
                                        onClick={() => handleSelect(tool)}
                                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-zinc-900 focus:bg-zinc-900"
                                    >
                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-100">{tool.name}</p>
                                            <p className="text-xs text-zinc-500">{tool.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

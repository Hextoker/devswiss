'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Tool = {
    id: string;
    name: string;
    description: string;
    path: string;
    keywords?: string[];
};

const tools: Tool[] = [
    {
        id: 'json-master',
        name: 'JSON Master',
        description: 'Formatea, minifica y valida JSON 100% en tu navegador.',
        path: '/tools/json-master',
        keywords: ['json', 'format', 'minify', 'validar'],
    },
];

export function CommandPalette() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
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
    }, [query]);

    const handleSelect = (tool: Tool) => {
        setIsOpen(false);
        setQuery('');
        router.push(tool.path);
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
                            if (e.key === 'Enter' && results.length > 0) {
                                e.preventDefault();
                                handleSelect(results[0]);
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
                    {results.length === 0 ? (
                        <p className="p-4 text-center text-sm text-zinc-500">
                            No results found. Start typing to search tools.
                        </p>
                    ) : (
                        <ul className="divide-y divide-zinc-900">
                            {results.map((tool) => (
                                <li key={tool.id}>
                                    <button
                                        onClick={() => handleSelect(tool)}
                                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-zinc-900 focus:bg-zinc-900"
                                    >
                                        <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-100">{tool.name}</p>
                                            <p className="text-xs text-zinc-500">{tool.description}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

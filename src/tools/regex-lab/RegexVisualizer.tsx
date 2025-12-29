'use client';

import React from 'react';

export interface RegexMatch {
    value: string;
    index: number;
    end: number;
    groups: string[];
    namedGroups?: Record<string, string>;
}

interface RegexVisualizerProps {
    text: string;
    matches: RegexMatch[];
}

const badgeColors = [
    'bg-emerald-200/80 text-emerald-950 ring-1 ring-emerald-400/70',
    'bg-cyan-200/80 text-cyan-950 ring-1 ring-cyan-400/70',
    'bg-amber-200/80 text-amber-950 ring-1 ring-amber-400/70',
    'bg-pink-200/80 text-pink-950 ring-1 ring-pink-300/70',
];

export const RegexVisualizer: React.FC<RegexVisualizerProps> = ({ text, matches }) => {
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
    const segments: React.ReactNode[] = [];
    let cursor = 0;

    sortedMatches.forEach((match, idx) => {
        if (match.index > cursor) {
            segments.push(
                <span key={`plain-${idx}-${cursor}`} className="text-slate-200">
                    {text.slice(cursor, match.index)}
                </span>
            );
        }

        segments.push(
            <span
                key={`match-${idx}-${match.index}`}
                className={`rounded-md px-1.5 py-0.5 ${badgeColors[idx % badgeColors.length]}`}
            >
                {text.slice(match.index, match.end)}
            </span>
        );

        cursor = match.end;
    });

    if (cursor < text.length) {
        segments.push(
            <span key={`plain-final-${cursor}`} className="text-slate-200">
                {text.slice(cursor)}
            </span>
        );
    }

    return (
        <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_10px_45px_-30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-xs text-slate-200">
                        ⌘
                    </span>
                    Visualización en vivo
                </div>
                <span className="text-xs text-slate-400">
                    {matches.length > 0
                        ? `${matches.length} coincidencia${matches.length > 1 ? 's' : ''}`
                        : 'Sin coincidencias todavía'}
                </span>
            </div>

            <div className="max-h-64 overflow-auto rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-100">
                {text ? (
                    <pre className="whitespace-pre-wrap break-words">{segments}</pre>
                ) : (
                    <p className="text-sm text-slate-400">Pega texto de prueba para ver los matches resaltados.</p>
                )}
            </div>

            {matches.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                    {sortedMatches.map((match, idx) => (
                        <span
                            key={`chip-${idx}-${match.index}`}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${badgeColors[idx % badgeColors.length]}`}
                        >
                            #{idx + 1} · {match.value}
                            <span className="text-[10px] font-medium opacity-80">
                                ({match.index}-{match.end})
                            </span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

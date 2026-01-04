'use client';

import React from 'react';
import { ExplainButton } from '@/components/shared/ExplainButton';
import { useJSONProcessor } from '@/hooks/useJSONProcessor';

const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function JSONMasterPage() {
    const hasPrefilled = React.useRef(false);
    const {
        jsonInput,
        error,
        indentSize,
        stats,
        isValid,
        setIndentSize,
        updateInput,
        format,
        minify,
        clear,
        copyToClipboard,
    } = useJSONProcessor();
    const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'error'>('idle');

    const handleCopy = async () => {
        const ok = await copyToClipboard();
        setCopyState(ok ? 'copied' : 'error');
        setTimeout(() => setCopyState('idle'), 1800);
    };

    React.useEffect(() => {
        if (hasPrefilled.current) return;
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const payload = params.get('payload');
        if (!payload) return;
        hasPrefilled.current = true;
        updateInput(payload);
    }, [updateInput]);

    return (
        <React.Fragment>
            <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 px-5 py-4 shadow-[0_10px_60px_-35px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 shadow-lg shadow-emerald-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="14" x="3" y="5" rx="2" /><path d="M7 9h10" /><path d="M7 13h6" /></svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">DevSwiss</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">JSON Master</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-200">
                        100% Client-side
                    </span>
                    <span className="rounded-full border border-zinc-700 px-3 py-1 font-medium text-zinc-300">
                        Zero Friction
                    </span>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section className="flex min-h-[60vh] flex-col rounded-2xl border border-zinc-800/70 bg-zinc-950/60 shadow-[0_10px_60px_-35px_rgba(0,0,0,0.6)]">
                    <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={format}
                                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-400/50 hover:bg-emerald-500/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M4 10h16" /><path d="M5 6h14" /><path d="M14 15h6" /><path d="M8 15h.01" /><path d="M12 15h.01" /></svg>
                                Formatear
                            </button>
                            <button
                                onClick={minify}
                                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-500/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6v6H3z" /><path d="M15 3h6v6h-6z" /><path d="M3 15h6v6H3z" /><path d="M15 15h6v6h-6z" /></svg>
                                Minificar
                            </button>
                            <button
                                onClick={handleCopy}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${copyState === 'copied'
                                    ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                                    : copyState === 'error'
                                        ? 'border-red-400/50 bg-red-500/10 text-red-200'
                                        : 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-zinc-900'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                {copyState === 'copied' ? 'Copiado' : copyState === 'error' ? 'Error' : 'Copiar'}
                            </button>
                            <button
                                onClick={clear}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-100 transition hover:-translate-y-0.5 hover:border-red-400/60 hover:bg-red-500/15"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
                                Limpiar
                            </button>
                        </div>
                        <div className="ml-auto flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300">
                            <span className="text-xs uppercase tracking-wide text-zinc-500">Indentación</span>
                            <select
                                value={indentSize}
                                onChange={(e) => setIndentSize(Number(e.target.value))}
                                className="rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-1 text-sm font-medium text-zinc-100 outline-none ring-0 focus:border-emerald-500"
                            >
                                <option value={2}>2 espacios</option>
                                <option value={4}>4 espacios</option>
                                <option value={8}>8 espacios</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative flex-1">
                        <textarea
                            value={jsonInput}
                            onChange={(e) => updateInput(e.target.value)}
                            spellCheck={false}
                            className="h-full w-full resize-none rounded-b-2xl bg-transparent px-4 py-4 font-mono text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none"
                            placeholder="Pega tu JSON aquí. El procesado y validación son instantáneos en tu navegador."
                        />

                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-zinc-800/80 bg-zinc-950/80 px-4 py-3 text-xs font-medium text-zinc-300">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2 w-2 rounded-full ${isValid ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' : 'bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.2)]'}`}
                                />
                                {error ? (
                                    <span className="text-amber-200">Error: {error}</span>
                                ) : (
                                    <span className="text-emerald-200">JSON válido</span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {stats && (
                                    <>
                                        <span className="text-zinc-400">
                                            {stats.lines} líneas · {formatBytes(stats.bytes)}
                                        </span>
                                        <span className="h-4 w-px bg-zinc-800" />
                                    </>
                                )}
                                <ExplainButton toolName="JSON Master" context={jsonInput} />
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="flex flex-col gap-3 rounded-2xl border border-zinc-800/70 bg-gradient-to-b from-zinc-950/80 to-zinc-950 px-4 py-4 text-sm text-zinc-200 shadow-[0_10px_60px_-35px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="M5 12h14" /></svg>
                        Pizarras rápidas
                    </div>
                    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="font-medium text-zinc-100">Flujo recomendado</p>
                        <ul className="space-y-2 text-zinc-400">
                            <li>1. Pega o escribe tu JSON; la validación se ejecuta al instante.</li>
                            <li>2. Ajusta la indentación preferida (se guarda en tu navegador).</li>
                            <li>3. Usa Formatear para lectura o Minificar para enviar payloads.</li>
                            <li>4. Copia directo al portapapeles, sin guardados ni registros.</li>
                        </ul>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="font-medium text-zinc-100">Tips de errores claros</p>
                        <p className="text-zinc-400">
                            Si aparece un error, revisa la posición y la línea sugerida. Se calculan en vivo con
                            el mismo motor del navegador para mantener la experiencia 100% client-side.
                        </p>
                    </div>
                </aside>
            </div>
        </React.Fragment>
    );
}

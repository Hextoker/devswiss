'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { optimize } from 'svgo/dist/svgo.browser';
import { ExplainButton } from '@/components/shared/ExplainButton';

const getByteSize = (value: string) => new Blob([value]).size;

const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function SVGOptimizerPage() {
    const hasPrefilled = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [svgInput, setSvgInput] = useState('');
    const [optimizedSvg, setOptimizedSvg] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const stats = useMemo(() => {
        if (!optimizedSvg && !svgInput) return null;
        const before = svgInput ? getByteSize(svgInput) : 0;
        const after = optimizedSvg ? getByteSize(optimizedSvg) : 0;
        const savings = before > 0 ? Math.max(0, before - after) : 0;
        const percent = before > 0 ? Math.round((savings / before) * 100) : 0;
        return { before, after, savings, percent };
    }, [svgInput, optimizedSvg]);

    const explainContext = useMemo(() => {
        const trimmed = svgInput.trim();
        return [
            'Estructura SVG: <svg> ... </svg>',
            `Caracteres: ${trimmed.length}`,
            trimmed ? `Vista previa:\n${trimmed.slice(0, 320)}` : 'Sin SVG cargado.',
        ].join('\n');
    }, [svgInput]);

    const handleOptimize = () => {
        setError(null);
        if (!svgInput.trim()) {
            setError('Pega o arrastra un SVG para optimizar.');
            return;
        }

        try {
            const result = optimize(svgInput, {
                multipass: true,
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                removeViewBox: false,
                            },
                        },
                    },
                ],
            }) as { data: string };

            setOptimizedSvg(result.data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo optimizar el SVG.';
            setError(message);
        }
    };

    const handleClear = () => {
        setSvgInput('');
        setOptimizedSvg('');
        setError(null);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.svg')) {
            setError('El archivo debe tener extension .svg');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const text = typeof reader.result === 'string' ? reader.result : '';
            setSvgInput(text);
            setOptimizedSvg('');
            setError(null);
        };
        reader.readAsText(file);
    };

    const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const text = typeof reader.result === 'string' ? reader.result : '';
            setSvgInput(text);
            setOptimizedSvg('');
            setError(null);
        };
        reader.readAsText(file);
    };

    const handleCopy = async () => {
        if (!optimizedSvg) return;
        try {
            await navigator.clipboard.writeText(optimizedSvg);
        } catch (err) {
            console.error('Clipboard error', err);
        }
    };

    useEffect(() => {
        if (hasPrefilled.current) return;
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const payload = params.get('svg');
        if (!payload) return;
        hasPrefilled.current = true;
        setSvgInput(payload);
        setOptimizedSvg('');
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <header className="cyber-panel cyber-border-blue flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 p-2 shadow-lg shadow-cyan-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h6v6H3z" /><path d="M15 3h6v6h-6z" /><path d="M3 15h6v6H3z" /><path d="M15 15h6v6h-6z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">DevSwiss</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">SVG Optimizer</h1>
                        <p className="text-sm text-slate-400">Limpia, minifica y arregla SVG sin salir del navegador.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-medium">
                        SVGO browser
                    </span>
                    <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-medium">
                        Drag & drop
                    </span>
                </div>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
                <section className="space-y-4">
                    <div
                        className={`rounded-2xl border border-dashed p-5 transition ${
                            dragActive
                                ? 'border-cyan-400 bg-cyan-500/10'
                                : 'border-slate-800/70 bg-slate-950/70'
                        }`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Carga rapida</p>
                                <p className="text-sm text-slate-300">Arrastra tu SVG o selecciona un archivo local.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400"
                                >
                                    Seleccionar archivo
                                </button>
                                <ExplainButton toolName="SVG Optimizer" context={explainContext} label="Pedagogía con IA" />
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/svg+xml"
                            className="hidden"
                            onChange={handleFilePick}
                        />
                    </div>

                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">SVG original</p>
                                <p className="text-sm text-slate-400">Pega o edita el SVG manualmente.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleOptimize}
                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/50 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-300"
                                >
                                    Optimizar
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-amber-400"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={svgInput}
                            onChange={(event) => setSvgInput(event.target.value)}
                            className="mt-3 min-h-[220px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 font-mono text-sm text-slate-100 outline-none focus:border-emerald-400"
                            placeholder='<svg viewBox="0 0 24 24">...</svg>'
                        />
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Resultado</p>
                                <p className="text-sm text-slate-300">SVG optimizado y listo para copiar.</p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100 transition hover:border-cyan-300"
                            >
                                Copiar
                            </button>
                        </div>
                        <textarea
                            value={optimizedSvg}
                            readOnly
                            className="mt-3 min-h-[220px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 font-mono text-xs text-slate-100 outline-none"
                            placeholder="El SVG optimizado aparecera aqui."
                        />
                        {stats && (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                                <span>Antes: {formatBytes(stats.before)}</span>
                                <span>Despues: {formatBytes(stats.after)}</span>
                                <span>Ahorro: {formatBytes(stats.savings)} ({stats.percent}%)</span>
                            </div>
                        )}
                        {error && (
                            <p className="mt-3 text-sm text-amber-200">{error}</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-sm text-slate-300 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Tips de optimizacion</p>
                        <ul className="mt-2 space-y-2">
                            <li>· Mantener viewBox permite escalar sin perder responsividad.</li>
                            <li>· SVGO elimina metadatos, ids innecesarios y espacios redundantes.</li>
                            <li>· Revisa accesibilidad: agrega title/desc si el SVG comunica algo.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}

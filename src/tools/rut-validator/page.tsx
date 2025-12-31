'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExplainButton } from '@/components/shared/ExplainButton';
import { RutValidationResult, calculateDV, formatRut, generateRandomRut, validateRut } from './utils';

type CopyState = 'idle' | 'copied' | 'error';
type FormatKey = 'pretty' | 'dashed' | 'compact';

const STATUS_STYLES = {
    valid: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    missing: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
    error: 'border-red-500/40 bg-red-500/10 text-red-100',
};

export default function RutValidatorPage() {
    const hasPrefilled = useRef(false);
    const [input, setInput] = useState<string>('12.345.678-5');
    const [validation, setValidation] = useState<RutValidationResult>(() => validateRut('12.345.678-5'));
    const [copyState, setCopyState] = useState<Record<FormatKey, CopyState>>({
        pretty: 'idle',
        dashed: 'idle',
        compact: 'idle',
    });

    const handleInputChange = useCallback((value: string) => {
        const cleaned = value.replace(/[^0-9kK.\-]/g, '');
        setInput(cleaned);
        setValidation(validateRut(cleaned));
    }, []);

    const handleCopy = async (key: FormatKey) => {
        const value = validation.formatted[key];
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            setCopyState((prev) => ({ ...prev, [key]: 'copied' }));
        } catch (err) {
            console.error('No se pudo copiar el RUT', err);
            setCopyState((prev) => ({ ...prev, [key]: 'error' }));
        } finally {
            setTimeout(() => setCopyState((prev) => ({ ...prev, [key]: 'idle' })), 1400);
        }
    };

    const handleAutoComplete = () => {
        if (!validation.body) return;
        const completed = formatRut(validation.body, validation.expectedDV, { withDots: true, withDash: true });
        setInput(completed);
        setValidation(validateRut(completed));
    };

    const handleGenerate = () => {
        const rut = generateRandomRut();
        setInput(rut.formatted.pretty);
        setValidation(validateRut(rut.formatted.pretty));
    };

    useEffect(() => {
        if (hasPrefilled.current) return;
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const incoming = params.get('value');
        if (!incoming) return;
        hasPrefilled.current = true;
        handleInputChange(incoming);
    }, [handleInputChange]);

    const statusTone = validation.isValid ? 'valid' : validation.missingDV ? 'missing' : 'error';

    const aiContext = useMemo(
        () =>
            [
                'Explica el algoritmo Módulo 11 para calcular el DV de un RUT chileno paso a paso.',
                `Cuerpo ingresado: ${validation.body || '(vacío)'}`,
                `DV provisto: ${validation.providedDV ?? '—'}`,
                `DV calculado: ${validation.expectedDV || '—'}`,
                validation.missingDV
                    ? 'El usuario no ingresó DV; sugiere auto-completarlo y muestra por qué es clave para evitar errores en bases de datos.'
                    : validation.isValid
                        ? 'El RUT es válido; refuerza cómo el DV garantiza integridad en inserts masivos y evita duplicados por typos.'
                        : 'El DV no coincide; explica cómo el Módulo 11 detecta inconsistencias y evita datos corruptos en almacenamiento.',
                'Enfócate en la importancia del DV para la consistencia de claves primarias y la detección temprana de errores humanos.',
            ].join('\n'),
        [validation.body, validation.expectedDV, validation.isValid, validation.missingDV, validation.providedDV]
    );

    const currentFormats = [
        { key: 'pretty' as const, label: '12.345.678-9', helper: 'Con puntos + guion' },
        { key: 'dashed' as const, label: '12345678-9', helper: 'Plano con guion' },
        { key: 'compact' as const, label: '12345678', helper: 'Solo cuerpo' },
    ];

    const validationDetails = [
        { label: 'Cuerpo detectado', value: validation.body || '—' },
        { label: 'DV provisto', value: validation.providedDV ?? 'Falta' },
        { label: 'DV calculado', value: validation.expectedDV || '—' },
        { label: 'Limpieza en vivo', value: validation.cleaned ? 'Caracteres no válidos removidos' : 'Pendiente de entrada' },
    ];

    return (
        <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-slate-900/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(244,114,182,0.16),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.16),transparent_38%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:52px_52px]" />
            </div>

            <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-500/25 bg-slate-950/70 px-5 py-4 shadow-[0_16px_70px_-40px_rgba(56,189,248,0.55)]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 p-2 shadow-[0_10px_50px_rgba(56,189,248,0.35)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15 3-3-3-3" /><path d="m9 15-3-3 3-3" /><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" /><path d="M19 21 5 21" /><path d="M9 9h1" /><path d="M9 13h1" /><path d="M14 9h1" /><path d="M14 13h1" /></svg>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">DevSwiss</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">RUT Validator</h1>
                            <p className="text-sm text-slate-300">Valida, formatea y genera RUTs con Módulo 11 y cero fricción.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-50/90">
                        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-medium">Validación local</span>
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-medium">Autocompletar DV</span>
                        <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 font-medium">Copiar en 1 clic</span>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)]">
                        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
                            <div className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[statusTone]}`}>
                                {validation.isValid ? 'RUT válido' : validation.missingDV ? 'DV faltante' : 'DV incorrecto'}
                            </div>
                            <p className="font-mono text-sm text-cyan-100">
                                {validation.cleaned ? validation.cleaned : '········'}
                            </p>
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={handleGenerate}
                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-400/50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9" /><path d="M3 9h6" /><path d="M21 12a9 9 0 0 1-9 9" /><path d="M21 15h-6" /><path d="M9 9v12" /><path d="M15 3v12" /></svg>
                                    Generar RUT válido
                                </button>
                                <ExplainButton toolName="RUT Validator" context={aiContext} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white">RUT chileno</label>
                            <input
                                value={input}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Ej: 12.345.678-9 o 12345678"
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-lg font-semibold tracking-wide text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
                            />
                            <p className="text-sm text-white/70">La entrada se limpia al vuelo (solo dígitos, puntos, guion y K).</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80 shadow-inner">
                            <p className="font-semibold text-white">Feedback</p>
                            <p className="mt-1 text-sm leading-relaxed">
                                {validation.message}
                                {validation.missingDV && validation.expectedDV && (
                                    <button
                                        onClick={handleAutoComplete}
                                        className="ml-2 inline-flex items-center gap-1 rounded-md border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-300/60"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                                        Autocompletar DV
                                    </button>
                                )}
                            </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {currentFormats.map(({ key, label, helper }) => (
                                <div
                                    key={key}
                                    className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.8)]"
                                >
                                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-cyan-200">
                                        <span>{label}</span>
                                        <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-100">{helper}</span>
                                    </div>
                                    <p className="font-mono text-lg font-semibold text-white">
                                        {validation.formatted[key] || '—'}
                                    </p>
                                    <button
                                        onClick={() => handleCopy(key)}
                                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                            copyState[key] === 'copied'
                                                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50'
                                                : copyState[key] === 'error'
                                                    ? 'border-red-400/60 bg-red-500/10 text-red-100'
                                                    : 'border-cyan-400/40 bg-cyan-500/10 text-cyan-50 hover:-translate-y-0.5 hover:border-cyan-300/60'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                        {copyState[key] === 'copied' ? 'Copiado' : copyState[key] === 'error' ? 'Error' : 'Copiar'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 text-sm text-cyan-50 shadow-[0_12px_60px_-35px_rgba(56,189,248,0.45)]">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-cyan-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M9 4v16" /><path d="M4 9h5" /><path d="M4 15h5" /></svg>
                                Cómo validamos
                            </div>
                            <ul className="mt-2 space-y-2 text-cyan-50/90">
                                <li>· Limpieza inteligente: quitamos caracteres no válidos y detectamos si falta el DV.</li>
                                <li>· Módulo 11 en TypeScript puro para calcular el DV esperado.</li>
                                <li>· Si el DV no coincide, resaltamos el error y proponemos el valor correcto.</li>
                                <li>· Botón de IA explica el algoritmo y su rol en la integridad de datos.</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/50 p-5 text-sm text-white/80 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.7)]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    Estado actual
                                </div>
                                {!validation.missingDV && (
                                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                                        Módulo 11 listo
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 grid gap-2">
                                {validationDetails.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                                    >
                                        <span className="text-xs uppercase tracking-wide text-white/60">{item.label}</span>
                                        <span className="font-semibold text-white">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <p className="text-xs uppercase tracking-wide text-white/60">Ejemplo rápido</p>
                                <p className="mt-1 font-mono text-sm text-white">
                                    {formatRut('20483965', calculateDV('20483965'), { withDots: true, withDash: true })}
                                </p>
                                <p className="text-xs text-white/60">Siempre validado localmente con el mismo algoritmo.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

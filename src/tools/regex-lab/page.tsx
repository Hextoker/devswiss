'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RegexVisualizer, RegexMatch } from './RegexVisualizer';
import { ExplainButton } from '@/components/shared/ExplainButton';
import { useAIExplain } from '@/hooks/useAIExplain';

type Flags = {
    g: boolean;
    i: boolean;
    m: boolean;
};

type Preset = {
    name: string;
    pattern: string;
    description: string;
    sample: string;
    flags?: Partial<Flags>;
};

const presets: Preset[] = [
    {
        name: 'Email',
        pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
        description: 'Correos estándar con TLD de 2+ letras.',
        sample: 'soporte@devswiss.com\nventas@tu-negocio.io\nuser.name+tag@empresa.co',
        flags: { i: true, g: true, m: false },
    },
    {
        name: 'URL',
        pattern: '^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w-./?%&=]*)?$',
        description: 'http/https opcional, dominio y ruta básica.',
        sample: 'https://devswiss.com\nhttp://sub.dominio.io/docs?ok=1\nwww.ejemplo.org/blog',
        flags: { g: true, i: true },
    },
    {
        name: 'Password fuerte',
        pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]:\";\'>?<.,]).{12,}$',
        description: '12+ caracteres con mayúscula, minúscula, dígito y símbolo.',
        sample: 'DevSwiss#2024!!\nFortaleza123!\nClaveMuySegura$99',
        flags: { g: false },
    },
    {
        name: 'Fecha (YYYY-MM-DD)',
        pattern: '^(?:19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
        description: 'Formato ISO básico con mes y día validados.',
        sample: '2024-03-15\n1999-12-01\n2020-02-30',
        flags: { g: true },
    },
];

const defaultText = `Números de ejemplo:
2024-03-15
ventas@devswiss.com
https://devswiss.com/tools
ClaveMuySegura$99`;

export default function RegexLabPage() {
    const hasPrefilled = useRef(false);
    const [pattern, setPattern] = useState<string>(presets[0].pattern);
    const [testText, setTestText] = useState<string>(defaultText);
    const [flags, setFlags] = useState<Flags>({ g: true, i: true, m: false });
    const [prompt, setPrompt] = useState('');
    const [aiNote, setAiNote] = useState('');

    const { generatePattern, generating, error: aiError } = useAIExplain();

    const flagsString = useMemo(
        () => `${flags.g ? 'g' : ''}${flags.i ? 'i' : ''}${flags.m ? 'm' : ''}`,
        [flags]
    );

    const { matches, regexError } = useMemo(() => {
        if (!pattern.trim()) return { matches: [] as RegexMatch[], regexError: 'Escribe una RegEx para comenzar.' };

        try {
            const regex = new RegExp(pattern, flagsString || undefined);
            const results: RegexMatch[] = [];
            let iterations = 0;
            let execResult: RegExpExecArray | null;

            if (flags.g) {
                while ((execResult = regex.exec(testText)) !== null) {
                    iterations += 1;
                    const value = execResult[0];
                    results.push({
                        value,
                        index: execResult.index ?? 0,
                        end: (execResult.index ?? 0) + value.length,
                        groups: execResult.length > 1 ? execResult.slice(1) : [],
                        namedGroups: execResult.groups || undefined,
                    });
                    if (value === '') regex.lastIndex += 1;
                    if (iterations > 2000) break; // safety guard
                }
            } else {
                execResult = regex.exec(testText);
                if (execResult) {
                    const value = execResult[0];
                    results.push({
                        value,
                        index: execResult.index ?? 0,
                        end: (execResult.index ?? 0) + value.length,
                        groups: execResult.length > 1 ? execResult.slice(1) : [],
                        namedGroups: execResult.groups || undefined,
                    });
                }
            }

            return { matches: results, regexError: null as string | null };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Patrón inválido.';
            return { matches: [] as RegexMatch[], regexError: message };
        }
    }, [pattern, flagsString, flags.g, testText]);

    const firstMatch = matches[0];
    const groupDetails = useMemo(() => {
        const details: { label: string; value: string }[] = [];
        if (!firstMatch) return details;

        if (firstMatch.namedGroups) {
            Object.entries(firstMatch.namedGroups).forEach(([key, value]) =>
                details.push({ label: `Grupo "${key}"`, value: value ?? '—' })
            );
        }

        firstMatch.groups.forEach((value, idx) => {
            details.push({ label: `Grupo ${idx + 1}`, value: value || '—' });
        });

        if (details.length === 0) {
            details.push({ label: 'Sin capturas', value: 'No se detectaron grupos en la primera coincidencia.' });
        }

        return details;
    }, [firstMatch]);

    const explainContext = useMemo(
        () =>
            [
                `RegExp: /${pattern}/${flagsString || '∅'}`,
                'Texto de prueba:',
                testText.slice(0, 320),
            ].join('\n'),
        [pattern, flagsString, testText]
    );

    const handleToggleFlag = (flag: keyof Flags) => {
        setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
    };

    const handleApplyPreset = (preset: Preset) => {
        setPattern(preset.pattern);
        setTestText(preset.sample);
        if (preset.flags) {
            setFlags((prev) => ({ ...prev, ...preset.flags }));
        }
    };

    const handleGenerate = async () => {
        setAiNote('');
        if (!prompt.trim()) {
            setAiNote('Describe la intención: ej. "Validar un correo corporativo con dominio propio".');
            return;
        }

        const suggestion = await generatePattern({ toolName: 'Regex Lab', content: prompt });
        if (suggestion) {
            setPattern(suggestion);
            setAiNote('Patrón propuesto aplicado. Ajusta lo que necesites y pruébalo en el texto.');
        }
    };

    useEffect(() => {
        if (hasPrefilled.current) return;
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams(window.location.search);
        const incomingPattern = params.get('pattern');
        const incomingTest = params.get('test');
        const incomingFlags = params.get('flags');

        if (!incomingPattern && !incomingTest && !incomingFlags) return;

        if (incomingPattern) setPattern(incomingPattern);
        if (incomingTest) setTestText(incomingTest);
        if (incomingFlags) {
            setFlags({
                g: incomingFlags.includes('g'),
                i: incomingFlags.includes('i'),
                m: incomingFlags.includes('m'),
            });
        }

        hasPrefilled.current = true;
    }, []);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-cyan-500 via-emerald-500 to-blue-500 p-2 shadow-lg shadow-cyan-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3H7v18h10V3Z" /><path d="M14 7h-4" /><path d="M9 15h2" /><path d="M9 11h6" /><path d="M9 19h6" /></svg>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">DevSwiss</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Regex Lab</h1>
                            <p className="text-sm text-slate-400">Resalta, genera y explica patrones con retroalimentación inmediata.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-medium">
                            Visualización en tiempo real
                        </span>
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-medium">
                            IA generadora + educativa
                        </span>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
                    <section className="space-y-4">
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                                    <span className="text-sm text-slate-500">/</span>
                                    <input
                                        value={pattern}
                                        onChange={(e) => setPattern(e.target.value)}
                                        spellCheck={false}
                                        className="w-full bg-transparent text-base font-semibold tracking-tight text-white outline-none placeholder:text-slate-600"
                                        placeholder="^\\w+@tu-dominio\\.com$"
                                    />
                                    <span className="text-sm text-slate-500">/{flagsString || ' '}</span>
                                </div>
                                <ExplainButton toolName="Regex Lab" context={explainContext} />
                            </div>

                            <div className="mt-4 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        <span>Flags</span>
                                        <span className="text-slate-500">g / i / m</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {(['g', 'i', 'm'] as (keyof Flags)[]).map((flag) => (
                                            <label
                                                key={flag}
                                                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                                                    flags[flag]
                                                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                                                        : 'border-slate-700 bg-slate-900 text-slate-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={flags[flag]}
                                                    onChange={() => handleToggleFlag(flag)}
                                                    className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-emerald-400 focus:ring-emerald-400"
                                                />
                                                {flag === 'g' ? 'global' : flag === 'i' ? 'insensible' : 'multilínea'}
                                            </label>
                                        ))}
                                    </div>
                                    {regexError ? (
                                        <p className="text-sm font-medium text-amber-300">Patrón inválido: {regexError}</p>
                                    ) : (
                                        <p className="text-sm text-slate-400">
                                            {matches.length > 0
                                                ? `${matches.length} coincidencia${matches.length !== 1 ? 's' : ''} detectada${matches.length !== 1 ? 's' : ''}.`
                                                : 'Sin coincidencias aún. Ajusta el patrón o pega más texto.'}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        <span>Generar con IA</span>
                                        {generating && (
                                            <span className="inline-flex items-center gap-1 text-emerald-300">
                                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                                                Pensando...
                                            </span>
                                        )}
                                    </div>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        className="min-h-[104px] w-full resize-none rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
                                        placeholder='Ej. "Necesito validar un correo corporativo @miempresa.com" o "Regex para tarjetas Visa y Mastercard".'
                                    />
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <button
                                            onClick={handleGenerate}
                                            disabled={generating}
                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/50 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/25 disabled:opacity-60"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                            Crear RegEx
                                        </button>
                                        <p className="text-xs text-slate-400">Describe tu regla y la IA propone el patrón base.</p>
                                    </div>
                                    {(aiNote || aiError) && (
                                        <p
                                            className={`text-sm ${
                                                aiError ? 'text-amber-300' : 'text-emerald-200'
                                            }`}
                                        >
                                            {aiError || aiNote}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Área de prueba</p>
                                    <p className="text-sm text-slate-300">
                                        Pega texto para ver coincidencias resaltadas al instante.
                                    </p>
                                </div>
                                <span className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                                    {testText.length} caracteres
                                </span>
                            </div>
                            <textarea
                                value={testText}
                                onChange={(e) => setTestText(e.target.value)}
                                spellCheck={false}
                                className="min-h-[180px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 font-mono text-sm leading-relaxed text-slate-100 outline-none focus:border-cyan-400"
                                placeholder="Pega logs, texto o payloads para probar tu expresión regular."
                            />
                            <RegexVisualizer text={testText} matches={matches} />
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <div className="flex items-center justify-between">
                                <div className="text-xs uppercase tracking-wide text-slate-500">Librería de presets</div>
                                <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold text-cyan-100">
                                    Patrones rápidos
                                </span>
                            </div>
                            <div className="mt-3 space-y-3">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => handleApplyPreset(preset)}
                                        className="w-full rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-900"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-white">{preset.name}</p>
                                            <span className="text-[11px] uppercase tracking-wide text-slate-500">Aplicar</span>
                                        </div>
                                        <p className="text-sm text-slate-400">{preset.description}</p>
                                        <p className="mt-2 font-mono text-xs text-slate-500">{preset.pattern}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Explicador estático</p>
                                    <p className="text-sm text-slate-300">Grupos capturados en la primera coincidencia.</p>
                                </div>
                                <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-400">
                                    {firstMatch ? 'Con coincidencias' : 'Sin coincidencias'}
                                </span>
                            </div>
                            <div className="mt-3 space-y-2">
                                {groupDetails.length ? (
                                    groupDetails.map((group, idx) => (
                                        <div
                                            key={`${group.label}-${idx}`}
                                            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
                                        >
                                            <p className="text-xs font-semibold text-slate-400">{group.label}</p>
                                            <p className="break-words font-mono text-sm text-slate-100">{group.value}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400">
                                        Capturaremos aquí los grupos (y grupos nombrados) del primer match.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Tips rápidos</p>
                            <ul className="mt-2 space-y-2 text-sm text-slate-300">
                                <li>· Usa ^ y $ para evitar coincidencias parciales en cada línea.</li>
                                <li>· Activa m (multilínea) para validar listas o logs completos.</li>
                                <li>· Combina lookaheads: (?=.*[A-Z])(?=.*\\d) para requisitos compuestos.</li>
                                <li>· El botón &quot;Explicar con IA&quot; desglosa tokens como \\d, \\b, ?= y cuantificadores.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

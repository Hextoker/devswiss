'use client';

import React, { useMemo, useState } from 'react';
import { ExplainButton } from '@/components/shared/ExplainButton';
import { CronParseResult, NextRuns, describeCron, parseCronExpression } from './NextRuns';

type CronFieldKey = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek';

const FIELD_CONFIG: Record<
    CronFieldKey,
    {
        label: string;
        placeholder: string;
        helper: string;
    }
> = {
    minute: { label: 'Minuto', placeholder: '*/5', helper: '0-59 · admite rangos (10-30) e intervalos (*/15)' },
    hour: { label: 'Hora', placeholder: '0', helper: '0-23 · soporta listas (8,14,20)' },
    dayOfMonth: { label: 'Día del mes', placeholder: '*', helper: '1-31 · usa */2 para días alternos' },
    month: { label: 'Mes', placeholder: '*', helper: '1-12 · 1=enero, 12=diciembre' },
    dayOfWeek: { label: 'Día de la semana', placeholder: '1-5', helper: '0-6 · 0/7=domingo, 1=lunes' },
};

const PRESETS: { label: string; values: Record<CronFieldKey, string> }[] = [
    { label: 'Cada hora', values: { minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' } },
    { label: 'Cada 15 minutos', values: { minute: '*/15', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' } },
    { label: 'Lunes a medianoche', values: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '1' } },
    { label: 'Días laborables 09:30', values: { minute: '30', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' } },
    { label: 'Primero de mes 08:00', values: { minute: '0', hour: '8', dayOfMonth: '1', month: '*', dayOfWeek: '*' } },
];

const sanitize = (value: string) => value.replace(/[^\d*/,\-\s]/g, '').trim();

const buildAIContext = (expression: string, human: string, parseResult: CronParseResult) => {
    const lines = [
        `Expresión actual: ${expression || '(vacía)'}`,
        `Lectura humana: ${human}`,
        '',
        'Jerarquía de campos: minuto -> hora -> día del mes -> mes -> día de la semana.',
        'Ejemplos útiles:',
        '- Rangos: 1-5 significa del 1 al 5.',
        '- Intervalos: */15 es cada 15 unidades del campo.',
        '- Listas: 0,15,30,45 combina valores puntuales.',
    ];

    if (!parseResult.valid) {
        lines.push('', `Error detectado: ${parseResult.error}`, 'Sugerencia: revisa que haya 5 campos y que todos estén en rango.');
    }

    return lines.join('\n');
};

export default function CronPredictorPage() {
    const [fields, setFields] = useState<Record<CronFieldKey, string>>({
        minute: '0',
        hour: '22',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
    });
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

    const expression = useMemo(
        () => [fields.minute, fields.hour, fields.dayOfMonth, fields.month, fields.dayOfWeek].join(' ').trim(),
        [fields.dayOfMonth, fields.dayOfWeek, fields.hour, fields.minute, fields.month]
    );

    const parseResult = useMemo(() => parseCronExpression(expression), [expression]);
    const humanText = useMemo(() => describeCron(parseResult), [parseResult]);
    const aiContext = useMemo(() => buildAIContext(expression, humanText, parseResult), [expression, humanText, parseResult]);
    const isValid = parseResult.valid;

    const handleChange = (key: CronFieldKey, value: string) => {
        setFields((prev) => ({ ...prev, [key]: sanitize(value) || '' }));
    };

    const handlePreset = (values: Record<CronFieldKey, string>) => {
        setFields(values);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(expression || '');
            setCopyState('copied');
        } catch (err) {
            console.error('Error al copiar cron', err);
            setCopyState('error');
        } finally {
            setTimeout(() => setCopyState('idle'), 1800);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-zinc-900 bg-gradient-to-br from-slate-950 via-slate-950 to-black text-slate-50">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_30%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>

            <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-zinc-950/70 px-5 py-4 shadow-[0_20px_80px_-45px_rgba(16,185,129,0.6)]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-2 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l3 3" /></svg>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-emerald-400/70">DevSwiss</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Cron Predictor</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-emerald-200/80">
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-medium">Consola interactiva</span>
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-medium">Zero Friction</span>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-4">
                        <div className="rounded-2xl border border-emerald-500/25 bg-black/50 p-5 shadow-[0_20px_80px_-40px_rgba(16,185,129,0.5)]">
                            <div className="flex flex-wrap items-center gap-3 border-b border-emerald-500/20 pb-4">
                                <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${isValid ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border border-amber-400/40 bg-amber-500/10 text-amber-100'}`}>
                                    {isValid ? 'Expresión válida' : 'Expresión inválida'}
                                </div>
                                <p className="font-mono text-sm text-emerald-100">{expression || '· · · · ·'}</p>
                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition ${
                                            copyState === 'copied'
                                                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-50'
                                                : copyState === 'error'
                                                    ? 'border-red-400/60 bg-red-500/15 text-red-100'
                                                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100 hover:-translate-y-0.5 hover:border-emerald-400/60'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                        {copyState === 'copied' ? 'Copiado' : copyState === 'error' ? 'Error' : 'Copiar cron'}
                                    </button>
                                    <ExplainButton toolName="Cron Predictor" context={aiContext} />
                                </div>
                            </div>

                            <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm leading-relaxed text-emerald-100">
                                {humanText}
                                {!isValid && <span className="ml-2 text-amber-200 underline decoration-dotted">Pulsa "Explicar con IA" para ver cómo corregirlo.</span>}
                            </p>

                            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {(Object.keys(FIELD_CONFIG) as CronFieldKey[]).map((key) => (
                                    <div key={key} className="space-y-2 rounded-xl border border-emerald-500/20 bg-zinc-950/60 p-3">
                                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-emerald-300">
                                            <span>{FIELD_CONFIG[key].label}</span>
                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">Campo {key === 'dayOfWeek' ? '5' : key === 'month' ? '4' : key === 'dayOfMonth' ? '3' : key === 'hour' ? '2' : '1'}</span>
                                        </div>
                                        <input
                                            value={fields[key]}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            placeholder={FIELD_CONFIG[key].placeholder}
                                            className={`w-full rounded-lg border bg-black/60 px-3 py-2 font-mono text-sm text-emerald-50 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 ${
                                                isValid ? 'border-emerald-700/40' : 'border-amber-500/40'
                                            }`}
                                        />
                                        <p className="text-xs text-emerald-200/70">{FIELD_CONFIG[key].helper}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 7 8-4 8 4" /><path d="m4 17 8 4 8-4" /><path d="m4 12 8 4 8-4" /></svg>
                                    Presets rápidos
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {PRESETS.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => handlePreset(preset.values)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-400/60"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <NextRuns parseResult={parseResult} />

                        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-50">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-cyan-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="M5 12h14" /></svg>
                                Tips de uso
                            </div>
                            <ul className="mt-2 space-y-1 text-cyan-100/80">
                                <li>· La vista humana se recalcula mientras escribes para detectar errores tempranos.</li>
                                <li>· Si la expresión es inválida, usa el botón de IA para revisar jerarquía y ejemplos.</li>
                                <li>· Los presets están listos para flujos comunes de automatización sin fricción.</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-indigo-50">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-indigo-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6-4-4-4 4" /><path d="M12 2v20" /></svg>
                                Modo consola
                            </div>
                            <p className="mt-2 leading-relaxed text-indigo-100/80">
                                Pasa el cursor sobre los campos para resaltar bordes y mantenlos en formato corto. El diseño
                                tipo terminal prioriza contraste alto y feedback inmediato sin distracciones.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

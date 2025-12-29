'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PreviewCard } from './PreviewCard';
import { ExplainButton } from '@/components/shared/ExplainButton';

type CopyState = 'idle' | 'copied' | 'error';

interface ControlSliderProps {
    label: string;
    helper?: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    unit?: string;
    accent: string;
    onChange: (value: number) => void;
}

const ControlSlider: React.FC<ControlSliderProps> = ({
    label,
    helper,
    min,
    max,
    step = 1,
    value,
    unit = '',
    accent,
    onChange,
}) => {
    const progress = ((value - min) / (max - min)) * 100;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_45px_-25px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    {helper && <p className="text-xs text-white/70">{helper}</p>}
                </div>
                <span className="text-sm font-semibold text-cyan-100">
                    {value.toFixed(0)}
                    {unit}
                </span>
            </div>

            <div className="relative mt-4 h-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="h-2 w-full rounded-full bg-white/10" />
                </div>
                <motion.div
                    className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
                    style={{ background: accent }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 140, damping: 22 }}
                />
                <motion.div
                    className="absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border border-white/60 bg-white shadow-lg shadow-cyan-400/10"
                    style={{ left: `calc(${progress}% - 14px)` }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    aria-label={label}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 h-8 w-full cursor-pointer appearance-none opacity-0"
                />
            </div>
        </div>
    );
};

export default function GlassmorphismGeneratorPage() {
    const [blur, setBlur] = useState<number>(14);
    const [opacity, setOpacity] = useState<number>(72);
    const [saturation, setSaturation] = useState<number>(120);
    const [radius, setRadius] = useState<number>(18);
    const [copyState, setCopyState] = useState<CopyState>('idle');

    const cssSnippet = useMemo(
        () =>
            [
                '.glass-panel {',
                `  background: rgba(255, 255, 255, ${(opacity / 100).toFixed(2)});`,
                '  border: 1px solid rgba(255, 255, 255, 0.35);',
                '  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);',
                `  border-radius: ${radius}px;`,
                `  backdrop-filter: blur(${blur}px) saturate(${saturation}%);`,
                `  -webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);`,
                '}',
            ].join('\n'),
        [blur, opacity, saturation, radius]
    );

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(cssSnippet);
            setCopyState('copied');
        } catch (err) {
            console.error('Failed to copy CSS', err);
            setCopyState('error');
        } finally {
            setTimeout(() => setCopyState('idle'), 1500);
        }
    };

    const aiContext = useMemo(
        () =>
            [
                'Cómo se genera el efecto:',
                `- backdrop-filter: blur(${blur}px) + saturate(${saturation}%) sobre un contenedor translúcido.`,
                `- Opacidad base: ${(opacity / 100).toFixed(2)} para dejar ver el gradiente de fondo.`,
                `- Bordes suaves: radio de ${radius}px y un borde blanco translúcido.`,
                '',
                'CSS actual:',
                cssSnippet,
            ].join('\n'),
        [blur, opacity, saturation, radius, cssSnippet]
    );

    return (
        <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-slate-900/40 bg-slate-950 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),rgba(56,189,248,0)),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.3),rgba(236,72,153,0)),radial-gradient(circle_at_50%_80%,rgba(94,234,212,0.18),rgba(94,234,212,0))]" />
                <motion.div
                    className="absolute inset-10 rounded-[32px] border border-white/5"
                    animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.04)', '0 0 0 24px rgba(255,255,255,0)'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-purple-600 p-2 shadow-lg shadow-cyan-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 10.5 12 7l5 3.5" /><path d="M7 13.5 12 17l5-3.5" /></svg>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/60">DevSwiss</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">
                                Glassmorphism Generator
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/80">
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium">
                            Vista en tiempo real
                        </span>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium">
                            Export CSS 1 clic
                        </span>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="space-y-4">
                        <PreviewCard blur={blur} opacity={opacity} saturation={saturation} radius={radius} />
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80 backdrop-blur">
                            <p className="font-medium text-white">Tips rápidos</p>
                            <ul className="mt-2 space-y-1 text-white/70">
                                <li>· El desenfoque resalta el fondo; para fondos claros, sube la saturación.</li>
                                <li>· Mantén algo de opacidad (40-80%) para que el borde se note sin perder contraste.</li>
                                <li>· Añade un borde blanco translúcido y sombra profunda para separar la tarjeta.</li>
                            </ul>
                        </div>
                    </section>

                    <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
                        <p className="text-sm font-semibold text-white">Controles finos</p>
                        <div className="space-y-3">
                            <ControlSlider
                                label="Desenfoque"
                                helper="0 a 20px para el efecto frost."
                                min={0}
                                max={20}
                                value={blur}
                                unit="px"
                                accent="linear-gradient(90deg,#22d3ee,#a855f7)"
                                onChange={setBlur}
                            />
                            <ControlSlider
                                label="Opacidad"
                                helper="Transparencia del vidrio."
                                min={0}
                                max={100}
                                value={opacity}
                                unit="%"
                                accent="linear-gradient(90deg,#f472b6,#22d3ee)"
                                onChange={setOpacity}
                            />
                            <ControlSlider
                                label="Saturación"
                                helper="Compensa la pérdida de color."
                                min={0}
                                max={200}
                                value={saturation}
                                unit="%"
                                accent="linear-gradient(90deg,#34d399,#a855f7)"
                                onChange={setSaturation}
                            />
                            <ControlSlider
                                label="Radio de borde"
                                helper="Esquinas suaves."
                                min={0}
                                max={50}
                                value={radius}
                                unit="px"
                                accent="linear-gradient(90deg,#a855f7,#6366f1)"
                                onChange={setRadius}
                            />
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-cyan-50 shadow-inner">
                            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">{cssSnippet}</pre>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleCopy}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                    copyState === 'copied'
                                        ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                                        : copyState === 'error'
                                            ? 'border-red-400/60 bg-red-500/15 text-red-100'
                                            : 'border-white/20 bg-white/10 text-white hover:-translate-y-0.5 hover:border-white/40'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                {copyState === 'copied' ? 'CSS copiado' : copyState === 'error' ? 'Error al copiar' : 'Copiar CSS'}
                            </button>
                            <ExplainButton toolName="Glassmorphism Generator" context={aiContext} />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

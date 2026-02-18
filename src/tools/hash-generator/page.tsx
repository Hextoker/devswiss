'use client';

import React from 'react';
import { ExplainButton } from '@/components/shared/ExplainButton';
import { useHashGenerator } from '@/hooks/useHashGenerator';
import { SecurityLevel } from '@/utils/hashUtils';

const securityStyles: Record<SecurityLevel, { badge: string; dot: string }> = {
    alta: {
        badge: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100',
        dot: 'bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.18)]',
    },
    media: {
        badge: 'border-amber-400/50 bg-amber-500/10 text-amber-50',
        dot: 'bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.18)]',
    },
    baja: {
        badge: 'border-red-400/60 bg-red-500/10 text-red-100',
        dot: 'bg-red-400 shadow-[0_0_0_4px_rgba(248,113,113,0.2)]',
    },
};

export default function HashGeneratorPage() {
    const {
        algorithm,
        algorithms,
        selected,
        input,
        setInput,
        setAlgorithm,
        hashResult,
        loading,
        error,
        copyState,
        generateHash,
        randomizePassword,
        copyHash,
    } = useHashGenerator();

    const weakAlgorithm = selected.security === 'baja';

    const aiContext = [
        'Explica qué es una función de resumen criptográfica (hash) y por qué es unidireccional.',
        'Aclara que no se puede des-hashear una contraseña y que solo se compara contra hashes almacenados.',
        `Algoritmo actual: ${selected.label} (${selected.security}).`,
    ].join('\n');

    return (
        <div className="flex flex-col gap-6">
                <header className="cyber-panel cyber-border-green flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-400 to-blue-500 p-2 shadow-lg shadow-emerald-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 6v6c0 5 3.5 9.5 9 10 5.5-.5 9-5 9-10V6Z" /><path d="M12 2v20" /><path d="M7 6h10" /><path d="M7 12h10" /></svg>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">DevSwiss</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Hash Generator</h1>
                            <p className="text-sm text-slate-400">
                                Calcula hashes seguros (Argon2, Bcrypt, SHA) 100% en tu navegador. Sin envíos a servidores.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-100">
                            Client-side only
                        </span>
                        <span className="rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1 font-medium text-cyan-100">
                            Salt &amp; memoria anti-rainbow
                        </span>
                        <span className="rounded-full border border-purple-400/40 bg-purple-500/10 px-3 py-1 font-medium text-purple-100">
                            IA educativa
                        </span>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
                    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="text-xs uppercase tracking-wide text-slate-500">Algoritmo</label>
                                <select
                                    value={algorithm}
                                    onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}
                                    className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-slate-100 outline-none ring-0 transition hover:border-emerald-400/50"
                                >
                                    {algorithms.map((alg) => (
                                        <option key={alg.id} value={alg.id}>
                                            {alg.label}
                                        </option>
                                    ))}
                                </select>
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${securityStyles[selected.security].badge}`}
                                >
                                    <span className={`h-2.5 w-2.5 rounded-full ${securityStyles[selected.security].dot}`} />
                                    Seguridad: {selected.security === 'alta' ? 'Alta' : selected.security === 'media' ? 'Media' : 'Débil'}
                                </span>
                            </div>
                            <div className="ml-auto flex flex-wrap items-center gap-2">
                                <button
                                    onClick={randomizePassword}
                                    className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-300/80 hover:bg-cyan-500/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.41 7.41 8.83 8.83 10.25 7.41 8.83 6 7.41 7.41z" /><path d="M15.17 16.59 13.75 15.17 12.33 16.59 13.75 18 15.17 16.59z" /><path d="M14.12 3h-4.24L12 6.11 14.12 3z" /><path d="M14.12 21h-4.24L12 17.89 14.12 21z" /><path d="M3 9.88v4.24L6.11 12 3 9.88z" /><path d="M21 9.88v4.24L17.89 12 21 9.88z" /><path d="m19.07 4.93-2.12-2.12L14.83 4.93 17 7.05l2.07-2.12z" /><path d="m4.93 19.07 2.12 2.12 2.12-2.12L7.05 17 4.93 19.07z" /></svg>
                                    Generar nueva contraseña aleatoria
                                </button>
                                <button
                                    onClick={generateHash}
                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-300/80 hover:bg-emerald-500/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m12 6-4 6h8l-4 6" /></svg>
                                    {loading ? 'Calculando...' : 'Generar hash'}
                                </button>
                                <button
                                    onClick={copyHash}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                        copyState === 'copied'
                                            ? 'border-emerald-300/60 bg-emerald-500/15 text-emerald-50'
                                            : copyState === 'error'
                                                ? 'border-red-400/60 bg-red-500/10 text-red-100'
                                                : 'border-slate-700 bg-slate-900/60 text-slate-100 hover:-translate-y-0.5 hover:border-slate-500'
                                    }`}
                                    disabled={!hashResult?.hash}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                    {copyState === 'copied' ? 'Hash copiado' : copyState === 'error' ? 'Error al copiar' : 'Copiar hash'}
                                </button>
                            </div>
                        </div>

                        {weakAlgorithm && (
                            <div className="mx-4 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                <div className="flex items-center gap-2 font-semibold">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                                    Advertencia: algoritmo débil (solo demostrativo).
                                </div>
                                <p className="text-red-200">
                                    {selected.warning || 'MD5 es vulnerable a colisiones y tablas rainbow. No lo utilices para credenciales reales.'}
                                </p>
                            </div>
                        )}

                        <div className="grid gap-4 px-4 pb-4 lg:grid-cols-2">
                            <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-100">Contraseña a hashear</label>
                                    <span className="text-xs text-slate-500">{input.length} caracteres</span>
                                </div>
                                <input
                                    type="password"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateHash();
                                    }}
                                    placeholder="Escribe o pega tu contraseña. Se procesa localmente con salt y sin registros."
                                    className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm text-slate-50 outline-none ring-0 transition focus:border-emerald-400/60 focus:bg-slate-900"
                                />
                                <p className="text-xs text-slate-500">
                                    El input nunca sale del navegador. Cada algoritmo usa salt aleatorio (cuando aplica) para impedir rainbow tables.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900 to-slate-900/60 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-100">Hash generado</p>
                                    <span className="text-xs text-slate-500">{hashResult?.detail || 'Sin hash aún'}</span>
                                </div>
                                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                                    {loading ? (
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                                            Calculando con {selected.label}...
                                        </div>
                                    ) : hashResult?.hash ? (
                                        <div className="space-y-2">
                                            <p className="break-all font-mono text-xs leading-6 text-emerald-100">
                                                {hashResult.hash}
                                            </p>
                                            {hashResult.raw && (
                                                <p className="break-all font-mono text-[11px] text-slate-400">
                                                    Raw: {hashResult.raw}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Genera un hash para verlo aquí.</p>
                                    )}
                                </div>
                                {error ? (
                                    <p className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                                        {error}
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        Consejo: mantén bcrypt/argon2 con costos altos para passwords. SHA/MD5 son rápidos y útiles para integridad, no para guardar claves.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M3 12h18" /></svg>
                            Guía rápida
                        </div>
                        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                            <p className="font-semibold text-slate-100">{selected.label}</p>
                            <p className="text-slate-400">{selected.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-semibold ${securityStyles[selected.security].badge}`}>
                                    <span className={`h-2 w-2 rounded-full ${securityStyles[selected.security].dot}`} />
                                    Seguridad {selected.security}
                                </span>
                                <span className="h-4 w-px bg-slate-800" />
                                <span className="text-slate-400">{selected.note}</span>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                            <p className="font-semibold text-slate-100">Buenas prácticas</p>
                            <ul className="space-y-1 text-slate-400">
                                <li>• Usa Argon2/Bcrypt para passwords; ajusta costos según CPU del cliente.</li>
                                <li>• Nunca envíes la contraseña en texto plano. Aquí todo ocurre en tu navegador.</li>
                                <li>• Agrega pepper del lado servidor + hash lento para almacenamiento real.</li>
                                <li>• SHA/MD5 solo sirven para huellas o checksums rápidos.</li>
                            </ul>
                        </div>

                        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                            <p className="font-semibold text-slate-100">IA educativa</p>
                            <p className="text-slate-400">
                                Aprende por qué las funciones de resumen son unidireccionales y cómo se comparan los hashes en autenticación.
                            </p>
                            <ExplainButton toolName="Hash Generator" context={aiContext} />
                        </div>
                    </aside>
                </div>
        </div>
    );
}

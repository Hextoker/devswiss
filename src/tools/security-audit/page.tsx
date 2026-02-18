'use client';

import React, { useMemo, useState } from 'react';
import { useAIExplain } from '@/hooks/useAIExplain';

type HashType = 'bcrypt' | 'md5' | 'sha1' | 'argon2' | 'desconocido';
type SecurityLevel = 'inseguro' | 'aceptable' | 'excelente';

type DetectionResult = {
    type: HashType;
    label: string;
    detail: string;
    cost?: number;
};

type SecurityResult = {
    level: SecurityLevel;
    label: string;
    message: string;
};

const HASH_PATTERNS = {
    bcrypt: /^\$(2a|2b|2y)\$\d{2}\$[./A-Za-z0-9]{53}$/,
    md5: /^[a-fA-F0-9]{32}$/,
    sha1: /^[a-fA-F0-9]{40}$/,
    argon2: /^\$(argon2i|argon2id)\$.+/,
};

const SEMAFORO_STYLES: Record<
    SecurityLevel,
    {
        badge: string;
        dot: string;
        border: string;
        text: string;
    }
> = {
    inseguro: {
        badge: 'border-red-500/60 bg-red-500/10 text-red-100',
        dot: 'bg-red-400 shadow-[0_0_0_6px_rgba(248,113,113,0.25)]',
        border: 'border-red-500/50',
        text: 'text-red-100',
    },
    aceptable: {
        badge: 'border-amber-400/60 bg-amber-500/10 text-amber-50',
        dot: 'bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.25)]',
        border: 'border-amber-400/50',
        text: 'text-amber-50',
    },
    excelente: {
        badge: 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100',
        dot: 'bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.25)]',
        border: 'border-emerald-400/60',
        text: 'text-emerald-100',
    },
};

const detectionBadges: { label: string; regex: string }[] = [
    { label: 'Bcrypt', regex: '^(\\$2a|\\$2b|\\$2y)\\$' },
    { label: 'MD5', regex: '32 hex' },
    { label: 'SHA-1', regex: '40 hex' },
    { label: 'Argon2', regex: '^\\$argon2(i|id)\\$' },
];

const detectHash = (value: string): DetectionResult => {
    const hash = value.trim();

    if (!hash) {
        return { type: 'desconocido', label: 'Sin hash', detail: 'Pega un hash para auditarlo.' };
    }

    if (HASH_PATTERNS.bcrypt.test(hash)) {
        const costMatch = hash.match(/^\$(?:2a|2b|2y)\$(\d{2})\$/);
        const cost = costMatch ? Number(costMatch[1]) : undefined;
        return {
            type: 'bcrypt',
            label: 'Bcrypt',
            detail: `Prefijo $2a/$2b/$2y detectado con coste ${cost ?? 'desconocido'} (60 caracteres).`,
            cost,
        };
    }

    if (HASH_PATTERNS.argon2.test(hash)) {
        const variant = hash.startsWith('$argon2id$') ? 'Argon2id' : 'Argon2i';
        return {
            type: 'argon2',
            label: variant,
            detail: `${variant} detectado. Incluye parámetros t/p/m en el propio hash.`,
        };
    }

    if (HASH_PATTERNS.md5.test(hash)) {
        return {
            type: 'md5',
            label: 'MD5',
            detail: '32 caracteres hexadecimales (huella corta). Vulnerable a colisiones.',
        };
    }

    if (HASH_PATTERNS.sha1.test(hash)) {
        return {
            type: 'sha1',
            label: 'SHA-1',
            detail: '40 caracteres hexadecimales. Colisiones prácticas desde 2017.',
        };
    }

    return {
        type: 'desconocido',
        label: 'No reconocido',
        detail: 'No coincide con los patrones de Bcrypt, Argon2, MD5 o SHA-1.',
    };
};

const evaluateSecurity = (detection: DetectionResult): SecurityResult => {
    switch (detection.type) {
        case 'md5':
            return {
                level: 'inseguro',
                label: 'Rojo · Inseguro',
                message: 'MD5 es vulnerable a colisiones y tablas rainbow. Úsalo solo para checksums no críticos.',
            };
        case 'sha1':
            return {
                level: 'inseguro',
                label: 'Rojo · Inseguro',
                message: 'SHA-1 tiene colisiones conocidas. No es apto para credenciales ni firmas en 2025.',
            };
        case 'bcrypt': {
            const cost = detection.cost ?? 0;
            if (cost >= 12) {
                return {
                    level: 'excelente',
                    label: 'Verde · Excelente',
                    message: `Bcrypt con coste ${cost} frena fuerza bruta. Mantén valores de 12-14 para usuarios reales.`,
                };
            }
            if (cost >= 10) {
                return {
                    level: 'aceptable',
                    label: 'Amarillo · Aceptable',
                    message: `Bcrypt con coste ${cost}. Considera subir a 12+ para hardware actual.`,
                };
            }
            return {
                level: 'inseguro',
                label: 'Rojo · Inseguro',
                message: `Bcrypt con coste ${cost || '?'} es bajo. Aumenta el factor de trabajo antes de producción.`,
            };
        }
        case 'argon2':
            return {
                level: 'excelente',
                label: 'Verde · Excelente',
                message: 'Argon2id recomendado por OWASP. Ajusta memoria y tiempo según tu plataforma.',
            };
        default:
            return {
                level: 'aceptable',
                label: 'Amarillo · Aceptable',
                message: 'Tipo no reconocido. Verifica que el hash esté completo y comparte solo para análisis estructural.',
            };
    }
};

export default function SecurityAuditPage() {
    const [hashInput, setHashInput] = useState('');
    const [aiNote, setAiNote] = useState('');

    const { explanation, loading, error, explain } = useAIExplain();

    const detection = useMemo(() => detectHash(hashInput), [hashInput]);
    const security = useMemo(() => evaluateSecurity(detection), [detection]);

    const aiPrompt = useMemo(
        () =>
            [
                'Analiza este hash. Identifica si es vulnerable a ataques de fuerza bruta o colisiones en 2025.',
                'Explica al administrador qué tan seguro es y, si es obsoleto, recomienda el estándar actual de la industria para el framework que use el usuario (Node, PHP, Python, etc.).',
                `Hash recibido (solo para análisis de estructura, nunca para credenciales): ${hashInput.trim() || '[vacío]'}`,
                `Tipo detectado: ${detection.label}`,
                `Lectura local: ${security.label} — ${security.message}`,
            ].join('\n'),
        [hashInput, detection.label, security.label, security.message]
    );

    const handleAudit = async () => {
        setAiNote('');
        if (!hashInput.trim()) {
            setAiNote('Pega un hash antes de auditar con IA.');
            return;
        }

        await explain({ toolName: 'Hash Auditor', content: aiPrompt });
        setAiNote('Auditoría enviada. Revisa el veredicto y las mejores prácticas abajo.');
    };

    return (
        <div className="flex flex-col gap-6">
                <header className="cyber-panel cyber-border-green flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 via-amber-500 to-red-500 p-2 shadow-lg shadow-emerald-500/25">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 10 4-4" /><path d="m12 10-4-4" /><path d="m12 14 4 4" /><path d="m12 14-4 4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4 12h2" /><path d="M18 12h2" /><circle cx="12" cy="12" r="6" /></svg>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">DevSwiss</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Auditoría de Hashes</h1>
                            <p className="text-sm text-slate-400">
                                Identifica el algoritmo, evalúa su seguridad y obtén un veredicto asistido por IA.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-100">
                            Detección por Regex
                        </span>
                        <span className="rounded-full border border-amber-400/50 bg-amber-500/10 px-3 py-1 font-medium text-amber-100">
                            Semáforo de riesgo
                        </span>
                        <span className="rounded-full border border-cyan-400/50 bg-cyan-500/10 px-3 py-1 font-medium text-cyan-100">
                            Auditoría con IA
                        </span>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_0.95fr]">
                    <section className="space-y-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/70 p-5 shadow-[0_16px_70px_-50px_rgba(0,0,0,0.85)]">
                        <div className="flex flex-wrap items-start gap-4 border-b border-slate-800 pb-4">
                            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${SEMAFORO_STYLES[security.level].badge}`}>
                                <span className={`h-2.5 w-2.5 rounded-full ${SEMAFORO_STYLES[security.level].dot}`} />
                                Semáforo: {security.label}
                            </div>
                            <div className="flex flex-col text-sm text-slate-300">
                                <span className="font-semibold text-slate-100">Algoritmo detectado:</span>
                                <span className="text-emerald-100">{detection.label}</span>
                                <span className="text-slate-400">{detection.detail}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center justify-between text-sm font-semibold text-slate-200">
                                Hash a evaluar
                                <span className="text-xs text-slate-500">Procesado 100% en cliente</span>
                            </label>
                            <textarea
                                value={hashInput}
                                onChange={(e) => setHashInput(e.target.value)}
                                placeholder="Pega aquí un hash ($2b$..., $argon2id$..., 32/40 hex)."
                                className="h-32 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 font-mono text-sm text-slate-100 outline-none ring-0 transition focus:border-emerald-400/60 focus:bg-slate-900"
                            />
                            <p className="text-xs text-slate-500">
                                No se envían contraseñas en claro. Solo se analiza la estructura del hash y su resistencia frente a
                                2025.
                            </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className={`rounded-xl border ${SEMAFORO_STYLES[security.level].border} bg-slate-900/70 p-4`}>
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                                    <span className={`h-2.5 w-2.5 rounded-full ${SEMAFORO_STYLES[security.level].dot}`} />
                                    Estado local
                                </div>
                                <p className="mt-2 text-sm text-slate-200">{security.message}</p>
                                <ul className="mt-3 space-y-1 text-xs text-slate-400">
                                    <li>· Bcrypt usa factor de coste (work factor) para frenar fuerza bruta.</li>
                                    <li>· Argon2i/Argon2id permite tunear memoria/tiempo contra GPUs.</li>
                                    <li>· MD5/SHA-1 son rápidos y vulnerables a colisiones en 2025.</li>
                                </ul>
                            </div>

                            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="m12 14 4-4" /><path d="m12 18 8-8" /><path d="M21 7V3h-4" /><path d="M3 4l7.86 7.86" /><circle cx="12" cy="12" r="10" /></svg>
                                    Reglas de identificación (Regex)
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {detectionBadges.map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
                                        >
                                            <span className="font-semibold text-slate-100">{item.label}</span>
                                            <span className="inline-flex w-fit items-center rounded-md bg-slate-800 px-2 py-1 text-[11px] font-mono text-slate-300">
                                                {item.regex}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    Los patrones se aplican en el navegador. Ajusta prefijos, longitud y prefijos hex para
                                    detectar variantes.
                                </p>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-5 shadow-[0_16px_70px_-50px_rgba(0,0,0,0.85)]">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase tracking-wide text-slate-500">IA</span>
                                    <div className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                                        Auditar con IA
                                    </div>
                                </div>
                                <button
                                    onClick={handleAudit}
                                    className="ml-auto inline-flex items-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-300/80 hover:bg-emerald-500/20"
                                >
                                    {loading ? (
                                        <>
                                            <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                                            Auditando...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                                            Auditar con IA
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-400">
                                <p className="font-semibold text-slate-200">Prompt enviado</p>
                                <p className="mt-1 whitespace-pre-line leading-relaxed">{aiPrompt}</p>
                            </div>

                            {aiNote && <p className="mt-2 text-xs text-amber-200">{aiNote}</p>}
                            {error && (
                                <p className="mt-2 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-50">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H3" /><path d="M18 8H6" /><path d="M19 12H9" /><path d="m15 16-2 2-2-2" /><path d="M9 12h.01" /><path d="M4 20h16" /></svg>
                                Veredicto y mejores prácticas (IA)
                            </div>
                            {loading ? (
                                <div className="mt-3 flex items-center gap-2 text-emerald-100">
                                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                                    Procesando recomendaciones...
                                </div>
                            ) : explanation ? (
                                <p className="mt-3 whitespace-pre-line leading-relaxed text-emerald-50">{explanation}</p>
                            ) : (
                                <p className="mt-3 text-emerald-100/80">
                                    Pulsa &quot;Auditar con IA&quot; para recibir una lectura guiada del hash, riesgos y qué algoritmo
                                    usar en tu framework (Node, PHP, Python, etc.).
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/70 p-4 text-sm text-zinc-100">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18" /><path d="M12 3v18" /></svg>
                                Notas rápidas
                            </div>
                            <ul className="mt-2 space-y-1 text-slate-300">
                                <li>· Evita exponer el hash completo en logs públicos o tickets.</li>
                                <li>· Si detectas MD5/SHA-1, migra a Argon2id o Bcrypt con factor alto.</li>
                                <li>· Para integridad de archivos, usa SHA-256/512; para passwords, Argon2/Bcrypt/PBKDF2.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
        </div>
    );
}

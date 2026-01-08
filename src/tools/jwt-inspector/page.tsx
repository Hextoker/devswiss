'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAIExplain } from '@/hooks/useAIExplain';

type DecodeSegment = {
    raw: string;
    text: string | null;
    json: Record<string, unknown> | null;
    error: string | null;
};

type ClaimStatus = 'ok' | 'warn' | 'error';

type ClaimDetail = {
    key: string;
    label: string;
    value: string;
    description: string;
    status: ClaimStatus;
    helper: string;
};

const STANDARD_CLAIMS = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];
const TIMESTAMP_CLAIMS = new Set(['exp', 'nbf', 'iat']);
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

const claimMeta: Record<string, { label: string; description: string }> = {
    iss: { label: 'iss', description: 'Emisor (issuer)' },
    sub: { label: 'sub', description: 'Sujeto (subject)' },
    aud: { label: 'aud', description: 'Audiencia (audience)' },
    exp: { label: 'exp', description: 'Expiracion (expiration)' },
    nbf: { label: 'nbf', description: 'No antes de (not before)' },
    iat: { label: 'iat', description: 'Emitido en (issued at)' },
    jti: { label: 'jti', description: 'Identificador unico (JWT ID)' },
};

const encodeBase64Url = (value: string) => {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const decodeBase64Url = (value: string) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    const padded = padding === 0 ? normalized : normalized + '='.repeat(4 - padding);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
};

const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value, null, 2);
};

const parseJson = (value: string) => {
    try {
        return { json: JSON.parse(value) as Record<string, unknown>, error: null };
    } catch (err) {
        return { json: null, error: 'JSON invalido' };
    }
};

const decodeSegment = (segment: string): DecodeSegment => {
    if (!segment) {
        return { raw: '', text: null, json: null, error: 'Segmento vacio' };
    }
    if (!BASE64URL_PATTERN.test(segment)) {
        return { raw: segment, text: null, json: null, error: 'Caracteres invalidos en Base64URL' };
    }
    try {
        const text = decodeBase64Url(segment);
        const { json, error } = parseJson(text);
        return { raw: segment, text, json, error };
    } catch (err) {
        return { raw: segment, text: null, json: null, error: 'No se pudo decodificar' };
    }
};

const toTimestamp = (value: unknown) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
        return Number(value);
    }
    return null;
};

const formatTimestamp = (value: number | null) => {
    if (value === null) return 'Timestamp invalido';
    const date = new Date(value * 1000);
    if (Number.isNaN(date.getTime())) return 'Timestamp invalido';
    return date.toLocaleString();
};

const buildClaimDetails = (payload: Record<string, unknown> | null) => {
    if (!payload) return [] as ClaimDetail[];
    const now = Date.now() / 1000;

    return STANDARD_CLAIMS.filter((claim) => claim in payload).map((claim) => {
        const rawValue = payload[claim];
        const meta = claimMeta[claim];
        let status: ClaimStatus = 'ok';
        let helper = '';
        let value = formatValue(rawValue);

        if (TIMESTAMP_CLAIMS.has(claim)) {
            const timestamp = toTimestamp(rawValue);
            const readable = formatTimestamp(timestamp);
            value = `${value} (${readable})`;

            if (timestamp === null) {
                status = 'error';
                helper = 'Timestamp no valido';
            } else if (claim === 'exp') {
                if (timestamp <= now) {
                    status = 'error';
                    helper = 'Token expirado';
                } else {
                    helper = 'Token aun vigente';
                }
            } else if (claim === 'nbf') {
                if (timestamp > now) {
                    status = 'warn';
                    helper = 'Todavia no es valido';
                } else {
                    helper = 'Ya es valido';
                }
            } else if (claim === 'iat') {
                if (timestamp > now + 60) {
                    status = 'warn';
                    helper = 'Emision en el futuro';
                } else {
                    helper = 'Fecha de emision coherente';
                }
            }
        }

        return {
            key: claim,
            label: meta.label,
            description: meta.description,
            value,
            status,
            helper,
        };
    });
};

const getSegmentPreview = (segment: DecodeSegment, fallback: string) => {
    if (segment.json) return JSON.stringify(segment.json, null, 2);
    if (segment.text) return segment.text;
    if (segment.error) return segment.error;
    return fallback;
};

const sampleToken = (() => {
    const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = encodeBase64Url(
        JSON.stringify({
            sub: '1234567890',
            name: 'Ada Lovelace',
            role: 'admin',
            iat: 1700000000,
            exp: 1893456000,
        })
    );
    const signature = encodeBase64Url('demo-signature');
    return `${header}.${payload}.${signature}`;
})();

export default function JWTInspectorPage() {
    const hasPrefilled = useRef(false);
    const [tokenInput, setTokenInput] = useState('');
    const [aiNote, setAiNote] = useState('');
    const { explanation, loading, error, explain } = useAIExplain();

    useEffect(() => {
        if (hasPrefilled.current) return;
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (!token) return;
        hasPrefilled.current = true;
        setTokenInput(token);
    }, []);

    const decoded = useMemo(() => {
        const trimmed = tokenInput.trim();
        if (!trimmed) {
            return {
                empty: true,
                error: null,
                parts: [] as string[],
                header: null as DecodeSegment | null,
                payload: null as DecodeSegment | null,
                signature: '',
            };
        }
        const parts = trimmed.split('.');
        if (parts.length !== 3) {
            return {
                empty: false,
                error: 'Un JWT valido contiene 3 segmentos separados por punto.',
                parts,
                header: null,
                payload: null,
                signature: '',
            };
        }
        const [headerRaw, payloadRaw, signature] = parts;
        return {
            empty: false,
            error: null,
            parts,
            header: decodeSegment(headerRaw),
            payload: decodeSegment(payloadRaw),
            signature,
        };
    }, [tokenInput]);

    const headerJson = decoded.header?.json ?? null;
    const payloadJson = decoded.payload?.json ?? null;
    const algorithm = typeof headerJson?.alg === 'string' ? headerJson.alg : 'desconocido';
    const isAlgNone = algorithm.toLowerCase() === 'none';
    const signatureEmpty = !decoded.signature;

    const claimDetails = useMemo(() => buildClaimDetails(payloadJson), [payloadJson]);
    const customClaims = useMemo(() => {
        if (!payloadJson) return [] as string[];
        return Object.keys(payloadJson).filter((key) => !STANDARD_CLAIMS.includes(key));
    }, [payloadJson]);

    const warnings = useMemo(() => {
        const list: string[] = [];
        if (!tokenInput.trim()) return list;
        if (decoded.error) list.push(decoded.error);
        if (isAlgNone) list.push('Algoritmo "none" detectado (sin firma).');
        if (signatureEmpty) list.push('Firma vacia o ausente.');
        if (payloadJson && !('exp' in payloadJson)) list.push('No se detecta exp (expiracion).');
        if (payloadJson && !('iat' in payloadJson)) list.push('No se detecta iat (emision).');
        return list;
    }, [decoded.error, isAlgNone, payloadJson, signatureEmpty, tokenInput]);

    const auditPrompt = useMemo(() => {
        const headerText = headerJson ? JSON.stringify(headerJson, null, 2) : 'No disponible';
        const payloadText = payloadJson ? JSON.stringify(payloadJson, null, 2) : 'No disponible';
        return [
            'Analiza el JWT siguiente de forma educativa.',
            'Explica los claims estandar y los personalizados, y advierte sobre configuraciones inseguras.',
            'Se deben resaltar riesgos como alg=none, expiracion faltante, o firma ausente.',
            '',
            `Header:\n${headerText}`,
            '',
            `Payload:\n${payloadText}`,
            '',
            `Firma: ${decoded.signature ? `${decoded.signature.length} caracteres Base64URL` : 'ausente'}`,
            `Claims personalizados: ${customClaims.length ? customClaims.join(', ') : 'ninguno'}`,
        ].join('\n');
    }, [customClaims, decoded.signature, headerJson, payloadJson]);

    const handleAudit = async () => {
        setAiNote('');
        if (!tokenInput.trim()) {
            setAiNote('Pega un JWT antes de ejecutar la auditoria.');
            return;
        }
        await explain({ toolName: 'JWT Debugger', content: auditPrompt });
        setAiNote('Auditoria generada. Revisa las observaciones abajo.');
    };

    const handleSample = () => {
        setTokenInput(sampleToken);
    };

    const handleClear = () => {
        setTokenInput('');
    };

    const segmentStyles = {
        header: {
            border: 'border-cyan-400/40',
            badge: 'bg-cyan-500/15 text-cyan-100',
            title: 'Header',
        },
        payload: {
            border: 'border-emerald-400/40',
            badge: 'bg-emerald-500/15 text-emerald-100',
            title: 'Payload',
        },
        signature: {
            border: 'border-amber-400/40',
            badge: 'bg-amber-500/15 text-amber-100',
            title: 'Signature',
        },
    };

    return (
        <React.Fragment>
            <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 px-5 py-4 shadow-[0_10px_60px_-35px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 shadow-lg shadow-emerald-500/30">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2l4 4-4 4-4-4 4-4z" />
                            <path d="M2 12l4-4 4 4-4 4-4-4z" />
                            <path d="M12 14l4-4 4 4-4 4-4-4z" />
                            <path d="M12 14l-4 4-4-4 4-4 4 4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">DevSwiss</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">JWT Debugger</h1>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-200">
                        100% Client-side
                    </span>
                    <span className="rounded-full border border-zinc-700 px-3 py-1 font-medium text-zinc-300">
                        Sin enviar tokens
                    </span>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <section className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 shadow-[0_10px_60px_-35px_rgba(0,0,0,0.6)]">
                        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 px-4 py-3">
                            <button
                                onClick={handleSample}
                                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-400/50 hover:bg-emerald-500/20"
                                type="button"
                            >
                                Cargar ejemplo
                            </button>
                            <button
                                onClick={handleClear}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-100 transition hover:-translate-y-0.5 hover:border-red-400/60 hover:bg-red-500/15"
                                type="button"
                            >
                                Limpiar
                            </button>
                            <span className="ml-auto text-xs text-zinc-500">
                                Decodificacion local, sin enviar datos
                            </span>
                        </div>
                        <textarea
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            spellCheck={false}
                            className="min-h-[160px] w-full resize-none rounded-b-2xl bg-transparent px-4 py-4 font-mono text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none"
                            placeholder="Pega el JWT aqui. Ejemplo: header.payload.signature"
                        />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {(['header', 'payload', 'signature'] as const).map((segment) => {
                            const style = segmentStyles[segment];
                            let content = segment === 'signature' ? 'Signature vacia' : `${style.title} sin datos`;
                            let error = '';

                            if (segment === 'header') {
                                if (decoded.header) {
                                    content = getSegmentPreview(decoded.header, 'Header sin datos');
                                    error = decoded.header.error || '';
                                }
                            } else if (segment === 'payload') {
                                if (decoded.payload) {
                                    content = getSegmentPreview(decoded.payload, 'Payload sin datos');
                                    error = decoded.payload.error || '';
                                }
                            } else if (decoded.signature) {
                                content = decoded.signature;
                            }

                            return (
                                <article
                                    key={segment}
                                    className={`rounded-2xl border ${style.border} bg-zinc-950/70 px-4 py-4 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.6)]`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                                            {style.title}
                                        </span>
                                        {segment === 'header' && (
                                            <span className="text-xs text-zinc-400">alg: {algorithm}</span>
                                        )}
                                        {segment === 'signature' && (
                                            <span className="text-xs text-zinc-400">
                                                {decoded.signature ? `${decoded.signature.length} chars` : '0 chars'}
                                            </span>
                                        )}
                                    </div>
                                    <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-zinc-100">
                                        {content}
                                    </pre>
                                    {error ? (
                                        <p className="mt-2 text-xs text-amber-200">
                                            {error}
                                        </p>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>
                </section>

                <aside className="flex flex-col gap-4 rounded-2xl border border-zinc-800/70 bg-gradient-to-b from-zinc-950/80 to-zinc-950 px-4 py-4 text-sm text-zinc-200 shadow-[0_10px_60px_-35px_rgba(0,0,0,0.6)]">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Estado de Claims</p>
                        {claimDetails.length === 0 ? (
                            <p className="text-sm text-zinc-500">
                                Pega un JWT valido para mostrar exp, iat y nbf.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {claimDetails.map((claim) => {
                                    const tone =
                                        claim.status === 'error'
                                            ? 'border-red-500/40 bg-red-500/10 text-red-100'
                                            : claim.status === 'warn'
                                                ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                                                : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100';
                                    return (
                                        <div key={claim.key} className={`rounded-xl border px-3 py-2 ${tone}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wide">
                                                    {claim.label}
                                                </span>
                                                <span className="text-[11px] text-zinc-200/80">
                                                    {claim.description}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-zinc-100">{claim.value}</p>
                                            {claim.helper ? (
                                                <p className="mt-1 text-[11px] text-zinc-200/80">{claim.helper}</p>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Alertas rapidas</p>
                        {warnings.length === 0 ? (
                            <p className="text-sm text-zinc-400">Sin alertas por ahora.</p>
                        ) : (
                            <ul className="space-y-2 text-sm text-amber-100">
                                {warnings.map((warning, index) => (
                                    <li key={`${warning}-${index}`}>• {warning}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Claims personalizados</p>
                        {customClaims.length === 0 ? (
                            <p className="text-sm text-zinc-400">No se detectan claims personalizados.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {customClaims.map((claim) => (
                                    <span
                                        key={claim}
                                        className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-100"
                                    >
                                        {claim}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Auditoria IA</p>
                        <button
                            onClick={handleAudit}
                            type="button"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-emerald-500/15"
                        >
                            {loading ? 'Analizando...' : 'Auditar JWT'}
                        </button>
                        {aiNote ? (
                            <p className="text-xs text-emerald-200">{aiNote}</p>
                        ) : null}
                        {error ? <p className="text-xs text-red-200">{error}</p> : null}
                        {explanation ? (
                            <pre className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-100">
                                {explanation}
                            </pre>
                        ) : (
                            <p className="text-xs text-zinc-500">
                                La auditoria explica claims estandar, personalizados y posibles riesgos.
                            </p>
                        )}
                    </div>
                </aside>
            </div>
        </React.Fragment>
    );
}

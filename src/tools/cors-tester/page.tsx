'use client';

import React, { useMemo, useState } from 'react';
import { ExplainButton } from '@/components/shared/ExplainButton';

type HeaderRow = {
    id: string;
    name: string;
    value: string;
};

type ResponseState = {
    status: number;
    statusText: string;
    ok: boolean;
    type: ResponseType;
    redirected: boolean;
    url: string;
    durationMs: number;
    headers: Array<[string, string]>;
    body: string;
    truncated: boolean;
};

const SIMPLE_HEADERS = new Set(['accept', 'accept-language', 'content-language', 'content-type']);
const SIMPLE_CONTENT_TYPES = new Set(['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain']);

const createHeaderRow = (): HeaderRow => ({
    id: `header-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: '',
    value: '',
});

const isSimpleContentType = (value: string) => {
    const base = value.split(';')[0]?.trim().toLowerCase();
    return SIMPLE_CONTENT_TYPES.has(base);
};

const isSimpleHeader = (name: string, value: string) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return true;
    if (!SIMPLE_HEADERS.has(normalized)) return false;
    if (normalized === 'content-type') {
        return isSimpleContentType(value);
    }
    return true;
};

const getPreflightReasons = (method: string, headers: HeaderRow[]) => {
    const reasons: string[] = [];
    const normalizedMethod = method.toUpperCase();
    const isSimpleMethod = ['GET', 'HEAD', 'POST'].includes(normalizedMethod);
    if (!isSimpleMethod) {
        reasons.push(`Metodo ${normalizedMethod} no es simple`);
    }

    headers.forEach((header) => {
        if (!header.name.trim()) return;
        if (!isSimpleHeader(header.name, header.value)) {
            reasons.push(`Header ${header.name.trim()} requiere preflight`);
        }
    });

    return reasons;
};

const renderHeaderRows = (headers: Array<[string, string]>) => {
    if (!headers.length) return 'No expuestos por la respuesta.';
    return headers.map(([key, value]) => `${key}: ${value}`).join('\n');
};

export default function CORSTesterPage() {
    const [url, setUrl] = useState('https://api.github.com');
    const [method, setMethod] = useState('GET');
    const [mode, setMode] = useState<'cors' | 'no-cors' | 'same-origin'>('cors');
    const [headers, setHeaders] = useState<HeaderRow[]>([createHeaderRow()]);
    const [body, setBody] = useState('');
    const [response, setResponse] = useState<ResponseState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const preflightReasons = useMemo(() => getPreflightReasons(method, headers), [method, headers]);
    const preflightRequired = preflightReasons.length > 0;

    const explainContext = useMemo(() => {
        const headerSummary = headers
            .filter((header) => header.name.trim())
            .map((header) => `${header.name.trim()}: ${header.value.trim()}`)
            .join('\n');

        return [
            `URL: ${url}`,
            `Metodo: ${method}`,
            `Modo fetch: ${mode}`,
            `Preflight: ${preflightRequired ? 'Si' : 'No'}`,
            preflightReasons.length ? `Motivos: ${preflightReasons.join(' | ')}` : 'Motivos: ninguno',
            headerSummary ? `Headers:\n${headerSummary}` : 'Headers: ninguno',
        ].join('\n');
    }, [url, method, mode, preflightRequired, preflightReasons, headers]);

    const handleHeaderChange = (id: string, key: 'name' | 'value', value: string) => {
        setHeaders((prev) => prev.map((header) => (header.id === id ? { ...header, [key]: value } : header)));
    };

    const handleAddHeader = () => setHeaders((prev) => [...prev, createHeaderRow()]);
    const handleRemoveHeader = (id: string) =>
        setHeaders((prev) => prev.filter((header) => header.id !== id));

    const handleSend = async () => {
        setError(null);
        setResponse(null);

        if (!url.trim()) {
            setError('Ingresa una URL valida para probar.');
            return;
        }

        const headerBag = new Headers();
        headers.forEach((header) => {
            const name = header.name.trim();
            if (!name) return;
            headerBag.append(name, header.value.trim());
        });

        const hasBody = !['GET', 'HEAD'].includes(method.toUpperCase()) && body.trim().length > 0;
        const start = performance.now();

        setLoading(true);
        try {
            const responseData = await fetch(url.trim(), {
                method,
                mode,
                headers: headerBag,
                body: hasBody ? body : undefined,
            });

            const durationMs = Math.round(performance.now() - start);
            const headersList = Array.from(responseData.headers.entries());
            const isOpaque = responseData.type === 'opaque';
            let responseBody = '';
            let truncated = false;

            if (!isOpaque) {
                responseBody = await responseData.text();
                if (responseBody.length > 2000) {
                    responseBody = responseBody.slice(0, 2000);
                    truncated = true;
                }
            }

            setResponse({
                status: responseData.status,
                statusText: responseData.statusText,
                ok: responseData.ok,
                type: responseData.type,
                redirected: responseData.redirected,
                url: responseData.url,
                durationMs,
                headers: headersList,
                body: responseBody,
                truncated,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido al ejecutar fetch.';
            setError(`Posible bloqueo CORS o fallo de red: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <header className="cyber-panel cyber-border-blue flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 p-2 shadow-lg shadow-cyan-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l4 4-4 4-4-4 4-4Z" /><path d="M4 10l4 4-4 4-4-4 4-4Z" /><path d="M20 10l4 4-4 4-4-4 4-4Z" /><path d="M12 18l4 4-4 4-4-4 4-4Z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">DevSwiss</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">CORS Tester</h1>
                        <p className="text-sm text-slate-400">
                            Simula fetch con headers personalizados y detecta errores de origen en segundos.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-medium">
                        Preflight visible
                    </span>
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-medium">
                        100% client-side
                    </span>
                </div>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_0.95fr]">
                <section className="space-y-4">
                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Configuracion de request</p>
                                <p className="text-sm text-slate-400">Define metodo, headers y cuerpo para probar CORS.</p>
                            </div>
                            <ExplainButton toolName="CORS Tester" context={explainContext} label="Pedagogía con IA" />
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-[140px_minmax(0,1fr)_140px]">
                            <select
                                value={method}
                                onChange={(event) => setMethod(event.target.value)}
                                className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-100 outline-none focus:border-cyan-400"
                            >
                                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].map((methodOption) => (
                                    <option key={methodOption} value={methodOption}>
                                        {methodOption}
                                    </option>
                                ))}
                            </select>
                            <input
                                value={url}
                                onChange={(event) => setUrl(event.target.value)}
                                className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                                placeholder="https://api.tu-dominio.com/v1/endpoint"
                            />
                            <select
                                value={mode}
                                onChange={(event) => setMode(event.target.value as 'cors' | 'no-cors' | 'same-origin')}
                                className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                            >
                                <option value="cors">cors</option>
                                <option value="no-cors">no-cors</option>
                                <option value="same-origin">same-origin</option>
                            </select>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                                <span>Headers</span>
                                <button
                                    onClick={handleAddHeader}
                                    className="rounded-lg border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-200 transition hover:border-cyan-400"
                                >
                                    + Agregar header
                                </button>
                            </div>
                            <div className="space-y-2">
                                {headers.map((header) => (
                                    <div key={header.id} className="grid gap-2 md:grid-cols-[1fr_1.2fr_auto]">
                                        <input
                                            value={header.name}
                                            onChange={(event) => handleHeaderChange(header.id, 'name', event.target.value)}
                                            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                                            placeholder="Authorization"
                                        />
                                        <input
                                            value={header.value}
                                            onChange={(event) => handleHeaderChange(header.id, 'value', event.target.value)}
                                            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                                            placeholder="Bearer ..."
                                        />
                                        <button
                                            onClick={() => handleRemoveHeader(header.id)}
                                            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-400 transition hover:border-amber-400 hover:text-amber-200"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                                <span>Body</span>
                                <span className="text-[11px] text-slate-500">Opcional para POST/PUT/PATCH</span>
                            </div>
                            <textarea
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                className="min-h-[120px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 font-mono text-sm text-slate-100 outline-none focus:border-cyan-400"
                                placeholder='{"query":"hello"}'
                            />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleSend}
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-500/20 disabled:opacity-60"
                            >
                                {loading ? 'Enviando...' : 'Probar request'}
                            </button>
                            <div
                                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                    preflightRequired
                                        ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                                        : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                                }`}
                            >
                                Preflight {preflightRequired ? 'requerido' : 'no requerido'}
                            </div>
                            {preflightRequired && (
                                <span className="text-xs text-amber-200">{preflightReasons[0]}</span>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                                <p className="font-semibold">Error detectado</p>
                                <p>{error}</p>
                                <p className="mt-2 text-xs text-amber-100">
                                    Revisa que el servidor responda con Access-Control-Allow-Origin y permita los headers solicitados.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Respuesta</p>
                                <p className="text-sm text-slate-300">Estado, headers visibles y payload.</p>
                            </div>
                            {response && (
                                <span
                                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
                                        response.ok
                                            ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                                            : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                                    }`}
                                >
                                    {response.ok ? 'OK' : 'Revisar'}
                                </span>
                            )}
                        </div>

                        {!response ? (
                            <p className="mt-3 text-sm text-slate-400">
                                Ejecuta una request para ver el estado y los headers expuestos.
                            </p>
                        ) : (
                            <div className="mt-3 space-y-3 text-sm text-slate-200">
                                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Estado</p>
                                    <p>
                                        {response.status} {response.statusText || 'OK'} · {response.type} · {response.durationMs}ms
                                    </p>
                                    <p className="text-xs text-slate-500">URL final: {response.url}</p>
                                </div>

                                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Headers visibles</p>
                                    <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-xs text-slate-100">
                                        {renderHeaderRows(response.headers)}
                                    </pre>
                                </div>

                                <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Body</p>
                                    {response.type === 'opaque' ? (
                                        <p className="mt-2 text-xs text-slate-400">
                                            Respuesta opaca (modo no-cors). El navegador no permite leer el contenido.
                                        </p>
                                    ) : (
                                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-slate-100">
                                            {response.body || 'Sin contenido disponible.'}
                                        </pre>
                                    )}
                                    {response.truncated && (
                                        <p className="mt-2 text-xs text-amber-200">Contenido truncado a 2000 caracteres.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-sm text-slate-300 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Checklist CORS</p>
                        <ul className="mt-2 space-y-2">
                            <li>· Access-Control-Allow-Origin debe incluir tu origen o * para recursos publicos.</li>
                            <li>· Access-Control-Allow-Headers debe listar headers personalizados.</li>
                            <li>· Access-Control-Allow-Methods debe permitir el metodo usado.</li>
                            <li>· Si hay cookies, habilita Access-Control-Allow-Credentials.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}

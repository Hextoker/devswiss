'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import { format } from 'sql-formatter';
import { ExplainButton } from '@/components/shared/ExplainButton';

type Dialect = 'postgresql' | 'mysql';

const defaultSql = `SELECT u.id, u.email, o.total
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.status = 'paid'
ORDER BY o.created_at DESC;`;

const highlightSql = (code: string) => Prism.highlight(code, Prism.languages.sql, 'sql');

export default function SQLFormatterPage() {
    const hasPrefilled = useRef(false);
    const [sqlInput, setSqlInput] = useState(defaultSql);
    const [formattedSql, setFormattedSql] = useState('');
    const [dialect, setDialect] = useState<Dialect>('postgresql');
    const [tabWidth, setTabWidth] = useState(2);
    const [error, setError] = useState<string | null>(null);
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

    const explainContext = useMemo(() => {
        const trimmed = sqlInput.trim();
        return [
            `Dialecto: ${dialect}`,
            `Largo: ${trimmed.length} chars`,
            trimmed ? `SQL:\n${trimmed.slice(0, 320)}` : 'Sin SQL cargado.',
        ].join('\n');
    }, [sqlInput, dialect]);

    const handleFormat = () => {
        setError(null);
        if (!sqlInput.trim()) {
            setError('Pega una query SQL para formatear.');
            return;
        }

        try {
            const formatted = format(sqlInput, {
                language: dialect,
                tabWidth,
                useTabs: false,
            });
            setSqlInput(formatted);
            setFormattedSql(formatted);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo formatear el SQL.';
            setError(message);
        }
    };

    const handleCopy = async () => {
        const payload = formattedSql || sqlInput;
        if (!payload.trim()) return;
        try {
            await navigator.clipboard.writeText(payload);
            setCopyState('copied');
        } catch (err) {
            console.error('Clipboard error', err);
            setCopyState('error');
        } finally {
            setTimeout(() => setCopyState('idle'), 1800);
        }
    };

    useEffect(() => {
        if (hasPrefilled.current) return;
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const payload = params.get('sql');
        if (!payload) return;
        hasPrefilled.current = true;
        setSqlInput(payload);
        setFormattedSql('');
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <style jsx global>{`
                .sql-highlight .token.comment,
                .sql-highlight .token.prolog,
                .sql-highlight .token.doctype,
                .sql-highlight .token.cdata {
                    color: #64748b;
                }
                .sql-highlight .token.punctuation {
                    color: #cbd5f5;
                }
                .sql-highlight .token.keyword {
                    color: #38bdf8;
                }
                .sql-highlight .token.function {
                    color: #a78bfa;
                }
                .sql-highlight .token.operator {
                    color: #f97316;
                }
                .sql-highlight .token.string {
                    color: #34d399;
                }
                .sql-highlight .token.number {
                    color: #facc15;
                }
                .sql-highlight .token.boolean {
                    color: #f472b6;
                }
            `}</style>

            <header className="cyber-panel cyber-border-blue flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-violet-500 via-sky-500 to-emerald-500 p-2 shadow-lg shadow-sky-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M8 8h8" /><path d="M8 12h6" /><path d="M8 16h4" /></svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">DevSwiss</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">SQL Formatter</h1>
                        <p className="text-sm text-slate-400">
                            Editor con resaltado para formatear SQL Postgres o MySQL localmente.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 font-medium">
                        sql-formatter
                    </span>
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-medium">
                        100% client-side
                    </span>
                </div>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
                <section className="space-y-4">
                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Editor SQL</p>
                                <p className="text-sm text-slate-400">Escribe, pega y formatea queries con dialecto.</p>
                            </div>
                            <ExplainButton toolName="SQL Formatter" context={explainContext} label="Pedagogía con IA" />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <select
                                value={dialect}
                                onChange={(event) => setDialect(event.target.value as Dialect)}
                                className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
                            >
                                <option value="postgresql">Postgres</option>
                                <option value="mysql">MySQL</option>
                            </select>
                            <select
                                value={tabWidth}
                                onChange={(event) => setTabWidth(Number(event.target.value))}
                                className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-400"
                            >
                                <option value={2}>2 espacios</option>
                                <option value={4}>4 espacios</option>
                                <option value={8}>8 espacios</option>
                            </select>
                            <button
                                onClick={handleFormat}
                                className="inline-flex items-center gap-2 rounded-lg border border-violet-400/50 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-100 transition hover:-translate-y-0.5 hover:border-violet-300"
                            >
                                Formatear
                            </button>
                            <button
                                onClick={handleCopy}
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                    copyState === 'copied'
                                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                                        : copyState === 'error'
                                            ? 'border-red-400/50 bg-red-500/10 text-red-200'
                                            : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:-translate-y-0.5 hover:border-slate-600'
                                }`}
                            >
                                {copyState === 'copied' ? 'Copiado' : copyState === 'error' ? 'Error' : 'Copiar'}
                            </button>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80">
                            <Editor
                                value={sqlInput}
                                onValueChange={(value: string) => setSqlInput(value)}
                                highlight={(value: string) => highlightSql(value)}
                                padding={16}
                                className="sql-highlight min-h-[280px] font-mono text-sm text-slate-100 outline-none"
                                textareaClassName="outline-none text-slate-100"
                                style={{ background: 'transparent' }}
                            />
                        </div>

                        {error && (
                            <p className="mt-3 text-sm text-amber-200">{error}</p>
                        )}
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Vista formateada</p>
                                <p className="text-sm text-slate-300">Previsualizacion con resaltado.</p>
                            </div>
                            <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-400">
                                {formattedSql ? 'Actualizado' : 'Sin formato'}
                            </span>
                        </div>
                        <div className="mt-3 max-h-[360px] overflow-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                            {formattedSql ? (
                                <pre
                                    className="sql-highlight whitespace-pre-wrap break-words font-mono text-xs text-slate-100"
                                    dangerouslySetInnerHTML={{ __html: highlightSql(formattedSql) }}
                                />
                            ) : (
                                <p className="text-sm text-slate-400">Presiona formatear para ver el resultado.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-sm text-slate-300 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Tips rapidos</p>
                        <ul className="mt-2 space-y-2">
                            <li>· Usa WITH para CTEs y mantener consultas largas legibles.</li>
                            <li>· Ajusta el dialecto si usas LIMIT/OFFSET o funciones especificas.</li>
                            <li>· El formateo es local: tus queries no salen del navegador.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExplainButton } from '@/components/shared/ExplainButton';

type CopyState = 'idle' | 'copied' | 'error';

type FileMeta = {
    name: string;
    size: number;
    type: string;
};

const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const encodeTextToBase64 = (value: string) => {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
};

const parseDataUri = (value: string) => {
    const match = value.match(/^data:([^;,]*)(?:;[^,]*)?;base64,([\s\S]+)$/i);
    if (!match) return null;
    return {
        mime: match[1] || 'application/octet-stream',
        base64: match[2],
        dataUri: match[0],
    };
};

const decodeBase64 = (value: string) => {
    const cleaned = value.replace(/\s+/g, '');
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return { bytes, text };
};

const detectImageMime = (bytes: Uint8Array, text: string) => {
    if (bytes.length >= 8) {
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
            return 'image/png';
        }
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            return 'image/jpeg';
        }
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
            return 'image/gif';
        }
        if (
            bytes[0] === 0x52 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x46 &&
            bytes[8] === 0x57 &&
            bytes[9] === 0x45 &&
            bytes[10] === 0x42 &&
            bytes[11] === 0x50
        ) {
            return 'image/webp';
        }
    }

    const trimmed = text.trimStart();
    if (trimmed.startsWith('<svg') || trimmed.includes('<svg')) {
        return 'image/svg+xml';
    }

    return null;
};

export default function Base64LabPage() {
    const hasPrefilled = useRef(false);
    const previewUrlRef = useRef<string | null>(null);
    const [textInput, setTextInput] = useState('');
    const [encodedOutput, setEncodedOutput] = useState('');
    const [decodeInput, setDecodeInput] = useState('');
    const [decodedOutput, setDecodedOutput] = useState('');
    const [decodeError, setDecodeError] = useState('');
    const [decodeInfo, setDecodeInfo] = useState('');
    const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
    const [fileDataUri, setFileDataUri] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [previewLabel, setPreviewLabel] = useState('');
    const [copyState, setCopyState] = useState<Record<'encoded' | 'decoded' | 'dataUri', CopyState>>({
        encoded: 'idle',
        decoded: 'idle',
        dataUri: 'idle',
    });

    const encodeStats = useMemo(() => {
        if (!encodedOutput) return null;
        const bytes = new TextEncoder().encode(textInput).length;
        return {
            inputSize: formatBytes(bytes),
            outputSize: formatBytes(encodedOutput.length),
            outputLength: encodedOutput.length,
        };
    }, [encodedOutput, textInput]);

    const updatePreview = useCallback((src: string | null, label: string, isObjectUrl: boolean) => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
        if (isObjectUrl && src) {
            previewUrlRef.current = src;
        }
        setPreviewSrc(src);
        setPreviewLabel(label);
    }, []);

    const handleDecodeValue = useCallback(
        (value?: string) => {
            const raw = (value ?? decodeInput).trim();
            if (!raw) {
                setDecodeError('Ingresa Base64 o un Data URI para decodificar.');
                setDecodedOutput('');
                setDecodeInfo('');
                updatePreview(null, '', false);
                return;
            }

            const parsed = parseDataUri(raw);
            const payload = parsed ? parsed.base64 : raw;
            const mime = parsed?.mime ?? null;

            try {
                const { bytes, text } = decodeBase64(payload);
                setDecodedOutput(text);
                setDecodeError('');
                setDecodeInfo(`Bytes decodificados: ${formatBytes(bytes.length)}`);

                if (mime && mime.startsWith('image/')) {
                    updatePreview(parsed?.dataUri ?? null, `Imagen detectada (${mime})`, false);
                    return;
                }

                const detectedMime = detectImageMime(bytes, text);
                if (detectedMime) {
                    const blob = new Blob([bytes], { type: detectedMime });
                    const url = URL.createObjectURL(blob);
                    updatePreview(url, `Imagen detectada (${detectedMime})`, true);
                    return;
                }

                updatePreview(null, '', false);
            } catch (error) {
                setDecodeError('Base64 inválido o corrupto. Revisa padding o caracteres.');
                setDecodedOutput('');
                setDecodeInfo('');
                updatePreview(null, '', false);
            }
        },
        [decodeInput, updatePreview]
    );

    const handleEncode = () => {
        if (!textInput.trim()) {
            setEncodedOutput('');
            return;
        }
        setEncodedOutput(encodeTextToBase64(textInput));
    };

    const handleCopy = async (value: string, target: 'encoded' | 'decoded' | 'dataUri') => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            setCopyState((prev) => ({ ...prev, [target]: 'copied' }));
        } catch (error) {
            setCopyState((prev) => ({ ...prev, [target]: 'error' }));
        } finally {
            setTimeout(() => {
                setCopyState((prev) => ({ ...prev, [target]: 'idle' }));
            }, 1600);
        }
    };

    const handleFile = useCallback(
        (file: File) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = typeof reader.result === 'string' ? reader.result : '';
                if (!result) return;
                setFileMeta({
                    name: file.name,
                    size: file.size,
                    type: file.type || 'application/octet-stream',
                });
                setFileDataUri(result);
                setDecodeInput(result);
                setDecodedOutput('');
                setDecodeError('');
                setDecodeInfo('');

                if (file.type.startsWith('image/')) {
                    updatePreview(result, `Imagen cargada (${file.type})`, false);
                } else {
                    updatePreview(null, '', false);
                }
            };
            reader.readAsDataURL(file);
        },
        [updatePreview]
    );

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (hasPrefilled.current) return;
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const payload = params.get('payload');
        if (!payload) return;
        const mode = params.get('mode');
        hasPrefilled.current = true;
        if (mode === 'encode') {
            setTextInput(payload);
            setEncodedOutput(encodeTextToBase64(payload));
        } else {
            setDecodeInput(payload);
            handleDecodeValue(payload);
        }
    }, [handleDecodeValue]);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const file = event.clipboardData?.files?.[0];
            if (file) {
                handleFile(file);
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handleFile]);

    const aiContext = [
        'Explica qué es Base64: una codificación que convierte bytes en texto ASCII.',
        'Aclara que no cifra ni comprime; solo transforma binario en texto.',
        'Menciona que crece ~33% porque cada 3 bytes se convierten en 4 caracteres + padding.',
        'Cuándo usarlo en web: Data URI pequeñas, envíos en JSON, headers, pruebas rápidas.',
        'Cuándo evitarlo: archivos grandes, streaming, cuando puedes servir binario directo.',
    ].join('\n');

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => setDragActive(false);

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-500 p-2 shadow-lg shadow-cyan-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M10 7h4" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">DevSwiss</p>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Base64 &amp; Media Laboratory</h1>
                            <p className="text-sm text-slate-400">
                                Codifica texto, decodifica Base64 y convierte archivos a Data URI sin salir del navegador.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-medium">
                            100% client-side
                        </span>
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-medium">
                            Drag &amp; paste files
                        </span>
                        <span className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 font-medium">
                            Vista previa de imágenes
                        </span>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
                    <section className="space-y-4">
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Texto → Base64</p>
                                    <p className="text-sm text-slate-300">Codifica texto plano con btoa + UTF-8 local.</p>
                                </div>
                                <ExplainButton toolName="Base64 & Media Lab" context={aiContext} />
                            </div>
                            <textarea
                                value={textInput}
                                onChange={(event) => setTextInput(event.target.value)}
                                className="mt-3 min-h-[160px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 font-mono text-sm text-slate-100 outline-none focus:border-cyan-400"
                                placeholder="Pega el texto que quieres codificar en Base64."
                            />
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                    onClick={handleEncode}
                                    className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-500/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                    Codificar
                                </button>
                                <button
                                    onClick={() => setTextInput('')}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900"
                                >
                                    Limpiar texto
                                </button>
                                <button
                                    onClick={() => handleCopy(encodedOutput, 'encoded')}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                        copyState.encoded === 'copied'
                                            ? 'border-emerald-300/60 bg-emerald-500/15 text-emerald-50'
                                            : copyState.encoded === 'error'
                                                ? 'border-red-400/60 bg-red-500/10 text-red-100'
                                                : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                    {copyState.encoded === 'copied'
                                        ? 'Copiado'
                                        : copyState.encoded === 'error'
                                            ? 'Error'
                                            : 'Copiar Base64'}
                                </button>
                            </div>
                            <textarea
                                value={encodedOutput}
                                readOnly
                                className="mt-3 min-h-[140px] w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 font-mono text-sm text-slate-100 outline-none"
                                placeholder="Aquí aparecerá la salida Base64."
                            />
                            {encodeStats && (
                                <p className="mt-2 text-xs text-slate-400">
                                    Entrada: {encodeStats.inputSize} · Salida: {encodeStats.outputSize} ({encodeStats.outputLength} chars)
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Base64 / Data URI → Texto</p>
                                    <p className="text-sm text-slate-300">Decodifica cadenas Base64 o data: URIs.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => handleDecodeValue()}
                                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-500/20"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18" /><path d="m15 6 6 6-6 6" /></svg>
                                        Decodificar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDecodeInput('');
                                            setDecodedOutput('');
                                            setDecodeError('');
                                            setDecodeInfo('');
                                            updatePreview(null, '', false);
                                        }}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900"
                                    >
                                        Limpiar
                                    </button>
                                    <button
                                        onClick={() => handleCopy(decodedOutput, 'decoded')}
                                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                                            copyState.decoded === 'copied'
                                                ? 'border-emerald-300/60 bg-emerald-500/15 text-emerald-50'
                                                : copyState.decoded === 'error'
                                                    ? 'border-red-400/60 bg-red-500/10 text-red-100'
                                                    : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                        {copyState.decoded === 'copied'
                                            ? 'Copiado'
                                            : copyState.decoded === 'error'
                                                ? 'Error'
                                                : 'Copiar texto'}
                                    </button>
                                </div>
                            </div>
                            <textarea
                                value={decodeInput}
                                onChange={(event) => setDecodeInput(event.target.value)}
                                className="mt-3 min-h-[160px] w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-3 font-mono text-sm text-slate-100 outline-none focus:border-emerald-400"
                                placeholder="Pega una cadena Base64 o Data URI para decodificar."
                            />
                            {decodeError ? (
                                <p className="mt-2 text-sm font-medium text-amber-300">{decodeError}</p>
                            ) : (
                                <p className="mt-2 text-xs text-slate-400">
                                    {decodeInfo || 'El decodificado se muestra aquí. Si es imagen, verás vista previa.'}
                                </p>
                            )}
                            <textarea
                                value={decodedOutput}
                                readOnly
                                className="mt-3 min-h-[140px] w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 font-mono text-sm text-slate-100 outline-none"
                                placeholder="Texto decodificado."
                            />
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Archivos → Data URI</p>
                                    <p className="text-sm text-slate-300">Arrastra, suelta o pega imágenes/PDF.</p>
                                </div>
                                <span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-300">
                                    FileReader
                                </span>
                            </div>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`mt-3 flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-6 text-center transition ${
                                    dragActive
                                        ? 'border-cyan-400/70 bg-cyan-500/10 text-cyan-100'
                                        : 'border-slate-700 bg-slate-900/60 text-slate-300'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                <div className="text-sm">
                                    <p className="font-semibold">Suelta el archivo aquí</p>
                                    <p className="text-xs text-slate-400">O pega desde el portapapeles.</p>
                                </div>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-100">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            if (file) {
                                                handleFile(file);
                                            }
                                        }}
                                        accept="image/*,application/pdf"
                                    />
                                    Seleccionar archivo
                                </label>
                            </div>
                            {fileMeta && (
                                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
                                    <p className="font-semibold text-slate-200">{fileMeta.name}</p>
                                    <p>Tipo: {fileMeta.type}</p>
                                    <p>Tamaño: {formatBytes(fileMeta.size)}</p>
                                    <button
                                        onClick={() => handleCopy(fileDataUri, 'dataUri')}
                                        className={`mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                            copyState.dataUri === 'copied'
                                                ? 'border-emerald-300/60 bg-emerald-500/15 text-emerald-50'
                                                : copyState.dataUri === 'error'
                                                    ? 'border-red-400/60 bg-red-500/10 text-red-100'
                                                    : 'border-slate-700 bg-slate-900/70 text-slate-200 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900'
                                        }`}
                                    >
                                        {copyState.dataUri === 'copied'
                                            ? 'Data URI copiado'
                                            : copyState.dataUri === 'error'
                                                ? 'Error al copiar'
                                                : 'Copiar Data URI'}
                                    </button>
                                </div>
                            )}
                            <textarea
                                value={fileDataUri}
                                readOnly
                                className="mt-3 min-h-[120px] w-full resize-none rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 font-mono text-xs text-slate-100 outline-none"
                                placeholder="El Data URI aparecerá aquí al cargar un archivo."
                            />
                        </div>

                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Vista previa</p>
                                    <p className="text-sm text-slate-300">Se muestra solo si es imagen.</p>
                                </div>
                                {previewLabel && (
                                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-100">
                                        {previewLabel}
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 flex min-h-[180px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60">
                                {previewSrc ? (
                                    <img
                                        src={previewSrc}
                                        alt="Vista previa Base64"
                                        className="max-h-[180px] w-full object-contain"
                                    />
                                ) : (
                                    <p className="px-4 text-center text-sm text-slate-400">
                                        Sin imagen para previsualizar. Decodifica un data:image/* o sube una imagen.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Buenas prácticas</p>
                            <ul className="mt-2 space-y-2 text-sm text-slate-300">
                                <li>· Usa Base64 para assets pequeños embebidos; evita binarios grandes.</li>
                                <li>· Data URI aumenta el tamaño, útil para mails y prototipos rápidos.</li>
                                <li>· Prefiere servir imágenes reales cuando el rendimiento importa.</li>
                                <li>· Base64 no protege datos sensibles: no es cifrado.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

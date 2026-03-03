'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import ExifReader from 'exifreader';
import type { ExifSection, FileMeta } from './exifUtils';
import { buildExifSections } from './exifUtils';

type LoadState = 'idle' | 'reading' | 'ready' | 'error';

const scheduleParse = (buffer: ArrayBuffer, onDone: () => void) => {
    const run = () => {
        onDone();
    };

    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(run, { timeout: 120 });
    } else {
        setTimeout(run, 0);
    }
};

export default function ExifMetadataTool() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewUrlRef = useRef<string | null>(null);
    const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
    const [tags, setTags] = useState<Record<string, unknown> | null>(null);
    const [loadState, setLoadState] = useState<LoadState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFailed, setPreviewFailed] = useState(false);

    const sections: ExifSection[] = useMemo(
        () => buildExifSections(tags, fileMeta),
        [tags, fileMeta]
    );

    const cleanupPreview = useCallback(() => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
    }, []);

    const handleClear = useCallback(() => {
        cleanupPreview();
        setFileMeta(null);
        setTags(null);
        setError(null);
        setLoadState('idle');
        setPreviewUrl(null);
        setPreviewFailed(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [cleanupPreview]);

    const handleFile = useCallback(
        (file: File) => {
            setError(null);
            setLoadState('reading');
            setPreviewFailed(false);
            const meta: FileMeta = {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
            };
            setFileMeta(meta);

            cleanupPreview();
            const nextPreviewUrl = URL.createObjectURL(file);
            previewUrlRef.current = nextPreviewUrl;
            setPreviewUrl(nextPreviewUrl);

            const reader = new FileReader();
            reader.onerror = () => {
                setError('No pudimos leer el archivo. Intenta con otra imagen.');
                setLoadState('error');
            };
            reader.onload = () => {
                const buffer = reader.result;
                if (!(buffer instanceof ArrayBuffer)) {
                    setError('El archivo no se pudo transformar a binario.');
                    setLoadState('error');
                    return;
                }

                scheduleParse(buffer, () => {
                    try {
                        const parsed = ExifReader.load(buffer, { expanded: true });
                        setTags(parsed);
                        setLoadState('ready');
                    } catch (err) {
                        console.error('EXIF parse error', err);
                        setTags(null);
                        setError('No encontramos metadatos EXIF en esta imagen.');
                        setLoadState('error');
                    }
                });
            };
            reader.readAsArrayBuffer(file);
        },
        [cleanupPreview]
    );

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    useEffect(() => {
        return () => cleanupPreview();
    }, [cleanupPreview]);

    return (
        <div className="flex flex-col gap-6">
            <header className="cyber-panel cyber-border-cyan flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-emerald-500 p-2 shadow-lg shadow-cyan-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4" /><path d="M9 7l3-3 3 3" /><circle cx="12" cy="13" r="3" /></svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">DevSwiss</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">Image Metadata Viewer</h1>
                        <p className="text-sm text-slate-400">EXIF local con privacidad total. Nada sale del navegador.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-medium">
                        ExifReader
                    </span>
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-medium">
                        Drag & drop
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 font-medium">
                        HEIC · JPEG · PNG
                    </span>
                </div>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_0.9fr]">
                <section className="space-y-4">
                    <div
                        className={`rounded-2xl border border-dashed p-5 transition ${
                            dragActive
                                ? 'border-cyan-400 bg-cyan-500/10'
                                : 'border-slate-800/70 bg-slate-950/70'
                        }`}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Carga local instantanea</p>
                                <p className="text-sm text-slate-300">
                                    Arrastra la imagen o selecciona un archivo para leer los metadatos.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400"
                                >
                                    Seleccionar archivo
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:border-amber-400"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.heic,.heif"
                            className="hidden"
                            onChange={handleFilePick}
                        />
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Metadatos detectados</p>
                                <p className="text-sm text-slate-400">
                                    Lectura local sin bloqueo, lista en menos de 100ms.
                                </p>
                            </div>
                            <span className="text-xs text-slate-400">
                                {loadState === 'reading'
                                    ? 'Procesando...'
                                    : loadState === 'ready'
                                        ? 'Listo'
                                        : 'En espera'}
                            </span>
                        </div>

                        {error && <p className="text-sm text-amber-200">{error}</p>}

                        <div className="space-y-3">
                            {sections.map((section) => (
                                <details
                                    key={section.id}
                                    className="rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-3"
                                    open
                                >
                                    <summary className="cursor-pointer text-sm font-semibold text-slate-200">
                                        {section.title}
                                    </summary>
                                    {section.items.length > 0 ? (
                                        <div className="mt-3 grid gap-2 text-sm text-slate-300">
                                            {section.items.map((item) => (
                                                <div
                                                    key={`${section.id}-${item.label}`}
                                                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-800/60 bg-slate-950/70 px-3 py-2"
                                                >
                                                    <span className="text-xs uppercase tracking-wide text-slate-500">
                                                        {item.label}
                                                    </span>
                                                    <span className="text-sm text-slate-200">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-slate-500">{section.emptyLabel}</p>
                                    )}
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-800/70 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Previsualizacion local</p>
                                <p className="text-sm text-slate-300">Thumbnail solo para confirmar.</p>
                            </div>
                        </div>
                        <div className="mt-3 flex min-h-[160px] items-center justify-center rounded-xl border border-slate-800/70 bg-slate-950/70">
                            {previewUrl && !previewFailed ? (
                                <Image
                                    src={previewUrl}
                                    alt="Previsualizacion"
                                    className="max-h-[180px] w-auto rounded-lg object-contain"
                                    onError={() => setPreviewFailed(true)}
                                    width={180}
                                    height={180}
                                    unoptimized
                                />
                            ) : (
                                <p className="text-sm text-slate-500">
                                    {previewFailed
                                        ? 'Vista previa no disponible para este formato.'
                                        : 'Carga una imagen para ver el thumbnail.'}
                                </p>
                            )}
                        </div>
                        {fileMeta && (
                            <div className="mt-3 text-xs text-slate-400">
                                <p className="truncate">{fileMeta.name}</p>
                                <p>{fileMeta.type || 'Tipo no detectado'}</p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 text-sm text-slate-300 shadow-[0_12px_60px_-35px_rgba(0,0,0,0.9)]">
                        <p className="text-xs uppercase tracking-wide text-slate-500">Pedagogia con IA</p>
                        <p className="mt-2 text-sm text-slate-300">
                            Revisar metadatos evita compartir ubicaciones exactas, modelos de camara o rutinas
                            personales. Muchos archivos guardan GPS y datos tecnicos que pueden revelar donde
                            vives o trabajas. DevSwiss lo procesa en tu navegador para proteger tu privacidad.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

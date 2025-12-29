'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIExplain } from '@/hooks/useAIExplain';

interface ExplainButtonProps {
    toolName: string;
    context: string;
}

export const ExplainButton: React.FC<ExplainButtonProps> = ({ toolName, context }) => {
    const { explanation, loading, error, explain } = useAIExplain();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleToggle = () => {
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);
        if (!isOpen) {
            explain({ toolName, content: context });
        }
    };

    const panel = (
        <div
            className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-2xl backdrop-blur"
            role="dialog"
            aria-label="Explicación con IA"
        >
            <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <p className="text-xs uppercase tracking-wide text-purple-500">Asistente</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Explicación IA</p>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-md p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    aria-label="Cerrar explicación"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            </div>
            <div className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200 max-h-64 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center gap-3 py-3">
                        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                        <span>Generando explicación educativa...</span>
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {explanation || 'Haz clic en el botón para obtener una explicación con IA.'}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative inline-flex" ref={popoverRef}>
            <button
                onClick={handleToggle}
                className="inline-flex items-center gap-2 rounded-md border border-purple-300/50 bg-purple-50/80 px-3 py-2 text-sm font-medium text-purple-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-purple-500/20 dark:bg-purple-950/40 dark:text-purple-200"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                Explicar con IA
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
                    <div
                        className={`${isMobile ? 'fixed inset-x-4 bottom-6 z-50' : 'absolute right-0 top-full z-50 mt-2'}`}
                    >
                        {panel}
                    </div>
                </>
            )}
        </div>
    );
};

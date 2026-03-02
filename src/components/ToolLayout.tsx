'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Terminal } from 'lucide-react';
import { JetBrains_Mono } from 'next/font/google';
import { useUIStore } from '@/store/useUIStore';
import { ShareButton } from '@/components/ShareButton';

interface ToolLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const jetBrains = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    display: 'swap',
});

export function ToolLayout({ children }: ToolLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isCommandPaletteOpen } = useUIStore();
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (!isCommandPaletteOpen) {
                    router.push('/');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCommandPaletteOpen, router]);

    useEffect(() => {
        if (isCommandPaletteOpen) {
            return;
        }

        const focusFirstField = () => {
            const container = contentRef.current;
            if (!container) return;

            const active = document.activeElement;
            if (active && active !== document.body) {
                return;
            }

            const selector =
                'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"]';
            const candidate = container.querySelector<HTMLElement>(selector);
            if (!candidate) return;
            if (candidate.offsetParent === null) return;

            candidate.focus({ preventScroll: false });
        };

        const id = window.setTimeout(focusFirstField, 0);
        return () => window.clearTimeout(id);
    }, [isCommandPaletteOpen, pathname]);

    return (
        <div className={`${jetBrains.className} cyber-page cyber-scroll selection:bg-[#00FF41] selection:text-black`}>
            <div className="cyber-scanline" />
            <div className="cyber-vignette" />

            <header className="relative z-50 border-b-2 border-[#00FF41]/20 bg-black/80 backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center border-2 border-[#00FF41] transform-[rotate(45deg)]">
                            <Terminal className="h-4 w-4 -rotate-45 text-[#00FF41]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500">DEVSWISS_TOOLKIT</p>
                            <Link
                                href="/"
                                className="group inline-flex items-center gap-2 text-sm font-bold uppercase text-zinc-200 transition hover:text-[#00FF41]"
                            >
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Volver al Dashboard
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ShareButton />
                        <span className="rounded-full border border-[#00FF41]/30 bg-[#00FF41]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00FF41]">
                            Command-First
                        </span>
                    </div>
                </div>
            </header>

            <div
                ref={contentRef}
                className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10"
            >
                {children}
            </div>
        </div>
    );
}

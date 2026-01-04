'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { ShareButton } from '@/components/ShareButton';

interface ToolLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export function ToolLayout({ children, title, description }: ToolLayoutProps) {
    const router = useRouter();
    const { isCommandPaletteOpen } = useUIStore();

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

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-black via-zinc-950 to-zinc-900 text-zinc-100">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
                {/* Global Header */}
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/"
                        className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-emerald-400"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Volver al Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <ShareButton />
                        <Link href="/" className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                DevSwiss <Sparkles className="h-3 w-3 text-emerald-200" />
                            </div>
                        </Link>
                    </div>
                </header>

                {children}
            </div>
        </div>
    );
}

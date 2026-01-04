'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (typeof window === 'undefined') return;

        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 ${copied ? 'border-emerald-500/30 text-emerald-400' : ''
                }`}
            title="Copiar link"
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copiado</span>
                </>
            ) : (
                <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Compartir</span>
                </>
            )}
        </button>
    );
}

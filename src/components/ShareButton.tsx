'use client';

import React, { useState } from 'react';
import { Share2, Check, Linkedin, Facebook, Twitter, Copy } from 'lucide-react';
import { buildShareUrls } from '@/utils/ogImageBuilder';

interface ShareButtonProps {
    title?: string;
    description?: string;
}

export function ShareButton({ title, description }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleCopyLink = async () => {
        if (typeof window === 'undefined') return;

        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    const handleSocialShare = (platform: string) => {
        if (typeof window === 'undefined') return;

        const config = {
            title: title || document.title,
            description: description || 'Check out this tool from DevSwiss',
        };

        const shareUrls = buildShareUrls(window.location.href, config);
        const url = shareUrls[platform as keyof typeof shareUrls];

        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
            setShowMenu(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 ${
                    copied ? 'border-emerald-500/30 text-emerald-400' : ''
                }`}
                title="Compartir en redes sociales"
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

            {showMenu && (
                <div className="absolute right-0 top-full mt-2 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl z-50">
                    <div className="flex flex-col p-2">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-3 rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 transition-colors"
                        >
                            <Copy className="h-4 w-4" />
                            <span>Copiar enlace</span>
                        </button>
                        <div className="my-1 border-t border-zinc-800" />
                        <button
                            onClick={() => handleSocialShare('linkedin')}
                            className="flex items-center gap-3 rounded px-3 py-2 text-sm text-blue-400 hover:bg-zinc-900 transition-colors"
                        >
                            <Linkedin className="h-4 w-4" />
                            <span>LinkedIn</span>
                        </button>
                        <button
                            onClick={() => handleSocialShare('facebook')}
                            className="flex items-center gap-3 rounded px-3 py-2 text-sm text-blue-500 hover:bg-zinc-900 transition-colors"
                        >
                            <Facebook className="h-4 w-4" />
                            <span>Facebook</span>
                        </button>
                        <button
                            onClick={() => handleSocialShare('twitter')}
                            className="flex items-center gap-3 rounded px-3 py-2 text-sm text-cyan-400 hover:bg-zinc-900 transition-colors"
                        >
                            <Twitter className="h-4 w-4" />
                            <span>Twitter/X</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

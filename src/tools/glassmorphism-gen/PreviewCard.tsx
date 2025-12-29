'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PreviewCardProps {
    blur: number;
    opacity: number;
    saturation: number;
    radius: number;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ blur, opacity, saturation, radius }) => {
    const glassStyles = {
        backgroundColor: `rgba(255, 255, 255, ${opacity / 100})`,
        borderRadius: radius,
        backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    };

    return (
        <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-900/70 p-8 shadow-[0_30px_120px_-50px_rgba(0,0,0,0.85)]">
            <div className="pointer-events-none absolute inset-0">
                <motion.div
                    className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.55),rgba(56,189,248,0))] blur-[70px]"
                    initial={{ opacity: 0.7, rotate: -8 }}
                    animate={{ opacity: 0.9, rotate: 12 }}
                    transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-[-60px] right-[-20px] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(236,72,153,0.55),rgba(236,72,153,0))] blur-[80px]"
                    initial={{ opacity: 0.65, rotate: 0 }}
                    animate={{ opacity: 0.95, rotate: 18 }}
                    transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
            </div>

            <motion.div
                layout
                className="relative z-10 mx-auto flex max-w-xl flex-col gap-4 border border-white/30 px-8 py-10 text-white shadow-[0_15px_80px_-40px_rgba(0,0,0,0.85)]"
                style={glassStyles}
                transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            >
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-white/70">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="14" y="3" rx="1" /><path d="M10 21V8a1 1 0 0 1 1-1h11" /><rect width="7" height="7" x="3" y="14" rx="1" /><path d="M3 10h11a1 1 0 0 1 1 1v11" /></svg>
                    </span>
                    Interface Preview
                </div>

                <p className="text-2xl font-semibold tracking-tight text-white drop-shadow-sm">
                    Crystal Dashboard
                </p>
                <p className="text-sm leading-relaxed text-white/80">
                    La tarjeta se mezcla con el fondo gracias al desenfoque y la saturación controlada. Ajusta
                    el vidrio esmerilado y observa cómo las luces del fondo se filtran de forma sutil.
                </p>

                <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/80">
                    <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1">
                        Blur: {blur.toFixed(0)}px
                    </span>
                    <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1">
                        Opacidad: {opacity.toFixed(0)}%
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">
                        Saturación: {saturation.toFixed(0)}%
                    </span>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                        Radio: {radius.toFixed(0)}px
                    </span>
                </div>
            </motion.div>
        </div>
    );
};

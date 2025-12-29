'use client';

import { useCallback, useMemo, useRef, useSyncExternalStore, useState } from 'react';
import { Star } from 'lucide-react';

import {
    addFavorite,
    isFavorite as isFavoriteInStorage,
    removeFavorite,
} from '@/utils/storage';

type FavoriteButtonProps = {
    toolId: string;
    className?: string;
    onToggle?: (isFavorite: boolean) => void;
};

export function FavoriteButton({ toolId, className, onToggle }: FavoriteButtonProps) {
    const [isReady] = useState(() => typeof window !== 'undefined');

    const listenersRef = useRef<Set<() => void>>(new Set());

    const subscribe = useMemo(() => {
        return (callback: () => void) => {
            listenersRef.current.add(callback);
            return () => listenersRef.current.delete(callback);
        };
    }, []);

    const notify = useCallback(() => {
        listenersRef.current.forEach((cb) => cb());
    }, []);

    const isFavorite = useSyncExternalStore(
        subscribe,
        () => (isReady ? isFavoriteInStorage(toolId) : false),
        () => false
    );

    const handleToggle = useCallback(() => {
        if (!isReady) return;

        const next = !isFavorite;
        if (next) {
            addFavorite(toolId);
        } else {
            removeFavorite(toolId);
        }
        notify();
        onToggle?.(next);
    }, [isFavorite, isReady, notify, onToggle, toolId]);

    return (
        <button
            type="button"
            aria-pressed={isFavorite}
            onClick={handleToggle}
            disabled={!isReady}
            className={`inline-flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-sm transition hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-60 ${className || ''}`}
        >
            <Star
                className="h-4 w-4"
                fill={isFavorite ? 'currentColor' : 'none'}
                strokeWidth={1.75}
            />
            <span>{isFavorite ? 'Favorito' : 'Marcar'}</span>
        </button>
    );
}

'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { darkMode } = useUserStore();

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return <>{children}</>;
}

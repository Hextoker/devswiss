import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
    favorites: string[];
    darkMode: boolean;
    toggleFavorite: (toolId: string) => void;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            favorites: [],
            darkMode: false,
            toggleFavorite: (toolId) =>
                set((state) => ({
                    favorites: state.favorites.includes(toolId)
                        ? state.favorites.filter((id) => id !== toolId)
                        : [...state.favorites, toolId],
                })),
            toggleDarkMode: () =>
                set((state) => ({ darkMode: !state.darkMode })),
            setDarkMode: (value) => set({ darkMode: value }),
        }),
        {
            name: 'user-storage',
        }
    )
);

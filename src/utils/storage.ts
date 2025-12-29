const STORAGE_KEY = 'devswiss_storage';

type DevSwissStorage = {
    favoriteIds: string[];
};

const emptyStorage: DevSwissStorage = { favoriteIds: [] };

const isBrowser = () => typeof window !== 'undefined';

const sanitizeIds = (ids: unknown): string[] => {
    if (!Array.isArray(ids)) return [];
    return ids.filter((id): id is string => typeof id === 'string');
};

const readStorage = (): DevSwissStorage => {
    if (!isBrowser()) return emptyStorage;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyStorage;

        const parsed = JSON.parse(raw) as Partial<DevSwissStorage>;
        return {
            favoriteIds: sanitizeIds(parsed.favoriteIds),
        };
    } catch (error) {
        console.warn('DevSwiss favorites: failed to read storage', error);
        return emptyStorage;
    }
};

const writeStorage = (data: DevSwissStorage) => {
    if (!isBrowser()) return;

    try {
        const uniqueIds = Array.from(new Set(sanitizeIds(data.favoriteIds)));
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ favoriteIds: uniqueIds })
        );
    } catch (error) {
        console.warn('DevSwiss favorites: failed to write storage', error);
    }
};

export const getFavorites = (): string[] => {
    return readStorage().favoriteIds;
};

export const addFavorite = (toolId: string): string[] => {
    if (!toolId) return getFavorites();

    const current = readStorage().favoriteIds;
    if (current.includes(toolId)) return current;

    const updated = [...current, toolId];
    writeStorage({ favoriteIds: updated });
    return updated;
};

export const removeFavorite = (toolId: string): string[] => {
    const current = readStorage().favoriteIds;
    if (!current.includes(toolId)) return current;

    const updated = current.filter((id) => id !== toolId);
    writeStorage({ favoriteIds: updated });
    return updated;
};

export const isFavorite = (toolId: string): boolean => {
    return readStorage().favoriteIds.includes(toolId);
};

export const getStorageKey = () => STORAGE_KEY;

'use client';

import { useState, useCallback, useMemo } from 'react';

interface ValidationResult {
    isValid: boolean;
    error: string | null;
}

const STORAGE_KEY = 'devswiss-json-master-indent';

const deriveLineColumn = (input: string, position: number) => {
    const slice = input.slice(0, position);
    const lines = slice.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1]?.length ?? 0;
    return { line, column };
};

const formatErrorMessage = (input: string, rawMessage: string): string => {
    const positionMatch = rawMessage.match(/position (\d+)/i);
    if (!positionMatch) {
        return rawMessage;
    }
    const position = Number(positionMatch[1]);
    const { line, column } = deriveLineColumn(input, position);
    return `${rawMessage} (línea ${line}, columna ${column + 1})`;
};

export const useJSONProcessor = () => {
    const [jsonInput, setJsonInput] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [indentSize, setIndentSize] = useState<number>(() => {
        if (typeof window === 'undefined') return 2;
        const savedIndent = localStorage.getItem(STORAGE_KEY);
        return savedIndent ? Number(savedIndent) : 2;
    });

    const setPreferredIndent = useCallback((size: number) => {
        setIndentSize(size);
        localStorage.setItem(STORAGE_KEY, String(size));
    }, []);

    const validate = useCallback(
        (input: string): ValidationResult => {
            if (!input.trim()) {
                return { isValid: true, error: null };
            }
            try {
                JSON.parse(input);
                return { isValid: true, error: null };
            } catch (err) {
                if (err instanceof Error) {
                    return {
                        isValid: false,
                        error: formatErrorMessage(input, err.message),
                    };
                }
                return { isValid: false, error: 'No se pudo parsear el JSON.' };
            }
        },
        []
    );

    const updateInput = useCallback(
        (input: string) => {
            setJsonInput(input);
            const result = validate(input);
            setError(result.error);
        },
        [validate]
    );

    const format = useCallback(() => {
        if (!jsonInput.trim()) return;
        try {
            const parsed = JSON.parse(jsonInput);
            const formatted = JSON.stringify(parsed, null, indentSize);
            setJsonInput(formatted);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(formatErrorMessage(jsonInput, err.message));
            }
        }
    }, [jsonInput, indentSize]);

    const minify = useCallback(() => {
        if (!jsonInput.trim()) return;
        try {
            const parsed = JSON.parse(jsonInput);
            const minified = JSON.stringify(parsed);
            setJsonInput(minified);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(formatErrorMessage(jsonInput, err.message));
            }
        }
    }, [jsonInput]);

    const clear = useCallback(() => {
        setJsonInput('');
        setError(null);
    }, []);

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(jsonInput);
            return true;
        } catch (err) {
            console.error('Failed to copy successfully', err);
            return false;
        }
    }, [jsonInput]);

    const stats = useMemo(() => {
        if (!jsonInput.length) return null;
        const bytes = new Blob([jsonInput]).size;
        const lines = jsonInput.split('\n').length;
        return { bytes, lines };
    }, [jsonInput]);

    return {
        jsonInput,
        error,
        indentSize,
        stats,
        isValid: !error,
        setIndentSize: setPreferredIndent,
        updateInput,
        format,
        minify,
        clear,
        copyToClipboard,
    };
};

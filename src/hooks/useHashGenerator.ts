'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlgorithmInfo,
    HashAlgorithm,
    HashResult,
    computeHash,
    generateSecurePassword,
    getAlgorithmInfo,
    getAlgorithms,
} from '@/utils/hashUtils';

type CopyState = 'idle' | 'copied' | 'error';

export const useHashGenerator = () => {
    const [algorithm, setAlgorithm] = useState<HashAlgorithm>('argon2id');
    const [input, setInput] = useState<string>('');
    const [hashResult, setHashResult] = useState<HashResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copyState, setCopyState] = useState<CopyState>('idle');

    const algorithms = useMemo<AlgorithmInfo[]>(() => getAlgorithms(), []);
    const selected = useMemo<AlgorithmInfo>(() => getAlgorithmInfo(algorithm), [algorithm]);

    const runHash = useCallback(
        async (value: string, algo?: HashAlgorithm) => {
            const targetAlgo = algo ?? algorithm;
            if (!value) {
                setError('Ingresa una contraseña o genera una aleatoria.');
                setHashResult(null);
                return;
            }
            setLoading(true);
            setError(null);
            setCopyState('idle');
            try {
                const result = await computeHash(value, targetAlgo);
                setHashResult(result);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'No se pudo generar el hash.';
                setError(message);
                setHashResult(null);
            } finally {
                setLoading(false);
            }
        },
        [algorithm]
    );

    const generateHash = useCallback(() => runHash(input), [input, runHash]);

    const randomizePassword = useCallback(async () => {
        const password = generateSecurePassword();
        setInput(password);
        await runHash(password);
    }, [runHash]);

    const copyHash = useCallback(async () => {
        if (!hashResult?.hash) return false;
        try {
            await navigator.clipboard.writeText(hashResult.hash);
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), 1600);
            return true;
        } catch (err) {
            console.error('No se pudo copiar el hash', err);
            setCopyState('error');
            setTimeout(() => setCopyState('idle'), 1600);
            return false;
        }
    }, [hashResult?.hash]);

    useEffect(() => {
        if (hashResult && input) {
            runHash(input, algorithm);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [algorithm]);

    return {
        algorithm,
        algorithms,
        selected,
        input,
        setInput,
        setAlgorithm,
        hashResult,
        loading,
        error,
        copyState,
        generateHash,
        randomizePassword,
        copyHash,
    };
};

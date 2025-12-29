'use client';

import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

export type HashAlgorithm = 'argon2id' | 'bcrypt' | 'sha256' | 'sha512' | 'md5';
export type SecurityLevel = 'alta' | 'media' | 'baja';

export type AlgorithmInfo = {
    id: HashAlgorithm;
    label: string;
    security: SecurityLevel;
    description: string;
    note: string;
    warning?: string;
};

type Argon2Module = {
    ArgonType: { Argon2d: number; Argon2i: number; Argon2id: number };
    hash: (options: {
        pass: string;
        salt: Uint8Array | string;
        time?: number;
        mem?: number;
        hashLen?: number;
        parallelism?: number;
        type?: number;
    }) => Promise<{ hashHex: string; encoded: string }>;
};

const algorithms: AlgorithmInfo[] = [
    {
        id: 'argon2id',
        label: 'Argon2id',
        security: 'alta',
        description: 'Ganador del PHC, resistente a GPU. Usa memoria y múltiples iteraciones.',
        note: 'Ideal para contraseñas modernas. Usa WebAssembly en tu navegador.',
    },
    {
        id: 'bcrypt',
        label: 'Bcrypt',
        security: 'alta',
        description: 'Clásico con salt y factor de costo. Aún robusto frente a fuerza bruta.',
        note: 'Costo por defecto 12 rounds para balancear seguridad y velocidad.',
    },
    {
        id: 'sha256',
        label: 'SHA-256',
        security: 'media',
        description: 'Función de resumen criptográfica generalista, rápida.',
        note: 'Úsala para integridad de datos. No es adecuada para contraseñas sin sal y stretching.',
    },
    {
        id: 'sha512',
        label: 'SHA-512',
        security: 'media',
        description: 'Más bits que SHA-256 pero igual de rápida.',
        note: 'Para passwords requiere sal y muchas iteraciones externas (PBKDF2, etc).',
    },
    {
        id: 'md5',
        label: 'MD5 (obsoleto)',
        security: 'baja',
        description: 'Rota desde 2004. Vulnerable a colisiones y rainbow tables.',
        note: 'Solo para huellas rápidas en entornos legados. No uses para contraseñas.',
        warning: 'MD5 es inseguro: evita usarlo en producción.',
    },
];

const randomBytes = (size: number): Uint8Array => {
    const array = new Uint8Array(size);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
        return array;
    }
    // Fallback con Math.random solo si Web Crypto no está disponible.
    for (let i = 0; i < size; i += 1) {
        array[i] = Math.floor(Math.random() * 256);
    }
    return array;
};

const loadArgon2 = async (): Promise<Argon2Module> => {
    // Use bundled build to avoid separate WASM loader resolution in Next.js/Turbopack.
    const mod = await import('argon2-browser/dist/argon2-bundled.min.js');
    const resolved = (mod as unknown as { default?: Argon2Module })?.default;
    return (resolved as Argon2Module) || (mod as unknown as Argon2Module);
};

const shaDigest = (value: string, variant: 'sha256' | 'sha512') => {
    if (variant === 'sha256') {
        return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
    }
    return CryptoJS.SHA512(value).toString(CryptoJS.enc.Hex);
};

export type HashResult = {
    hash: string;
    raw?: string;
    detail?: string;
};

export const computeHash = async (value: string, algorithm: HashAlgorithm): Promise<HashResult> => {
    switch (algorithm) {
        case 'bcrypt': {
            const cost = 12;
            const hash = await bcrypt.hash(value, cost);
            return { hash, detail: `bcrypt con salt aleatorio y costo ${cost}` };
        }
        case 'argon2id': {
            try {
                const argon2 = await loadArgon2();
                const salt = randomBytes(16);
                const result = await argon2.hash({
                    pass: value,
                    salt,
                    time: 3,
                    mem: 8192,
                    hashLen: 32,
                    parallelism: 1,
                    type: argon2.ArgonType.Argon2id,
                });
                return {
                    hash: result.encoded,
                    raw: result.hashHex,
                    detail: 'Argon2id · t=3, m=8192KiB, p=1',
                };
            } catch (err) {
                console.warn('Argon2 hashing failed', err);
                throw new Error('Argon2 no está disponible en este navegador.');
            }
        }
        case 'sha256':
            return { hash: shaDigest(value, 'sha256'), detail: 'SHA-256 · integridad rápida' };
        case 'sha512':
            return { hash: shaDigest(value, 'sha512'), detail: 'SHA-512 · integridad rápida' };
        case 'md5':
            return { hash: CryptoJS.MD5(value).toString(CryptoJS.enc.Hex), detail: 'MD5 · inseguro, solo demostrativo' };
        default:
            throw new Error('Algoritmo no soportado');
    }
};

export const getAlgorithms = () => algorithms;

export const getAlgorithmInfo = (id: HashAlgorithm) => {
    return algorithms.find((alg) => alg.id === id) ?? algorithms[0];
};

export const generateSecurePassword = (length = 18) => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%^&*()_+-=[]{}';
    const all = uppercase + lowercase + digits + symbols;

    const ensure = [uppercase, lowercase, digits, symbols].map((pool) => pool[Math.floor(Math.random() * pool.length)]);
    const remaining = length - ensure.length;

    const bytes = randomBytes(Math.max(remaining, 0));
    const chars = [];

    for (let i = 0; i < remaining; i += 1) {
        const idx = bytes[i] % all.length;
        chars.push(all.charAt(idx));
    }

    const password = [...ensure, ...chars]
        .sort(() => Math.random() - 0.5)
        .join('')
        .slice(0, length);

    return password;
};

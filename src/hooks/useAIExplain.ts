'use client';

import { useState } from 'react';

interface ExplainPayload {
    toolName: string;
    content: string;
}

interface AIExplainResponse {
    explanation: string;
    loading: boolean;
    generating: boolean;
    error: string | null;
    explain: (payload: ExplainPayload) => Promise<void>;
    generatePattern: (payload: ExplainPayload) => Promise<string | null>;
}

export const useAIExplain = (): AIExplainResponse => {
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buildRegexExplanation = (pattern: string, flags: string) => {
        const details: string[] = [];

        if (pattern.startsWith('^')) details.push('^ — Ancla de inicio de línea para evitar coincidencias parciales.');
        if (pattern.endsWith('$')) details.push('$ — Ancla de fin de línea para cerrar el patrón.');
        if (/\(\?=/.test(pattern)) details.push('(?=...) — Lookahead positivo: exige la condición sin consumir texto.');
        if (/\(\?!/.test(pattern)) details.push('(?!...) — Lookahead negativo: bloquea coincidencias con esa condición.');
        if (/\\d/.test(pattern)) details.push('\\d — Dígitos del 0 al 9.');
        if (/\\w/.test(pattern)) details.push('\\w — Caracteres de palabra (letras, números o guion bajo).');
        if (/\\s/.test(pattern)) details.push('\\s — Espacios en blanco, saltos de línea o tabs.');
        if (/\[\^/.test(pattern)) details.push('[^...] — Clase negada, excluye los caracteres listados.');
        if (/\{\d+(,\d*)?\}/.test(pattern)) details.push('{m,n} — Controla la cantidad exacta o rango de repeticiones.');
        if (/\\b/.test(pattern)) details.push('\\b — Límite de palabra, separa tokens completos.');
        if (/\\./.test(pattern)) details.push('\\. — Punto escapado, fuerza a coincidir con un punto literal.');

        if (flags) {
            const readableFlags: Record<string, string> = {
                g: 'g — Global: encuentra todas las coincidencias.',
                i: 'i — Insensible a mayúsculas/minúsculas.',
                m: 'm — Multilínea: ^ y $ consideran saltos de línea.',
            };
            const applied = flags
                .split('')
                .map((f) => readableFlags[f])
                .filter(Boolean);
            if (applied.length) details.push(`Flags: ${applied.join(' · ')}`);
        }

        return details.length
            ? ['Desglose rápido de la RegEx:', ...details].join('\n')
            : 'Patrón recibido. Usa símbolos como ^, $, \\b o grupos con () para reglas más precisas.';
    };

    const explain = async ({ toolName, content }: ExplainPayload) => {
        setLoading(true);
        setError(null);
        try {
            // Placeholder for actual API call to an educational assistant.
            await new Promise((resolve) => setTimeout(resolve, 900));

            const lowerTool = toolName.toLowerCase();
            if (lowerTool.includes('regex')) {
                const regexMatch = content.match(/\/(.+)\/([a-z]*)/i);
                const pattern = regexMatch?.[1] || content.trim();
                const flags = regexMatch?.[2] || '';
                setExplanation(buildRegexExplanation(pattern, flags));
                return;
            }

            if (lowerTool.includes('hash')) {
                setExplanation(
                    [
                        'Una función de resumen (hash) toma una entrada y devuelve una huella de longitud fija.',
                        '- Es determinística: la misma entrada produce el mismo hash.',
                        '- Es unidireccional: no existe una “inversa” para recuperar la contraseña; solo puedes verificar comparando hashes.',
                        '- Resistente a colisiones: debería ser difícil encontrar dos entradas con el mismo hash (MD5 ya no cumple esto).',
                        '- Para contraseñas se agrega salt y se usan algoritmos lentos (Argon2/Bcrypt) para frenar ataques de fuerza bruta.',
                        '- SHA/MD5 son rápidos y útiles para integridad, pero no para almacenar passwords sin un esquema adicional (PBKDF2, HKDF, etc).',
                    ].join('\n')
                );
                return;
            }

            if (lowerTool.includes('glass')) {
                const preview = content.trim() || 'Sin CSS generado aún.';
                setExplanation(
                    [
                        'Guía rápida de glassmorphism:',
                        '- `backdrop-filter: blur()` desenfoca solo el fondo que queda detrás de tu tarjeta, no el contenido interno.',
                        '- El fondo debe ser translúcido (`background: rgba(...)`) para dejar pasar color y simular vidrio real.',
                        '- Añade `saturate()` para recuperar color tras el blur y un borde blanco suave para separar la capa.',
                        '- Soporte: Chrome/Edge/Safari modernos lo soportan; Firefox solo con flag `layout.css.backdrop-filter.enabled` y puede variar.',
                        '',
                        'CSS actual:',
                        preview.slice(0, 420),
                    ].join('\n')
                );
                return;
            }

            const preview = content.trim().slice(0, 240) || 'Sin contenido en el editor.';
            setExplanation(
                [
                    `Resumen para ${toolName}:`,
                    '- Detecta problemas comunes (claves duplicadas, comas faltantes) y muestra el error con contexto.',
                    '- Usa "Formatear" para aplicar indentación consistente y "Minificar" para payloads pequeños.',
                    '- Mantén la preferencia de espacios en el selector; se guarda en tu navegador para Zero Friction.',
                    '',
                    'Contexto actual:',
                    preview,
                ].join('\n')
            );
        } catch (err) {
            setError('No se pudo generar la explicación.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generatePattern = async ({ toolName, content }: ExplainPayload) => {
        setGenerating(true);
        setError(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            const lowerContent = content.toLowerCase();
            let pattern = '';
            let rationale: string[] = [];

            if (lowerContent.includes('correo') || lowerContent.includes('email')) {
                pattern = '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
                rationale = [
                    'Local: letras, números y ._%+-',
                    'Dominio: subdominios opcionales con guiones',
                    'TLD de 2+ letras',
                ];
            } else if (lowerContent.includes('url')) {
                pattern = '^(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w-./?%&=]*)?$';
                rationale = ['http/https opcional', 'Dominio con subdominios', 'Ruta y query opcionales'];
            } else if (lowerContent.includes('contrase') || lowerContent.includes('password')) {
                pattern = '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]:\";\'>?<.,]).{12,}$';
                rationale = [
                    'Min 12 caracteres',
                    'Lookaheads: 1 mayúscula, 1 minúscula, 1 dígito, 1 símbolo',
                ];
            } else if (lowerContent.includes('fecha')) {
                pattern = '^(?:19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$';
                rationale = ['Formato ISO YYYY-MM-DD', 'Valida mes 01-12', 'Día 01-31'];
            } else if (lowerContent.includes('telefono') || lowerContent.includes('teléfono') || lowerContent.includes('phone')) {
                pattern = '^\\+?\\d{1,3}?[-.\\s]?\\(?\\d{2,4}\\)?[-.\\s]?\\d{3,4}[-.\\s]?\\d{3,4}$';
                rationale = ['Prefijo internacional opcional', 'Soporta separadores -, . o espacios', 'Bloques flexibles 2-4/3-4/3-4'];
            } else if (lowerContent.includes('uuid')) {
                pattern = '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[1-5][a-fA-F0-9]{3}-[89abAB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}$';
                rationale = ['UUID v1-5', 'Includes variant bits 8,9,a,b'];
            } else {
                const words = lowerContent.split(/\s+/).filter(Boolean);
                pattern = words.length ? words.map((w) => `(?=.*${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`).join('') + '.+' : '.+';
                rationale = ['Patrón genérico basado en las palabras clave detectadas'];
            }

            setExplanation(
                [
                    `Patrón sugerido para ${toolName}:`,
                    pattern,
                    '',
                    'Desglose:',
                    ...rationale.map((item) => `- ${item}`),
                ].join('\n')
            );

            return pattern;
        } catch (err) {
            setError('No se pudo generar la RegEx solicitada.');
            console.error(err);
            return null;
        } finally {
            setGenerating(false);
        }
    };

    return { explanation, loading, generating, error, explain, generatePattern };
};

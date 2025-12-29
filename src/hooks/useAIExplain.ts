'use client';

import { useState } from 'react';

interface ExplainPayload {
    toolName: string;
    content: string;
}

interface AIExplainResponse {
    explanation: string;
    loading: boolean;
    error: string | null;
    explain: (payload: ExplainPayload) => Promise<void>;
}

export const useAIExplain = (): AIExplainResponse => {
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const explain = async ({ toolName, content }: ExplainPayload) => {
        setLoading(true);
        setError(null);
        try {
            // Placeholder for actual API call to an educational assistant.
            await new Promise((resolve) => setTimeout(resolve, 900));

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

    return { explanation, loading, error, explain };
};

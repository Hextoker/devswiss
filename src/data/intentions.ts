export type IntentionKey = 'rut' | 'json' | 'cron' | 'hexColor' | 'base64' | 'jwt';

export type QuickAction = {
    key: IntentionKey;
    title: string;
    description: string;
    path: string;
};

type IntentionDefinition = {
    key: IntentionKey;
    title: string;
    description: string;
    pattern: RegExp;
    normalize?: (input: string) => string;
    buildPath: (value: string) => string;
};

const HEX_COLOR_PATTERN = '^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$';
const BASE64_PATTERN = '(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?';
const BASE64_PATTERN_ANCHORED = `(?=.{16,}$)${BASE64_PATTERN}`;
const DATA_URI_PATTERN = 'data:[^,\\s]*;base64,[A-Za-z0-9+/=\\s]+';
const JWT_PATTERN = '([A-Za-z0-9_-]+)\\.([A-Za-z0-9_-]+)\\.([A-Za-z0-9_-]*)';

const intentions: IntentionDefinition[] = [
    {
        key: 'rut',
        title: 'Validar RUT al vuelo',
        description: 'Abre RUT Validator con el número listo para validar y autocompletar DV.',
        pattern: /^\s*(?:\d{1,3}(?:\.\d{3}){1,2}|\d{7,8})-?[0-9kK]\s*$/,
        normalize: (value) => value.replace(/\s+/g, ''),
        buildPath: (value) => `/tools/rut-validator?value=${encodeURIComponent(value)}`,
    },
    {
        key: 'json',
        title: 'Formatear JSON',
        description: 'Envía el payload a JSON Master para validar y formatear automáticamente.',
        pattern: /^\s*(\{[\s\S]*\}|\[[\s\S]*\])\s*$/,
        normalize: (value) => value.trim(),
        buildPath: (value) => `/tools/json-master?payload=${encodeURIComponent(value)}`,
    },
    {
        key: 'jwt',
        title: 'Inspeccionar JWT',
        description: 'Abre JWT Debugger con el token listo para analizar.',
        pattern: new RegExp(`^\\s*${JWT_PATTERN}\\s*$`),
        normalize: (value) => value.trim(),
        buildPath: (value) => `/tools/jwt-inspector?token=${encodeURIComponent(value)}`,
    },
    {
        key: 'cron',
        title: 'Leer Cron',
        description: 'Abre Cron Predictor con la expresión lista para traducir y validar.',
        pattern: /^\s*([*@\d/,?-]+\s+){4}[*@\d/,?-]+\s*$/,
        normalize: (value) => value.trim().replace(/\s+/g, ' '),
        buildPath: (value) => `/tools/cron-predictor?expression=${encodeURIComponent(value)}`,
    },
    {
        key: 'hexColor',
        title: 'Color Hex detectado',
        description: 'Abre Regex Lab con el color aplicado a un patrón hex válido.',
        pattern: new RegExp(HEX_COLOR_PATTERN, 'i'),
        normalize: (value) => (value.startsWith('#') ? value : `#${value}`),
        buildPath: (value) =>
            `/tools/regex-lab?pattern=${encodeURIComponent(HEX_COLOR_PATTERN)}&test=${encodeURIComponent(value)}&flags=gi`,
    },
    {
        key: 'base64',
        title: 'Decodificar Base64',
        description: 'Abre Base64 & Media Laboratory listo para decodificar data: o cadenas Base64.',
        pattern: new RegExp(`^(?:${DATA_URI_PATTERN}|${BASE64_PATTERN_ANCHORED})$`, 'i'),
        normalize: (value) => value.trim(),
        buildPath: (value) =>
            `/tools/base64-lab?mode=decode&payload=${encodeURIComponent(value)}`,
    },
];

export const detectQuickAction = (query: string): QuickAction | null => {
    const raw = query.trim();
    if (!raw) return null;

    for (const intention of intentions) {
        const match = raw.match(intention.pattern);
        if (!match) continue;

        const normalized = intention.normalize ? intention.normalize(match[0]) : match[0];

        return {
            key: intention.key,
            title: intention.title,
            description: intention.description,
            path: intention.buildPath(normalized),
        };
    }

    return null;
};

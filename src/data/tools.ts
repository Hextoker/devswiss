import { Tool } from '@/types';

export type ToolCategory = 'Seguridad' | 'Datos' | 'Diseño' | 'Automatización' | 'DevTools';

export type ToolMeta = Tool & {
    category: ToolCategory;
    icon:
        | 'shield'
        | 'hash'
        | 'regex'
        | 'json'
        | 'rut'
        | 'clock'
        | 'glass';
    accent: 'emerald' | 'cyan' | 'amber' | 'violet' | 'blue';
    tagline: string;
    spotlight?: boolean;
};

export const toolCategories: ToolCategory[] = [
    'Seguridad',
    'Datos',
    'Diseño',
    'Automatización',
    'DevTools',
];

export const tools: ToolMeta[] = [
    {
        id: 'security-audit',
        name: 'Security Audit',
        description:
            'Detecta el tipo de hash, su nivel de seguridad y recibe un veredicto rápido antes de exponer credenciales.',
        path: '/tools/security-audit',
        category: 'Seguridad',
        icon: 'shield',
        accent: 'emerald',
        tagline: 'Lectura de riesgo y mejores prácticas en segundos',
        keywords: ['seguridad', 'hash', 'auditoria', 'bcrypt', 'argon2'],
        spotlight: true,
    },
    {
        id: 'jwt-inspector',
        name: 'JWT Debugger',
        description:
            'Inspecciona JSON Web Tokens, valida claims criticos y detecta configuraciones inseguras en el navegador.',
        path: '/tools/jwt-inspector',
        category: 'Seguridad',
        icon: 'shield',
        accent: 'blue',
        tagline: 'Decodifica header, payload y firma con alertas instantaneas',
        keywords: ['jwt', 'token', 'auth', 'oauth', 'claims', 'seguridad', 'bearer'],
        spotlight: true,
    },
    {
        id: 'cors-tester',
        name: 'CORS Tester',
        description:
            'Ejecuta fetch con headers personalizados, identifica preflight y diagnostica bloqueos de origen.',
        path: '/tools/cors-tester',
        category: 'Seguridad',
        icon: 'shield',
        accent: 'cyan',
        tagline: 'Preflight visible y errores de origen explicados',
        keywords: ['cors', 'preflight', 'fetch', 'headers', 'access-control', 'seguridad'],
        spotlight: true,
    },
    {
        id: 'hash-generator',
        name: 'Hash Generator',
        description:
            'Genera hashes seguros (Argon2, Bcrypt, SHA) 100% en el navegador con guías educativas.',
        path: '/tools/hash-generator',
        category: 'Seguridad',
        icon: 'hash',
        accent: 'emerald',
        tagline: 'Hashes listos para producción y pruebas rápidas',
        keywords: ['hash', 'bcrypt', 'argon2', 'sha256', 'sha512', 'md5', 'seguridad', 'cryptografia'],
    },
    {
        id: 'regex-lab',
        name: 'Regex Lab',
        description:
            'Laboratorio interactivo para crear, visualizar y explicar expresiones regulares con IA.',
        path: '/tools/regex-lab',
        category: 'DevTools',
        icon: 'regex',
        accent: 'cyan',
        tagline: 'Prueba patrones con vista previa y explicaciones',
        keywords: ['regex', 'expresiones regulares', 'validar', 'visualizar', 'ia', 'educativo'],
    },
    {
        id: 'json-master',
        name: 'JSON Master',
        description: 'Formatea, minifica y valida JSON 100% en tu navegador.',
        path: '/tools/json-master',
        category: 'Datos',
        icon: 'json',
        accent: 'blue',
        tagline: 'Lint, minify y validación sin enviar tus datos',
        keywords: ['json', 'format', 'minify', 'validar', 'lint', 'beautify'],
    },
    {
        id: 'sql-formatter',
        name: 'SQL Formatter',
        description: 'Formatea queries SQL (Postgres/MySQL) con resaltado de sintaxis local.',
        path: '/tools/sql-formatter',
        category: 'Datos',
        icon: 'json',
        accent: 'violet',
        tagline: 'Queries legibles en segundos, sin enviar datos',
        keywords: ['sql', 'postgres', 'mysql', 'formatter', 'beautify', 'query'],
    },
    {
        id: 'base64-lab',
        name: 'Base64 & Media Laboratory',
        description:
            'Codifica y decodifica Base64, además de convertir archivos en Data URI con vista previa local.',
        path: '/tools/base64-lab',
        category: 'Datos',
        icon: 'hash',
        accent: 'cyan',
        tagline: 'Texto, archivos y Data URI 100% en el navegador',
        keywords: ['base64', 'data uri', 'encode', 'decode', 'imagen', 'pdf', 'client-side'],
    },
    {
        id: 'rut-validator',
        name: 'RUT Validator',
        description:
            'Valida, formatea y genera RUTs chilenos con cálculo del DV vía Módulo 11, autocompletado y copias rápidas.',
        path: '/tools/rut-validator',
        category: 'Datos',
        icon: 'rut',
        accent: 'amber',
        tagline: 'DV correcto, formateo automático y generación en vivo',
        keywords: ['rut', 'dv', 'chile', 'validator', 'format', 'generator'],
    },
    {
        id: 'cron-predictor',
        name: 'Cron Predictor',
        description:
            'Predice y genera expresiones cron con traducción humana en vivo, presets y próximas ejecuciones.',
        path: '/tools/cron-predictor',
        category: 'Automatización',
        icon: 'clock',
        accent: 'violet',
        tagline: 'Cron en claro + próximos disparos listos',
        keywords: ['cron', 'scheduler', 'automation', 'productivity'],
    },
    {
        id: 'glassmorphism-gen',
        name: 'Glassmorphism Generator',
        description:
            'Crea tarjetas de vidrio esmerilado con blur, saturación y opacidad en vivo; copia el CSS en un clic.',
        path: '/tools/glassmorphism-gen',
        category: 'Diseño',
        icon: 'glass',
        accent: 'cyan',
        tagline: 'Recetas UI con presets y export CSS inmediata',
        keywords: ['css', 'glass', 'blur', 'backdrop-filter', 'ui', 'glassmorphism'],
    },
    {
        id: 'svg-optimizer',
        name: 'SVG Optimizer',
        description: 'Limpia y minifica SVG con SVGO browser, via drag-and-drop.',
        path: '/tools/svg-optimizer',
        category: 'Diseño',
        icon: 'glass',
        accent: 'emerald',
        tagline: 'SVG ligero con viewBox preservado',
        keywords: ['svg', 'optimize', 'svgo', 'minify', 'vector', 'design'],
    },
];

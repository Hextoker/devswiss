
import { Metadata } from 'next';
import { getEmojiFavicon } from '@/utils/emojiFavicon';

export const metadata: Metadata = {
    title: '🧩 Regex Lab | Probador y Analizador de Expresiones Regulares',
    description: 'Prueba, depura y analiza tus expresiones regulares (Regex) en tiempo real. Entorno gratuito y seguro para desarrolladores.',
    keywords: ['regex tester', 'regex debugger', 'expresiones regulares', 'javascript regex', 'regular expressions', 'devswiss', 'regex online'],
    icons: {
        icon: [{ url: getEmojiFavicon('🧩') }],
    },
    openGraph: {
        title: '🧩 Regex Lab | Probador y Analizador de Expresiones Regulares | DevSwiss',
        description: 'Prueba, depura y analiza tus expresiones regulares (Regex) en tiempo real. Entorno gratuito y seguro para desarrolladores.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/regex-lab/page';

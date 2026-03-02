
import { Metadata } from 'next';
import { getEmojiFavicon } from '@/utils/emojiFavicon';

export const metadata: Metadata = {
    title: '🧊 Glassmorphism Generator | CSS Glass Effect Maker',
    description: 'Crea hermosos efectos de vidrio (glassmorphism) con CSS puro. Generador visual gratuito con código listo para copiar y pegar.',
    keywords: ['glassmorphism generator', 'css glass effect', 'backdrop-filter', 'css generator', 'ui design tools', 'devswiss', 'web design'],
    icons: {
        icon: [{ url: getEmojiFavicon('🧊') }],
    },
    openGraph: {
        title: '🧊 Glassmorphism Generator | CSS Glass Effect Maker | DevSwiss',
        description: 'Crea hermosos efectos de vidrio (glassmorphism) con CSS puro. Generador visual gratuito con código listo para copiar y pegar.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/glassmorphism-gen/page';

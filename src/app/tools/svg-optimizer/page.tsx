import { Metadata } from 'next';
import { getEmojiFavicon } from '@/utils/emojiFavicon';

export const metadata: Metadata = {
    title: '🧊 SVG Optimizer | Limpia y Minifica SVG en el Navegador',
    description:
        'Optimiza, limpia y minifica SVG con SVGO (browser) vía drag-and-drop. Procesamiento 100% client-side.',
    keywords: ['svg optimizer', 'svgo', 'minify svg', 'vector', 'devswiss', 'optimize svg'],
    icons: {
        icon: [{ url: getEmojiFavicon('🧊') }],
    },
    openGraph: {
        title: '🧊 SVG Optimizer | Limpia y Minifica SVG en el Navegador | DevSwiss',
        description:
            'Optimiza, limpia y minifica SVG con SVGO (browser) vía drag-and-drop. Procesamiento 100% client-side.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/svg-optimizer/page';

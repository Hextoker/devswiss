
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JSON Master | Formateador y Validador JSON Online',
    description: 'Formatea, valida y minifica código JSON. Herramienta gratuita para desarrolladores con procesamiento local seguro y "Explain with AI".',
    keywords: ['json formatter', 'json validator', 'pretty print json', 'json minify', 'json online', 'devswiss', 'json tools', 'debug json'],
    openGraph: {
        title: 'JSON Master | Formateador y Validador JSON Online | DevSwiss',
        description: 'Formatea, valida y minifica código JSON. Herramienta gratuita para desarrolladores con procesamiento local seguro y "Explain with AI".',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/json-master/page';

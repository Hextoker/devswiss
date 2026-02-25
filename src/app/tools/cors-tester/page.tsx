import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CORS Tester | Diagnostica Preflight y Errores de Origen',
    description:
        'Prueba peticiones fetch, configura headers y detecta bloqueos CORS con lectura de preflight y respuestas en vivo.',
    keywords: ['cors tester', 'preflight', 'fetch', 'headers', 'access-control', 'devswiss'],
    openGraph: {
        title: 'CORS Tester | Diagnostica Preflight y Errores de Origen | DevSwiss',
        description:
            'Prueba peticiones fetch, configura headers y detecta bloqueos CORS con lectura de preflight y respuestas en vivo.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/cors-tester/page';

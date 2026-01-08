import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Base64 & Media Laboratory | Codificar y Decodificar Base64',
    description: 'Codifica texto, decodifica Base64 y convierte archivos en Data URI directamente en tu navegador. Vista previa para imágenes y soporte local 100%.',
    keywords: [
        'base64',
        'data uri',
        'base64 encoder',
        'base64 decoder',
        'client-side',
        'devswiss',
        'data uri generator',
    ],
    openGraph: {
        title: 'Base64 & Media Laboratory | DevSwiss',
        description: 'Codifica texto, decodifica Base64 y genera Data URI con vista previa de imágenes en el navegador.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/base64-lab/page';

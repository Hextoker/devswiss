
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Validador de RUT Chileno Online | Gratis y Privado',
    description: 'Valida y formatea RUTs chilenos al instante. Herramienta 100% gratuita que procesa los datos en tu navegador para total privacidad.',
    keywords: ['validador rut', 'rut chileno', 'validar rut gratis', 'formato rut', 'algoritmo modulo 11', 'devswiss', 'rut generator', 'online'],
    openGraph: {
        title: 'Validador de RUT Chileno Online | Gratis y Privado | DevSwiss',
        description: 'Valida y formatea RUTs chilenos al instante. Herramienta 100% gratuita que procesa los datos en tu navegador para total privacidad.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/rut-validator/page';

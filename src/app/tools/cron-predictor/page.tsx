
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cron Predictor | Explicación de Expresiones Cron',
    description: 'Traduce expresiones Cron a lenguaje natural y predice las próximas ejecuciones. Herramienta online gratuita para programadores.',
    keywords: ['cron expression', 'cron validator', 'cron schedule', 'crontab guru alternate', 'devswiss', 'cron job generator', 'linux cron'],
    openGraph: {
        title: 'Cron Predictor | Explicación de Expresiones Cron | DevSwiss',
        description: 'Traduce expresiones Cron a lenguaje natural y predice las próximas ejecuciones. Herramienta online gratuita para programadores.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/cron-predictor/page';

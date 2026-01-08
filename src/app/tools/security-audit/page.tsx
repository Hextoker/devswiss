
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Security Audit | Checklist de Seguridad Web',
    description: 'Realiza un chequeo rápido de seguridad para tus aplicaciones web. Lista de verificación y consejos prácticos para developers.',
    keywords: ['web security audit', 'security checklist', 'owasp top 10', 'seguridad web', 'devswiss', 'website audit', 'developer tools'],
    openGraph: {
        title: 'Security Audit | Checklist de Seguridad Web | DevSwiss',
        description: 'Realiza un chequeo rápido de seguridad para tus aplicaciones web. Lista de verificación y consejos prácticos para developers.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/security-audit/page';

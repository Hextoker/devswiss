import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JWT Debugger | Inspector de JSON Web Tokens',
    description:
        'Decodifica JWTs localmente, analiza claims estandar y detecta configuraciones inseguras con explicaciones educativas.',
    keywords: ['jwt', 'token', 'jwt debugger', 'jwt inspector', 'claims', 'auth', 'devswiss'],
    openGraph: {
        title: 'JWT Debugger | Inspector de JSON Web Tokens | DevSwiss',
        description:
            'Decodifica JWTs localmente, analiza claims estandar y detecta configuraciones inseguras con explicaciones educativas.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/jwt-inspector/page';

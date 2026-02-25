import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'SQL Formatter | Formatea Queries Postgres y MySQL',
    description:
        'Editor con resaltado de sintaxis para formatear SQL (Postgres/MySQL) localmente con sql-formatter.',
    keywords: ['sql formatter', 'postgres', 'mysql', 'format sql', 'devswiss', 'sql beautify'],
    openGraph: {
        title: 'SQL Formatter | Formatea Queries Postgres y MySQL | DevSwiss',
        description:
            'Editor con resaltado de sintaxis para formatear SQL (Postgres/MySQL) localmente con sql-formatter.',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/sql-formatter/page';

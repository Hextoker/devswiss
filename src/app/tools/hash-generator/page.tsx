
import { Metadata } from 'next';
import { getEmojiFavicon } from '@/utils/emojiFavicon';

export const metadata: Metadata = {
    title: '🔐 Generador de Hashes Seguros (Bcrypt, Argon2)',
    description: 'Genera hashes seguros como Bcrypt y Argon2 instantáneamente. Ideal para developers. Totalmente gratis y privado (client-side only).',
    keywords: ['hash generator', 'bcrypt online', 'argon2 generator', 'md5', 'sha256', 'password hasher', 'devswiss', 'seguridad web', 'criptografía'],
    icons: {
        icon: [{ url: getEmojiFavicon('🔐') }],
    },
    openGraph: {
        title: '🔐 Generador de Hashes Seguros (Bcrypt, Argon2) | DevSwiss',
        description: 'Genera hashes seguros como Bcrypt y Argon2 instantáneamente. Ideal para developers. Totalmente gratis y privado (client-side only).',
    },
};

export const dynamic = 'force-static';

export { default } from '@/tools/hash-generator/page';

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { ToolLayout } from '@/components/ToolLayout';
import { tools } from '@/data/tools';
import { getSiteUrl } from '@/utils/siteUrl';

const siteUrl = getSiteUrl();

const normalizePathname = (pathname: string | null) => {
    if (!pathname) {
        return null;
    }

    return pathname.endsWith('/') && pathname.length > 1
        ? pathname.slice(0, -1)
        : pathname;
};

const getToolMetaFromPath = (pathname: string | null) => {
    const normalized = normalizePathname(pathname);
    return tools.find((tool) => tool.path === normalized);
};

const getPathnameFromHeaders = async () => {
    const headerList = await headers();
    const rawUrl =
        headerList.get('x-next-url') ||
        headerList.get('x-url') ||
        headerList.get('referer');

    if (!rawUrl) {
        return null;
    }

    try {
        return new URL(rawUrl, siteUrl).pathname;
    } catch {
        return null;
    }
};

const buildOgUrl = (title: string, description: string) => {
    const url = new URL('/api/og', siteUrl);
    url.searchParams.set('title', title);
    url.searchParams.set('description', description);
    return url.toString();
};

export async function generateMetadata(): Promise<Metadata> {
    const pathname = await getPathnameFromHeaders();
    const toolMeta = getToolMetaFromPath(pathname);
    const title = toolMeta?.name ?? 'DevSwiss Tools';
    const description =
        toolMeta?.description ??
        'Utilidades enfocadas en seguridad, datos, automatizacion y diseno.';
    const ogUrl = buildOgUrl(title, description);

    return {
        openGraph: {
            images: [
                {
                    url: ogUrl,
                    width: 1200,
                    height: 630,
                    alt: `${title} - DevSwiss`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            images: [ogUrl],
        },
    };
}

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ToolLayout>{children}</ToolLayout>;
}

import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { tools } from '@/data/tools';
import { getEmojiFavicon } from '@/utils/emojiFavicon';
import { generateOGImageUrl } from '@/utils/ogImageBuilder';

type ToolParams = {
    id: string;
};

type ToolModule = {
    default: ComponentType;
};

const toolTitleOverrides: Record<string, string> = {
    'rut-validator': 'Validador de RUT',
};

const toolEmojiMap: Record<string, string> = {
    'security-audit': '🛡️',
    'jwt-inspector': '🛡️',
    'cors-tester': '🛡️',
    'hash-generator': '🔐',
    'regex-lab': '🧩',
    'json-master': '🧾',
    'sql-formatter': '🧾',
    'base64-lab': '🔐',
    'rut-validator': '🪪',
    'cron-predictor': '⏱️',
    'glassmorphism-gen': '🧊',
    'svg-optimizer': '🧊',
    'image-metadata': '📷',
};

const toolPageLoaders: Record<string, () => Promise<ToolModule>> = {
    'security-audit': () => import('@/tools/security-audit/page'),
    'jwt-inspector': () => import('@/tools/jwt-inspector/page'),
    'cors-tester': () => import('@/tools/cors-tester/page'),
    'hash-generator': () => import('@/tools/hash-generator/page'),
    'regex-lab': () => import('@/tools/regex-lab/page'),
    'json-master': () => import('@/tools/json-master/page'),
    'sql-formatter': () => import('@/tools/sql-formatter/page'),
    'base64-lab': () => import('@/tools/base64-lab/page'),
    'rut-validator': () => import('@/tools/rut-validator/page'),
    'cron-predictor': () => import('@/tools/cron-predictor/page'),
    'glassmorphism-gen': () => import('@/tools/glassmorphism-gen/page'),
    'svg-optimizer': () => import('@/tools/svg-optimizer/page'),
    'image-metadata': () => import('@/tools/image-metadata/page'),
};

const toTitleCase = (value: string | undefined) => {
    if (!value || typeof value !== 'string') {
        return 'Tool';
    }
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const getToolTitle = (id: string) => {
    if (toolTitleOverrides[id]) {
        return toolTitleOverrides[id];
    }

    const toolMeta = tools.find((tool) => tool.id === id);
    return toolMeta?.name ?? toTitleCase(id);
};

const buildDescription = (title: string) =>
    `Herramienta ${title} de DevSwiss que funciona con privacidad total y procesamiento local en tu navegador, sin enviar datos a servidores externos.`;

const getAccentColor = (toolId: string): string | undefined => {
    const tool = tools.find((t) => t.id === toolId);
    return tool?.accent;
};

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams(): Promise<ToolParams[]> {
    return tools.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<ToolParams>;
}): Promise<Metadata> {
    const { id } = await params;
    const toolMeta = tools.find((tool) => tool.id === id);
    const toolTitle = getToolTitle(id);
    const description = buildDescription(toolTitle);
    const accentColor = getAccentColor(id);
    const ogImageUrl = generateOGImageUrl({
        title: toolTitle,
        description,
        accent: accentColor,
    });
    const pageTitle = `${toolTitle} | DevSwiss`;
    const emoji = toolEmojiMap[id];

    return {
        title: pageTitle,
        description,
        keywords: toolMeta?.keywords,
        icons: emoji ? { icon: [{ url: getEmojiFavicon(emoji) }] } : undefined,
        openGraph: {
            title: pageTitle,
            description,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    type: 'image/png',
                    alt: pageTitle,
                },
                // LinkedIn specific image
                {
                    url: generateOGImageUrl({
                        title: toolTitle,
                        description,
                        accent: accentColor,
                        socialNetwork: 'linkedin',
                    }),
                    width: 1200,
                    height: 627,
                    type: 'image/png',
                    alt: pageTitle,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description,
            images: [generateOGImageUrl({
                title: toolTitle,
                description,
                accent: accentColor,
                socialNetwork: 'twitter',
            })],
        },
    };
}

export default async function ToolPage({
    params,
}: {
    params: Promise<ToolParams>;
}) {
    const { id } = await params;
    const loader = toolPageLoaders[id];

    if (!loader) {
        notFound();
    }

    const { default: ToolComponent } = await loader();
    return <ToolComponent />;
}

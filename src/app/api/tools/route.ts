import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

type ToolConfig = {
    id?: string;
    name: string;
    description: string;
    path?: string;
    keywords?: string[];
};

const TOOLS_DIR = path.join(process.cwd(), 'src/tools');

const formatNameFromSlug = (slug: string) =>
    slug
        .split('-')
        .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
        .join(' ');

export async function GET() {
    try {
        const entries = await fs.readdir(TOOLS_DIR, { withFileTypes: true });
        const tools = await Promise.all(
            entries
                .filter((entry) => entry.isDirectory())
                .map(async (entry) => {
                    const slug = entry.name;
                    const configPath = path.join(TOOLS_DIR, slug, 'tool.config.json');
                    try {
                        const raw = await fs.readFile(configPath, 'utf-8');
                        const config = JSON.parse(raw) as ToolConfig;
                        return {
                            id: config.id ?? slug,
                            name: config.name,
                            description: config.description,
                            path: config.path ?? `/tools/${slug}`,
                            keywords: config.keywords ?? [],
                        };
                    } catch {
                        console.warn(`Tool ${slug} missing config. Using defaults.`);
                        return {
                            id: slug,
                            name: formatNameFromSlug(slug),
                            description: 'Herramienta disponible en DevSwiss.',
                            path: `/tools/${slug}`,
                            keywords: [],
                        };
                    }
                })
        );

        const uniqueTools = tools.filter(Boolean);
        return NextResponse.json(uniqueTools);
    } catch (err) {
        console.error('Failed to read tools manifest', err);
        return NextResponse.json({ error: 'No se pudieron cargar las herramientas.' }, { status: 500 });
    }
}

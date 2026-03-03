import { ImageResponse } from 'next/og';

export const runtime = 'edge';

interface OGImageOptions {
    width?: number;
    height?: number;
    title?: string;
    description?: string;
    accent?: string;
    socialNetwork?: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'generic';
}

const sizes = {
    generic: { width: 1200, height: 630 },
    linkedin: { width: 1200, height: 627 },
    facebook: { width: 1200, height: 630 },
    instagram: { width: 1080, height: 1080 },
    twitter: { width: 1024, height: 576 },
};

const normalizeText = (value: string | null, fallback: string, maxLength: number): string => {
    try {
        if (!value || typeof value !== 'string') {
            return fallback;
        }

        const trimmed = value.trim();
        if (!trimmed) {
            return fallback;
        }

        return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed;
    } catch (error) {
        return fallback;
    }
};

const renderInstagramImage = (title: string, description: string, accentColor: string) => (
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            backgroundImage:
                'radial-gradient(900px circle at 50% 50%, rgba(6, 95, 70, 0.3), transparent 60%)',
            padding: '60px',
        } as const}
    >
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
                borderRadius: '40px',
                border: `2px solid ${accentColor}40`,
                background:
                    'linear-gradient(135deg, rgba(24, 24, 27, 0.85), rgba(9, 9, 11, 0.65))',
                textAlign: 'center',
                padding: '60px',
            } as const}
        >
            <div style={{ fontSize: '72px', fontWeight: 700, color: '#ecfeff' }}>
                {title}
            </div>
            <div
                style={{
                    fontSize: '24px',
                    color: 'rgba(226, 232, 240, 0.8)',
                    lineHeight: '1.3',
                    maxWidth: '800px',
                }}
            >
                {description}
            </div>
            <div style={{ fontSize: '20px', color: accentColor }}>
                DevSwiss · Developer Tools
            </div>
        </div>
    </div>
);

const renderDefaultImage = (
    title: string,
    description: string,
    accentColor: string,
) => (
    <div
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            backgroundImage:
                'radial-gradient(900px circle at 20% 15%, rgba(6, 95, 70, 0.2), transparent 60%)',
            padding: '64px',
        } as const}
    >
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '32px',
                border: `1px solid ${accentColor}40`,
                background:
                    'linear-gradient(135deg, rgba(24, 24, 27, 0.75), rgba(9, 9, 11, 0.55))',
                boxShadow: '0 40px 120px rgba(0, 0, 0, 0.45)',
                padding: '64px',
            } as const}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${accentColor} 0%, rgba(6, 95, 70, 0.6) 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0b1f1a',
                        fontSize: '20px',
                        fontWeight: 700,
                        letterSpacing: '1px',
                    }}
                >
                    DS
                </div>
                <div
                    style={{
                        color: 'rgba(226, 232, 240, 0.9)',
                        fontSize: '28px',
                        fontWeight: 600,
                        letterSpacing: '1px',
                    }}
                >
                    DevSwiss
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div
                    style={{
                        color: '#ecfeff',
                        fontSize: '64px',
                        fontWeight: 700,
                        lineHeight: '1.05',
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        color: 'rgba(226, 232, 240, 0.78)',
                        fontSize: '28px',
                        lineHeight: '1.4',
                        maxWidth: '980px',
                    }}
                >
                    {description}
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'rgba(148, 163, 184, 0.8)',
                    fontSize: '20px',
                }}
            >
                <div>Developer Swiss Army Knife</div>
                <div style={{ color: accentColor }}>devswiss.cl</div>
            </div>
        </div>
    </div>
);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const title = normalizeText(searchParams.get('title'), 'DevSwiss', 80);
        const description = normalizeText(
            searchParams.get('description'),
            'Developer Swiss Army Knife con herramientas seguras y privadas.',
            180,
        );
        const accentColor = searchParams.get('accent') || '#34d399';
        const socialParam = searchParams.get('social') || 'generic';
        const socialNetwork: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'generic' = 
            socialParam as any;

        const size = sizes[socialNetwork];

        // Select render function based on platform
        const imageContent =
            socialNetwork === 'instagram'
                ? renderInstagramImage(title, description, accentColor)
                : renderDefaultImage(title, description, accentColor);

        return new ImageResponse(imageContent, {
            width: size.width,
            height: size.height,
        });
    } catch (error) {
        console.error('OG Image generation error:', error);
        // Return a fallback simple image on error
        return new ImageResponse(
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#09090b',
                    fontSize: '48px',
                    color: '#fff',
                }}
            >
                DevSwiss
            </div>,
            { width: 1200, height: 630 },
        );
    }
}

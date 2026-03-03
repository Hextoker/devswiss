import { ImageResponse } from 'next/og';

export const runtime = 'edge';

interface SocialImageParams {
    title?: string;
    description?: string;
    toolName?: string;
    platform?: 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'pinterest';
    accentColor?: string;
    icon?: string;
}

const platformSizes = {
    linkedin: { width: 1200, height: 627 },
    facebook: { width: 1200, height: 630 },
    instagram: { width: 1080, height: 1080 },
    twitter: { width: 1024, height: 576 },
    pinterest: { width: 1000, height: 1500 },
};

function getSafeParam(param: string | null): string {
    if (!param || typeof param !== 'string') return '';
    return param.trim();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const title = getSafeParam(searchParams.get('title'));
        const description = getSafeParam(searchParams.get('description'));
        const toolName = getSafeParam(searchParams.get('toolName'));
        const platform = (getSafeParam(searchParams.get('platform')) as keyof typeof platformSizes) || 'linkedin';
        const accentColor = getSafeParam(searchParams.get('accentColor')) || '#34d399';
        const icon = getSafeParam(searchParams.get('icon')) || '';

        const size = platformSizes[platform] || platformSizes.linkedin;

        // Render based on platform
        const imageContent = renderSocialImage({
            title: title || 'DevSwiss',
            description: description || 'Developer tools with privacy',
            toolName,
            platform,
            accentColor,
            icon,
            size,
        });

        return new ImageResponse(imageContent, {
            width: size.width,
            height: size.height,
        });
    } catch (error) {
        console.error('Social image generation error:', error);
        return new ImageResponse(
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#09090b',
                    color: '#fff',
                    fontSize: '48px',
                }}
            >
                DevSwiss
            </div>,
            { width: 1200, height: 630 },
        );
    }
}

function renderSocialImage(params: SocialImageParams & { size: { width: number; height: number } }) {
    const { title, description, toolName, platform, accentColor, size } = params;

    // Instagram square format - centered
    if (platform === 'instagram') {
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#09090b',
                    backgroundImage:
                        'radial-gradient(circle at center, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
                    padding: '60px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        textAlign: 'center',
                    }}
                >
                    {/* Logo Badge */}
                    <div
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '30px',
                            background: `linear-gradient(135deg, ${accentColor} 0%, rgba(6, 95, 70, 0.6) 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0b1f1a',
                            fontSize: '48px',
                            fontWeight: '700',
                            boxShadow: `0 20px 60px ${accentColor}40`,
                        }}
                    >
                        DS
                    </div>

                    {/* Title */}
                    <div
                        style={{
                            fontSize: '56px',
                            fontWeight: '700',
                            color: '#ecfeff',
                            lineHeight: '1.1',
                            maxWidth: '800px',
                        }}
                    >
                        {title}
                    </div>

                    {/* Tool Name Badge */}
                    {toolName && (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: `${accentColor}20`,
                                border: `2px solid ${accentColor}`,
                                borderRadius: '20px',
                                padding: '12px 24px',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: accentColor,
                            }}
                        >
                            {toolName}
                        </div>
                    )}

                    {/* Description */}
                    <div
                        style={{
                            fontSize: '18px',
                            color: 'rgba(226, 232, 240, 0.7)',
                            lineHeight: '1.4',
                            maxWidth: '700px',
                        }}
                    >
                        {description}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            marginTop: '20px',
                            fontSize: '16px',
                            color: 'rgba(148, 163, 184, 0.7)',
                        }}
                    >
                        devswiss.cl
                    </div>
                </div>
            </div>
        );
    }

    // Pinterest tall format
    if (platform === 'pinterest') {
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backgroundColor: '#09090b',
                    backgroundImage: `linear-gradient(135deg, rgba(52, 211, 153, 0.2), ${accentColor}15)`,
                    padding: '60px 40px',
                    paddingTop: '100px',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: `linear-gradient(135deg, ${accentColor} 0%, rgba(6, 95, 70, 0.6) 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0b1f1a',
                        fontSize: '36px',
                        fontWeight: '700',
                        marginBottom: '40px',
                    }}
                >
                    DS
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: '52px',
                        fontWeight: '700',
                        color: '#ecfeff',
                        textAlign: 'center',
                        lineHeight: '1.2',
                        marginBottom: '30px',
                        maxWidth: '800px',
                    }}
                >
                    {title}
                </div>

                {/* Description */}
                <div
                    style={{
                        fontSize: '24px',
                        color: 'rgba(226, 232, 240, 0.78)',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        marginBottom: '50px',
                        maxWidth: '800px',
                    }}
                >
                    {description}
                </div>

                {/* Tool Badge */}
                {toolName && (
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            backgroundColor: `${accentColor}20`,
                            border: `2px solid ${accentColor}`,
                            borderRadius: '24px',
                            padding: '16px 32px',
                            fontSize: '20px',
                            fontWeight: '600',
                            color: accentColor,
                            marginBottom: 'auto',
                        }}
                    >
                        {toolName}
                    </div>
                )}

                {/* Footer - Push to bottom */}
                <div
                    style={{
                        marginTop: 'auto',
                        paddingTop: '40px',
                        textAlign: 'center',
                        fontSize: '18px',
                        color: 'rgba(148, 163, 184, 0.7)',
                    }}
                >
                    devswiss.cl
                </div>
            </div>
        );
    }

    // Default for LinkedIn, Facebook, Twitter
    return (
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
            }}
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
                }}
            >
                {/* Header */}
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
                            fontWeight: '700',
                            letterSpacing: '1px',
                        }}
                    >
                        DS
                    </div>
                    <div
                        style={{
                            color: 'rgba(226, 232, 240, 0.9)',
                            fontSize: '28px',
                            fontWeight: '600',
                            letterSpacing: '1px',
                        }}
                    >
                        DevSwiss
                    </div>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div
                        style={{
                            color: '#ecfeff',
                            fontSize: '64px',
                            fontWeight: '700',
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

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'rgba(148, 163, 184, 0.8)',
                        fontSize: '20px',
                    }}
                >
                    <div>{toolName || 'Developer Swiss Army Knife'}</div>
                    <div style={{ color: accentColor }}>devswiss.cl</div>
                </div>
            </div>
        </div>
    );
}

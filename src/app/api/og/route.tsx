import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const size = {
    width: 1200,
    height: 630,
};

const normalizeText = (value: string | null, fallback: string, maxLength: number) => {
    if (!value) {
        return fallback;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return fallback;
    }

    return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const title = normalizeText(searchParams.get('title'), 'DevSwiss', 80);
    const description = normalizeText(
        searchParams.get('description'),
        'Developer Swiss Army Knife con herramientas seguras y privadas.',
        180,
    );

    return new ImageResponse(
        (
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
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        background:
                            'linear-gradient(135deg, rgba(24, 24, 27, 0.75), rgba(9, 9, 11, 0.55))',
                        boxShadow: '0 40px 120px rgba(0, 0, 0, 0.45)',
                        padding: '64px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '16px',
                                background:
                                    'linear-gradient(135deg, #34d399 0%, #0f766e 100%)',
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
                        <div style={{ color: 'rgba(110, 231, 183, 0.9)' }}>
                            devswiss.cl
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        },
    );
}

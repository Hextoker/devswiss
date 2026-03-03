import { getSiteUrl } from './siteUrl';

export type SocialNetwork = 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'generic';

export interface OGImageConfig {
    title: string;
    description: string;
    accent?: string;
    socialNetwork?: SocialNetwork;
}

// Map accent colors to hex values
const accentColorMap: Record<string, string> = {
    emerald: '#34d399',
    cyan: '#06b6d4',
    amber: '#fbbf24',
    violet: '#a78bfa',
    blue: '#3b82f6',
};

/**
 * Generates an OG image URL with parameters optimized for different social networks
 * @param config - Configuration for the OG image
 * @returns URL to the OG image
 */
export function generateOGImageUrl(config: OGImageConfig): string {
    const siteUrl = getSiteUrl();
    const url = new URL(`${siteUrl}/api/og`);

    url.searchParams.set('title', config.title);
    url.searchParams.set('description', config.description);

    // Resolve accent color
    const accentColor = config.accent
        ? accentColorMap[config.accent] || config.accent
        : accentColorMap.emerald;

    url.searchParams.set('accent', accentColor);

    if (config.socialNetwork) {
        url.searchParams.set('social', config.socialNetwork);
    }

    return url.toString();
}

/**
 * Gets optimized OG image configuration for a specific social network
 */
export function getOptimizedOGConfig(
    baseConfig: OGImageConfig,
    socialNetwork: SocialNetwork,
): { url: string; width: number; height: number; type: string } {
    const url = generateOGImageUrl({ ...baseConfig, socialNetwork });

    const sizes: Record<SocialNetwork, { width: number; height: number }> = {
        linkedin: { width: 1200, height: 627 },
        facebook: { width: 1200, height: 630 },
        instagram: { width: 1080, height: 1080 },
        twitter: { width: 1024, height: 576 },
        generic: { width: 1200, height: 630 },
    };

    const size = sizes[socialNetwork];

    return {
        url,
        width: size.width,
        height: size.height,
        type: 'image/png',
    };
}

/**
 * Generates complete OpenGraph metadata for a tool
 */
export function generateToolOGMetadata(config: OGImageConfig) {
    const genericConfig = getOptimizedOGConfig(config, 'generic');

    return {
        title: config.title,
        description: config.description,
        openGraph: {
            title: config.title,
            description: config.description,
            images: [
                {
                    url: genericConfig.url,
                    width: genericConfig.width,
                    height: genericConfig.height,
                    type: genericConfig.type,
                },
                // LinkedIn specific
                {
                    url: getOptimizedOGConfig(config, 'linkedin').url,
                    width: 1200,
                    height: 627,
                    type: 'image/png',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            image: getOptimizedOGConfig(config, 'twitter').url,
        },
    };
}

/**
 * Builds social media share URLs
 */
export function buildShareUrls(pageUrl: string, config: OGImageConfig) {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(config.title);
    const encodedDescription = encodeURIComponent(config.description);

    return {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=DevSwiss,tools`,
        reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    };
}

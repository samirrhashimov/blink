import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    canonical?: string;
    ogType?: string;
    ogImage?: string;
    twitterHandle?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = "Blink - Your links, organized. A minimalist web-based link storage and collaboration app.",
    canonical = "https://blinklinknet.netlify.app",
    ogType = "website",
    ogImage = "./src/assets/og-image.png", // Make sure to have an OG image
    twitterHandle = "@linzaapps"
}) => {
    const siteTitle = "Blink";
    const fullTitle = title ? `${title} | ${siteTitle}` : `${siteTitle} - Your links, organized`;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:url" content={canonical} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:creator" content={twitterHandle} />
        </Helmet>
    );
};

export default SEO;

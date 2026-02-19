import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  productPrice?: number;
  productCurrency?: string;
  productAvailability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  noIndex?: boolean;
  alternateLanguages?: { lang: string; url: string }[];
  schemaJson?: object | object[];
}

const BASE_URL = 'https://fasterfollow.net';
const DEFAULT_OG_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/VkyjaS5ujxUlvnMyASXBvxQSAzZ2/social-images/social-1767393108363-IMG_0001.webp';
const SITE_NAME = 'فاستر فولو';
const TWITTER_HANDLE = '@fasterfollow';

// Helper to truncate text to a max length
const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  productPrice,
  productCurrency = 'USD',
  productAvailability = 'InStock',
  noIndex = false,
  alternateLanguages,
  schemaJson,
}: SEOHeadProps) => {
  const seoTitle = truncate(title, 60);
  const seoDescription = truncate(description, 155);
  const fullTitle = `${seoTitle} | ${SITE_NAME}`;
  const fullCanonicalUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : BASE_URL;
  const finalOgImage = ogImage || DEFAULT_OG_IMAGE;
  const robotsContent = noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  // Normalize schemaJson to an array for multi-schema support
  const schemas: object[] = schemaJson
    ? Array.isArray(schemaJson)
      ? schemaJson
      : [schemaJson]
    : [];

  return (
    <Helmet>
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Basic Meta */}
      <meta name="description" content={seoDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />

      {/* Canonical */}
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Alternate languages */}
      {alternateLanguages?.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      {alternateLanguages && alternateLanguages.length > 0 && (
        <link rel="alternate" hrefLang="x-default" href={fullCanonicalUrl} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_SA" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Article-specific OG tags */}
      {ogType === 'article' && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === 'article' && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === 'article' && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}

      {/* Product-specific OG tags */}
      {ogType === 'product' && productPrice !== undefined && (
        <>
          <meta property="product:price:amount" content={productPrice.toString()} />
          <meta property="product:price:currency" content={productCurrency} />
          <meta property="product:availability" content={productAvailability} />
        </>
      )}

      {/* Inline JSON-LD schemas passed as prop */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;

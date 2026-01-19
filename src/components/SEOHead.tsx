import { useEffect } from 'react';

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
}: SEOHeadProps) => {
  useEffect(() => {
    // Enforce character limits per 2025 best practices
    const seoTitle = truncate(title, 60);
    const seoDescription = truncate(description, 155);
    const fullTitle = `${seoTitle} | ${SITE_NAME}`;
    const fullCanonicalUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : BASE_URL;
    const finalOgImage = ogImage || DEFAULT_OG_IMAGE;

    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (el) {
        el.setAttribute(attr === 'content' ? 'content' : attr, value);
      } else {
        el = document.createElement('meta');
        const [key, val] = selector.replace(/[\[\]'"]/g, '').split('=');
        if (key.startsWith('name')) {
          el.setAttribute('name', val);
        } else if (key.startsWith('property')) {
          el.setAttribute('property', val);
        }
        el.setAttribute('content', value);
        document.head.appendChild(el);
      }
    };

    // Helper to update or create link tag
    const setLink = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
      let el = document.querySelector(selector);
      if (el) {
        el.setAttribute('href', href);
      } else {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        el.setAttribute('href', href);
        if (hreflang) el.setAttribute('hreflang', hreflang);
        document.head.appendChild(el);
      }
    };

    // Basic meta tags
    setMeta('meta[name="description"]', 'content', seoDescription);
    if (keywords) {
      setMeta('meta[name="keywords"]', 'content', keywords);
    }

    // Robots
    const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    setMeta('meta[name="robots"]', 'content', robotsContent);

    // Canonical URL
    setLink('canonical', fullCanonicalUrl);

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', seoTitle);
    setMeta('meta[property="og:description"]', 'content', seoDescription);
    setMeta('meta[property="og:image"]', 'content', finalOgImage);
    setMeta('meta[property="og:url"]', 'content', fullCanonicalUrl);
    setMeta('meta[property="og:type"]', 'content', ogType);
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);
    setMeta('meta[property="og:locale"]', 'content', 'ar_SA');

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:site"]', 'content', TWITTER_HANDLE);
    setMeta('meta[name="twitter:title"]', 'content', seoTitle);
    setMeta('meta[name="twitter:description"]', 'content', seoDescription);
    setMeta('meta[name="twitter:image"]', 'content', finalOgImage);

    // Article specific OG tags
    if (ogType === 'article') {
      if (articlePublishedTime) {
        setMeta('meta[property="article:published_time"]', 'content', articlePublishedTime);
      }
      if (articleModifiedTime) {
        setMeta('meta[property="article:modified_time"]', 'content', articleModifiedTime);
      }
      if (articleAuthor) {
        setMeta('meta[property="article:author"]', 'content', articleAuthor);
      }
    }

    // Product specific OG tags
    if (ogType === 'product' && productPrice !== undefined) {
      setMeta('meta[property="product:price:amount"]', 'content', productPrice.toString());
      setMeta('meta[property="product:price:currency"]', 'content', productCurrency);
      setMeta('meta[property="product:availability"]', 'content', productAvailability);
    }

    // Alternate languages (hreflang)
    if (alternateLanguages && alternateLanguages.length > 0) {
      alternateLanguages.forEach(({ lang, url }) => {
        setLink('alternate', url, lang);
      });
      // x-default
      setLink('alternate', fullCanonicalUrl, 'x-default');
    }

  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex, articlePublishedTime, articleModifiedTime, articleAuthor, productPrice, productCurrency, productAvailability, alternateLanguages]);

  return null;
};

export default SEOHead;

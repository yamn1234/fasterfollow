/**
 * Generate static HTML pages for all services for SEO crawlers
 * This script runs during build to create pre-rendered service pages
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jljizjuzliucwcvzrtkr.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsaml6anV6bGl1Y3djdnpydGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMzU1NzgsImV4cCI6MjA4MjYxMTU3OH0.mMa5TJECLsLSycO8fJrHf2jOPwpjTDDZCygYQVMbuIQ';
const BASE_URL = 'https://fasterfollow.net';
const OUTPUT_DIR = path.resolve('./public/services');

interface Service {
  slug: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  image_url: string | null;
  price: number;
  min_quantity: number | null;
  max_quantity: number | null;
  delivery_time: string | null;
}

function escapeHtml(text: string | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateServiceHTML(service: Service): string {
  const title = service.seo_title || service.name_ar || service.name;
  const fullTitle = `${title} | فاستر فولو`;
  const description = service.seo_description || service.description_ar || service.description || '';
  const keywords = service.seo_keywords || '';
  const ogTitle = service.og_title || title;
  const ogDescription = service.og_description || description;
  const ogImage = service.og_image || service.image_url || `${BASE_URL}/og-image.png`;
  const canonicalUrl = `${BASE_URL}/services/${service.slug}`;

  // Clean description for meta (remove newlines, limit length)
  const cleanDescription = description.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 155);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(fullTitle)}</title>
  <meta name="description" content="${escapeHtml(cleanDescription)}">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(cleanDescription)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="فاستر فولو">
  <meta property="og:locale" content="ar_SA">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(cleanDescription)}">
  <meta name="twitter:image" content="${escapeHtml(ogImage)}">
  
  <!-- Product Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${escapeHtml(service.name_ar || service.name)}",
    "description": "${escapeHtml(cleanDescription)}",
    "image": "${escapeHtml(ogImage)}",
    "url": "${canonicalUrl}",
    "brand": {
      "@type": "Brand",
      "name": "فاستر فولو"
    },
    "offers": {
      "@type": "Offer",
      "price": "${service.price}",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "${canonicalUrl}"
    }
  }
  </script>
  
  <!-- BreadcrumbList Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "${BASE_URL}/"},
      {"@type": "ListItem", "position": 2, "name": "الخدمات", "item": "${BASE_URL}/services"},
      {"@type": "ListItem", "position": 3, "name": "${escapeHtml(service.name_ar || service.name)}", "item": "${canonicalUrl}"}
    ]
  }
  </script>
  
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  
  <!-- Redirect to SPA after crawler has seen content -->
  <script>
    // Only redirect for browsers, not crawlers
    if (typeof window !== 'undefined' && !navigator.userAgent.match(/bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebot|twitter|linkedin|whatsapp|telegram/i)) {
      window.location.replace('/services/${service.slug}');
    }
  </script>
</head>
<body style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right; max-width: 800px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
  <nav style="margin-bottom: 20px; font-size: 14px; color: #666;">
    <a href="/" style="color: #7c3aed;">الرئيسية</a> / 
    <a href="/services" style="color: #7c3aed;">الخدمات</a> / 
    <span>${escapeHtml(service.name_ar || service.name)}</span>
  </nav>
  
  <article>
    <h1 style="color: #1a1a2e; font-size: 28px; margin-bottom: 16px;">${escapeHtml(service.name_ar || service.name)}</h1>
    
    <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">
      <p style="color: #666; font-size: 16px; line-height: 1.8;">${escapeHtml(service.description_ar || service.description || 'خدمة احترافية من فاستر فولو')}</p>
      
      <div style="margin-top: 20px; padding: 16px; background: #f0f0f5; border-radius: 8px;">
        <p style="margin: 8px 0;"><strong>السعر:</strong> $${service.price} لكل 1000</p>
        ${service.min_quantity ? `<p style="margin: 8px 0;"><strong>الحد الأدنى:</strong> ${service.min_quantity}</p>` : ''}
        ${service.max_quantity ? `<p style="margin: 8px 0;"><strong>الحد الأقصى:</strong> ${service.max_quantity}</p>` : ''}
        ${service.delivery_time ? `<p style="margin: 8px 0;"><strong>وقت التنفيذ:</strong> ${escapeHtml(service.delivery_time)}</p>` : ''}
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="/services/${service.slug}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">اطلب الآن</a>
    </div>
  </article>
  
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 14px;">
    <p>© ${new Date().getFullYear()} فاستر فولو - جميع الحقوق محفوظة</p>
    <p><a href="/services" style="color: #7c3aed;">تصفح جميع الخدمات</a></p>
  </footer>
</body>
</html>`;
}

async function generateServicePages() {
  console.log('🚀 Starting service pages generation...');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Fetch all active services
  const { data: services, error } = await supabase
    .from('services')
    .select(`
      slug, name, name_ar, description, description_ar,
      seo_title, seo_description, seo_keywords,
      og_title, og_description, og_image, image_url,
      price, min_quantity, max_quantity, delivery_time
    `)
    .eq('is_active', true)
    .eq('is_archived', false);

  if (error) {
    console.error('❌ Error fetching services:', error);
    return;
  }

  if (!services || services.length === 0) {
    console.log('⚠️ No active services found');
    return;
  }

  console.log(`📦 Found ${services.length} active services`);

  // Track generated files for _redirects
  const redirects: string[] = [];

  // Generate HTML for each service
  for (const service of services) {
    try {
      const html = generateServiceHTML(service as Service);
      const filePath = path.join(OUTPUT_DIR, `${service.slug}.html`);
      fs.writeFileSync(filePath, html, 'utf-8');
      
      // Add redirect rule
      redirects.push(`/services/${service.slug} /services/${service.slug}.html 200`);
      
      console.log(`✅ Generated: ${service.slug}.html`);
    } catch (err) {
      console.error(`❌ Error generating ${service.slug}:`, err);
    }
  }

  // Update _redirects file
  const redirectsPath = path.resolve('./public/_redirects');
  let existingRedirects = '';
  
  if (fs.existsSync(redirectsPath)) {
    existingRedirects = fs.readFileSync(redirectsPath, 'utf-8');
  }

  // Remove old service redirects and add new ones
  const lines = existingRedirects.split('\n');
  const filteredLines = lines.filter(line => !line.match(/^\/services\/[^\s]+\s+\/services\/[^\s]+\.html\s+200$/));
  
  // Find the position to insert service redirects (before SPA fallback)
  const spaFallbackIndex = filteredLines.findIndex(line => line.includes('/* /index.html'));
  
  const newRedirects = [
    ...filteredLines.slice(0, spaFallbackIndex > 0 ? spaFallbackIndex : filteredLines.length),
    '',
    '# Static HTML pages for SEO (crawlers will see these)',
    ...redirects,
    '',
    ...(spaFallbackIndex > 0 ? filteredLines.slice(spaFallbackIndex) : ['# SPA fallback for all other routes', '/* /index.html 200']),
  ].join('\n').replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(redirectsPath, newRedirects, 'utf-8');
  console.log(`\n📝 Updated _redirects with ${redirects.length} service routes`);

  console.log(`\n✨ Service pages generation complete!`);
}

// Run the generator
generateServicePages().catch(console.error);

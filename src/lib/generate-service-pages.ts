/**
 * Generate static HTML pages for all services for SEO crawlers
 * This script runs during build to create pre-rendered service pages
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
      "url": "${canonicalUrl}",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "USD"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "SA"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": "0",
            "maxValue": "0",
            "unitCode": "d"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": "0",
            "maxValue": "1",
            "unitCode": "d"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "SA",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
        "merchantReturnDays": "0",
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
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
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right; max-width: 800px; margin: 0 auto; padding: 20px; background: #f8f9fa; color: #333; }
    .cta-btn { display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; transition: opacity 0.2s; }
    .cta-btn:hover { opacity: 0.9; }
    .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .info-box { margin-top: 20px; padding: 16px; background: #f0f0f5; border-radius: 8px; }
    .info-box p { margin: 8px 0; }
    h1 { color: #1a1a2e; font-size: 28px; margin-bottom: 16px; }
    nav a { color: #7c3aed; text-decoration: none; }
    footer a { color: #7c3aed; text-decoration: none; }
  </style>
</head>
<body>
  <nav style="margin-bottom: 20px; font-size: 14px; color: #666;">
    <a href="/">الرئيسية</a> / 
    <a href="/services">الخدمات</a> / 
    <span>\${escapeHtml(service.name_ar || service.name)}</span>
  </nav>
  
  <article>
    <h1>\${escapeHtml(service.name_ar || service.name)}</h1>
    
    <div class="card">
      <p style="color: #666; font-size: 16px; line-height: 1.8;">\${escapeHtml(service.description_ar || service.description || 'خدمة احترافية من فاستر فولو')}</p>
      
      <div class="info-box">
        <p><strong>السعر:</strong> $\${service.price} لكل 1000</p>
        \${service.min_quantity ? \`<p><strong>الحد الأدنى:</strong> \${service.min_quantity}</p>\` : ''}
        \${service.max_quantity ? \`<p><strong>الحد الأقصى:</strong> \${service.max_quantity}</p>\` : ''}
        \${service.delivery_time ? \`<p><strong>وقت التنفيذ:</strong> \${escapeHtml(service.delivery_time)}</p>\` : ''}
      </div>
    </div>
    
    <section class="card" style="margin-top: 20px;">
      <h2 style="font-size: 20px; color: #1a1a2e; margin-bottom: 12px;">لماذا فاستر فولو؟</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 8px 0;">✅ تنفيذ فوري وسريع</li>
        <li style="padding: 8px 0;">✅ حسابات حقيقية ومتفاعلة</li>
        <li style="padding: 8px 0;">✅ ضمان مع تعويض فوري</li>
        <li style="padding: 8px 0;">✅ دعم فني على مدار الساعة</li>
        <li style="padding: 8px 0;">✅ أسعار تنافسية</li>
      </ul>
    </section>
    
    <div style="text-align: center; margin-top: 30px;">
      <p style="margin-top: 16px;"><a href="/services" class="cta-btn" style="background: #e5e7eb; color: #333; font-size: 14px; padding: 10px 24px;">تصفح جميع الخدمات</a></p>
    </div>
  </article>
  
  <section class="card" style="margin-top: 20px;">
    <h2 style="font-size: 18px; color: #1a1a2e; margin-bottom: 12px;">خدمات أخرى</h2>
    <p style="color: #666;">اكتشف المزيد من خدماتنا على <a href="/services" style="color: #7c3aed;">صفحة الخدمات</a>. نوفر خدمات لجميع منصات التواصل الاجتماعي بما في ذلك 
      <a href="/services?category=instagram" style="color: #7c3aed;">انستقرام</a>، 
      <a href="/services?category=tiktok" style="color: #7c3aed;">تيك توك</a>، 
      <a href="/services?category=youtube" style="color: #7c3aed;">يوتيوب</a>، 
      <a href="/services?category=twitter" style="color: #7c3aed;">تويتر</a>، 
      <a href="/services?category=snapchat" style="color: #7c3aed;">سناب شات</a>.
    </p>
  </section>
  
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 14px;">
    <p>© \${new Date().getFullYear()} فاستر فولو - جميع الحقوق محفوظة</p>
    <nav style="margin-top: 8px;">
      <a href="/" style="color: #7c3aed; margin: 0 8px;">الرئيسية</a> |
      <a href="/services" style="color: #7c3aed; margin: 0 8px;">الخدمات</a> |
      <a href="/auth" style="color: #7c3aed; margin: 0 8px;">تسجيل الدخول</a> |
      <a href="/blog" style="color: #7c3aed; margin: 0 8px;">المدونة</a>
    </nav>
  </footer>
</body>
</html>`;
}

async function generateServicePages() {
  console.log('🚀 Starting service pages generation...');

  // Clean old generated files and recreate directory
  if (fs.existsSync(OUTPUT_DIR)) {
    const oldFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html'));
    oldFiles.forEach(f => fs.unlinkSync(path.join(OUTPUT_DIR, f)));
    console.log(`🧹 Cleaned ${oldFiles.length} old HTML files`);
  } else {
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

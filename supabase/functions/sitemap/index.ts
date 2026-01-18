import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the base URL from request or use default
    const url = new URL(req.url);
    const baseUrl = url.searchParams.get('baseUrl') || 'https://fasterfollow.lovable.app';

    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/services', priority: '0.9', changefreq: 'daily' },
      { loc: '/blog', priority: '0.8', changefreq: 'daily' },
      { loc: '/auth', priority: '0.5', changefreq: 'monthly' },
    ];

    // Fetch services
    const { data: services } = await supabase
      .from('services')
      .select('slug, updated_at')
      .eq('is_active', true)
      .eq('is_archived', false);

    // Fetch blog posts
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .eq('is_archived', false);

    // Fetch pages
    const { data: pages } = await supabase
      .from('pages')
      .select('slug, updated_at')
      .eq('is_published', true)
      .eq('is_archived', false);

    // Fetch service categories
    const { data: categories } = await supabase
      .from('service_categories')
      .select('slug, updated_at')
      .eq('is_active', true);

    // Build sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '  </url>\n';
    }

    // Add services
    if (services) {
      for (const service of services) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/services/${service.slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `    <lastmod>${new Date(service.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
        xml += '  </url>\n';
      }
    }

    // Add blog posts
    if (blogPosts) {
      for (const post of blogPosts) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
        xml += '  </url>\n';
      }
    }

    // Add pages
    if (pages) {
      for (const page of pages) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/page/${page.slug}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += `    <lastmod>${new Date(page.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
        xml += '  </url>\n';
      }
    }

    // Add categories
    if (categories) {
      for (const category of categories) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/services?category=${category.slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `    <lastmod>${new Date(category.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    // Check if download is requested
    const download = url.searchParams.get('download') === 'true';
    
    const headers: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/xml',
    };

    if (download) {
      headers['Content-Disposition'] = 'attachment; filename="sitemap.xml"';
    }

    return new Response(xml, { headers });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

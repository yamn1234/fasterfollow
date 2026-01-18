import { useEffect, useState } from 'react';

const Sitemap = () => {
  const [xml, setXml] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const baseUrl = 'https://fasterfollow.lovable.app';
        const sitemapUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap?baseUrl=${encodeURIComponent(baseUrl)}`;
        
        const response = await fetch(sitemapUrl);
        const text = await response.text();
        setXml(text);
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  useEffect(() => {
    if (xml && !loading) {
      // Set content type header via meta tag workaround
      document.title = 'Sitemap';
      
      // Create a blob and redirect to download
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      // Replace current page with XML content
      const newWindow = window.open('', '_self');
      if (newWindow) {
        newWindow.document.write(`<pre style="word-wrap: break-word; white-space: pre-wrap;">${xml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
        newWindow.document.close();
      }
    }
  }, [xml, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <pre className="p-4 text-xs overflow-auto whitespace-pre-wrap">
      {xml}
    </pre>
  );
};

export default Sitemap;

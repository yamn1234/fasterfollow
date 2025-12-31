import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageData {
  id: string;
  title: string;
  title_ar: string | null;
  slug: string;
  content: string | null;
  content_ar: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const PageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .eq('is_archived', false)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setPage(data);

      // Update page title
      if (data.seo_title) {
        document.title = data.seo_title;
      } else {
        document.title = data.title_ar || data.title;
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">الصفحة غير موجودة</h1>
          <p className="text-muted-foreground mb-6">الصفحة التي تبحث عنها غير متوفرة</p>
          <Button asChild>
            <Link to="/">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Link>
        </Button>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">
              {page.title_ar || page.title}
            </h1>
          </header>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content_ar || page.content || '' }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default PageView;

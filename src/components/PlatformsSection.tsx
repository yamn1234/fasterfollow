import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  icon: string | null;
  description: string | null;
  description_ar: string | null;
}

const platformColors: Record<string, string> = {
  'instagram': 'from-pink-500 to-purple-600',
  'انستجرام': 'from-pink-500 to-purple-600',
  'انستقرام': 'from-pink-500 to-purple-600',
  'tiktok': 'from-gray-900 to-gray-700',
  'تيك توك': 'from-gray-900 to-gray-700',
  'facebook': 'from-blue-600 to-blue-800',
  'فيسبوك': 'from-blue-600 to-blue-800',
  'youtube': 'from-red-500 to-red-700',
  'يوتيوب': 'from-red-500 to-red-700',
  'twitter': 'from-sky-400 to-sky-600',
  'تويتر': 'from-sky-400 to-sky-600',
  'snapchat': 'from-yellow-400 to-yellow-500',
  'سناب شات': 'from-yellow-400 to-yellow-500',
  'سناب': 'from-yellow-400 to-yellow-500',
  'threads': 'from-gray-800 to-gray-900',
  'ثريدز': 'from-gray-800 to-gray-900',
};

const platformIcons: Record<string, string> = {
  'instagram': '📸',
  'انستجرام': '📸',
  'انستقرام': '📸',
  'tiktok': '🎵',
  'تيك توك': '🎵',
  'facebook': '👍',
  'فيسبوك': '👍',
  'youtube': '▶️',
  'يوتيوب': '▶️',
  'twitter': '🐦',
  'تويتر': '🐦',
  'snapchat': '👻',
  'سناب شات': '👻',
  'سناب': '👻',
  'threads': '🧵',
  'ثريدز': '🧵',
};

const getPlatformColor = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(platformColors)) {
    if (lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  return 'from-primary to-primary-glow';
};

const getPlatformIcon = (name: string, icon: string | null) => {
  if (icon) return icon;
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(platformIcons)) {
    if (lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  return '📱';
};

const PlatformsSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('service_categories')
          .select('id, name, name_ar, slug, icon, description, description_ar')
          .eq('is_active', true)
          .is('parent_id', null)
          .order('sort_order', { ascending: true })
          .limit(6);

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-secondary/30" id="platforms">
        <div className="container flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-secondary/30" id="platforms">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            اختر <span className="text-gradient">منصتك المفضلة</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            نوفر خدمات لجميع منصات التواصل الاجتماعي الشهيرة بأسعار تنافسية وجودة عالية
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
          {categories.map((category) => (
            <Link key={category.id} to={`/services?category=${category.slug}`}>
              <Card variant="platform" className="cursor-pointer group h-full">
                <CardContent className="p-6 text-center">
                  <div
                    className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${getPlatformColor(category.name)} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    {getPlatformIcon(category.name, category.icon)}
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    {category.name_ar || category.name}
                  </h3>
                  {category.description_ar || category.description ? (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {category.description_ar || category.description}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformsSection;
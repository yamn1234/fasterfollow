import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Zap } from "lucide-react";

const services = [
  {
    id: 1,
    title: "زيادة متابعين انستجرام",
    description: "متابعين حقيقيين عرب وأجانب بجودة عالية",
    platform: "انستجرام",
    platformIcon: "📸",
    price: 0.99,
    unit: "1000",
    rating: 4.9,
    orders: 2340,
    isBestSeller: true,
    features: ["سريع", "ضمان", "حقيقي"],
  },
  {
    id: 2,
    title: "زيادة مشاهدات تيك توك",
    description: "مشاهدات سريعة تساعد في الظهور بالاكسبلور",
    platform: "تيك توك",
    platformIcon: "🎵",
    price: 0.49,
    unit: "1000",
    rating: 4.8,
    orders: 3120,
    isBestSeller: true,
    features: ["أسرع خدمة", "ضمان"],
  },
  {
    id: 3,
    title: "زيادة لايكات انستجرام",
    description: "لايكات من حسابات حقيقية ونشطة",
    platform: "انستجرام",
    platformIcon: "📸",
    price: 0.79,
    unit: "1000",
    rating: 4.7,
    orders: 1890,
    isBestSeller: false,
    features: ["حقيقي", "سريع"],
  },
  {
    id: 4,
    title: "زيادة متابعين تيك توك",
    description: "متابعين حقيقيين يتفاعلون مع المحتوى",
    platform: "تيك توك",
    platformIcon: "🎵",
    price: 1.29,
    unit: "1000",
    rating: 4.9,
    orders: 2670,
    isBestSeller: true,
    features: ["ضمان", "حقيقي", "نشط"],
  },
  {
    id: 5,
    title: "زيادة مشتركين يوتيوب",
    description: "مشتركين حقيقيين لقناتك على يوتيوب",
    platform: "يوتيوب",
    platformIcon: "▶️",
    price: 2.99,
    unit: "100",
    rating: 4.6,
    orders: 980,
    isBestSeller: false,
    features: ["حقيقي", "ضمان"],
  },
  {
    id: 6,
    title: "زيادة متابعين تويتر",
    description: "متابعين حقيقيين لحسابك على تويتر",
    platform: "تويتر",
    platformIcon: "🐦",
    price: 1.49,
    unit: "1000",
    rating: 4.7,
    orders: 1450,
    isBestSeller: false,
    features: ["سريع", "ضمان"],
  },
];

const ServicesSection = () => {
  return (
    <section className="py-16 lg:py-24" id="services">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            الخدمات <span className="text-gradient">الأكثر طلباً</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            اكتشف خدماتنا المميزة والأكثر شعبية بين عملائنا
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {services.map((service) => (
            <Card key={service.id} variant="service" className="relative group">
              {service.isBestSeller && (
                <div className="absolute -top-3 right-4 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold gradient-primary text-primary-foreground shadow-md">
                    <Zap className="h-3 w-3" />
                    الأكثر مبيعاً
                  </span>
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
                    {service.platformIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate">{service.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{service.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {service.orders.toLocaleString()} طلب
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-2xl font-bold text-gradient">
                      ${service.price}
                    </span>
                    <span className="text-sm text-muted-foreground mr-1">
                      / {service.unit}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="px-6 pb-6">
                <Button variant="hero" className="w-full group-hover:shadow-lg">
                  <ShoppingCart className="h-4 w-4" />
                  اطلب الآن
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            عرض جميع الخدمات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

import { Card, CardContent } from "@/components/ui/card";

const platforms = [
  {
    name: "انستجرام",
    icon: "📸",
    color: "from-pink-500 to-purple-600",
    services: ["متابعين", "لايكات", "مشاهدات", "تعليقات"],
  },
  {
    name: "تيك توك",
    icon: "🎵",
    color: "from-gray-900 to-gray-700",
    services: ["متابعين", "لايكات", "مشاهدات", "شير"],
  },
  {
    name: "فيسبوك",
    icon: "👍",
    color: "from-blue-600 to-blue-800",
    services: ["متابعين", "لايكات", "مشاهدات", "تعليقات"],
  },
  {
    name: "يوتيوب",
    icon: "▶️",
    color: "from-red-500 to-red-700",
    services: ["مشتركين", "مشاهدات", "لايكات", "ساعات مشاهدة"],
  },
  {
    name: "تويتر",
    icon: "🐦",
    color: "from-sky-400 to-sky-600",
    services: ["متابعين", "لايكات", "ريتويت", "تعليقات"],
  },
  {
    name: "سناب شات",
    icon: "👻",
    color: "from-yellow-400 to-yellow-500",
    services: ["متابعين", "مشاهدات", "سكور"],
  },
];

const PlatformsSection = () => {
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
          {platforms.map((platform) => (
            <Card
              key={platform.name}
              variant="platform"
              className="cursor-pointer group"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  {platform.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{platform.name}</h3>
                <div className="flex flex-wrap gap-1 justify-center">
                  {platform.services.slice(0, 2).map((service) => (
                    <span
                      key={service}
                      className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformsSection;

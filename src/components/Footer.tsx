import { ShoppingCart, Mail, MessageCircle, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    services: [
      { label: "انستجرام", href: "#" },
      { label: "تيك توك", href: "#" },
      { label: "فيسبوك", href: "#" },
      { label: "يوتيوب", href: "#" },
      { label: "تويتر", href: "#" },
    ],
    support: [
      { label: "الأسئلة الشائعة", href: "#" },
      { label: "طريقة الطلب", href: "#" },
      { label: "طرق الدفع", href: "#" },
      { label: "تواصل معنا", href: "#" },
    ],
    legal: [
      { label: "سياسة الخصوصية", href: "#" },
      { label: "شروط الاستخدام", href: "#" },
      { label: "سياسة الاسترداد", href: "#" },
    ],
  };

  return (
    <footer className="bg-foreground text-background py-12 lg:py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">متجر المتابعين</span>
            </a>
            <p className="text-background/70 mb-6 leading-relaxed">
              أفضل وأسرع موقع لزيادة المتابعين والتفاعل على جميع منصات التواصل الاجتماعي في العالم العربي.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">الخدمات</h3>
            <ul className="space-y-3">
              {links.services.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">الدعم</h3>
            <ul className="space-y-3">
              {links.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">قانوني</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm">
            © {currentYear} متجر المتابعين. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
              alt="Visa"
              className="h-6 opacity-60 hover:opacity-100 transition-opacity"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
              alt="Mastercard"
              className="h-6 opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

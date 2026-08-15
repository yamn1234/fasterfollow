import { useCustomerLanguage } from "@/contexts/CustomerLanguageContext";

// Extended translations for the entire website
const extendedTranslations: Record<string, { ar: string; en: string }> = {
  // Header
  yourBalance: { ar: 'رصيدك:', en: 'Balance:' },
  controlPanel: { ar: 'لوحة التحكم', en: 'Dashboard' },
  myAccount: { ar: 'حسابي', en: 'My Account' },
  loginBtn: { ar: 'تسجيل الدخول', en: 'Login' },
  
  // Hero Section
  welcomeTo: { ar: 'مرحباً بك في', en: 'Welcome to' },
  metaCommand: { 
    ar: `'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                        
                                            
                                            IMPORTANT:

• Please do not cancel or stop a prompt after sending it. Stopping a prompt may cause credit consumption issues.

• When creating a new project, the first prompt may consume approximately 1 credit. Please allow it to complete fully and avoid interrupting the process.

• For all prompts, do not stop the generation once it has started. Also, do not refresh or reload the page until the prompt has been fully processed.

• If your account starts consuming credits unexpectedly, follow these steps:

Go to Project Settings.

Use "Invite Member" and add your newly created account or another account.

Switch to the invited account.

Continue prompting from the new account.

Following these steps will help prevent unnecessary credit consumption issues.

Correct Usage

After activating your license, open your project and refresh the Lovable page before sending your first prompt.

After sending a prompt, verify that the response shows "Lovable" instead of repeating your prompt text:

✅ "Lovable" appears = No credits used (free mode active)

❌ Your prompt text (for example, "Hello world") appears = Credits are being used. Refresh the page and resend the prompt.

New Project

Creating a new project from the dashboard may consume 1 credit (or less). Once the project is created, all future prompts inside that project are free (no credits used).

Free Project Creation (No Credit Usage)

Method to initialize a project without using credits:

Start creating a new project from the dashboard.

Immediately stop the creation process as soon as it begins.

This initializes the project in free mode without deducting any credits.

Troubleshooting

Additional verification is required. Please complete the captcha and try again.

Fix 1: Disable the Extension and Complete the CAPTCHA

Turn off the extension, send a prompt in Lovable, complete the CAPTCHA, then re-enable the extension.

Fix 2: Change Your IP Address

Connect to a VPN or switch VPN servers, reload Lovable, and try again.

Fix 3: Sign Out and Back In

Log out of Lovable, sign back in, and send your prompt again.

Workspace out of credits

You Have 0 Credits

Important: The extension will not work with 0 credits. Keep at least 1 credit available in your active workspace.

Fix 1 (Recommended)

Wait for your 5 free daily credits to reset (up to 24 hours).

Fix 2

Switch to a workspace with at least 1 available credit, or create a new workspace.

Fix 3

Use another Lovable account that has available credits.

Correct Usage

Reload Lovable after activating your license.

After sending a prompt, make sure the chat prompt shows "Lovable".

If it shows your prompt instead of "Lovable", reload the page and try again.

Project creation was blocked due to suspicious activity

Fix 1: Change Your IP

Connect to a VPN or switch to a different network, then try creating the Lovable project again.

Fix 2: Use Another Workspace or Account

Switch to a different Lovable workspace, or sign in with another account and create the project there.`, 
    en: `'''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
                                        
                                            
                                            IMPORTANT:

• Please do not cancel or stop a prompt after sending it. Stopping a prompt may cause credit consumption issues.

• When creating a new project, the first prompt may consume approximately 1 credit. Please allow it to complete fully and avoid interrupting the process.

• For all prompts, do not stop the generation once it has started. Also, do not refresh or reload the page until the prompt has been fully processed.

• If your account starts consuming credits unexpectedly, follow these steps:

Go to Project Settings.

Use "Invite Member" and add your newly created account or another account.

Switch to the invited account.

Continue prompting from the new account.

Following these steps will help prevent unnecessary credit consumption issues.

Correct Usage

After activating your license, open your project and refresh the Lovable page before sending your first prompt.

After sending a prompt, verify that the response shows "Lovable" instead of repeating your prompt text:

✅ "Lovable" appears = No credits used (free mode active)

❌ Your prompt text (for example, "Hello world") appears = Credits are being used. Refresh the page and resend the prompt.

New Project

Creating a new project from the dashboard may consume 1 credit (or less). Once the project is created, all future prompts inside that project are free (no credits used).

Free Project Creation (No Credit Usage)

Method to initialize a project without using credits:

Start creating a new project from the dashboard.

Immediately stop the creation process as soon as it begins.

This initializes the project in free mode without deducting any credits.

Troubleshooting

Additional verification is required. Please complete the captcha and try again.

Fix 1: Disable the Extension and Complete the CAPTCHA

Turn off the extension, send a prompt in Lovable, complete the CAPTCHA, then re-enable the extension.

Fix 2: Change Your IP Address

Connect to a VPN or switch VPN servers, reload Lovable, and try again.

Fix 3: Sign Out and Back In

Log out of Lovable, sign back in, and send your prompt again.

Workspace out of credits

You Have 0 Credits

Important: The extension will not work with 0 credits. Keep at least 1 credit available in your active workspace.

Fix 1 (Recommended)

Wait for your 5 free daily credits to reset (up to 24 hours).

Fix 2

Switch to a workspace with at least 1 available credit, or create a new workspace.

Fix 3

Use another Lovable account that has available credits.

Correct Usage

Reload Lovable after activating your license.

After sending a prompt, make sure the chat prompt shows "Lovable".

If it shows your prompt instead of "Lovable", reload the page and try again.

Project creation was blocked due to suspicious activity

Fix 1: Change Your IP

Connect to a VPN or switch to a different network, then try creating the Lovable project again.

Fix 2: Use Another Workspace or Account

Switch to a different Lovable workspace, or sign in with another account and create the project there.` 
  },
  tryFree: { ar: 'جرب مجاناً', en: 'Try Free' },
  ultraFast: { ar: 'سرعة فائقة', en: 'Ultra Fast' },
  deliveryInMinutes: { ar: 'توصيل خلال دقائق', en: 'Delivery in minutes' },
  fullGuarantee: { ar: 'ضمان كامل', en: 'Full Guarantee' },
  refundOrCompensation: { ar: 'استرداد أو تعويض', en: 'Refund or compensation' },
  continuousSupport: { ar: 'دعم متواصل', en: '24/7 Support' },
  support247: { ar: '24 ساعة / 7 أيام', en: '24 hours / 7 days' },
  happyCustomer: { ar: 'عميل سعيد', en: 'Happy Customers' },
  availableService: { ar: 'خدمة متاحة', en: 'Services Available' },
  technicalSupport: { ar: 'دعم فني', en: 'Tech Support' },
  
  // Features Section
  whyChooseUs: { ar: 'لماذا متجر المتابعين؟', en: 'Why Choose Us?' },
  uniqueExperience: { ar: 'نقدم لك تجربة فريدة ومميزة تجعلنا الخيار الأول لآلاف العملاء', en: 'We offer a unique experience that makes us the first choice for thousands of customers' },
  fastDelivery: { ar: 'سرعة فائقة', en: 'Fast Delivery' },
  fastDeliveryDesc: { ar: 'تبدأ الخدمة خلال دقائق من الطلب مع تسليم تدريجي طبيعي', en: 'Service starts within minutes with natural gradual delivery' },
  guaranteeDesc: { ar: 'نضمن جميع خدماتنا مع تعويض فوري في حالة النقص', en: 'We guarantee all services with immediate compensation for any shortage' },
  competitivePrices: { ar: 'أسعار تنافسية', en: 'Competitive Prices' },
  competitivePricesDesc: { ar: 'أفضل الأسعار في السوق مع جودة عالية لا مثيل لها', en: 'Best prices in the market with unmatched quality' },
  supportTeam: { ar: 'دعم فني 24/7', en: '24/7 Support' },
  supportTeamDesc: { ar: 'فريق دعم متخصص جاهز لمساعدتك في أي وقت', en: 'Dedicated support team ready to help you anytime' },
  freeGifts: { ar: 'هدايا مجانية', en: 'Free Bonuses' },
  freeGiftsDesc: { ar: 'احصل على رصيد مجاني عند كل شحن وخدمات مجانية', en: 'Get free balance on every deposit and free services' },
  autoSystem: { ar: 'تشغيل آلي', en: 'Auto Processing' },
  autoSystemDesc: { ar: 'نظام آلي متطور لبدء الخدمة فوراً بدون تأخير', en: 'Advanced automated system for instant service start' },
  
  // Services Section
  mostRequestedServices: { ar: 'الخدمات الأكثر طلباً', en: 'Most Requested Services' },
  topServicesSubtitle: { ar: 'اكتشف أفضل خدماتنا المميزة التي يثق بها آلاف العملاء', en: 'Discover our best services trusted by thousands of customers' },
  viewAllServices: { ar: 'عرض جميع الخدمات', en: 'View All Services' },
  orderNow: { ar: 'اطلب الآن', en: 'Order Now' },
  per1000: { ar: 'لكل 1000', en: 'per 1K' },
  review: { ar: 'تقييم', en: 'reviews' },
  
  // Platforms Section
  choosePlatform: { ar: 'اختر', en: 'Choose Your' },
  favoritePlatform: { ar: 'منصتك المفضلة', en: 'Favorite Platform' },
  platformsSubtitle: { ar: 'نوفر خدمات لجميع منصات التواصل الاجتماعي الشهيرة بأسعار تنافسية وجودة عالية', en: 'We provide services for all popular social media platforms at competitive prices and high quality' },
  
  // CTA Section
  getFreeBalance: { ar: 'احصل على رصيد مجاني للتجربة', en: 'Get Free Balance to Try' },
  startYourJourney: { ar: 'ابدأ رحلتك نحو النجاح', en: 'Start Your Journey to Success' },
  onSocialMedia: { ar: 'على السوشيال ميديا', en: 'on Social Media' },
  registerNowDesc: { ar: 'سجل الآن واحصل على رصيد مجاني لتجربة جميع خدماتنا. لا يوجد حد أدنى للشحن!', en: 'Register now and get free balance to try all our services. No minimum deposit!' },
  registerNowFree: { ar: 'سجل الآن مجاناً', en: 'Register Now for Free' },
  contactUs: { ar: 'تواصل معنا', en: 'Contact Us' },
  activeCustomers: { ar: 'عميل نشط', en: 'Active Customers' },
  completedOrders: { ar: 'طلب مكتمل', en: 'Completed Orders' },
  customerSatisfaction: { ar: 'رضا العملاء', en: 'Customer Satisfaction' },
  
  // Footer
  footerDescription: { ar: 'أفضل متجر لخدمات السوشيال ميديا في العالم العربي. نقدم خدمات عالية الجودة بأسعار منافسة.', en: 'The best social media services store in the Arab world. We provide high-quality services at competitive prices.' },
  quickLinks: { ar: 'روابط سريعة', en: 'Quick Links' },
  ourServices: { ar: 'خدماتنا', en: 'Our Services' },
  home: { ar: 'الرئيسية', en: 'Home' },
  services: { ar: 'الخدمات', en: 'Services' },
  blog: { ar: 'المدونة', en: 'Blog' },
  faq: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
  termsOfService: { ar: 'شروط الاستخدام', en: 'Terms of Service' },
  privacyPolicy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
  supportCenter: { ar: 'مركز الدعم', en: 'Support Center' },
  allRightsReserved: { ar: 'جميع الحقوق محفوظة', en: 'All Rights Reserved' },
  
  // Auth Page
  welcomeBack: { ar: 'مرحباً بعودتك', en: 'Welcome Back' },
  loginSubtitle: { ar: 'سجل دخولك للوصول إلى حسابك', en: 'Sign in to access your account' },
  createNewAccount: { ar: 'إنشاء حساب جديد', en: 'Create New Account' },
  registerSubtitle: { ar: 'أنشئ حسابك الآن وابدأ', en: 'Create your account and get started' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  fullName: { ar: 'الاسم الكامل', en: 'Full Name' },
  forgotPassword: { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Register' },
  noAccount: { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  haveAccount: { ar: 'لديك حساب بالفعل؟', en: 'Already have an account?' },
  createAccount: { ar: 'أنشئ حساباً جديداً', en: 'Create a new account' },
  signInWithGoogle: { ar: 'تسجيل الدخول بـ Google', en: 'Sign in with Google' },
  orContinueWith: { ar: 'أو المتابعة بـ', en: 'Or continue with' },
  loggingIn: { ar: 'جاري تسجيل الدخول...', en: 'Logging in...' },
  creatingAccount: { ar: 'جاري إنشاء الحساب...', en: 'Creating account...' },
  
  // Password Recovery
  passwordRecovery: { ar: 'استعادة كلمة المرور', en: 'Password Recovery' },
  enterEmailForCode: { ar: 'أدخل بريدك الإلكتروني لإرسال كود التحقق', en: 'Enter your email to receive a verification code' },
  sendCode: { ar: 'إرسال الكود', en: 'Send Code' },
  sendingCode: { ar: 'جاري الإرسال...', en: 'Sending...' },
  backToLogin: { ar: 'العودة لتسجيل الدخول', en: 'Back to Login' },
  enterVerificationCode: { ar: 'أدخل كود التحقق', en: 'Enter Verification Code' },
  codeSentTo: { ar: 'تم إرسال كود التحقق إلى', en: 'Verification code sent to' },
  verificationCode: { ar: 'كود التحقق', en: 'Verification Code' },
  enterCodePlaceholder: { ar: 'أدخل الكود المكون من 6 أرقام', en: 'Enter the 6-digit code' },
  verifyCode: { ar: 'تحقق من الكود', en: 'Verify Code' },
  verifying: { ar: 'جاري التحقق...', en: 'Verifying...' },
  resendCode: { ar: 'إعادة إرسال الكود', en: 'Resend Code' },
  setNewPassword: { ar: 'تعيين كلمة مرور جديدة', en: 'Set New Password' },
  enterNewPassword: { ar: 'أدخل كلمة المرور الجديدة لحسابك', en: 'Enter your new password' },
  newPassword: { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  confirmPassword: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  saveNewPassword: { ar: 'حفظ كلمة المرور الجديدة', en: 'Save New Password' },
  saving: { ar: 'جاري الحفظ...', en: 'Saving...' },
  
  // Validation Messages
  invalidEmail: { ar: 'البريد الإلكتروني غير صالح', en: 'Invalid email address' },
  passwordMinLength: { ar: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', en: 'Password must be at least 6 characters' },
  fullNameRequired: { ar: 'الاسم الكامل مطلوب', en: 'Full name is required' },
  passwordsNotMatch: { ar: 'كلمتا المرور غير متطابقتين', en: 'Passwords do not match' },
  enter6DigitCode: { ar: 'يرجى إدخال كود التحقق المكون من 6 أرقام', en: 'Please enter the 6-digit verification code' },
  
  // Toast Messages
  loginSuccess: { ar: 'تم تسجيل الدخول بنجاح!', en: 'Logged in successfully!' },
  accountCreated: { ar: 'تم إنشاء الحساب بنجاح!', en: 'Account created successfully!' },
  wrongCredentials: { ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', en: 'Invalid email or password' },
  emailAlreadyRegistered: { ar: 'هذا البريد الإلكتروني مسجل بالفعل', en: 'This email is already registered' },
  unexpectedError: { ar: 'حدث خطأ غير متوقع', en: 'An unexpected error occurred' },
  codeSentSuccess: { ar: 'تم إرسال كود التحقق إلى بريدك الإلكتروني', en: 'Verification code sent to your email' },
  codeVerified: { ar: 'تم التحقق بنجاح', en: 'Verified successfully' },
  invalidCode: { ar: 'كود التحقق غير صحيح أو منتهي الصلاحية', en: 'Invalid or expired verification code' },
  passwordChanged: { ar: 'تم تغيير كلمة المرور بنجاح!', en: 'Password changed successfully!' },
  googleLoginError: { ar: 'حدث خطأ أثناء تسجيل الدخول بـ Google', en: 'Error signing in with Google' },
  
  // Services Page
  allServices: { ar: 'جميع الخدمات', en: 'All Services' },
  searchServices: { ar: 'ابحث عن خدمة...', en: 'Search for a service...' },
  selectCategory: { ar: 'اختر الفئة', en: 'Select Category' },
  allCategories: { ar: 'جميع الفئات', en: 'All Categories' },
  noServicesFound: { ar: 'لا توجد خدمات مطابقة لبحثك', en: 'No services match your search' },
  minQuantity: { ar: 'الحد الأدنى', en: 'Min' },
  maxQuantity: { ar: 'الحد الأقصى', en: 'Max' },
  details: { ar: 'التفاصيل', en: 'Details' },
  
  // Order Dialog
  orderService: { ar: 'طلب الخدمة', en: 'Order Service' },
  enterLink: { ar: 'أدخل الرابط', en: 'Enter Link' },
  linkPlaceholder: { ar: 'https://...', en: 'https://...' },
  quantity: { ar: 'الكمية', en: 'Quantity' },
  comments: { ar: 'تعليقات (اختياري)', en: 'Comments (optional)' },
  commentsPlaceholder: { ar: 'أدخل التعليقات هنا...', en: 'Enter comments here...' },
  totalPrice: { ar: 'السعر الإجمالي:', en: 'Total Price:' },
  confirmOrder: { ar: 'تأكيد الطلب', en: 'Confirm Order' },
  processingOrder: { ar: 'جاري المعالجة...', en: 'Processing...' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  
  // Service Detail Page
  serviceDetails: { ar: 'تفاصيل الخدمة', en: 'Service Details' },
  description: { ar: 'الوصف', en: 'Description' },
  deliveryTime: { ar: 'وقت التسليم', en: 'Delivery Time' },
  instantTo24Hours: { ar: 'فوري - 24 ساعة', en: 'Instant - 24 Hours' },
  rating: { ar: 'التقييم', en: 'Rating' },
  
  // Dashboard
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  overview: { ar: 'نظرة عامة', en: 'Overview' },
  newOrder: { ar: 'طلب جديد', en: 'New Order' },
  myOrders: { ar: 'طلباتي', en: 'My Orders' },
  transactions: { ar: 'سجل العمليات', en: 'Transactions' },
  addBalance: { ar: 'شحن الرصيد', en: 'Add Balance' },
  coupon: { ar: 'كوبون', en: 'Coupon' },
  support: { ar: 'الدعم الفني', en: 'Support' },
  profile: { ar: 'الملف الشخصي', en: 'Profile' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  
  // Common
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  noData: { ar: 'لا توجد بيانات', en: 'No data' },
  save: { ar: 'حفظ', en: 'Save' },
  delete: { ar: 'حذف', en: 'Delete' },
  edit: { ar: 'تعديل', en: 'Edit' },
  view: { ar: 'عرض', en: 'View' },
  close: { ar: 'إغلاق', en: 'Close' },
  confirm: { ar: 'تأكيد', en: 'Confirm' },
  submit: { ar: 'إرسال', en: 'Submit' },
  all: { ar: 'الكل', en: 'All' },
  filter: { ar: 'تصفية', en: 'Filter' },
  refresh: { ar: 'تحديث', en: 'Refresh' },
  copy: { ar: 'نسخ', en: 'Copy' },
  copied: { ar: 'تم النسخ', en: 'Copied' },
  
  // Language
  language: { ar: 'اللغة', en: 'Language' },
  arabic: { ar: 'العربية', en: 'Arabic' },
  english: { ar: 'الإنجليزية', en: 'English' },
  
  // Theme
  darkMode: { ar: 'الوضع الداكن', en: 'Dark Mode' },
  lightMode: { ar: 'الوضع الفاتح', en: 'Light Mode' },
};

export const useTranslation = () => {
  const { language, direction, setLanguage, toggleLanguage, t: contextT } = useCustomerLanguage();
  
  const t = (key: string): string => {
    // First check extended translations
    if (extendedTranslations[key]) {
      return extendedTranslations[key][language];
    }
    // Fall back to context translations
    return contextT(key);
  };
  
  return {
    language,
    direction,
    setLanguage,
    toggleLanguage,
    t,
    isArabic: language === 'ar',
    isEnglish: language === 'en',
  };
};

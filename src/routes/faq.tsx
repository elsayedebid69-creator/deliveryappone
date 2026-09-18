import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { AppHeader, AppFooter } from "@/components/app-header";
import { FoodHubLogo } from "@/components/food-hub-logo";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Bike,
  Store,
  Clock,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "الأسئلة الشائعة | منصة FOODHUB لتوصيل الطعام" },
      {
        name: "description",
        content:
          "إجابات شاملة لكافة الأسئلة الشائعة حول خدمات الطلب والتوصيل فائق السرعة، السلة الموحدة لعدة مطابخ، رادار التتبع المباشر، وطرق الدفع على FoodHub.",
      },
      { property: "og:title", content: "الأسئلة الشائعة | FOODHUB FAQ" },
      {
        property: "og:description",
        content: "كل ما تحتاج معرفته عن خدمات وتطبيقات FOODHUB لتوصيل الوجبات في السعودية.",
      },
    ],
  }),
  component: FaqPage,
});

interface FaqItem {
  id: string;
  category: "delivery" | "cart" | "payment" | "partners" | "general";
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: "f1",
    category: "delivery",
    qAr: "كم يستغرق وقت توصيل الطلب في FoodHub؟",
    qEn: "How long does order delivery take on FoodHub?",
    aAr: "يبدأ وقت التوصيل في FoodHub من 15 إلى 25 دقيقة فقط، بفضل نظام المطابخ السحابية الذكية وتوزيع أسطول الكباتن بالذكاء الاصطناعي وفق المناطق الجغرافية الأكثر طلباً.",
    aEn: "Delivery times range from 15 to 25 minutes, powered by smart cloud kitchen hubs and AI-optimized courier routing.",
  },
  {
    id: "f2",
    category: "delivery",
    qAr: "كيف يعمل رادار تتبع الطلبات المباشر؟",
    qEn: "How does the live order tracking radar work?",
    aAr: "بمجرد خروج الطلب من المطبخ، يتيح لك التطبيق خريطة GPS حية متصلة برادار الكابتن، تعرض سرعة المندوب، والمسار الدقيق، ودرجة حرارة الشنطة الذكية 65°C مع وقت الوصول التنازلي.",
    aEn: "Once dispatched, our live GPS radar displays your courier's speed, exact route, and smart 65°C thermal bag status with real-time countdown ETA.",
  },
  {
    id: "f3",
    category: "cart",
    qAr: "ما هي ميزة السلة الموحدة (Multi-Brand Cart)؟",
    qEn: "What is the Unified Multi-Brand Cart feature?",
    aAr: "تتيح لك منصة FoodHub طلب وجبات من مطعمين أو مطبخين سحابيين مختلفين في نفس الفاتورة وسلة واحدة، ليصلك الطلب في كيس حراري موحد عبر مندوب واحد وبرسوم توصيل مخفضة توفر عليك حتى 50%.",
    aEn: "FoodHub lets you combine dishes from 2 different restaurants or cloud kitchens into a single cart with unified delivery, saving up to 50% on fees.",
  },
  {
    id: "f4",
    category: "cart",
    qAr: "هل توفر المنصة تفاصيل السعرات الحرارية والماكروز؟",
    qEn: "Does the platform show calorie and macro details?",
    aAr: "نعم، كافة الأطباق والوجبات الصحية مزودة بحساب دقيق للسعرات الحرارية، نسبة البروتين، الكربوهيدرات، والدهون لمساعدتك في تتبع حميتك ونظامك الغذائي بدقة.",
    aEn: "Yes, all healthy meals feature accurate calorie, protein, carb, and fat counts to seamlessly match your dietary goals.",
  },
  {
    id: "f5",
    category: "payment",
    qAr: "ما هي طرق الدفع المتاحة على FoodHub؟",
    qEn: "What payment methods are available on FoodHub?",
    aAr: "نوفر كافة وسائل الدفع الإلكتروني المعتمدة: Apple Pay، بطاقات مدى Mada، فيزا وماستركارد، تقسيط تابي وتمارا بدون فوائد، بالإضافة إلى خيار الدفع نقداً عند الاستلام.",
    aEn: "We support Apple Pay, Mada, Visa/Mastercard, Tabby and Tamara interest-free installments, as well as Cash on Delivery.",
  },
  {
    id: "f6",
    category: "payment",
    qAr: "هل الدفع عبر تطبيق وموقع FoodHub آمن؟",
    qEn: "Is payment on FoodHub secure?",
    aAr: "نعم، جميع المعاملات المالية مشفرة بأعلى بروتوكولات الأمان العالمية 256-bit SSL وتتوافق بالكامل مع معايير البنك المركزي السعودي وهيئة الزكاة والضريبة والجمارك (ZATCA).",
    aEn: "Yes, all transactions are protected with 256-bit SSL encryption and full compliance with Saudi Central Bank & ZATCA standards.",
  },
  {
    id: "f7",
    category: "partners",
    qAr: "كيف يمكنني الانضمام كشريك مطعم أو مطبخ سحابي؟",
    qEn: "How can I join as a partner restaurant or cloud kitchen?",
    aAr: "يمكنك تقديم طلب الانضمام عبر صفحة الشراكات أو تحميل التطبيق، حيث نوفر لك شاشة إدارة طلبات KDS متقدمة، ودعماً تقنياً متكاملاً، وعمولة 0% لأول 30 يوماً من التشغيل.",
    aEn: "You can apply via our Partnerships page or app. We provide KDS kitchen screen integration, full tech support, and 0% commission for the first 30 days.",
  },
  {
    id: "f8",
    category: "partners",
    qAr: "كيف أنضم ككابتن توصيل في أسطول FoodHub؟",
    qEn: "How do I become a delivery courier on FoodHub?",
    aAr: "يمكنك التسجيل عبر صفحة الانضمام للكباتن، والحصول على الشنطة الذكية المعزولة وحوافز يومية مجزية مع سحب فوري للأرباح دون تأخير.",
    aEn: "Sign up via the Courier Join page to receive smart thermal gear, competitive daily bonuses, and instant payout withdrawals.",
  },
  {
    id: "f9",
    category: "general",
    qAr: "ماذا أفعل إذا تأخر طلبي أو وصل غير مطابق؟",
    qEn: "What if my order is delayed or incorrect?",
    aAr: "نضمن لك في FoodHub تجربة استثنائية؛ في حال تأخر الطلب عن الوقت المضمون أو وجود أي نقص، يعوضك فريق الدعم الفني الفوري فوراً باسترداد مالي أو كوبون خصم مباشر خلال دقائق عبر مركز المساعدة.",
    aEn: "We guarantee satisfaction; if your order is delayed or incorrect, our 24/7 support team provides instant refunds or wallet credits within minutes.",
  },
];

export function FaqPage() {
  const { lang } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ f1: true, f3: true });

  const categories = [
    { id: "all", nameAr: "الكل", nameEn: "All" },
    { id: "delivery", nameAr: "⚡ السرعة والتوصيل", nameEn: "⚡ Delivery & Speed" },
    { id: "cart", nameAr: "🛒 السلة الموحدة", nameEn: "🛒 Unified Cart" },
    { id: "payment", nameAr: "💳 الدفع والفوترة", nameEn: "💳 Payments & Billing" },
    { id: "partners", nameAr: "🤝 المطابخ والكباتن", nameEn: "🤝 Partners & Fleet" },
    { id: "general", nameAr: "🛡️ الضمان والخدمة", nameEn: "🛡️ Guarantees" },
  ];

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      faq.qAr.toLowerCase().includes(query) ||
      faq.qEn.toLowerCase().includes(query) ||
      faq.aAr.toLowerCase().includes(query) ||
      faq.aEn.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    sounds.playClick();
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="flex-1 w-full pb-20">
        {/* Hero Header */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12 sm:py-16">
          <div className="absolute -top-32 start-1/2 -translate-x-1/2 size-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-2">
              <Link to="/" onClick={() => sounds.playClick()} className="hover:text-amber-400 transition-colors">
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-amber-400 font-bold">{lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1 text-xs font-bold text-amber-300">
              <HelpCircle className="size-3.5" />
              <span>{lang === "ar" ? "مركز الإجابات المعتمد" : "FoodHub Knowledge Base"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {lang === "ar" ? "الأسئلة الشائعة والمتكررة" : "Frequently Asked Questions"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {lang === "ar"
                ? "إجابات فورية وشاملة لكل ما يخص تجربة طلب وجباتك، التوصيل في 15 دقيقة، السلة الموحدة، وخيارات الدفع."
                : "Find instant answers to all your questions about 15-min delivery, multi-brand cart, radar tracking, and payment options."}
            </p>

            {/* Live Search Input */}
            <div className="max-w-lg mx-auto pt-4">
              <div className="relative">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "ar" ? "ابحث عن سؤالك هنا (مثال: التوصيل، الدفع، السلة...)" : "Search questions (e.g. delivery, payments...)"}
                  className="w-full h-11 ps-10 pe-4 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-2xl text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter & FAQ Accordion */}
        <section className="mx-auto max-w-4xl px-4 py-10 space-y-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {lang === "ar" ? cat.nameAr : cat.nameEn}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = !!openIds[faq.id];
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen ? "border-amber-500/40 bg-slate-900/90 shadow-lg shadow-amber-500/5" : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-start gap-4"
                    >
                      <span className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                        <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                        {lang === "ar" ? faq.qAr : faq.qEn}
                      </span>
                      <div className="shrink-0 size-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                        <p>{lang === "ar" ? faq.aAr : faq.aEn}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 space-y-3 bg-slate-900/30 rounded-3xl border border-slate-800">
                <HelpCircle className="size-10 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-400">
                  {lang === "ar" ? "لم نجد أي نتائج تطابق بحثك" : "No FAQs matching your search"}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="text-xs text-amber-400 underline font-bold"
                >
                  {lang === "ar" ? "إعادة تعيين البحث" : "Reset search"}
                </button>
              </div>
            )}
          </div>

          {/* Quick Support Banner */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 text-center space-y-4 shadow-xl">
            <div className="size-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Sparkles className="size-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {lang === "ar" ? "هل لديك سؤال إضافي لم تجد إجابته؟" : "Have a question not listed here?"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {lang === "ar"
                ? "فريق الدعم الفني وخدمة العملاء في FoodHub متواجد على مدار 24 ساعة للإجابة الفورية."
                : "Our FoodHub customer support team is available 24/7 to assist you immediately."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/contact"
                onClick={() => sounds.playClick()}
                className="h-10 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-yellow-300 flex items-center gap-2 shadow-md shadow-amber-500/20"
              >
                <span>{lang === "ar" ? "تواصل معنا مباشرة" : "Contact Support"}</span>
                <ArrowRight className="size-3.5 rtl:rotate-180" />
              </Link>
              <Link
                to="/help"
                onClick={() => sounds.playClick()}
                className="h-10 px-5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 flex items-center gap-2"
              >
                <span>{lang === "ar" ? "زيارة مركز المساعدة" : "Help Center"}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}

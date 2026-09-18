import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { AppHeader, AppFooter } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  LifeBuoy,
  ShieldCheck,
  Zap,
  ShoppingBag,
  CreditCard,
  PhoneCall,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Mail,
  MapPin,
  Flame,
} from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "مركز المساعدة والدعم الفني 24/7 | منصة FOODHUB" },
      {
        name: "description",
        content:
          "مركز مساعدة عملاء FoodHub على مدار الساعة: حل مشكلات الطلبات، تتبع الكباتن، طلبات الاسترجاع الفوري والتعويضات، والمساعدة في الدفع.",
      },
      { property: "og:title", content: "مركز المساعدة | FOODHUB Help Center" },
      {
        property: "og:description",
        content: "دعم فني فوري ومباشر على مدار 24 ساعة لخدمة عملاء وشركاء FOODHUB.",
      },
    ],
  }),
  component: HelpCenterPage,
});

export function HelpCenterPage() {
  const { lang } = useI18n();
  const [activeTicketCategory, setActiveTicketCategory] = useState<string>("delay");
  const [orderNumberInput, setOrderNumberInput] = useState("");
  const [issueDetailsInput, setIssueDetailsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const HELP_CARDS = [
    {
      id: "orders",
      icon: ShoppingBag,
      titleAr: "مشكلات الطلب الحالي والتوصيل",
      titleEn: "Current Order & Delivery Issues",
      descAr: "تأخر المندوب، تعديل العنوان، أو إلغاء الطلب قبل التجهيز.",
      descEn: "Delayed courier, address updates, or pre-prep cancellations.",
      color: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    },
    {
      id: "refunds",
      icon: CreditCard,
      titleAr: "الاسترداد المالي والتعويضات",
      titleEn: "Refunds & In-Wallet Credits",
      descAr: "استرجاع فوري للمبالغ في حال عدم استلام الوجبة أو نقص صنف.",
      descEn: "Instant refunds for missing items or unfulfilled deliveries.",
      color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    },
    {
      id: "radar",
      icon: Zap,
      titleAr: "رادار التتبع وحرارة الشنطة",
      titleEn: "Radar GPS & Thermal Bag Status",
      descAr: "متابعة مسار الكابتن دقيقة بدقيقة ومراقبة حرارة الوجبة 65°C.",
      descEn: "Live courier telemetry and 65°C insulated bag monitoring.",
      color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    },
    {
      id: "account",
      icon: ShieldCheck,
      titleAr: "الحساب والأمان والخصوصية",
      titleEn: "Account Security & Profile",
      descAr: "تحديث رقم الهاتف، إدارة العناوين المسجلة، وحماية الخصوصية.",
      descEn: "Update phone number, saved addresses, and privacy settings.",
      color: "border-purple-500/30 bg-purple-500/5 text-purple-400",
    },
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim() || !issueDetailsInput.trim()) {
      sounds.playClick();
      toast.error(
        lang === "ar"
          ? "يرجى تعبئة رقم الطلب ووصف المشكلة"
          : "Please enter your order number and issue description"
      );
      return;
    }

    setIsSubmitting(true);
    sounds.playClick();

    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSuccess(true);
      sounds.playSuccess();
      toast.success(
        lang === "ar"
          ? "🚀 تم فتح تذكرة دعم فوري برقم #FH-" + Math.floor(100000 + Math.random() * 900000)
          : "🚀 Support ticket opened successfully! #FH-" + Math.floor(100000 + Math.random() * 900000)
      );
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="flex-1 w-full pb-20">
        {/* Hero Header */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12 sm:py-16">
          <div className="absolute -top-32 start-1/2 -translate-x-1/2 size-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-2">
              <Link to="/" onClick={() => sounds.playClick()} className="hover:text-amber-400 transition-colors">
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-cyan-400 font-bold">{lang === "ar" ? "مركز المساعدة" : "Help Center"}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1 text-xs font-bold text-cyan-300">
              <LifeBuoy className="size-3.5" />
              <span>{lang === "ar" ? "دعم فني مباشر على مدار 24 ساعة" : "24/7 Live Dedicated Support"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {lang === "ar" ? "كيف يمكننا مساعدتك اليوم؟" : "How can we help you today?"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {lang === "ar"
                ? "نحن هنا لضمان تجربة مثالية لكل وجبة تطلبها عبر FoodHub؛ اختر الموضوع أو افتح تذكرة مباشرة مع خدمة العملاء."
                : "We are committed to delivering perfection with every meal. Select an issue or open an instant support ticket."}
            </p>
          </div>
        </section>

        {/* 4 Core Help Topics */}
        <section className="mx-auto max-w-5xl px-4 py-12 space-y-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HELP_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className={`rounded-3xl border p-5 space-y-3 transition-all hover:scale-[1.02] ${card.color}`}
                >
                  <div className="size-11 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">
                    {lang === "ar" ? card.titleAr : card.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    {lang === "ar" ? card.descAr : card.descEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Instant Ticket / Issue Resolution Card */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left: Interactive Ticket Form */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-amber-400" />
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {lang === "ar" ? "فتح بلاغ أو طلب مساعدة فوري" : "Open Instant Support Ticket"}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-black text-emerald-300 animate-pulse">
                  {lang === "ar" ? "متوسط الرد: أقل من 3 دقائق" : "Avg Response: < 3 min"}
                </span>
              </div>

              {ticketSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="size-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="size-9" />
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {lang === "ar" ? "تم استلام بلاغك وجارٍ معالجته فوراً!" : "Ticket Received & Being Processed!"}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {lang === "ar"
                      ? "يقوم ممثل خدمة العملاء في FoodHub بمراجعة بيانات الطلب، وسيتم التواصل معك مباشرة عبر التطبيق أو الإيميل المسجل خلال دقائق."
                      : "Our customer care specialist is inspecting your order telemetry and will contact you via app/email shortly."}
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      setTicketSuccess(false);
                      setOrderNumberInput("");
                      setIssueDetailsInput("");
                    }}
                    className="h-10 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                  >
                    {lang === "ar" ? "فتح بلاغ آخر" : "Submit Another Request"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {lang === "ar" ? "نوع المشكلة:" : "Issue Category:"}
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: "delay", labelAr: "⚡ تأخر الطلب", labelEn: "⚡ Delayed" },
                        { id: "wrong", labelAr: "🍽️ صنف ناقص/خطأ", labelEn: "🍽️ Wrong Item" },
                        { id: "payment", labelAr: "💳 مشكلة بالدفع", labelEn: "💳 Payment" },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setActiveTicketCategory(type.id);
                          }}
                          className={`p-2 rounded-xl font-bold transition-all text-[11px] ${
                            activeTicketCategory === type.id
                              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                              : "bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white"
                          }`}
                        >
                          {lang === "ar" ? type.labelAr : type.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {lang === "ar" ? "رقم الطلب (أو رقم الجوال المسجل):" : "Order ID (or Registered Phone):"}
                    </label>
                    <input
                      type="text"
                      value={orderNumberInput}
                      onChange={(e) => setOrderNumberInput(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: #FH-84920 أو 05xxxxxxxx" : "e.g. #FH-84920 or +9665x..."}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {lang === "ar" ? "تفاصيل الشكوى أو الملاحظة:" : "Issue Description:"}
                    </label>
                    <textarea
                      rows={4}
                      value={issueDetailsInput}
                      onChange={(e) => setIssueDetailsInput(e.target.value)}
                      placeholder={
                        lang === "ar"
                          ? "اكتب تفاصيل ما حدث معك لمساعدتك بأسرع ما يمكن..."
                          : "Describe your issue in detail for fast resolution..."
                      }
                      className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20"
                  >
                    {isSubmitting
                      ? (lang === "ar" ? "جارٍ إرسال التذكرة..." : "Sending Ticket...")
                      : (lang === "ar" ? "إرسال التذكرة إلى الدعم الفني الفوري" : "Submit Ticket to 24/7 Support")}
                  </Button>
                </form>
              )}
            </div>

            {/* Right: Guarantees & Contact Direct Channels */}
            <div className="lg:col-span-5 space-y-5">
              {/* 100% Quality Guarantee Card */}
              <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {lang === "ar" ? "ضمان FoodHub الذهبي 100%" : "FoodHub 100% Quality Guarantee"}
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {lang === "ar" ? "توصيل ساخن ومضمون" : "Hot & Punctual Delivery"}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {lang === "ar"
                        ? "استرداد كامل للمبلغ إذا تأخر الطلب عن الوقت الأقصى المضمون."
                        : "100% refund if your order exceeds guaranteed maximum window."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {lang === "ar"
                        ? "شنطة معزولة 65°C تضمن وصول الوجبة بنفس جودة وسخونة المطبخ."
                        : "65°C thermal bags guarantee fresh & hot restaurant taste."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      {lang === "ar"
                        ? "تعويض فوري لأي صنف غير متوفر أو غير مطابق."
                        : "Instant wallet compensation for missing or mismatched dishes."}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Direct Support Channels */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  {lang === "ar" ? "قنوات التواصل المباشرة" : "Direct Contact Channels"}
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <Mail className="size-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-500">{lang === "ar" ? "البريد الإلكتروني للدعم:" : "Support Email:"}</span>
                      <span className="font-mono text-slate-200 font-bold">support@foodhub.com</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <PhoneCall className="size-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-500">{lang === "ar" ? "الخط الساخن الموحد:" : "Hotline:"}</span>
                      <span className="font-mono text-slate-200 font-bold">9200-FOODHUB (+966)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}

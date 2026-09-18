import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { AppHeader, AppFooter } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Handshake,
  Store,
  Bike,
  Building2,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  ChevronLeft,
} from "lucide-react";

export const Route = createFileRoute("/partnerships")({
  head: () => ({
    meta: [
      { title: "الشراكات وانضمام الأعمال | منصة FOODHUB" },
      {
        name: "description",
        content:
          "انضم كشريك مطبخ سحابي أو مطعم، أو كابتن توصيل في أسطول FoodHub. ضاعف مبيعاتك واستفد من تقنيات السلة الموحدة والانتشار الواسع.",
      },
      { property: "og:title", content: "الشراكات والأعمال | FOODHUB Partnerships" },
      {
        property: "og:description",
        content: "بوابة نمو الأعمال والمطابخ السحابية وأساطيل التوصيل في السعودية عبر FOODHUB.",
      },
    ],
  }),
  component: PartnershipsPage,
});

export function PartnershipsPage() {
  const { lang } = useI18n();
  const [partnerType, setPartnerType] = useState<"restaurant" | "courier" | "corporate">("restaurant");
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("الرياض");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const PARTNER_TRACKS = [
    {
      id: "restaurant",
      icon: Store,
      titleAr: "المطاعم والمطابخ السحابية",
      titleEn: "Restaurants & Cloud Kitchens",
      descAr: "شاشة KDS ذكية، دمج في السلة الموحدة، وعمولة 0% لأول شهر.",
      descEn: "Smart KDS screens, multi-brand bundling, and 0% commission for 30 days.",
      badge: "خصم 100% على العمولة لأول شهر",
      color: "border-orange-500/30 bg-orange-500/5 text-orange-400",
    },
    {
      id: "courier",
      icon: Bike,
      titleAr: "كباتن وأساطيل التوصيل",
      titleEn: "Delivery Couriers & Fleets",
      descAr: "دخل يومي مجزي، سحب فوري للأرباح، وشنطة ذكية 65°C مجاناً.",
      descEn: "High daily earnings, instant payouts, and free 65°C thermal equipment.",
      badge: "سحب أرباح يومي فوري",
      color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    },
    {
      id: "corporate",
      icon: Building2,
      titleAr: "حلول الشركات والتموين",
      titleEn: "Corporate & Catering",
      descAr: "باقات وجبات مخصصة للشركات والموظفين مع فواتير ضريبية موحدة.",
      descEn: "Tailored meal subscriptions for enterprise teams with unified tax invoicing.",
      badge: "خصم حتى 30% للشركات",
      color: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactPerson.trim() || !phone.trim()) {
      sounds.playClick();
      toast.error(
        lang === "ar"
          ? "يرجى تعبئة كافة الحقول المطلوبة لطلب الشراكة"
          : "Please complete all required fields"
      );
      return;
    }

    setIsSubmitting(true);
    sounds.playClick();

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      sounds.playSuccess();
      toast.success(
        lang === "ar"
          ? "🎉 تم استلام طلب الشراكة بنجاح! سيتواصل معك مدير الشراكات خلال 24 ساعة."
          : "🎉 Partnership application submitted! Our team will contact you within 24 hours."
      );
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="flex-1 w-full pb-20">
        {/* Hero Header */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12 sm:py-16">
          <div className="absolute -top-32 start-1/2 -translate-x-1/2 size-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-2">
              <Link to="/" onClick={() => sounds.playClick()} className="hover:text-amber-400 transition-colors">
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-orange-400 font-bold">{lang === "ar" ? "الشراكات" : "Partnerships"}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/30 px-4 py-1 text-xs font-bold text-orange-300">
              <Handshake className="size-3.5" />
              <span>{lang === "ar" ? "بوابة نمو الأعمال والشركاء" : "Business Growth & Partner Portal"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {lang === "ar" ? "انضم لشبكة شركاء FOODHUB الرائدة" : "Partner with FOODHUB & Scale Fast"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {lang === "ar"
                ? "سواء كنت مطبخاً سحابياً، علامة مطاعم شهيرة، أو كابتن توصيل؛ نوفر لك أحدث تقنيات التوزيع لزيادة أرباحك وتوسيع نطاق وصولك."
                : "Whether you run a cloud kitchen, a premier restaurant brand, or a courier fleet; we provide next-gen tech to boost your revenue."}
            </p>
          </div>
        </section>

        {/* 3 Partner Tracks Cards */}
        <section className="mx-auto max-w-5xl px-4 py-12 space-y-12">
          <div className="grid md:grid-cols-3 gap-6">
            {PARTNER_TRACKS.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  className={`rounded-3xl border p-6 space-y-4 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-xl ${track.color}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="size-12 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                        <Icon className="size-6" />
                      </div>
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 text-[10px] font-black text-amber-300 border border-slate-800">
                        {track.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white">
                      {lang === "ar" ? track.titleAr : track.titleEn}
                    </h3>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      {lang === "ar" ? track.descAr : track.descEn}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setPartnerType(track.id as any);
                      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{lang === "ar" ? "تقديم طلب الانضمام" : "Apply to Join"}</span>
                    <ChevronLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Application Form */}
          <div
            id="apply-form"
            className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 space-y-8 shadow-2xl"
          >
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400">
                <Sparkles className="size-3.5" />
                <span>{lang === "ar" ? "نموذج تسجيل الشركاء الفوري" : "Instant Partner Application"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {lang === "ar" ? "ابدأ شراكتك معنا اليوم" : "Start Your Partnership Today"}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === "ar"
                  ? "املأ بياناتك وسيقوم فريق تطوير الأعمال بالتواصل معك وتفعيل حسابك خلال 24 ساعة."
                  : "Fill out your details and our business development team will activate your account within 24 hours."}
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <div className="size-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="size-9" />
                </div>
                <h3 className="text-lg font-black text-white">
                  {lang === "ar" ? "تم إرسال طلب الشراكة بنجاح!" : "Application Received!"}
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  {lang === "ar"
                    ? "شكراً لاهتمامك بالانضمام إلى FOODHUB. تم تحويل ملفك إلى قسم الشراكات المختص للبدء الفوري في إجراءات الربط التقني والتشغيلي."
                    : "Thank you for partnering with FOODHUB. Your profile has been assigned to our onboarding specialist."}
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setBusinessName("");
                    setContactPerson("");
                    setPhone("");
                  }}
                  className="h-10 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                >
                  {lang === "ar" ? "تقديم طلب آخر" : "Submit Another Request"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    {lang === "ar" ? "مسار الشراكة المطلوب:" : "Partner Track:"}
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: "restaurant", labelAr: "🏪 مطبخ / مطعم", labelEn: "🏪 Kitchen" },
                      { id: "courier", labelAr: "🛵 كابتن توصيل", labelEn: "🛵 Courier" },
                      { id: "corporate", labelAr: "🏢 شركة / تموين", labelEn: "🏢 Corporate" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setPartnerType(t.id as any);
                        }}
                        className={`p-2.5 rounded-xl font-bold transition-all text-xs ${
                          partnerType === t.id
                            ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                            : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {lang === "ar" ? t.labelAr : t.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {lang === "ar" ? "اسم المنشأة أو الاسم التجاري:" : "Business / Store Name:"}
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: مطبخ الذواقة السحابي" : "e.g. Gourmet Cloud Kitchen"}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {lang === "ar" ? "اسم الشخص المسؤول:" : "Contact Person Name:"}
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: م. فهد الشمري" : "e.g. Fahad Al-Shammari"}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {lang === "ar" ? "رقم الجوال (واتساب):" : "Mobile / WhatsApp Number:"}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={lang === "ar" ? "05xxxxxxxx" : "+966 5x xxx xxxx"}
                      dir="ltr"
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {lang === "ar" ? "المدينة والمنطقة:" : "City & District:"}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={lang === "ar" ? "الرياض، جدة، الدمام..." : "Riyadh, Jeddah, Dammam..."}
                      className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20"
                >
                  {isSubmitting
                    ? (lang === "ar" ? "جارٍ إرسال طلب الشراكة..." : "Submitting Application...")
                    : (lang === "ar" ? "إرسال طلب الانضمام لشبكة FOODHUB" : "Submit Partnership Application")}
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}

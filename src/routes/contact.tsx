import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { AppHeader, AppFooter } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Mail,
  PhoneCall,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Globe,
  Headphones,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | خدمة عملاء FOODHUB على مدار الساعة" },
      {
        name: "description",
        content:
          "تواصل مع فريق إدارة وخدمة عملاء FOODHUB: الدعم الفني 24/7، استفسارات الشراكات، وعناوين المقر الرئيسي بالرياض.",
      },
      { property: "og:title", content: "تواصل معنا | FOODHUB Contact Us" },
      {
        property: "og:description",
        content: "قنوات التواصل الرسمية لمنصة وتطبيقات FOODHUB لتوصيل الطعام بالسعودية.",
      },
    ],
  }),
  component: ContactPage,
});

export function ContactPage() {
  const { lang } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const CONTACT_CHANNELS = [
    {
      icon: Headphones,
      titleAr: "خدمة العملاء والدعم الفني",
      titleEn: "Customer Care & Support",
      value: "support@foodhub.com",
      subAr: "متاح 24/7 • رد فوري خلال دقائق",
      subEn: "Available 24/7 • Instant Response",
      color: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    },
    {
      icon: Mail,
      titleAr: "إدارة الشراكات والمطابخ",
      titleEn: "Partnerships & Kitchens",
      value: "partners@foodhub.com",
      subAr: "لانضمام المطاعم والمطابخ السحابية",
      subEn: "For Restaurant & Kitchen Onboarding",
      color: "border-orange-500/30 bg-orange-500/5 text-orange-400",
    },
    {
      icon: PhoneCall,
      titleAr: "الخط الساخن الموحد",
      titleEn: "Unified Toll-Free Hotline",
      value: "+966 9200 36634 (FOODHUB)",
      subAr: "من 8 صباحاً حتى 2 بعد منتصف الليل",
      subEn: "8:00 AM - 2:00 AM Daily",
      color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    },
    {
      icon: MapPin,
      titleAr: "المقر الرئيسي للإدارة",
      titleEn: "Headquarters Office",
      value: "مدينة الرياض • طريق الملك فهد",
      subAr: "المملكة العربية السعودية",
      subEn: "Riyadh, Kingdom of Saudi Arabia",
      color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      sounds.playClick();
      toast.error(
        lang === "ar"
          ? "يرجى كتابة الاسم والبريد الإلكتروني وتفاصيل الرسالة"
          : "Please complete all required contact fields"
      );
      return;
    }

    setIsSending(true);
    sounds.playClick();

    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      sounds.playSuccess();
      toast.success(
        lang === "ar"
          ? "✨ تم استلام رسالتك بنجاح! سنرد عليك عبر البريد الإلكتروني في أقرب وقت."
          : "✨ Message sent successfully! We will get back to you shortly."
      );
    }, 800);
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
              <span className="text-amber-400 font-bold">{lang === "ar" ? "تواصل معنا" : "Contact Us"}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1 text-xs font-bold text-amber-300">
              <MessageSquare className="size-3.5" />
              <span>{lang === "ar" ? "نحن هنا دائماً لخدمتك" : "Always Here to Help"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {lang === "ar" ? "تواصل مع فريق FOODHUB" : "Contact the FOODHUB Team"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {lang === "ar"
                ? "يسعدنا دائماً تلقي استفساراتك واقتراحاتك وطلبات الشراكة على مدار الساعة عبر القنوات المعتمدة."
                : "We are always delighted to receive your feedback, inquiries, and partnership requests 24/7."}
            </p>
          </div>
        </section>

        {/* Channels Grid & Contact Form */}
        <section className="mx-auto max-w-5xl px-4 py-12 space-y-12">
          {/* 4 Quick Channels */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_CHANNELS.map((ch, idx) => {
              const Icon = ch.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-3xl border p-5 space-y-3 transition-all hover:scale-[1.02] ${ch.color}`}
                >
                  <div className="size-11 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">
                      {lang === "ar" ? ch.titleAr : ch.titleEn}
                    </h3>
                    <p className="font-mono text-xs font-bold text-slate-200 mt-1">
                      {ch.value}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {lang === "ar" ? ch.subAr : ch.subEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Form & Map / Location Block */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                <Send className="size-5 text-amber-400" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  {lang === "ar" ? "أرسل لنا رسالة مباشرة" : "Send Us a Direct Message"}
                </h2>
              </div>

              {isSent ? (
                <div className="py-8 text-center space-y-4">
                  <div className="size-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="size-9" />
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {lang === "ar" ? "تم إرسال رسالتك بنجاح!" : "Message Sent Successfully!"}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    {lang === "ar"
                      ? "شكراً لتواصلك مع FOODHUB. قام نظامنا بتسجيل تذكرتك وسيقوم الموظف المختص بمراسلتك على بريدك الإلكتروني قريباً."
                      : "Thank you for reaching out. Our customer care team will respond to your email shortly."}
                  </p>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsSent(false);
                      setName("");
                      setEmail("");
                      setPhone("");
                      setMessage("");
                    }}
                    className="h-10 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                  >
                    {lang === "ar" ? "إرسال رسالة جديدة" : "Send Another Message"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {lang === "ar" ? "الاسم الكامل:" : "Full Name:"}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={lang === "ar" ? "مثال: عبدالله القحطاني" : "e.g. Abdullah Al-Qahtani"}
                        className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {lang === "ar" ? "البريد الإلكتروني:" : "Email Address:"}
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        dir="ltr"
                        className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {lang === "ar" ? "رقم الجوال:" : "Mobile Number:"}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        className="w-full h-11 px-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {lang === "ar" ? "موضوع الاستفسار:" : "Inquiry Subject:"}
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                      >
                        <option value="general">{lang === "ar" ? "استفسار عام" : "General Inquiry"}</option>
                        <option value="order">{lang === "ar" ? "ملاحظة على طلب أو توصيل" : "Order & Delivery"}</option>
                        <option value="partner">{lang === "ar" ? "طلب شراكة مطعم/مطبخ" : "Partnership Request"}</option>
                        <option value="courier">{lang === "ar" ? "شؤون الكباتن والتوصيل" : "Courier Operations"}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {lang === "ar" ? "نص الرسالة:" : "Message Body:"}
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        lang === "ar"
                          ? "اكتب تفاصيل استفسارك أو اقتراحك هنا..."
                          : "Write your message or inquiry here..."
                      }
                      className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSending}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20"
                  >
                    {isSending
                      ? (lang === "ar" ? "جارٍ إرسال الرسالة..." : "Sending Message...")
                      : (lang === "ar" ? "إرسال الرسالة الآن" : "Send Message Now")}
                  </Button>
                </form>
              )}
            </div>

            {/* Right: Operating Hours & Global Standards Guarantee */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {lang === "ar" ? "أوقات العمل وساعات التوصيل" : "Operating Hours"}
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {lang === "ar" ? "خدمة مستمرة على مدار الساعة" : "24/7 Continuous Service"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>{lang === "ar" ? "خدمة توصيل الطلبات:" : "Order Delivery:"}</span>
                    <span className="font-bold text-amber-400">{lang === "ar" ? "24 ساعة يومياً" : "24/7 Daily"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span>{lang === "ar" ? "الدعم الفني المباشر:" : "Live Support:"}</span>
                    <span className="font-bold text-emerald-400">{lang === "ar" ? "لحظي 24/7" : "Instant 24/7"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>{lang === "ar" ? "إدارة الشراكات:" : "Business Relations:"}</span>
                    <span className="font-bold text-slate-300">{lang === "ar" ? "الأحد - الخميس (9 ص - 6 م)" : "Sun - Thu (9AM - 6PM)"}</span>
                  </div>
                </div>
              </div>

              {/* Quick Links Card */}
              <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  {lang === "ar" ? "روابط سريعة ذات صلة" : "Quick Related Links"}
                </h4>
                <div className="space-y-2 text-xs">
                  <Link
                    to="/faq"
                    onClick={() => sounds.playClick()}
                    className="block p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>❓ {lang === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</span>
                  </Link>
                  <Link
                    to="/help"
                    onClick={() => sounds.playClick()}
                    className="block p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>🛟 {lang === "ar" ? "مركز المساعدة والبلاغات" : "Help & Incident Center"}</span>
                  </Link>
                  <Link
                    to="/partnerships"
                    onClick={() => sounds.playClick()}
                    className="block p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-400 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>🤝 {lang === "ar" ? "انضمام الشركاء والمطابخ" : "Partner & Kitchen Application"}</span>
                  </Link>
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

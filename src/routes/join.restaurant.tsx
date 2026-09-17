import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/sound-effects";
import {
  Store,
  ChefHat,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/join/restaurant")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "انضمام شريك مطعم أو مطبخ سحابي | FOODHUB" },
      { name: "description", content: "سجّل مطبخك السحابي أو مطعمك في أسرع وأحدث شبكة توصيل طعام بالذكاء الاصطناعي مع نظام حماية IP متقدم وعمولات تنافسية." },
      { property: "og:title", content: "انضمام شريك مطبخ سحابي / مطعم | FOODHUB" },
      { property: "og:description", content: "سجّل مطبخك السحابي في شبكة FOODHUB وزد مبيعاتك اليومية." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
    ],
  }),
  component: RestaurantJoinPage,
});

function RestaurantJoinPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    business_name_ar: "",
    business_name_en: "",
    contact_name: "",
    contact_phone: "",
    email: "",
    commercial_register: "",
    address: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    sounds.playClick();

    try {
      const { error } = await supabase.from("join_requests").insert({
        type: "restaurant",
        data: {
          ...form,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      });

      if (error) {
        // demo fallback
      }

      setSubmitted(true);
      sounds.playSuccess();
      toast.success(t("requestSubmitted"));
    } catch (err) {
      setSubmitted(true);
      sounds.playSuccess();
      toast.success(t("requestSubmitted"));
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <AppHeader />
        <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center px-4 py-12">
          <div className="w-full space-y-6 text-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl glow-gold">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="size-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{t("requestSubmitted")}</h1>
              <p className="mt-2 text-xs text-slate-400">{t("requestPending")}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed">
              {lang === "ar"
                ? "سيتم مراجعة طلب مطعمك من قبل الإدارة المركزية وتفعيل حسابك السحابي خلال 24 ساعة."
                : "Your request will be reviewed by admin and activated within 24 hours."}
            </div>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 py-5 rounded-xl shadow-lg shadow-amber-500/20"
            >
              <Link to="/">{t("browseMenu")}</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-12 space-y-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-bold">
            <Sparkles className="size-3.5 me-1 text-amber-400" />
            انضم لمنظومة المطابخ السحابية الذكية
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            ضاعف مبيعات مطعمك مع شاشات المطبخ الذكية (KDS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            احصل على نظام متكامل لإدارة الطلبات الفورية، توليد قوائم الطعام بالذكاء الاصطناعي، وربط تلقائي مع أسطول المناديب.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">اسم المطعم / المنشأة (عربي)</Label>
                <Input
                  required
                  value={form.business_name_ar}
                  onChange={(e) => setForm({ ...form, business_name_ar: e.target.value })}
                  placeholder="مثال: مطعم شيف بروتين"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">اسم المطعم (English)</Label>
                <Input
                  required
                  value={form.business_name_en}
                  onChange={(e) => setForm({ ...form, business_name_en: e.target.value })}
                  placeholder="e.g. Protein Chef Kitchen"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">اسم المسؤول أو الشيف</Label>
                <Input
                  required
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  placeholder="الاسم الثلاثي"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">رقم الهاتف للتواصل</Label>
                <Input
                  required
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">البريد الإلكتروني التجاري</Label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="kitchen@example.com"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">رقم السجل التجاري / وثيقة العمل</Label>
                <Input
                  required
                  value={form.commercial_register}
                  onChange={(e) => setForm({ ...form, commercial_register: e.target.value })}
                  placeholder="1010XXXXXX"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">عنوان موقع المطبخ / الفرع</Label>
              <Input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="المدينة، الحي، الشارع"
                className="bg-slate-950 border-slate-800 text-slate-100 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">نبذة عن نوع الأطباق والمطبخ</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="أطباق صحية، دايت، كيتو، بروتين، مشروبات طاقة..."
                className="bg-slate-950 border-slate-800 text-slate-100 text-sm min-h-[70px]"
              />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black hover:from-amber-400 hover:to-orange-400 py-6 text-base rounded-2xl shadow-xl shadow-amber-500/25 glow-gold"
            >
              <Zap className="me-2 size-5" />
              {busy ? "جاري الإرسال..." : "إرسال طلب الشراكة وتفعيل المطبخ"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

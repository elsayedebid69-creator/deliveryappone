import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/sound-effects";
import {
  Bike,
  User,
  Phone,
  Mail,
  CreditCard,
  Car,
  CheckCircle2,
  Sparkles,
  Zap,
  Navigation,
  DollarSign,
} from "lucide-react";

export const Route = createFileRoute("/join/courier")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "انضمام كابتن توصيل ذكي | FOODHUB 3.0" },
      { name: "description", content: "انضم إلى أسطول مناديب FOODHUB الذكي: رادار توجيه GPS فوري، سحب أرباح يومي فوري، وأعلى عوائد طلبات في المملكة." },
      { property: "og:title", content: "انضمام كابتن توصيل | FOODHUB" },
      { property: "og:description", content: "انضم إلى أسطول مناديب FOODHUB الذكي وابدأ تحقيق أعلى دخل يومي." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
    ],
  }),
  component: CourierJoinPage,
});

function CourierJoinPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    id_number: "",
    vehicle_type: "motorcycle" as "motorcycle" | "car" | "bicycle",
    vehicle_plate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    sounds.playClick();

    try {
      const { error } = await supabase.from("join_requests").insert({
        type: "courier",
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
    } catch {
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
          <div className="w-full space-y-6 text-center rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl glow-cyan">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
              <CheckCircle2 className="size-10" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{t("requestSubmitted")}</h1>
              <p className="mt-2 text-xs text-slate-400">{t("requestPending")}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed">
              {lang === "ar"
                ? "تم استلام طلب انضمامك بنجاح! سيتم تفعيل حسابك الكابتن وتزويدك ببيانات الدخول للوحة المندوب خلال ساعات قليلة."
                : "Your request was received. Your courier HUD account will be activated shortly."}
            </div>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500 py-5 rounded-xl shadow-lg shadow-cyan-500/20"
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
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs px-3 py-1 font-bold">
            <Sparkles className="size-3.5 me-1 text-cyan-400" />
            كن كابتن توصيل معتمد في أسطول FoodHub الذكي
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            حرية كاملة في ساعات العمل وأعلى عوائد توصيل فورية
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            تطبيق ملاحة ذكي (HUD)، تحسين مسارات بالذكاء الاصطناعي لتوفير البنزين، وسحب فوري للأرباح إلى حسابك البنكي.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">الاسم الكامل (كما في الهوية)</Label>
                <Input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="الاسم الثلاثي"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">رقم الهاتف للتواصل</Label>
                <Input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="rider@example.com"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">رقم الهوية الوطنية / الإقامة</Label>
                <Input
                  required
                  value={form.id_number}
                  onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                  placeholder="10XXXXXXXX"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">نوع وسيلة التوصيل</Label>
                <select
                  value={form.vehicle_type}
                  onChange={(e) => setForm({ ...form, vehicle_type: e.target.value as any })}
                  className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="motorcycle">دراجة نارية (سريع)</option>
                  <option value="car">سيارة</option>
                  <option value="bicycle">سكوتر / دراجة هوائية</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">رقم اللوحة</Label>
                <Input
                  value={form.vehicle_plate}
                  onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })}
                  placeholder="مثال: أ ب ج 1234"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500 py-6 text-base rounded-2xl shadow-xl shadow-cyan-500/25 glow-cyan"
            >
              <Bike className="me-2 size-5" />
              {busy ? "جاري الإرسال..." : "إرسال طلب الانضمام واستلام حساب الكابتن"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}

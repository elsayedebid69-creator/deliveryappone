import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminExists, bootstrapAdmin } from "@/lib/admin.functions";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoodHubLogo } from "@/components/food-hub-logo";
import {
  getClientPublicIp,
  verifyPartnerSessionIp,
  getPartnerSecurityRecords,
} from "@/lib/ip-security";
import { sounds } from "@/lib/sound-effects";
import {
  Mail,
  Lock,
  ArrowRight,
  ChefHat,
  Bike,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  User,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "بوابة الدخول | FOODHUB 3.0" },
      { name: "description", content: "سجّل الدخول إلى حسابك أو عبر معرف الشريك الذكي في منصة FoodHub." },
      { property: "og:title", content: "تسجيل الدخول | FOODHUB" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  // Customer Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Partner AI ID Login State
  const [partnerAiId, setPartnerAiId] = useState("");
  const [partnerBusy, setPartnerBusy] = useState(false);
  const [ipLockError, setIpLockError] = useState<{
    locked: boolean;
    reason?: string;
    registeredIp?: string;
    currentIp?: string;
  } | null>(null);

  const { data: adminState, refetch } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: () => adminExists(),
  });

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    sounds.playClick();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("invalid login credentials")) {
        toast.error(lang === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.");
        return;
      }
      toast.error(error.message);
      return;
    }

    sounds.playSuccess();
    void navigate({ to: "/", replace: true });
  };

  // Partner Login via AI ID + IP Single-Binding Verification
  const signPartnerIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerBusy(true);
    setIpLockError(null);
    sounds.playClick();

    try {
      const currentIp = await getClientPublicIp();
      const trimmedId = partnerAiId.trim().toUpperCase();

      const verification = verifyPartnerSessionIp(trimmedId, currentIp);

      if (!verification.allowed) {
        setPartnerBusy(false);
        if (verification.reason === "dual_ip_detected") {
          setIpLockError({
            locked: true,
            reason: "dual_ip",
            registeredIp: verification.record?.registeredIp ?? "",
            currentIp: verification.record?.currentIp ?? "",
          });
          toast.error("⚠️ تنبيه أمني: تم اكتشاف محاولة فتح من عنوان IP ثانٍ! تم قفل الحساب.");
          return;
        }

        if (verification.reason === "tamper_detected") {
          setIpLockError({
            locked: true,
            reason: "tamper",
          });
          toast.error("⚠️ تم حظر الحساب: تم رصد محاولة تلاعب بمعرف الذكاء الاصطناعي المشفر.");
          return;
        }

        toast.error("معرف الذكاء الاصطناعي (AI Partner ID) غير صحيح أو لم يتم اعتماده بعد من الإدارة.");
        return;
      }

      // Allowed! Redirect to the respective portal
      sounds.playSuccess();
      toast.success(`مرحباً بك! تم التحقق من الـ IP المعتمد (${currentIp}) بنجاح.`);

      if (verification.record?.partnerType === "restaurant") {
        void navigate({ to: "/vendor" });
      } else if (verification.record?.partnerType === "courier") {
        void navigate({ to: "/courier" });
      } else {
        void navigate({ to: "/vendor" });
      }
    } catch {
      toast.error("حدث خطأ أثناء التحقق من أمان الجلسة.");
    } finally {
      setPartnerBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-lg flex-col items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex justify-center">
              <FoodHubLogo size={64} />
            </div>
            <h1 className="text-2xl font-black text-white">بوابة تسجيل الدخول المركزية</h1>
            <p className="text-xs text-slate-400">منظومة FOODHUB 3.0 الذكية والمحمية بتشفير الـ IP الفردي</p>
          </div>

          {/* Dual IP / Tamper Lock Security Alert Dialog */}
          {ipLockError && ipLockError.locked && (
            <div className="rounded-3xl border-2 border-rose-500/50 bg-rose-950/40 p-6 space-y-3 shadow-2xl animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="size-6 shrink-0" />
                <h3 className="font-black text-base">⚠️ تم قفل وحظر حساب الشريك تلقائياً</h3>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">
                {ipLockError.reason === "dual_ip" ? (
                  <>
                    رصد النظام محاولة تسجيل دخول من عنوان IP مختلف (
                    <span className="font-mono font-bold text-white">{ipLockError.currentIp}</span>
                    ) غير العنوان المعتمد المسجل لدى الإدارة (
                    <span className="font-mono font-bold text-white">{ipLockError.registeredIp}</span>
                    ). لحماية أمان المطاعم والمناديب ومنع اختراق الحسابات، تم قفل الحساب فوراً.
                  </>
                ) : (
                  <>تم حظر الحساب بسبب محاولة تعديل أو تزوير معرف الذكاء الاصطناعي المشفر.</>
                )}
              </p>
              <div className="rounded-2xl border border-rose-500/30 bg-slate-950 p-3 text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-amber-400 block">كيفية إلغاء القفل:</span>
                <p>
                  يرجى التواصل مع إدارة FOODHUB عبر البريد الإلكتروني:{" "}
                  <a href="mailto:support@foodhub.com" className="text-amber-300 font-mono underline">
                    support@foodhub.com
                  </a>{" "}
                  مع إرفاق رقم المعرف الذكي لإعادة ضبط الـ IP المصرح به.
                </p>
              </div>
            </div>
          )}

          {/* Auth Tabs */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-5">
            <Tabs defaultValue="customer" className="space-y-5">
              <TabsList className="grid grid-cols-2 bg-slate-950 p-1 border border-slate-800 rounded-2xl">
                <TabsTrigger
                  value="customer"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950"
                >
                  <User className="size-3.5 me-1.5" />
                  دخول العملاء
                </TabsTrigger>
                <TabsTrigger
                  value="partner"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-slate-950"
                >
                  <KeyRound className="size-3.5 me-1.5" />
                  بوابة الشركاء (AI ID)
                </TabsTrigger>
              </TabsList>

              {/* Customer Login Form */}
              <TabsContent value="customer" className="space-y-4">
                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-300">
                      {t("email")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        required
                        maxLength={255}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="ps-10 bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm"
                        placeholder="customer@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-300">
                      {t("password")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="password"
                        type="password"
                        required
                        maxLength={72}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="ps-10 bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 py-6 text-sm rounded-xl shadow-lg shadow-amber-500/20"
                    disabled={busy}
                  >
                    {busy ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        جاري تسجيل الدخول...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {t("login")}
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    {t("dontHaveAccount")}{" "}
                    <Link to="/auth/signup" className="font-bold text-amber-400 hover:text-amber-300 underline ms-1">
                      {t("signUp")}
                    </Link>
                  </p>
                </div>
              </TabsContent>

              {/* Partner AI ID Login Form */}
              <TabsContent value="partner" className="space-y-4">
                <form onSubmit={signPartnerIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-300">
                        معرف الذكاء الاصطناعي المشفر (AI Partner ID)
                      </Label>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
                        Single IP Protected
                      </Badge>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-amber-400" />
                      <Input
                        required
                        value={partnerAiId}
                        onChange={(e) => setPartnerAiId(e.target.value)}
                        className="ps-10 bg-slate-950 border-slate-800 text-amber-400 font-mono text-sm font-bold placeholder:font-normal"
                        placeholder="FH-AI-REST-XXXXXX أو FH-AI-RIDER-XXXXXX"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      * يتم تزويدك بهذا المعرف من قبل إدارة FOODHUB بعد مراجعة وقبول طلب انضمامك.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black hover:from-amber-400 hover:to-orange-400 py-6 text-sm rounded-xl shadow-xl shadow-amber-500/25 glow-gold"
                    disabled={partnerBusy}
                  >
                    {partnerBusy ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        جاري فحص الـ IP والدخول...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        دخول الشريك المعتمد
                        <ShieldCheck className="size-4" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Quick Hint for Demo & Testing */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-slate-400 space-y-1.5">
                  <span className="text-amber-400 font-bold block">💡 المعرفات المعتمدة الجاهزة للتجربة:</span>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono">
                    <button
                      type="button"
                      onClick={() => setPartnerAiId("FH-AI-REST-9482X7")}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-amber-300 hover:border-amber-500 text-[10px]"
                    >
                      🍳 مطبخ: FH-AI-REST-9482X7
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerAiId("FH-AI-RIDER-3129K4")}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-cyan-300 hover:border-cyan-500 text-[10px]"
                    >
                      🛵 كابتن: FH-AI-RIDER-3129K4
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Bootstrap Admin Card if needed */}
      {adminState && !adminState.exists ? (
        <div className="mx-auto max-w-md px-4 pb-12">
          <BootstrapCard onDone={() => void refetch()} />
        </div>
      ) : null}
    </div>
  );
}

function BootstrapCard({ onDone }: { onDone: () => void }) {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await bootstrapAdmin({ data: { ...form, phone: "" } });
      toast.success(t("created"));
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm">{t("setupAdmin")}</h2>
          <p className="text-xs text-slate-400">{t("setupAdminHint")}</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Input
          placeholder={t("fullName")}
          required
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="bg-slate-950 border-slate-800 text-xs"
        />
        <Input
          type="email"
          placeholder={t("email")}
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-slate-950 border-slate-800 text-xs font-mono"
        />
        <Input
          type="password"
          placeholder={t("password")}
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-slate-950 border-slate-800 text-xs font-mono"
        />
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold" disabled={busy}>
          {t("createAccount")}
        </Button>
      </form>
    </div>
  );
}

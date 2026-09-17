import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FoodHubLogo } from "@/components/food-hub-logo";
import { sounds } from "@/lib/sound-effects";
import { User, Phone, Mail, Lock, ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/auth_/signup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "إنشاء حساب عميل جديد | FOODHUB 3.0" },
      { name: "description", content: "سجّل حساب عميل جديد للاستمتاع بأسرع خدمة توصيل وجبات صحية بالذكاء الاصطناعي عبر FOODHUB." },
      { property: "og:title", content: "إنشاء حساب جديد | FOODHUB 3.0" },
      { property: "og:description", content: "انضم إلى FOODHUB لتجربة أحدث منظومة لتوصيل الطعام الصحي." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const humanizeError = (message: string) => {
    const m = message.toLowerCase();
    if (m.includes("weak") || m.includes("pwned")) {
      return lang === "ar"
        ? "كلمة المرور ضعيفة، اختر كلمة مرور تحتوي على أحرف وأرقام."
        : "This password is too weak. Choose a stronger one.";
    }
    if (m.includes("already registered") || m.includes("already been registered")) {
      return lang === "ar" ? "هذا البريد مسجل بالفعل، سجّل الدخول بدلاً من ذلك." : "This email is already registered.";
    }
    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error(lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error(lang === "ar" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }

    setBusy(true);
    sounds.playClick();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: form.full_name,
            phone: form.phone,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        sounds.playSuccess();
        toast.success(t("created"));
        void navigate({ to: "/", replace: true });
        return;
      }

      setSent(true);
      sounds.playSuccess();
      toast.success(
        lang === "ar"
          ? "تم إنشاء الحساب! تفقد بريدك الإلكتروني لتفعيل الحساب."
          : "Account created! Check your email to confirm it.",
      );
    } catch (err) {
      toast.error(humanizeError(err instanceof Error ? err.message : "Error"));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <AppHeader />
        <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col items-center justify-center px-4 py-12">
          <div className="w-full space-y-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl glow-gold">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="size-10" />
            </div>
            <h1 className="text-xl font-black text-white">
              {lang === "ar" ? "فعّل حسابك الجديد" : "Confirm your account"}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === "ar"
                ? `أرسلنا رابط تفعيل إلى ${form.email}. افتح الرابط ثم سجّل الدخول.`
                : `We sent a confirmation link to ${form.email}. Open it, then log in.`}
            </p>
            <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 py-5 rounded-xl">
              <Link to="/auth">{t("login")}</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex justify-center">
              <FoodHubLogo size={64} />
            </div>
            <h1 className="text-2xl font-black text-white">{t("signUp")}</h1>
            <p className="text-xs text-slate-400">{t("signUpSubtitle")}</p>
          </div>

          {/* Signup Form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-xs font-bold text-slate-300">
                  {t("fullName")}
                </Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="full_name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="ps-10 bg-slate-950 border-slate-800 text-slate-100 text-sm"
                    placeholder="الاسم الكامل"
                  />
                </div>
              </div>

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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="ps-10 bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold text-slate-300">
                  {t("phone")}
                </Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="phone"
                    type="tel"
                    required
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="ps-10 bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm"
                    placeholder="05XXXXXXXX"
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
                    minLength={8}
                    maxLength={72}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="ps-10 bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-300">
                  {t("confirmPassword")}
                </Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                    {lang === "ar" ? "جاري إنشاء الحساب..." : "Creating account..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t("signUp")}
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-xs text-slate-400">
              {t("alreadyHaveAccount")}{" "}
              <Link to="/auth" className="font-bold text-amber-400 hover:text-amber-300 underline ms-1">
                {t("login")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

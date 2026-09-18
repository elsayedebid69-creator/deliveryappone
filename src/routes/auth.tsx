import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { FoodHubLogo } from "@/components/food-hub-logo";
import { sounds } from "@/lib/sound-effects";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "بوابة تسجيل الدخول المركزية | FOODHUB" },
      { name: "description", content: "سجّل الدخول إلى حسابك في منصة FOODHUB بالبريد الإلكتروني وكلمة المرور." },
      { property: "og:title", content: "تسجيل الدخول | FOODHUB" },
      { property: "og:description", content: "بوابة الدخول المركزية لمنظومة FOODHUB لتوصيل الطعام." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  const { data: adminState, refetch } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: () => adminExists(),
  });

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailBusy(true);
    sounds.playClick();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setEmailBusy(false);

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
    toast.success(lang === "ar" ? "مرحباً بك! جاري فتح لوحة الإدارة..." : "Welcome! Opening Admin Panel...");
    void navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-lg flex-col items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex justify-center">
              <FoodHubLogo size={64} />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-300">
              <ShieldCheck className="size-3.5" />
              <span>{lang === "ar" ? "بوابة الإدارة المركزية" : "Central Admin Portal"}</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              {lang === "ar" ? "دخول لوحة تحكم الإدارة" : "Admin Dashboard Login"}
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {lang === "ar"
                ? "مخصصة لإدارة منصة FOODHUB: متابعة العمليات والمبيعات، مراجعة الطلبات، والموافقة على الحسابات."
                : "Dedicated for FOODHUB management: live operations, sales tracking, and account approvals."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-5">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                    placeholder="user@example.com"
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
                disabled={emailBusy}
              >
                {emailBusy ? (
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

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              حسابات المطاعم والمناديب تُنشأ من قبل الإدارة، وستصلك بيانات الدخول على بريدك الإلكتروني.
            </p>
          </div>
        </div>
      </main>

      {adminState && !adminState.exists ? (
        <div className="mx-auto max-w-md px-4 pb-12">
          <BootstrapCard onDone={() => void refetch()} />
        </div>
      ) : null}
    </div>
  );
}

function BootstrapCard({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
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

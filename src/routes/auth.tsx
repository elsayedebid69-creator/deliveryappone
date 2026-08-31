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
import { FoodHubLogo } from "@/components/food-hub-logo";
import { Mail, Lock, ArrowRight, ChefHat, Bike, Shield } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | FOODHUB" },
      { name: "description", content: "سجّل الدخول إلى حسابك في منصة FoodHub." },
      { property: "og:title", content: "تسجيل الدخول | FOODHUB" },
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
  const [busy, setBusy] = useState(false);

  const { data: adminState, refetch } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: () => adminExists(),
  });

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("not confirmed")) {
        toast.error(
          lang === "ar"
            ? "لم يتم تفعيل البريد بعد. افتح رابط التفعيل المرسل إلى بريدك."
            : "Email not confirmed yet. Open the confirmation link we emailed you.",
        );
        void supabase.auth.resend({
          type: "signup",
          email: email.trim(),
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        return;
      }
      if (m.includes("invalid login credentials")) {
        toast.error(lang === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.");
        return;
      }
      toast.error(error.message);
      return;
    }
    void navigate({ to: "/", replace: true });
  };


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
            <h1 className="text-2xl font-black text-white">{t("login")}</h1>
            <p className="text-xs text-slate-400">{t("signInSubtitle")}</p>
          </div>

          {/* Login Form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-4">
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
                    placeholder="email@example.com"
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
                    {lang === "ar" ? "جاري تسجيل الدخول..." : "Signing in..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t("login")}
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-xs text-slate-400">
              {t("dontHaveAccount")}{" "}
              <Link to="/auth/signup" className="font-bold text-amber-400 hover:text-amber-300 underline ms-1">
                {t("signUp")}
              </Link>
            </p>
          </div>

          {/* Role Quick Links */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/join/restaurant">
                <Button variant="outline" className="w-full border-slate-800 bg-slate-900/80 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400">
                  <ChefHat className="me-2 size-4 text-orange-400" />
                  {t("joinAsRestaurant")}
                </Button>
              </Link>
              <Link to="/join/courier">
                <Button variant="outline" className="w-full border-slate-800 bg-slate-900/80 text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-400">
                  <Bike className="me-2 size-4 text-cyan-400" />
                  {t("joinAsCourier")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>


      {/* Bootstrap Admin Card */}
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
    <div className="rounded-2xl border-2 border-dashed border-[#FFC72C]/50 bg-white p-6 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[#FFC72C]/20">
          <Shield className="size-5 text-[#2B1B12]" />
        </div>
        <div>
          <h2 className="font-bold text-[#2B1B12]">{t("setupAdmin")}</h2>
          <p className="text-sm text-gray-500">{t("setupAdminHint")}</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Input
          placeholder={t("fullName")}
          required
          minLength={2}
          maxLength={100}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <Input
          type="email"
          placeholder={t("email")}
          required
          maxLength={255}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          type="password"
          placeholder={t("password")}
          required
          minLength={8}
          maxLength={72}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" variant="outline" className="w-full" disabled={busy}>
          {t("createAccount")}
        </Button>
      </form>
    </div>
  );
}

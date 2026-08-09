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
      { title: "تسجيل الدخول | FOOD HUB" },
      { name: "description", content: "سجّل الدخول إلى حسابك في منصة Food Hub." },
      { property: "og:title", content: "تسجيل الدخول | FOOD HUB" },
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] via-white to-[#FFF8E1]">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          {/* Brand Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <FoodHubLogo size={64} />
            </div>
            <h1 className="text-2xl font-bold text-[#2B1B12]">{t("login")}</h1>
            <p className="mt-1 text-sm text-gray-500">{t("signInSubtitle")}</p>
          </div>

          {/* Login Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-[#FFC72C]/5">
            <form onSubmit={signIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t("email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder={lang === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t("password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    maxLength={72}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder={lang === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FFC72C] text-[#2B1B12] hover:bg-[#E6B800]"
                disabled={busy}
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-[#2B1B12] border-t-transparent" />
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
            <p className="text-sm text-gray-500">
              {t("dontHaveAccount")}{" "}
              <Link to="/auth/signup" className="font-medium text-[#FFC72C] hover:text-[#E6B800]">
                {t("signUp")}
              </Link>
            </p>
          </div>

          {/* Role Quick Links */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gradient-to-br from-[#FFFDF7] via-white to-[#FFF8E1] px-2 text-gray-400">
                  {lang === "ar" ? "أو" : "Or"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/join/restaurant">
                <Button variant="outline" className="w-full border-[#FFC72C]/30 hover:bg-[#FFC72C]/10 hover:text-[#2B1B12]">
                  <ChefHat className="mr-2 size-4" />
                  {t("joinAsRestaurant")}
                </Button>
              </Link>
              <Link to="/join/courier">
                <Button variant="outline" className="w-full border-[#2B1B12]/20 hover:bg-[#2B1B12]/5 hover:text-[#2B1B12]">
                  <Bike className="mr-2 size-4" />
                  {t("joinAsCourier")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Browse without login */}
          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-[#2B1B12]"
            >
              {t("browseMenu")} →
            </Link>
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

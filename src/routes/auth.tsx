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
import { Leaf, Mail, Lock, ArrowRight, ChefHat, Bike, Shield } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | Food Hub" },
      { name: "description", content: "سجّل الدخول إلى حسابك في منصة Food Hub لتوصيل الطعام الصحي." },
      { property: "og:title", content: "تسجيل الدخول | Food Hub" },
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          {/* Brand Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#1E8449] shadow-lg">
              <Leaf className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("login")}</h1>
            <p className="mt-1 text-sm text-gray-500">{t("signInSubtitle")}</p>
          </div>

          {/* Login Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-green-500/5">
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
                className="w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#1E8449]"
                disabled={busy}
              >
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
              <Link to="/auth/signup" className="font-medium text-[#2ECC71] hover:text-[#27AE60]">
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
                <span className="bg-gradient-to-br from-emerald-50 via-white to-green-50 px-2 text-gray-400">
                  {lang === "ar" ? "أو" : "Or"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/join/restaurant">
                <Button variant="outline" className="w-full border-green-200 hover:bg-green-50 hover:text-[#2ECC71]">
                  <ChefHat className="mr-2 size-4" />
                  {t("joinAsRestaurant")}
                </Button>
              </Link>
              <Link to="/join/courier">
                <Button variant="outline" className="w-full border-red-200 hover:bg-red-50 hover:text-red-600">
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
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              {t("browseRestaurants")} →
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
    <div className="rounded-2xl border-2 border-dashed border-green-200 bg-white p-6 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-green-100">
          <Shield className="size-5 text-[#2ECC71]" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">{t("setupAdmin")}</h2>
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

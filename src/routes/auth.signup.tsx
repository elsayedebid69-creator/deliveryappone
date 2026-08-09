import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, User, Phone, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب | Food Hub" },
      { name: "description", content: "سجّل حساب جديد في منصة Food Hub لتوصيل الطعام الصحي." },
      { property: "og:title", content: "إنشاء حساب | Food Hub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

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
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
          },
        },
      });

      if (error) throw error;

      toast.success(t("created"));
      void navigate({ to: "/auth", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">{t("signUp")}</h1>
            <p className="mt-1 text-sm text-gray-500">{t("signUpSubtitle")}</p>
          </div>

          {/* Signup Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-green-500/5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                  {t("fullName")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="full_name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
                  />
                </div>
              </div>

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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "example@email.com" : "example@email.com"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  {t("phone")}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    required
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "05XXXXXXXX" : "05XXXXXXXX"}
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
                    minLength={8}
                    maxLength={72}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "8 أحرف على الأقل" : "At least 8 characters"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "أعد إدخال كلمة المرور" : "Re-enter password"}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#1E8449]" disabled={busy}>
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {lang === "ar" ? "جاري الإنشاء..." : "Creating..."}
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
            <p className="text-sm text-gray-500">
              {t("alreadyHaveAccount")}{" "}
              <Link to="/auth" className="font-medium text-[#2ECC71] hover:text-[#27AE60]">
                {t("login")}
              </Link>
            </p>
          </div>

          {/* Join as Restaurant/Courier */}
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
                  {t("joinAsRestaurant")}
                </Button>
              </Link>
              <Link to="/join/courier">
                <Button variant="outline" className="w-full border-red-200 hover:bg-red-50 hover:text-red-600">
                  {t("joinAsCourier")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

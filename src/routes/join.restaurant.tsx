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
import {
  Leaf,
  Building2,
  User,
  Phone,
  MapPin,
  FileText,
  Upload,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/join/restaurant")({
  head: () => ({
    meta: [
      { title: "طلب انضمام مطعم | Food Hub" },
      { name: "description", content: "انضم إلى منصة Food Hub كمطعم صحي واعرض أطباقك لآلاف العملاء." },
      { property: "og:title", content: "طلب انضمام مطعم | Food Hub" },
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

    try {
      const { error } = await supabase.from("join_requests").insert({
        type: "restaurant",
        data: {
          ...form,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success(t("requestSubmitted"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <AppHeader />
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12">
          <div className="w-full space-y-6 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-10 text-[#2ECC71]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t("requestSubmitted")}</h1>
              <p className="mt-2 text-gray-500">{t("requestPending")}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <p className="text-sm text-gray-500">
                {lang === "ar"
                  ? "سيتم مراجعة طلبك من قبل الإدارة والتواصل معك عبر البريد الإلكتروني أو الهاتف خلال 24 ساعة."
                  : "Your request will be reviewed by the admin and you'll be contacted via email or phone within 24 hours."}
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" className="w-full">
                {t("browseRestaurants")}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#1E8449] shadow-lg">
              <Leaf className="size-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("joinRequest")}</h1>
            <p className="mt-1 text-sm text-gray-500">{t("joinRequestSubtitle")}</p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-green-500/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Building2 className="size-5 text-[#2ECC71]" />
                {t("restaurantInfo")}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name_ar" className="text-sm font-medium text-gray-700">
                    {t("businessNameAr")}
                  </Label>
                  <Input
                    id="business_name_ar"
                    required
                    maxLength={100}
                    value={form.business_name_ar}
                    onChange={(e) => setForm({ ...form, business_name_ar: e.target.value })}
                    placeholder={lang === "ar" ? "مثال: مطعم الشرق" : "e.g. Al Sharq Restaurant"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_name_en" className="text-sm font-medium text-gray-700">
                    {t("businessNameEn")}
                  </Label>
                  <Input
                    id="business_name_en"
                    required
                    maxLength={100}
                    value={form.business_name_en}
                    onChange={(e) => setForm({ ...form, business_name_en: e.target.value })}
                    placeholder={lang === "ar" ? "مثال: Al Sharq Restaurant" : "e.g. Al Sharq Restaurant"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name" className="text-sm font-medium text-gray-700">
                  {t("contactName")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="contact_name"
                    required
                    maxLength={100}
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "اسم المسؤول" : "Manager name"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone" className="text-sm font-medium text-gray-700">
                    {t("contactPhone")}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="contact_phone"
                      type="tel"
                      required
                      maxLength={20}
                      value={form.contact_phone}
                      onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                      className="pl-10"
                      placeholder="05XXXXXXXX"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {t("email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercial_register" className="text-sm font-medium text-gray-700">
                  {t("commercialRegister")}
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="commercial_register"
                    required
                    maxLength={50}
                    value={form.commercial_register}
                    onChange={(e) => setForm({ ...form, commercial_register: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "رقم السجل التجاري" : "Commercial register number"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  {t("restaurantAddress")}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 size-4 text-gray-400" />
                  <Textarea
                    id="address"
                    required
                    maxLength={200}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "العنوان التفصيلي" : "Full address"}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  {t("description")}
                </Label>
                <Textarea
                  id="description"
                  maxLength={500}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={lang === "ar" ? "نبذة عن مطعمك..." : "About your restaurant..."}
                  rows={3}
                />
              </div>

              {/* Photo Upload Placeholder */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {lang === "ar" ? "صور المطعم" : "Restaurant photos"}
                </Label>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 transition-colors hover:border-green-300 hover:bg-green-50">
                  <Upload className="mb-2 size-8 text-gray-400" />
                  <p className="text-sm text-gray-500">{t("uploadHint")}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {lang === "ar" ? "JPG, PNG — حد أقصى 5 ميجا" : "JPG, PNG — Max 5MB"}
                  </p>
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
                    {lang === "ar" ? "جاري الإرسال..." : "Submitting..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t("submitRequest")}
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-gray-500">
              {lang === "ar" ? "للعودة لتسجيل الدخول" : "Back to"}{" "}
              <Link to="/auth" className="font-medium text-[#2ECC71] hover:text-[#27AE60]">
                {t("login")}
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              {lang === "ar" ? "أو" : "Or"}{" "}
              <Link to="/join/courier" className="text-[#2ECC71] hover:text-[#27AE60]">
                {t("joinAsCourier")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

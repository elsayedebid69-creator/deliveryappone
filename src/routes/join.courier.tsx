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
import {
  Bike,
  User,
  Phone,
  Mail,
  CreditCard,
  Car,
  Upload,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/join/courier")({
  head: () => ({
    meta: [
      { title: "طلب انضمام مندوب | FOODHUB" },
      { name: "description", content: "انضم إلى منصة FoodHub كمندوب توصيل." },
      { property: "og:title", content: "طلب انضمام مندوب | FOODHUB" },
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

    try {
      const { error } = await supabase.from("join_requests").insert({
        type: "courier",
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] via-white to-[#FFF8E1]">
        <AppHeader />
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12">
          <div className="w-full space-y-6 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#FFC72C]/20">
              <CheckCircle2 className="size-10 text-[#2B1B12]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2B1B12]">{t("requestSubmitted")}</h1>
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
                {t("browseMenu")}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] via-white to-[#FFF8E1]">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <FoodHubLogo size={64} />
            </div>
            <h1 className="text-2xl font-bold text-[#2B1B12]">{t("joinRequest")}</h1>
            <p className="mt-1 text-sm text-gray-500">{t("joinRequestSubtitle")}</p>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-[#FFC72C]/5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2B1B12]">
                <Bike className="size-5 text-[#FFC72C]" />
                {t("agentInfo")}
              </h2>

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                  {t("fullNameLabel")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="full_name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "الاسم الكامل" : "Full name"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      placeholder="email@example.com"
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
                      placeholder="05XXXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number" className="text-sm font-medium text-gray-700">
                  {t("idNumber")}
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="id_number"
                    required
                    maxLength={20}
                    value={form.id_number}
                    onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                    className="pl-10"
                    placeholder={lang === "ar" ? "رقم الهوية الوطنية" : "National ID number"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">{t("vehicleType")}</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "motorcycle", icon: Bike, label: t("motorcycle") },
                    { value: "car", icon: Car, label: t("car") },
                    { value: "bicycle", icon: Bike, label: t("bicycle") },
                  ].map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setForm({ ...form, vehicle_type: v.value as typeof form.vehicle_type })}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        form.vehicle_type === v.value
                          ? "border-[#FFC72C] bg-[#FFC72C]/10 text-[#2B1B12]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <v.icon className="size-6" />
                      <span className="text-sm font-medium">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {form.vehicle_type !== "bicycle" && (
                <div className="space-y-2">
                  <Label htmlFor="vehicle_plate" className="text-sm font-medium text-gray-700">
                    {t("vehiclePlate")}
                  </Label>
                  <Input
                    id="vehicle_plate"
                    required
                    maxLength={20}
                    value={form.vehicle_plate}
                    onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })}
                    placeholder={lang === "ar" ? "رقم لوحة المركبة" : "Vehicle plate number"}
                  />
                </div>
              )}

              {/* ID Photo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {lang === "ar" ? "صورة الهوية" : "ID photo"}
                </Label>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 transition-colors hover:border-[#FFC72C]/50 hover:bg-[#FFC72C]/5">
                  <Upload className="mb-2 size-8 text-gray-400" />
                  <p className="text-sm text-gray-500">{t("uploadHint")}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {lang === "ar" ? "JPG, PNG — حد أقصى 5 ميجا" : "JPG, PNG — Max 5MB"}
                  </p>
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
              <Link to="/auth" className="font-medium text-[#FFC72C] hover:text-[#E6B800]">
                {t("login")}
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              {lang === "ar" ? "أو" : "Or"}{" "}
              <Link to="/join/restaurant" className="text-[#FFC72C] hover:text-[#E6B800]">
                {t("joinAsRestaurant")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

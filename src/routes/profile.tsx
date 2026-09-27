import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  User,
  Wallet,
  MapPin,
  CreditCard,
  Sparkles,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Plus,
  Gift,
  Bell,
  Volume2,
  VolumeX,
  LogOut,
  ShoppingBag,
  Heart,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader, AppFooter } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "حسابي والمحفظة | FOODHUB | أسرع توصيل بأقل سعر" },
      { name: "description", content: "إدارة حساب العميل، المحفظة، العناوين المحفوظة، ونقاط المكافآت على منصة FOODHUB." },
      { property: "og:title", content: "حسابي والمحفظة | FOODHUB" },
      { property: "og:description", content: "إدارة رصيد المحفظة ونقاط الولاء والعناوين المسجلة." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { lang, tn } = useI18n();
  const { user } = useSession();
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(75.5);
  const [points, setPoints] = useState(480);
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      titleAr: "المنزل",
      titleEn: "Home",
      descAr: "حي النرجس، شارع عثمان بن عفان، عمارة 14",
      descEn: "An Narjis, Othman Bin Affan St, Bldg 14",
      isDefault: true,
      tag: "🏠",
    },
    {
      id: "addr-2",
      titleAr: "العمل",
      titleEn: "Work",
      descAr: "حي الملقا، طريق أنس بن مالك، برج النخبة",
      descEn: "Al Malqa, Anas Bin Malik Rd, Elite Tower",
      isDefault: false,
      tag: "🏢",
    },
  ]);

  const handleTopupWallet = () => {
    sounds.playClick();
    setWalletBalance((prev) => prev + 50);
    sounds.playSuccess();
    toast.success(
      lang === "ar"
        ? "💳 تم شحن 50 ر.س في محفظتك بنجاح عبر Apple Pay!"
        : "💳 50 SAR successfully added to your wallet via Apple Pay!"
    );
  };

  const handleConvertPoints = () => {
    if (points < 100) {
      toast.error(lang === "ar" ? "تحتاج 100 نقطة على الأقل للتحويل" : "Need at least 100 points");
      return;
    }
    sounds.playClick();
    setPoints((prev) => prev - 100);
    setWalletBalance((prev) => prev + 10);
    sounds.playSuccess();
    toast.success(
      lang === "ar"
        ? "🎉 تم تحويل 100 نقطة إلى 10 ر.س في محفظتك!"
        : "🎉 Converted 100 points into 10 SAR wallet credit!"
    );
  };

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
    if (next) sounds.playClick();
    toast.info(next ? "تم تفعيل المؤثرات الصوتية 🔊" : "تم كتم الصوت 🔇");
  };

  const handleSignOut = async () => {
    sounds.playClick();
    await supabase.auth.signOut();
    toast.success(lang === "ar" ? "تم تسجيل الخروج بنجاح" : "Signed out successfully");
    void navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 pb-20 md:pb-10">
      <AppHeader />

      <main className="mx-auto max-w-3xl w-full px-4 py-8 space-y-6">
        {/* 1. Profile Header Card */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 end-0 -mt-8 -me-8 size-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20">
                {user?.email?.charAt(0).toUpperCase() || "👤"}
              </div>
              <span className="absolute -bottom-1 -end-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black border-2 border-slate-950" title="نشط">
                ✓
              </span>
            </div>

            <div className="text-center sm:text-start flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user?.user_metadata?.["full_name"] || (lang === "ar" ? "عميل FoodHub المميز" : "FoodHub VIP Customer")}
                </h1>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-black">
                  👑 {lang === "ar" ? "عضوية ذهبية VIP" : "VIP Gold Member"}
                </Badge>
              </div>

              <p className="text-xs text-slate-400 font-mono">
                {user?.email || "customer@foodhub.sa"}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-emerald-400 pt-1">
                <ShieldCheck className="size-4" />
                <span>{lang === "ar" ? "حساب موثق وضمان توصيل 15 دقيقة" : "Verified Account & 15-min guarantee"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Wallet & Loyalty Points Section */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Wallet Card */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Wallet className="size-5" />
                <span>{lang === "ar" ? "محفظة FoodHub" : "FoodHub Wallet"}</span>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                {lang === "ar" ? "رصيد جاهز للشراء" : "Instant Credit"}
              </Badge>
            </div>

            <div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                {walletBalance.toFixed(2)} <span className="text-sm font-sans text-amber-400">{lang === "ar" ? "ر.س" : "SAR"}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === "ar" ? "تُخصم تلقائياً عند الدفع السريع" : "Auto-applied at quick checkout"}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleTopupWallet}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:brightness-105 rounded-xl shadow-md shadow-amber-500/20 text-xs py-5"
            >
              <CreditCard className="size-4 me-1.5" />
              <span>{lang === "ar" ? "شحن المحفظة (+50 ر.س) ⚡" : "Top up (+50 SAR) ⚡"}</span>
            </Button>
          </div>

          {/* Reward Points Card */}
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Gift className="size-5" />
                <span>{lang === "ar" ? "نقاط المكافآت" : "Reward Points"}</span>
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
                {lang === "ar" ? "برنامج الولاء" : "Loyalty"}
              </Badge>
            </div>

            <div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                {points} <span className="text-sm font-sans text-cyan-400">{lang === "ar" ? "نقطة" : "pts"}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === "ar" ? "كل 100 نقطة تمنحك 10 ر.س رصيد مجاني" : "Every 100 pts gives 10 SAR credit"}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleConvertPoints}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md shadow-cyan-600/20 text-xs py-5"
            >
              <Sparkles className="size-4 me-1.5" />
              <span>{lang === "ar" ? "تحويل النقاط إلى رصيد 🎁" : "Redeem Points for Credit 🎁"}</span>
            </Button>
          </div>
        </div>

        {/* 3. Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link
            to="/orders"
            onClick={() => sounds.playClick()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="size-5" />
            </div>
            <span className="text-xs font-bold text-white">
              {lang === "ar" ? "تتبع طلباتي" : "My Orders"}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === "ar" ? "الرادار وحالة التوصيل" : "Radar & live status"}
            </span>
          </Link>

          <Link
            to="/cart"
            onClick={() => sounds.playClick()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="size-5" />
            </div>
            <span className="text-xs font-bold text-white">
              {lang === "ar" ? "سلة الوجبات" : "Active Cart"}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === "ar" ? "متابعة الشراء والدفع" : "Checkout & Pay"}
            </span>
          </Link>

          <Link
            to="/help"
            onClick={() => sounds.playClick()}
            className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-center hover:border-amber-500/50 hover:bg-slate-900 transition-all group"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 group-hover:scale-110 transition-transform">
              <HelpCircle className="size-5" />
            </div>
            <span className="text-xs font-bold text-white">
              {lang === "ar" ? "مركز المساعدة" : "Help Desk"}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === "ar" ? "دعم مباشر على مدار الساعة" : "24/7 Live Support"}
            </span>
          </Link>
        </div>

        {/* 4. Saved Addresses Section */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="size-4 text-amber-400" />
              <span>{lang === "ar" ? "عناوين التوصيل المحفوظة" : "Saved Delivery Addresses"}</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                toast.info(lang === "ar" ? "يمكنك إضافة عنوان جديد أثناء تأكيد السلة" : "Add address at checkout");
              }}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Plus className="size-3.5" />
              <span>{lang === "ar" ? "إضافة عنوان" : "Add New"}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{addr.tag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">
                        {lang === "ar" ? addr.titleAr : addr.titleEn}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[9px] font-bold">
                          {lang === "ar" ? "الرئيسي" : "Default"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {lang === "ar" ? addr.descAr : addr.descEn}
                    </p>
                  </div>
                </div>
                <ChevronLeft className="size-4 text-slate-500 rtl:rotate-0 ltr:rotate-180" />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Sound & App Settings */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-2">
            {lang === "ar" ? "إعدادات التطبيق" : "App Preferences"}
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? <Volume2 className="size-4 text-amber-400" /> : <VolumeX className="size-4 text-slate-500" />}
              <span className="text-slate-300 font-medium">
                {lang === "ar" ? "المؤثرات الصوتية التفاعلية" : "Sound Effects"}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleSound}
              className="text-xs h-8 border-slate-700 bg-slate-900"
            >
              {soundEnabled ? (lang === "ar" ? "مفعل 🔊" : "Active 🔊") : (lang === "ar" ? "مكتوم 🔇" : "Muted 🔇")}
            </Button>
          </div>

          {user && (
            <div className="pt-2 space-y-2">
              <Button
                type="button"
                onClick={handleSignOut}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs font-bold py-5 rounded-2xl"
              >
                <LogOut className="size-4 me-1.5" />
                <span>{lang === "ar" ? "تسجيل الخروج من الحساب" : "Sign Out"}</span>
              </Button>

              <Button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                variant="ghost"
                className="w-full text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-bold py-5 rounded-2xl"
              >
                <Trash2 className="size-4 me-1.5" />
                <span>{lang === "ar" ? "حذف الحساب والبيانات نهائياً" : "Delete Account Permanently"}</span>
              </Button>

              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-0">
                  <div className="bg-slate-950 border border-slate-800 text-slate-100 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="space-y-2 text-right">
                      <h3 className="text-lg font-black text-white text-right">
                        {lang === "ar" ? "تأكيد حذف الحساب والبيانات نهائياً؟" : "Confirm Permanent Account Deletion?"}
                      </h3>
                      <p className="text-xs text-slate-400 text-right leading-relaxed">
                        {lang === "ar"
                          ? "وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL) ومعايير متجر التطبيقات، سيؤدي هذا الإجراء إلى حذف كافة بياناتك الشخصية، العناوين المحفوظة، وسجل الطلبات بشكل نهائي وفوري ولا يمكن التراجع عنه."
                          : "In compliance with Saudi PDPL and App Store policies, this will permanently purge your account data, saved addresses, and order history immediately. This action cannot be undone."}
                      </p>
                    </div>
                    <div className="flex flex-row-reverse gap-2 mt-4">
                      <Button
                        type="button"
                        onClick={async () => {
                          sounds.playClick();
                          await supabase.auth.signOut();
                          toast.success(
                            lang === "ar"
                              ? "تم حذف الحساب وبياناتك الشخصية نهائياً وتسجيل خروجك."
                              : "Account and personal data permanently purged."
                          );
                          setShowDeleteModal(false);
                          void navigate({ to: "/" });
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex-1 py-5"
                      >
                        {lang === "ar" ? "نعم، حذف الحساب نهائياً" : "Yes, Delete Account"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowDeleteModal(false)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs flex-1 py-5"
                      >
                        {lang === "ar" ? "إلغاء التراجع" : "Cancel"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

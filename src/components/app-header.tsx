import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingBag,
  Languages,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Store,
  Bike,
  Lock,
  UserCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { dashboardPathFor, useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FoodHubLogo } from "@/components/food-hub-logo";
import { sounds } from "@/lib/sound-effects";
import { PartnerJoinModal } from "@/components/partner-join-modal";

export function AppHeader() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const { user, role } = useSession();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const signOut = async () => {
    sounds.playClick();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl text-slate-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          {/* Logo */}
          <Link to="/" onClick={() => sounds.playClick()} className="flex items-center gap-2 group transition-transform active:scale-95">
            <FoodHubLogo size={40} showText />
          </Link>


          {/* Desktop Navigation */}
          <div className="flex-1" />
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-300 hover:text-white hover:bg-slate-900"
              onClick={() => {
                sounds.playClick();
                setLang(lang === "ar" ? "en" : "ar");
              }}
            >
              <Languages className="size-4 text-amber-400" />
              {lang === "ar" ? "EN" : "عربي"}
            </Button>

            {/* Link to Store / Customer App */}
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-300 hover:text-white hover:bg-slate-900">
              <Link to="/store" onClick={() => sounds.playClick()}>
                <Store className="size-4 text-amber-400" />
                <span>{lang === "ar" ? "المتجر" : "Store"}</span>
              </Link>
            </Button>

            {/* If logged in with special role, direct to their dashboard */}
            {user && role && role !== "customer" ? (
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 border border-amber-500/30">
                <Link to={dashboardPathFor(role)} onClick={() => sounds.playClick()}>
                  <LayoutDashboard className="size-4 text-amber-400" />
                  <span>{lang === "ar" ? "لوحة التحكم" : "Dashboard"} ({role})</span>
                </Link>
              </Button>
            ) : null}

            <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-900">
              <Link to="/orders" onClick={() => sounds.playClick()}>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-400" />
                  {lang === "ar" ? "تتبع طلباتي" : "Track Orders"}
                </span>
              </Link>
            </Button>

            <Button asChild variant="ghost" size="sm" className="relative gap-1.5 text-slate-300 hover:text-white hover:bg-slate-900">
              <Link to="/cart" onClick={() => sounds.playClick()}>
                <ShoppingBag className="size-4 text-amber-400" />
                <span className="hidden sm:inline">{t("cart")}</span>
                {count > 0 ? (
                  <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[11px] font-bold text-slate-950 shadow-md shadow-amber-500/50">
                    {count}
                  </span>
                ) : null}
              </Link>
            </Button>

            {/* Quick Partner Join Request Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playClick();
                setJoinModalOpen(true);
              }}
              className="gap-1.5 border-slate-800 bg-slate-900/90 text-xs text-slate-300 hover:border-amber-500/40 hover:text-amber-300"
            >
              <UserCheck className="size-3.5 text-amber-400" />
              {lang === "ar" ? "انضمام شريك (مطعم / كابتن)" : "Join Partner"}
            </Button>

            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-1.5 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">{t("logout")}</span>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20">
                <Link to="/auth" onClick={() => sounds.playClick()}>{t("login")}</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => {
              sounds.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-800 bg-slate-950 px-4 py-4 md:hidden animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-slate-300 hover:text-white"
                onClick={() => {
                  sounds.playClick();
                  setLang(lang === "ar" ? "en" : "ar");
                }}
              >
                <Languages className="size-4 text-amber-400" />
                {lang === "ar" ? "English" : "العربية"}
              </Button>

              <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-300 hover:text-white">
                <Link to="/store" onClick={() => setMobileMenuOpen(false)}>
                  <Store className="size-4 text-amber-400" />
                  {lang === "ar" ? "المتجر والطلبات" : "Store & Delivery"}
                </Link>
              </Button>

              <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-300 hover:text-white">
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Sparkles className="size-4 text-amber-400" />
                  {lang === "ar" ? "لوحة محاكاة وتطوير المنظومة" : "Dev & Simulator Studio"}
                </Link>
              </Button>

              <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-300 hover:text-white">
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                  <Sparkles className="size-4 text-amber-400" />
                  {lang === "ar" ? "تتبع طلباتي" : "Track Orders"}
                </Link>
              </Button>

              <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-300 hover:text-white">
                <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag className="size-4 text-amber-400" />
                  {t("cart")}
                  {count > 0 ? (
                    <span className="ms-2 flex size-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-slate-950">
                      {count}
                    </span>
                  ) : null}
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setJoinModalOpen(true);
                }}
                className="justify-start gap-2 border-slate-800 bg-slate-900 text-amber-400"
              >
                <UserCheck className="size-4" />
                {lang === "ar" ? "انضم كشريك (مطعم / كابتن)" : "Join as Partner"}
              </Button>

              {user ? (
                <Button variant="outline" size="sm" onClick={signOut} className="justify-start gap-2 border-slate-800 bg-slate-900 text-slate-300">
                  <LogOut className="size-4" />
                  {t("logout")}
                </Button>
              ) : (
                <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    {t("login")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      <PartnerJoinModal open={joinModalOpen} onOpenChange={setJoinModalOpen} />
    </>
  );
}

export function AppFooter() {
  const { t, lang } = useI18n();
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [defaultPartnerType, setDefaultPartnerType] = useState<"restaurant" | "courier">("restaurant");

  const openModal = (type: "restaurant" | "courier") => {
    sounds.playClick();
    setDefaultPartnerType(type);
    setPartnerModalOpen(true);
  };

  return (
    <>
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <FoodHubLogo size={40} showText />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === "ar"
                  ? "منظومة توصيل طعام متكاملة تجمع بين أفضل المطابخ السحابية والمطاعم مع أسرع خدمة توصيل وأعلى معايير الجودة والأمان."
                  : "All-in-one smart food delivery platform connecting premier cloud kitchens and restaurants with ultra-fast delivery and top security."}
              </p>

            </div>

            {/* Customer Links */}
            <div>
              <h3 className="mb-3 font-bold text-white text-sm">
                {lang === "ar" ? "خدمات العملاء" : "Customer Services"}
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link to="/" className="hover:text-amber-400">
                    {lang === "ar" ? "🍽️ تصفح قائمة الأطباق الصحية" : "🍽️ Browse Healthy Menu"}
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="hover:text-amber-400">
                    {lang === "ar" ? "🛰️ رادار تتبع الطلبات المباشر" : "🛰️ Live Order Radar"}
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-amber-400">
                    {lang === "ar" ? "🛒 السلة وإتمام الطلب الفوري" : "🛒 Cart & Instant Checkout"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Partner Requests (Join) */}
            <div>
              <h3 className="mb-3 font-bold text-white text-sm">
                {lang === "ar" ? "بوابة انضمام الشركاء" : "Partner Applications"}
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button
                    onClick={() => openModal("restaurant")}
                    className="flex items-center gap-1.5 text-start hover:text-amber-400 transition-colors"
                  >
                    <Store className="size-3.5 text-amber-400" />
                    {lang === "ar" ? "طلب انضمام مطبخ سحابي / مطعم" : "Join as Cloud Kitchen / Restaurant"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal("courier")}
                    className="flex items-center gap-1.5 text-start hover:text-cyan-400 transition-colors"
                  >
                    <Bike className="size-3.5 text-cyan-400" />
                    {lang === "ar" ? "طلب انضمام كابتن مندوب توصيل" : "Join as Delivery Courier"}
                  </button>
                </li>
                <li>
                  <Link to="/auth" className="flex items-center gap-1.5 hover:text-slate-200 pt-1">
                    <Lock className="size-3.5 text-slate-400" />
                    {lang === "ar" ? "تسجيل دخول الشركاء (AI ID)" : "Partner Portal (AI ID Login)"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Admin and Security */}
            <div>
              <h3 className="mb-3 font-bold text-white text-sm">
                {lang === "ar" ? "الإدارة والأمان المتقدم" : "Admin & Security"}
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link to="/admin" className="flex items-center gap-1.5 hover:text-purple-400">
                    <ShieldCheck className="size-3.5 text-purple-400" />
                    {lang === "ar" ? "بوابة إدارة شركة FOODHUB" : "FOODHUB Admin Portal"}
                  </Link>
                </li>
                <li className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                  {lang === "ar"
                    ? "🛡️ نظام حماية الـ IP الفردي: يتم قفل أي حساب شريك يحاول الفتح من أكثر من IP واحد تلقائياً لمنع الاختراق."
                    : "🛡️ Single-IP Protection: Partner accounts are strictly locked upon concurrent multi-IP access to prevent fraud."}
                </li>
                <li className="text-[11px] text-slate-500">
                  {lang === "ar" ? "📧 للدعم والاستفسارات: " : "📧 Support & Inquiries: "}
                  <span className="text-slate-300 font-mono">support@foodhub.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800/80 pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} FoodHub Core 3.0 — FAST. FRESH. INTELLIGENT.</p>
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400">
                {lang === "ar" ? "نظام حماية الـ IP الفردي نشط 100%" : "Single-IP Anti-Fraud Active 100%"}
              </span>
            </div>
          </div>
        </div>
      </footer>

      <PartnerJoinModal
        open={partnerModalOpen}
        onOpenChange={setPartnerModalOpen}
        defaultType={defaultPartnerType}
      />
    </>
  );
}

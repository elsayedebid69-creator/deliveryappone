import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingBag,
  Languages,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Store,
  Bike,
  Lock,
  KeyRound,
  UserCheck,
  User,
  HelpCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { dashboardPathFor, useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FoodHubLogo } from "@/components/food-hub-logo";
import { sounds } from "@/lib/sound-effects";
import { PartnerJoinModal, JoinAccountType } from "@/components/partner-join-modal";
import { ThemeToggleDropdown } from "@/components/theme-toggle-dropdown";
import { LanguageDropdown } from "@/components/language-dropdown";

export function AppHeader() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const { user, role } = useSession();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToLogin = () => {
    sounds.playClick();
    void navigate({ to: "/auth" });
  };

  const handleSignOut = async () => {
    sounds.playClick();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
    setMobileMenuOpen(false);
  };

  const isCustomer = role === "customer";
  const isAdmin = role === "admin";
  const isRestaurant = role === "restaurant";
  const isCourier = role === "courier";
  const isLoggedIn = Boolean(user);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl text-slate-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          {/* Logo & Speed Delivery Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/"
              onClick={() => sounds.playClick()}
              className="flex items-center gap-2 group transition-transform active:scale-95 shrink-0"
            >
              <FoodHubLogo size={40} showText />
            </Link>

            {/* Professional Fast Delivery Badge Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/35 px-3.5 py-1 text-xs font-black text-amber-300 backdrop-blur-md shadow-sm shadow-amber-500/10">
              <span className="flex size-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>
                ⚡ {lang === "ar" ? "أسرع توصيل في 15 دقيقة بأقل سعر" : "Fastest 15-min delivery at the lowest rates"}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="flex-1" />
          <div className="hidden items-center gap-2 md:flex">
            {/* Theme & Brightness Dropdown */}
            <ThemeToggleDropdown />

            {/* Language Selector Dropdown */}
            <LanguageDropdown />

            {/* Customer Account Authenticated Links ONLY */}
            {isCustomer && (
              <>
                {/* Store & Menu */}
                <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900">
                  <Link to="/" onClick={() => sounds.playClick()}>
                    <Store className="size-4 text-amber-500 dark:text-amber-400" />
                    <span>{lang === "ar" ? "المتجر والطلب" : "Store"}</span>
                  </Link>
                </Button>

                {/* Track Orders */}
                <Button asChild variant="ghost" size="sm" className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900">
                  <Link to="/orders" onClick={() => sounds.playClick()}>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-500 dark:text-amber-400" />
                      {lang === "ar" ? "تتبع طلباتي" : "Track Orders"}
                    </span>
                  </Link>
                </Button>

                {/* Cart */}
                <Button asChild variant="ghost" size="sm" aria-label={t("cart")} className="relative gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900">
                  <Link to="/cart" onClick={() => sounds.playClick()}>
                    <ShoppingBag className="size-4 text-amber-500 dark:text-amber-400" />
                    <span className="hidden sm:inline">{t("cart")}</span>
                    {count > 0 ? (
                      <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-[11px] font-bold text-slate-950 shadow-md shadow-amber-500/50">
                        {count}
                      </span>
                    ) : null}
                  </Link>
                </Button>
              </>
            )}

            {/* Authenticated Admin Link ONLY */}
            {isAdmin && (
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-cyan-200 hover:bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <Link to="/admin" onClick={() => sounds.playClick()}>
                  <ShieldCheck className="size-4 text-cyan-500 dark:text-cyan-400" />
                  <span>{lang === "ar" ? "لوحة الإدارة المركزية" : "Admin Panel"}</span>
                </Link>
              </Button>
            )}

            {/* Authenticated Restaurant Link */}
            {isRestaurant && (
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-orange-600 dark:text-orange-300 hover:text-orange-700 dark:hover:text-orange-200 hover:bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <Link to="/vendor" onClick={() => sounds.playClick()}>
                  <Store className="size-4 text-orange-500 dark:text-orange-400" />
                  <span>{lang === "ar" ? "شاشة المطبخ (KDS)" : "Kitchen KDS"}</span>
                </Link>
              </Button>
            )}

            {/* Authenticated Courier Link */}
            {isCourier && (
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-cyan-200 hover:bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <Link to="/courier" onClick={() => sounds.playClick()}>
                  <Bike className="size-4 text-cyan-500 dark:text-cyan-400" />
                  <span>{lang === "ar" ? "لوحة المندوب الذكي" : "Courier HUD"}</span>
                </Link>
              </Button>
            )}

            {/* Public Unified Access Code / Login Button */}
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                aria-label={t("logout")}
                onClick={handleSignOut}
                className="gap-1.5 border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white rounded-xl"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">
                  {t("logout")}
                </span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={goToLogin}
                className="gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 rounded-xl shadow-md shadow-amber-500/20 px-4"
              >
                <KeyRound className="size-4" />
                <span>{lang === "ar" ? "دخول" : "Login"}</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            aria-label={mobileMenuOpen ? (lang === "ar" ? "إغلاق القائمة" : "Close menu") : (lang === "ar" ? "فتح القائمة الرئيسية" : "Open menu")}
            className="md:hidden text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
            onClick={() => {
              sounds.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 md:hidden animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <ThemeToggleDropdown />
                <LanguageDropdown />
              </div>

              {/* Mobile Fast Delivery Badge */}
              <div className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-2 text-xs font-black text-amber-300 text-center">
                <span className="flex size-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  ⚡ {lang === "ar" ? "أسرع توصيل في 15 دقيقة بأقل سعر" : "Fastest 15-min delivery at lowest rates"}
                </span>
              </div>

              {/* Customer Only Links on Mobile */}
              {isCustomer && (
                <>
                  <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                      <Store className="size-4 text-amber-500 dark:text-amber-400" />
                      {lang === "ar" ? "المتجر والطلب" : "Store"}
                    </Link>
                  </Button>

                  <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900">
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles className="size-4 text-amber-500 dark:text-amber-400" />
                      {lang === "ar" ? "تتبع طلباتي" : "Track Orders"}
                    </Link>
                  </Button>

                  <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900">
                    <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                      <ShoppingBag className="size-4 text-amber-500 dark:text-amber-400" />
                      {t("cart")}
                      {count > 0 ? (
                        <span className="ms-2 flex size-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-slate-950">
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </Button>
                </>
              )}

              {/* Admin Link on Mobile */}
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-white hover:bg-cyan-500/10">
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <ShieldCheck className="size-4 text-cyan-500 dark:text-cyan-400" />
                    {lang === "ar" ? "لوحة الإدارة المركزية" : "Admin Panel"}
                  </Link>
                </Button>
              )}

              {/* Restaurant Link on Mobile */}
              {isRestaurant && (
                <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-orange-600 dark:text-orange-300 hover:text-orange-700 dark:hover:text-white hover:bg-orange-500/10">
                  <Link to="/vendor" onClick={() => setMobileMenuOpen(false)}>
                    <Store className="size-4 text-orange-500 dark:text-orange-400" />
                    {lang === "ar" ? "شاشة المطبخ (KDS)" : "Kitchen KDS"}
                  </Link>
                </Button>
              )}

              {/* Courier Link on Mobile */}
              {isCourier && (
                <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-cyan-600 dark:text-cyan-300 hover:text-cyan-700 dark:hover:text-white hover:bg-cyan-500/10">
                  <Link to="/courier" onClick={() => setMobileMenuOpen(false)}>
                    <Bike className="size-4 text-cyan-500 dark:text-cyan-400" />
                    {lang === "ar" ? "لوحة المندوب الذكي" : "Courier HUD"}
                  </Link>
                </Button>
              )}

              {isLoggedIn ? (
                <Button variant="outline" size="sm" onClick={handleSignOut} className="justify-start gap-2 border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  <LogOut className="size-4" />
                  {t("logout")}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    goToLogin();
                  }}
                  className="justify-start gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold px-4"
                >
                  <KeyRound className="size-4" />
                  {lang === "ar" ? "دخول" : "Login"}
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

    </>
  );
}

export function AppFooter() {
  const { lang } = useI18n();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinType, setJoinType] = useState<JoinAccountType>("customer");

  const openJoinModal = (type: JoinAccountType) => {
    sounds.playClick();
    setJoinType(type);
    setJoinModalOpen(true);
  };

  const openCodeModal = () => {
    sounds.playClick();
    window.location.assign("/auth");
  };

  return (
    <>
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* 1. Brand & Description */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <FoodHubLogo size={40} showText />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === "ar"
                  ? "منظومة توصيل طعام متكاملة تجمع بين أفضل المطابخ السحابية والمطاعم مع أسرع خدمة توصيل وأعلى معايير الجودة وأقل سعر توصيل."
                  : "All-in-one smart food delivery platform connecting premier cloud kitchens and restaurants with ultra-fast delivery and top security."}
              </p>
            </div>

            {/* 2. Customer Services */}
            <div>
              <h3 className="mb-3 font-bold text-white text-sm">
                {lang === "ar" ? "خدمات العملاء" : "Customer Services"}
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link to="/" className="hover:text-amber-400 transition-colors">
                    {lang === "ar" ? "🍽️ تصفح قائمة الأطباق الصحية" : "🍽️ Browse Healthy Menu"}
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="hover:text-amber-400 transition-colors">
                    {lang === "ar" ? "🛰️ رادار تتبع الطلبات المباشر" : "🛰️ Live Order Radar"}
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-amber-400 transition-colors">
                    {lang === "ar" ? "🛒 السلة وإتمام الطلب الفوري" : "🛒 Cart & Instant Checkout"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. Account Creation Requests (Customer, Courier, Restaurant) */}
            <div>
              <h3 className="mb-3 font-bold text-white text-sm">
                {lang === "ar" ? "إنشاء الحسابات وانضمام الشركاء" : "Account Creation & Partners"}
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link
                    to="/register"
                    search={{ role: "customer" }}
                    onClick={() => sounds.playClick()}
                    className="flex items-center gap-1.5 text-start hover:text-amber-400 transition-colors"
                  >
                    <User className="size-3.5 text-amber-400" />
                    {lang === "ar" ? "طلب إنشاء حساب عميل جديد (تفعيل فوري)" : "Request Customer Account (Instant)"}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    search={{ role: "courier" }}
                    onClick={() => sounds.playClick()}
                    className="flex items-center gap-1.5 text-start hover:text-cyan-400 transition-colors"
                  >
                    <Bike className="size-3.5 text-cyan-400" />
                    {lang === "ar" ? "طلب انضمام كابتن مندوب توصيل" : "Join as Delivery Courier"}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    search={{ role: "restaurant" }}
                    onClick={() => sounds.playClick()}
                    className="flex items-center gap-1.5 text-start hover:text-orange-400 transition-colors"
                  >
                    <Store className="size-3.5 text-orange-400" />
                    {lang === "ar" ? "طلب انضمام مطبخ سحابي / متجر" : "Join as Cloud Kitchen / Store"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. Access Codes & Support */}
            <div>
              <h3 className="mb-3 font-bold text-white text-sm">
                {lang === "ar" ? "أكواد الدخول والدعم الفني" : "Access Codes & Support"}
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button
                    onClick={openCodeModal}
                    className="flex items-center gap-1.5 text-start hover:text-amber-400 transition-colors text-amber-300 font-semibold"
                  >
                    <KeyRound className="size-3.5 text-amber-400" />
                    {lang === "ar" ? "دخول بكود الوصول المعتمد" : "Access Code Login"}
                  </button>
                </li>
                <li>
                  <button
                    onClick={openCodeModal}
                    className="flex items-center gap-1.5 text-start hover:text-rose-400 transition-colors"
                  >
                    <HelpCircle className="size-3.5 text-rose-400" />
                    {lang === "ar" ? "نسيت كود الدخول؟ طلب كود جديد" : "Forgot Code? Request New Code"}
                  </button>
                </li>
                <li className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                  {lang === "ar"
                    ? "🛡️ نظام حماية الـ IP الفردي: يتم تزويد كل شريك وعميل بكود دخول مشفر معتمد من الإدارة."
                    : "🛡️ Single-IP Protected: Valid access codes are issued and verified by administration."}
                </li>
                <li className="text-[11px] text-slate-500">
                  {lang === "ar" ? "📧 للدعم والاستفسارات: " : "📧 Support & Inquiries: "}
                  <span className="text-slate-300 font-mono">support@foodhub.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800/80 pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} FOODHUB — {lang === "ar" ? "أسرع توصيل بأقل سعر" : "FASTEST DELIVERY & LOWEST PRICE"}</p>
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400">
                {lang === "ar" ? "نظام الأكواد المشفرة وحماية الـ IP نشط 100%" : "Encrypted Codes & IP Shield Active 100%"}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Join Request Modal */}
      <PartnerJoinModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        defaultType={joinType}
      />

    </>
  );
}

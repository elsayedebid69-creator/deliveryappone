import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, Languages, LogOut, LayoutDashboard, Menu, X, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { dashboardPathFor, useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FoodHubLogo } from "@/components/food-hub-logo";
import { sounds } from "@/lib/sound-effects";

export function AppHeader() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const { user, role } = useSession();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const signOut = async () => {
    sounds.playClick();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-11 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl text-slate-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {/* Logo */}
        <Link to="/" onClick={() => sounds.playClick()} className="flex items-center gap-2">
          <FoodHubLogo size={40} showText />
          <span className="hidden sm:inline-block rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
            3.0 AI
          </span>
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

          {user && role && role !== "customer" ? (
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-300 hover:text-white hover:bg-slate-900">
              <Link to={dashboardPathFor(role)} onClick={() => sounds.playClick()}>
                <LayoutDashboard className="size-4 text-amber-400" />
                <span className="hidden sm:inline">{t("dashboard")}</span>
              </Link>
            </Button>
          ) : null}

          <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-900">
            <Link to="/orders" onClick={() => sounds.playClick()}>
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-400" />
                تتبع طلباتي
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

            {user && role && role !== "customer" ? (
              <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-300 hover:text-white">
                <Link to={dashboardPathFor(role)} onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="size-4 text-amber-400" />
                  {t("dashboard")}
                </Link>
              </Button>
            ) : null}

            <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-slate-300 hover:text-white">
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                <Sparkles className="size-4 text-amber-400" />
                تتبع طلباتي
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
  );
}

export function AppFooter() {
  const { t, lang } = useI18n();
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <FoodHubLogo size={40} showText />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              منظومة توصيل ذكية متكاملة تجمع بين العميل، شاشة المطبخ KDS، ومندوب التوصيل بالذكاء الاصطناعي.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 font-bold text-white text-sm">
              {lang === "ar" ? "التطبيقات الثلاثة" : "Ecosystem Apps"}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-amber-400">
                  👤 تطبيق العميل
                </Link>
              </li>
              <li>
                <Link to="/_authenticated/vendor" className="hover:text-amber-400">
                  🍳 شاشة المطبخ (KDS)
                </Link>
              </li>
              <li>
                <Link to="/_authenticated/courier" className="hover:text-amber-400">
                  🛵 تطبيق المندوب (HUD)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-bold text-white text-sm">
              {lang === "ar" ? "الانضمام والشركاء" : "For Partners"}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/join/restaurant" className="hover:text-amber-400">
                  {t("joinAsRestaurant")}
                </Link>
              </li>
              <li>
                <Link to="/join/courier" className="hover:text-amber-400">
                  {t("joinAsCourier")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-bold text-white text-sm">
              {lang === "ar" ? "الدعم والتقنية" : "Support"}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="text-slate-500">الذكاء الاصطناعي:</span> AI FoodHub Core 3.0
              </li>
              <li>
                <span className="text-slate-500">الرادار:</span> GPS Telemetry Active
              </li>
              <li>
                <span className="text-slate-500">الدعم:</span> support@foodhub.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800/80 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FoodHub 3.0 — FAST. FRESH. INTELLIGENT.
        </div>
      </div>
    </footer>
  );
}

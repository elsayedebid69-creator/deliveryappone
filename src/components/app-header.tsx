import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, Languages, LogOut, LayoutDashboard, UtensilsCrossed, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { dashboardPathFor, useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const { user, role } = useSession();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md">
            <UtensilsCrossed className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-gray-900">
            {t("brand")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="flex-1" />
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-gray-600 hover:text-gray-900"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          >
            <Languages className="size-4" />
            {lang === "ar" ? "EN" : "ع"}
          </Button>

          {user && role && role !== "customer" ? (
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900">
              <Link to={dashboardPathFor(role)}>
                <LayoutDashboard className="size-4" />
                <span className="hidden sm:inline">{t("dashboard")}</span>
              </Link>
            </Button>
          ) : null}

          {user ? (
            <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Link to="/orders">{t("orders")}</Link>
            </Button>
          ) : null}

          <Button asChild variant="ghost" size="sm" className="relative gap-1.5 text-gray-600 hover:text-gray-900">
            <Link to="/cart">
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">{t("cart")}</span>
              {count > 0 ? (
                <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-[11px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>

          {user ? (
            <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </Button>
          ) : (
            <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Link to="/auth">{t("login")}</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="justify-start gap-2 text-gray-600"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            >
              <Languages className="size-4" />
              {lang === "ar" ? "English" : "العربية"}
            </Button>

            {user && role && role !== "customer" ? (
              <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-gray-600">
                <Link to={dashboardPathFor(role)} onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="size-4" />
                  {t("dashboard")}
                </Link>
              </Button>
            ) : null}

            {user ? (
              <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-gray-600">
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                  {t("orders")}
                </Link>
              </Button>
            ) : null}

            <Button asChild variant="ghost" size="sm" className="justify-start gap-2 text-gray-600">
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingBag className="size-4" />
                {t("cart")}
                {count > 0 ? (
                  <Badge className="ml-2 bg-orange-500 text-white">{count}</Badge>
                ) : null}
              </Link>
            </Button>

            {user ? (
              <Button variant="outline" size="sm" onClick={signOut} className="justify-start gap-2 border-gray-200 text-gray-600">
                <LogOut className="size-4" />
                {t("logout")}
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
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
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <UtensilsCrossed className="size-5" />
              </span>
              <span className="font-display text-lg font-bold text-gray-900">{t("brand")}</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              {t("heroSub")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              {lang === "ar" ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-orange-600">
                  {t("allRestaurants")}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-600">
                  {t("cart")}
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-orange-600">
                  {t("login")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              {lang === "ar" ? "للشركاء" : "For Partners"}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/join/restaurant" className="hover:text-orange-600">
                  {t("joinAsRestaurant")}
                </Link>
              </li>
              <li>
                <Link to="/join/courier" className="hover:text-orange-600">
                  {t("joinAsCourier")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              {lang === "ar" ? "تواصل معنا" : "Contact"}
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <span className="text-gray-400">{lang === "ar" ? "البريد الإلكتروني" : "Email"}:</span>{" "}
                support@sufra.com
              </li>
              <li>
                <span className="text-gray-400">{lang === "ar" ? "الجوال" : "Phone"}:</span>{" "}
                920000000
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {t("brand")} — {t("tagline")}
        </div>
      </div>
    </footer>
  );
}

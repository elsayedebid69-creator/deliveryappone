import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Languages, LogOut, LayoutDashboard, UtensilsCrossed } from "lucide-react";
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

  const signOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="hero-gradient flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <UtensilsCrossed className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">{t("brand")}</span>
        </Link>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        >
          <Languages className="size-4" />
          {lang === "ar" ? "EN" : "ع"}
        </Button>

        {user && role && role !== "customer" ? (
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to={dashboardPathFor(role)}>
              <LayoutDashboard className="size-4" />
              <span className="hidden sm:inline">{t("dashboard")}</span>
            </Link>
          </Button>
        ) : null}

        {user ? (
          <Button asChild variant="ghost" size="sm">
            <Link to="/orders">{t("orders")}</Link>
          </Button>
        ) : null}

        <Button asChild variant="ghost" size="sm" className="relative gap-1.5">
          <Link to="/cart">
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">{t("cart")}</span>
            {count > 0 ? (
              <span className="absolute -top-1 -end-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>
        </Button>

        {user ? (
          <Button variant="outline" size="sm" onClick={signOut} className="gap-1.5">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link to="/auth">{t("login")}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

export function AppFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border/70 py-8 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} {t("brand")} — {t("tagline")}
    </footer>
  );
}

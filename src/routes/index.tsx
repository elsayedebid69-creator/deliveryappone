import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { CustomerApp } from "@/components/storefront/customer-app";
import { CustomerMobileApp } from "@/components/apps/customer-mobile-app";
import { CourierMobileApp } from "@/components/apps/courier-mobile-app";
import { KitchenMobileApp } from "@/components/apps/kitchen-mobile-app";
import { AppEcosystemSwitcher, type ActiveAppId } from "@/components/apps/app-ecosystem-switcher";
import { AppHeader, AppFooter } from "@/components/app-header";
import { safeJsonLd } from "@/lib/jsonld";
import { useI18n } from "@/lib/i18n";
import { Smartphone, Globe } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

export const Route = createFileRoute("/")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      app: (search.app as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "FOODHUB | منظومة التطبيقات الثلاثة (عميل • مندوب • مطبخ)" },
      {
        name: "description",
        content: "أسرع توصيل طعام بأقل سعر في المملكة مع 3 تطبيقات مخصصة: تطبيق العميل، تطبيق المندوب، وتطبيق شاشة المطبخ KDS.",
      },
      { property: "og:title", content: "FOODHUB | منظومة التطبيقات الثلاثة" },
      {
        property: "og:description",
        content: "منظومة متكاملة لطلب وتوصيل وإدارة المطاعم السحابية.",
      },
      { property: "og:image", content: "https://foodhub.delivery/icons/icon-512.png" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://foodhub.delivery/" },
    ],
    links: [{ rel: "canonical", href: "https://foodhub.delivery/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const search = Route.useSearch();

  // Determine initial active app view
  const [activeApp, setActiveApp] = useState<ActiveAppId>(() => {
    if (search.app === "courier") return "courier";
    if (search.app === "kitchen" || search.app === "vendor") return "kitchen";
    if (search.app === "portal") return "portal";
    try {
      const saved = localStorage.getItem("foodhub_active_app_view");
      if (saved === "courier" || saved === "kitchen" || saved === "customer" || saved === "portal") {
        return saved as ActiveAppId;
      }
    } catch {
      // ignore
    }
    return "customer";
  });

  // Track if mobile viewport or native platform
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isNative = Capacitor.isNativePlatform();
      const isSmall = window.innerWidth < 768;
      setIsMobileDevice(isNative || isSmall);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectApp = (appId: ActiveAppId) => {
    setActiveApp(appId);
    try {
      localStorage.setItem("foodhub_active_app_view", appId);
      window.dispatchEvent(new CustomEvent("foodhub_app_changed", { detail: { appId } }));
    } catch {
      // ignore
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://foodhub.delivery/#website",
        url: "https://foodhub.delivery/",
        name: "FOODHUB",
        description: "أسرع منصة توصيل طعام بأقل سعر في المملكة مع تطبيقات العميل والمندوب والمطبخ",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />

      {/* 1. MASTER 3-APP ECOSYSTEM SWITCHER BAR */}
      <AppEcosystemSwitcher
        activeApp={activeApp}
        onSelectApp={handleSelectApp}
      />

      {/* 2. APP VIEWPORT RENDERING */}
      {activeApp === "customer" && (
        <div className="flex-1 animate-in fade-in-50 duration-200">
          <CustomerMobileApp />
        </div>
      )}

      {activeApp === "courier" && (
        <div className="flex-1 animate-in fade-in-50 duration-200">
          <CourierMobileApp />
        </div>
      )}

      {activeApp === "kitchen" && (
        <div className="flex-1 animate-in fade-in-50 duration-200">
          <KitchenMobileApp />
        </div>
      )}

      {activeApp === "portal" && (
        <div className="flex-1 flex flex-col animate-in fade-in-50 duration-200">
          <AppHeader />
          <main className="flex-1">
            <CustomerApp isEmbedded={false} />
          </main>
          <AppFooter />
        </div>
      )}

      {/* 3. OPTIONAL DESKTOP PORTAL TOGGLE (For desktop users who want the marketing website) */}
      {!isMobileDevice && activeApp !== "portal" && (
        <div className="fixed bottom-3 end-4 z-40">
          <button
            onClick={() => handleSelectApp("portal")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs shadow-xl transition-all"
            title={ar ? "عرض موقع سطح المكتب" : "View Desktop Website"}
          >
            <Globe className="size-3.5 text-amber-400" />
            <span>{ar ? "عرض الموقع التسويقي" : "View Marketing Site"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CustomerMobileApp } from "@/components/apps/customer-mobile-app";
import { CourierMobileApp } from "@/components/apps/courier-mobile-app";
import { KitchenMobileApp } from "@/components/apps/kitchen-mobile-app";
import { CustomerApp } from "@/components/storefront/customer-app";
import { AppHeader, AppFooter } from "@/components/app-header";
import { safeJsonLd } from "@/lib/jsonld";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FOODHUB | أسرع توصيل بأقل سعر" },
      {
        name: "description",
        content: "الموقع الرسمي لمنصة فود هب: أسرع توصيل طعام بأقل سعر في المملكة. وجبات صحية ومطابخ سحابية في الرياض مع لوحة تحكم متكاملة للإدارة.",
      },
      { property: "og:title", content: "FOODHUB | أسرع توصيل بأقل سعر" },
      {
        property: "og:description",
        content: "الموقع الرسمي لمنصة FOODHUB لعرض المنصة للجمهور وبوابة الإدارة المركزية.",
      },
      { property: "og:image", content: "https://foodhub.delivery/icons/icon-512.png" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://foodhub.delivery/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://foodhub.delivery/icons/icon-512.png" },
    ],
    links: [{ rel: "canonical", href: "https://foodhub.delivery/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const [appMode, setAppMode] = useState<"website" | "customer" | "captain" | "kitchen">("website");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get("app")?.toLowerCase();

      if (appParam === "admin") {
        localStorage.setItem("foodhub_native_app", "admin");
        window.location.replace("/admin-app");
        return;
      }
      if (appParam === "captain" || appParam === "courier") {
        setAppMode("captain");
      } else if (appParam === "kitchen" || appParam === "vendor") {
        setAppMode("kitchen");
      } else if (appParam === "customer") {
        setAppMode("customer");
      } else {
        // Default on web, desktop, and Lovable: Show the official Public Website & Admin Portal!
        setAppMode("website");
      }
    } catch {
      setAppMode("website");
    }
  }, []);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://foodhub.delivery/#website",
        url: "https://foodhub.delivery/",
        name: "FOODHUB",
        description: "المنصة الرسمية الموحدة لتوصيل الطعام وإدارة المطابخ السحابية",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://foodhub.delivery/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://foodhub.delivery/#organization",
        name: "FOODHUB Delivery",
        url: "https://foodhub.delivery/",
        logo: "https://foodhub.delivery/icons/icon-512.png",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+966551234567",
          contactType: "customer service",
          areaServed: "SA",
          availableLanguage: ["Arabic", "English"],
        },
      },
    ],
  };

  // 1. Captain Standalone Mobile App (Loaded by Captain APK: delivery.foodhub.captain)
  if (appMode === "captain") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        <main className="flex-1">
          <CourierMobileApp />
        </main>
      </div>
    );
  }

  // 2. Kitchen & Merchant Standalone Mobile/Tablet App (Loaded by Kitchen APK: delivery.foodhub.kitchen)
  if (appMode === "kitchen") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        <main className="flex-1">
          <KitchenMobileApp />
        </main>
      </div>
    );
  }

  // 3. Customer Standalone Mobile App (Loaded by Customer APK: delivery.foodhub.customer)
  if (appMode === "customer") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
        <main className="flex-1">
          <CustomerMobileApp />
        </main>
      </div>
    );
  }

  // 4. Default: Official Public Presentation Website & Admin Portal Access (for web visitors & Lovable editor)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />
      <AppHeader />
      <main className="flex-1">
        <CustomerApp isEmbedded={false} />
      </main>
      <AppFooter />
    </div>
  );
}

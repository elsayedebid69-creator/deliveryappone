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
        content: "تطبيق فود هب الرسمي لطلب الوجبات السريعة والصحية من أفضل المطابخ السحابية بالرياض بتوصيل فائق السرعة يبدأ من 15 دقيقة.",
      },
      { property: "og:title", content: "FOODHUB | أسرع توصيل بأقل سعر" },
      {
        property: "og:description",
        content: "أسرع توصيل طعام في 15 دقيقة بأقل سعر توصيل في المملكة مع رادار تتبع حي وخصومات فورية.",
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
  const [appMode, setAppMode] = useState<"customer" | "captain" | "kitchen" | "landing">("customer");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get("app")?.toLowerCase();

      if (appParam === "captain" || appParam === "courier") {
        setAppMode("captain");
      } else if (appParam === "kitchen" || appParam === "vendor") {
        setAppMode("kitchen");
      } else if (appParam === "landing") {
        setAppMode("landing");
      } else {
        // Default for Customer App APK, mobile browsers, and customer storefront
        setAppMode("customer");
      }
    } catch {
      setAppMode("customer");
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
        description: "أسرع منصة توصيل طعام بأقل سعر في المملكة",
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

  // 1. Captain Standalone Mobile App (?app=captain)
  if (appMode === "captain") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        <main className="flex-1">
          <CourierMobileApp />
        </main>
      </div>
    );
  }

  // 2. Kitchen & Merchant Standalone Mobile/Tablet App (?app=kitchen)
  if (appMode === "kitchen") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        <main className="flex-1">
          <KitchenMobileApp />
        </main>
      </div>
    );
  }

  // 3. Legacy Marketing Landing Page (?app=landing)
  if (appMode === "landing") {
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

  // 4. Dedicated Pure Customer Mobile App (Default for Root & ?app=customer)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteSchema) }}
      />
      <main className="flex-1">
        <CustomerMobileApp />
      </main>
    </div>
  );
}

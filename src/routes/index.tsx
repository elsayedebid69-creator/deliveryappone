import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CustomerMobileApp } from "@/components/apps/customer-mobile-app";
import { CourierMobileApp } from "@/components/apps/courier-mobile-app";
import { KitchenMobileApp } from "@/components/apps/kitchen-mobile-app";
import { safeJsonLd } from "@/lib/jsonld";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FOODHUB | أسرع توصيل بأقل سعر" },
      {
        name: "description",
        content: "تطبيق فود هب الرسمي لطلب الوجبات السريعة والصحية من أفضل المطابخ السحابية بالرياض بتوصيل فائق السرعة.",
      },
      { property: "og:title", content: "FOODHUB" },
      { property: "og:image", content: "https://foodhub.delivery/icons/icon-512.png" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://foodhub.delivery/" },
    ],
    links: [{ rel: "canonical", href: "https://foodhub.delivery/" }],
  }),
  component: RootAppEntryPoint,
});

function RootAppEntryPoint() {
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const app = params.get("app")?.toLowerCase();
      if (app) {
        setAppId(app);
      }
    } catch {
      // ignore
    }
  }, []);

  // 1. If Captain app flavor (?app=captain or ?app=courier)
  if (appId === "captain" || appId === "courier") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        <main className="flex-1">
          <CourierMobileApp />
        </main>
      </div>
    );
  }

  // 2. If Kitchen app flavor (?app=kitchen or ?app=vendor)
  if (appId === "kitchen" || appId === "vendor") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        <main className="flex-1">
          <KitchenMobileApp />
        </main>
      </div>
    );
  }

  // 3. Default: Dedicated Pure Customer Mobile App
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://foodhub.delivery/#website",
        url: "https://foodhub.delivery/",
        name: "FOODHUB",
        description: "تطبيق العميل الرسمي لطلب الطعام والتوصيل السريع",
      },
    ],
  };

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

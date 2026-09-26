import { createFileRoute } from "@tanstack/react-router";
import { CustomerMobileApp } from "@/components/apps/customer-mobile-app";
import { safeJsonLd } from "@/lib/jsonld";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FOODHUB | تطبيق العميل لطلب الطعام السريع" },
      {
        name: "description",
        content: "تطبيق فود هب الرسمي لطلب الوجبات السريعة والصحية من أفضل المطابخ السحابية بالرياض بتوصيل فائق السرعة.",
      },
      { property: "og:title", content: "FOODHUB | تطبيق العميل" },
      {
        property: "og:description",
        content: "أسرع توصيل طعام في الرياض بأقل الأسعار وعروض يومية متجددة.",
      },
      { property: "og:image", content: "https://foodhub.delivery/icons/icon-512.png" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://foodhub.delivery/" },
    ],
    links: [{ rel: "canonical", href: "https://foodhub.delivery/" }],
  }),
  component: CustomerStandaloneApp,
});

function CustomerStandaloneApp() {
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
      {/* 100% Dedicated Customer Mobile App (No switchers, no admin clutter) */}
      <main className="flex-1">
        <CustomerMobileApp />
      </main>
    </div>
  );
}

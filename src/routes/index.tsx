import { createFileRoute } from "@tanstack/react-router";
import { CustomerApp } from "@/components/storefront/customer-app";
import { AppHeader, AppFooter } from "@/components/app-header";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FOODHUB 3.0 | الجيل القادم لتوصيل الطعام الصحي والذكي" },
      {
        name: "description",
        content: "منظومة توصيل وجبات فائقة الحداثة مدعومة بالذكاء الاصطناعي على طريقة Zomato — أسرع، أطزج، وأذكى.",
      },
      { property: "og:title", content: "FOODHUB 3.0 | الجيل القادم لتوصيل الطعام" },
      {
        property: "og:description",
        content: "وجبات طازجة محسوبة السعرات بتوصيل راداري حي ومساعد ذكي AI.",
      },
      { property: "og:image", content: "/icons/icon-512.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://mealify-admin.lovable.app/#website",
        url: "https://mealify-admin.lovable.app/",
        name: "FOODHUB",
        description: "منظومة توصيل الطعام الصحي والذكي 3.0",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://mealify-admin.lovable.app/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://mealify-admin.lovable.app/#organization",
        name: "FOODHUB Delivery",
        url: "https://mealify-admin.lovable.app/",
        logo: "https://mealify-admin.lovable.app/icons/icon-512.png",
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <AppHeader />
      <main className="flex-1">
        <CustomerApp isEmbedded={false} />
      </main>
      <AppFooter />
    </div>
  );
}

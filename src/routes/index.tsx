import { createFileRoute } from "@tanstack/react-router";
import { CustomerApp } from "@/components/storefront/customer-app";
import { AppHeader, AppFooter } from "@/components/app-header";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FOODHUB | أسرع توصيل بأقل سعر" },
      {
        name: "description",
        content: "أسرع توصيل طعام بأقل سعر في المملكة. وجبات صحية ولذيذة من أفضل المطابخ السحابية بتوصيل فائق السرعة يبدأ من 15 دقيقة.",
      },
      { property: "og:title", content: "FOODHUB | أسرع توصيل بأقل سعر" },
      {
        property: "og:description",
        content: "أسرع توصيل طعام في 15 دقيقة بأقل سعر توصيل في المملكة مع رادار تتبع حي وخصومات فورية.",
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

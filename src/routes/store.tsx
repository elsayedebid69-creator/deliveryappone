import { createFileRoute } from "@tanstack/react-router";
import { CustomerApp } from "@/components/storefront/customer-app";
import { AppHeader, AppFooter } from "@/components/app-header";

export const Route = createFileRoute("/store")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FoodHub Store | اطلب الآن من أفضل المطابخ والمتاجر" },
      {
        name: "description",
        content: "اطلب وجباتك المفضلة ومشترياتك اليومية بأسرع توصيل وأقل سعر عبر FoodHub.",
      },
      { property: "og:title", content: "متجر FoodHub | أسرع توصيل بأقل سعر" },
      {
        property: "og:description",
        content: "تصفح متجر FoodHub: مطابخ ومتاجر قريبة منك، عروض يومية، وتوصيل سريع لطلبك خلال دقائق.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://foodhub.delivery/store" },
      { property: "og:image", content: "https://foodhub.delivery/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://foodhub.delivery/icons/icon-512.png" },
    ],
    links: [{ rel: "canonical", href: "https://foodhub.delivery/store" }],
  }),
  component: StorePage,
});

function StorePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />
      <main className="flex-1">
        <CustomerApp isEmbedded={false} />
      </main>
      <AppFooter />
    </div>
  );
}

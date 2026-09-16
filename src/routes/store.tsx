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
        content: "اطلب وجباتك المفضلة ومشترياتك اليومية بتوصيل فائق السرعة عبر FoodHub 3.0.",
      },
      { property: "og:title", content: "متجر FoodHub 3.0" },
    ],
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

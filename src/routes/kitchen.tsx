import { createFileRoute } from "@tanstack/react-router";
import { KitchenMobileApp } from "@/components/apps/kitchen-mobile-app";

export const Route = createFileRoute("/kitchen")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FOODHUB Kitchen | تطبيق شاشة المطبخ KDS" },
      {
        name: "description",
        content: "تطبيق شاشة المطبخ وإدارة المطاعم KDS في منصة فود هب. استقبال التذاكر الفورية ومؤقتات الطهي وإدارة المخزون.",
      },
      { property: "og:title", content: "FOODHUB Kitchen | تطبيق شاشة المطبخ KDS" },
      { property: "og:image", content: "https://foodhub.delivery/icons/icon-512.png" },
    ],
  }),
  component: KitchenStandaloneApp,
});

function KitchenStandaloneApp() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <main className="flex-1">
        <KitchenMobileApp />
      </main>
    </div>
  );
}

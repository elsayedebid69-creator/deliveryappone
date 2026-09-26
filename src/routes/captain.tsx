import { createFileRoute } from "@tanstack/react-router";
import { CourierMobileApp } from "@/components/apps/courier-mobile-app";

export const Route = createFileRoute("/captain")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FOODHUB Captain | تطبيق المندوب الذكي" },
      {
        name: "description",
        content: "تطبيق كابتن ومندوب فود هب الرسمي. استلام وتوصيل الطلبات، الرادار الحي، والملاحة وإثبات التسليم.",
      },
      { property: "og:title", content: "FOODHUB Captain | تطبيق المندوب الذكي" },
      { property: "og:image", content: "https://foodhub.delivery/icons/icon-512.png" },
    ],
  }),
  component: CaptainStandaloneApp,
});

function CaptainStandaloneApp() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <main className="flex-1">
        <CourierMobileApp />
      </main>
    </div>
  );
}

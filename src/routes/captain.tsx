import { createFileRoute } from "@tanstack/react-router";
import { SimpleCourierApp } from "@/components/apps/simple-courier-app";

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
      { property: "og:description", content: "شيفت المندوب ومواقع استلام وتسليم الطلبات في FoodHub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CaptainStandaloneApp,
});

function CaptainStandaloneApp() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        <SimpleCourierApp />
      </main>
    </div>
  );
}

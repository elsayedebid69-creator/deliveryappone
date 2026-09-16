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
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
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

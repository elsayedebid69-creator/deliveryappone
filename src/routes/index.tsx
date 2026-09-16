import { createFileRoute } from "@tanstack/react-router";
import { AppSimulatorWorkspace } from "@/components/dev-workspace/app-simulator";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FoodHub 3.0 | لوحة تطوير ومحاكاة المنظومة الشاملة" },
      {
        name: "description",
        content: "مركز تطوير وتحكم ومحاكاة تطبيقات FoodHub 3.0 — تطبيق العميل، شاشة المطبخ KDS، لوحة المندوب، ولوحة الإدارة.",
      },
      { property: "og:title", content: "FoodHub 3.0 Developer & Ecosystem Studio" },
      {
        property: "og:description",
        content: "بيئة تطوير ومحاكاة متعددة الأجهزة لتطبيقات توصيل الطعام السحابية المدعومة بالذكاء الاصطناعي.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return <AppSimulatorWorkspace />;
}

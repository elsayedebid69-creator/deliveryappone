import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Clock, Bike } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AppFooter, AppHeader } from "@/components/app-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سُفرة | توصيل طعام سريع من أفضل المطاعم" },
      {
        name: "description",
        content:
          "اطلب من أفضل المطاعم القريبة منك عبر سُفرة، وتابع طلبك لحظة بلحظة حتى باب بيتك.",
      },
      { property: "og:title", content: "سُفرة | توصيل طعام سريع" },
      {
        property: "og:description",
        content: "أشهى الأطباق من مطاعمك المفضلة تصلك في دقائق مع تتبع مباشر للطلب.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang, tf } = useI18n();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter((r) =>
      [r.name_ar, r.name_en, r.cuisine_ar, r.cuisine_en].some((v) =>
        (v ?? "").toLowerCase().includes(term),
      ),
    );
  }, [data, q]);

  return (
    <div className="min-h-screen">
      <AppHeader />

      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt={lang === "ar" ? "أطباق شهية من مطاعم متنوعة" : "Delicious dishes from local restaurants"}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="hero-gradient absolute inset-0 opacity-85" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-primary-foreground">
          <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {t("fastDelivery")}
          </p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            {t("tagline")}
          </h1>
          <p className="mt-4 max-w-xl text-base opacity-90">{t("heroSub")}</p>

          <div className="surface mt-8 flex max-w-xl items-center gap-2 p-2">
            <Search className="ms-2 size-5 shrink-0 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              maxLength={80}
              className="border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">{t("allRestaurants")}</h2>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <Link
                key={r.id}
                to="/restaurant/$id"
                params={{ id: r.id }}
                className="surface group overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-float)]"
              >
                <div className="hero-gradient flex h-28 items-end p-4">
                  <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                    {tf(r, "cuisine")}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="text-lg font-bold">{tf(r, "name")}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Star className="size-4 fill-primary text-primary" />
                      {r.rating}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-4" />
                      {r.eta_minutes} {t("min")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bike className="size-4" />
                      {Number(r.delivery_fee) === 0
                        ? t("free")
                        : `${r.delivery_fee} ${t("sar")}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

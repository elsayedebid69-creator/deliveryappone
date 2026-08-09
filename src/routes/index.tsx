import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Clock, Bike, Filter, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { AppFooter, AppHeader } from "@/components/app-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const CATEGORIES = [
  { id: "all", ar: "الكل", en: "All" },
  { id: "fastfood", ar: "وجبات سريعة", en: "Fast Food" },
  { id: "pizza", ar: "بيتزا", en: "Pizza" },
  { id: "burger", ar: "برجر", en: "Burger" },
  { id: "shawarma", ar: "شاورما", en: "Shawarma" },
  { id: "seafood", ar: "مأكولات بحرية", en: "Seafood" },
  { id: "dessert", ar: "حلويات", en: "Desserts" },
  { id: "coffee", ar: "قهوة", en: "Coffee" },
];

function Home() {
  const { t, lang, tf } = useI18n();
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
    let results = data ?? [];

    if (term) {
      results = results.filter((r) =>
        [r.name_ar, r.name_en, r.cuisine_ar, r.cuisine_en].some((v) =>
          (v ?? "").toLowerCase().includes(term),
        ),
      );
    }

    if (selectedCategory !== "all") {
      results = results.filter((r) => {
        const cuisine = (r.cuisine_ar ?? "").toLowerCase();
        return cuisine.includes(selectedCategory);
      });
    }

    return results;
  }, [data, q, selectedCategory]);

  return (
    <div className="min-h-screen">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt={lang === "ar" ? "أطباق شهية من مطاعم متنوعة" : "Delicious dishes from local restaurants"}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="hero-gradient absolute inset-0 opacity-90" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
              {t("fastDelivery")}
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              {t("tagline")}
            </h1>
            <p className="mt-4 max-w-xl text-base opacity-90">{t("heroSub")}</p>
          </div>

          {/* Search Bar */}
          <div className="surface mt-8 flex max-w-xl items-center gap-2 p-2">
            <Search className="ms-2 size-5 shrink-0 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              maxLength={80}
              className="border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0"
            />
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              <Filter className="size-4" />
            </Button>
          </div>

          {/* Categories */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-white text-orange-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {cat[lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("allRestaurants")}</h2>
          <p className="text-sm text-gray-500">
            {filtered.length} {lang === "ar" ? "مطعم" : "restaurants"}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-16 text-center">
            <Search className="mb-4 size-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              {lang === "ar" ? "لم يتم العثور على مطاعم" : "No restaurants found"}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {lang === "ar" ? "جرب البحث بكلمات مختلفة" : "Try searching with different keywords"}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <Link
                key={r.id}
                to="/restaurant/$id"
                params={{ id: r.id }}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="hero-gradient flex h-32 items-end p-4">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700">
                    {tf(r, "cuisine")}
                  </span>
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="text-lg font-bold">{tf(r, "name")}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                      <Star className="size-4 fill-orange-400 text-orange-400" />
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

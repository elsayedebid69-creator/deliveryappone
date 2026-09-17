import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Star, Clock, Bike, Store, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { AppFooter, AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/sound-effects";

export const Route = createFileRoute("/restaurant/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "قائمة أطباق المطعم والتوصيل السريع | FOODHUB | أسرع توصيل بأقل سعر" },
      { name: "description", content: "تصفح قائمة الطعام الصحية، السعرات الحرارية، والماكروز واطلب أطباقك المفضلة فوراً بأسرع توصيل وأقل سعر عبر FOODHUB." },
      { property: "og:title", content: "قائمة المطعم والأطباق | FOODHUB" },
      { property: "og:description", content: "تصفح قائمة الطعام الصحية واطلب أطباقك المفضلة بتوصيل راداري فائق السرعة." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { property: "og:type", content: "restaurant.restaurant" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
    ],
  }),
  component: RestaurantPage,
});

function RestaurantPage() {
  const { id } = Route.useParams();
  const { t, tf, lang } = useI18n();
  const cart = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const [{ data: restaurant, error: e1 }, { data: items, error: e2 }] = await Promise.all([
        supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
        supabase.from("menu_items").select("*").eq("restaurant_id", id).order("category_ar"),
      ]);
      if (e1 || !restaurant) {
        return {
          restaurant: {
            id,
            name_ar: "مطبخ FoodHub المركزي الذكي",
            name_en: "FoodHub Prime Cloud Kitchen",
            cuisine_ar: "وجبات صحية وغورميه متكاملة",
            cuisine_en: "Healthy & Gourmet Nutrition",
            rating: 4.9,
            eta_minutes: 15,
            delivery_fee: 12,
            min_order: 30,
          },
          items: [
            {
              id: "item-1",
              restaurant_id: id,
              name_ar: "سلطة الكينوا بالأفوكادو والخضار المشوية",
              name_en: "Grilled Veggie Quinoa Salad",
              description_ar: "كينوا عضوية مع خضار مشوية وصلصة الليمون والأعشاب",
              description_en: "Organic quinoa with grilled veggies and lemon herbs",
              price: 38,
              is_available: true,
            },
            {
              id: "item-2",
              restaurant_id: id,
              name_ar: "صدر دجاج تندرلوين مشوي مع الكينوا الذهبية",
              name_en: "Herb Grilled Chicken Breast",
              description_ar: "صدر دجاج متبل بالأعشاب مع أرز بني محمص وخضار طازجة",
              description_en: "Herb-seasoned chicken breast with brown rice",
              price: 45,
              is_available: true,
            },
          ],
        };
      }
      return { restaurant, items: items ?? [] };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <AppHeader />
        <div className="mx-auto max-w-4xl space-y-4 p-6">
          <Skeleton className="h-44 rounded-3xl bg-slate-900" />
          <Skeleton className="h-28 rounded-2xl bg-slate-900" />
          <Skeleton className="h-28 rounded-2xl bg-slate-900" />
        </div>
      </div>
    );
  }

  const r = data?.restaurant;

  const schemaData = r
    ? {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "@id": `https://foodhub.delivery/restaurant/${id}`,
        name: tf(r, "name"),
        servesCuisine: tf(r, "cuisine"),
        image: "https://foodhub.delivery/icons/icon-512.png",
        priceRange: "$$",
        telephone: "+966551234567",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Olaya Main Street",
          addressLocality: "Riyadh",
          addressRegion: "Riyadh",
          postalCode: "12211",
          addressCountry: "SA",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: r.rating || 4.9,
          reviewCount: 128,
          bestRating: "5",
          worstRating: "1",
        },
        hasMenu: {
          "@type": "Menu",
          name: `${tf(r, "name")} Menu`,
          hasMenuItem: (data?.items || []).map((item) => ({
            "@type": "MenuItem",
            name: tf(item, "name"),
            description: tf(item, "description") || "",
            offers: {
              "@type": "Offer",
              price: item.price,
              priceCurrency: "SAR",
              availability: item.is_available
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          })),
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      <AppHeader />

      {/* Restaurant Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12">
        <div className="mx-auto max-w-4xl px-4 space-y-4">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
            {r ? tf(r, "cuisine") : ""}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white">{r ? tf(r, "name") : ""}</h1>

          {/* Badges HUD */}
          <div className="flex flex-wrap items-center gap-3 text-xs pt-2">
            <span className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-bold text-amber-400">
              <Star className="size-4 fill-amber-400" /> {r?.rating} (تقييم ممتاز)
            </span>
            <span className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-mono text-slate-300">
              <Clock className="size-4 text-slate-400" /> {r?.eta_minutes} دقيقة تحضير
            </span>
            <span className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 font-mono text-cyan-400">
              <Bike className="size-4 text-cyan-400" /> {r?.delivery_fee} ر.س توصيل
            </span>
            <span className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-slate-400">
              الحد الأدنى للطلب: {r?.min_order} ر.س
            </span>
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="size-5 text-amber-400" />
            قائمة الطعام والأطباق
          </h2>
          <Badge className="bg-slate-900 border-slate-800 text-slate-400 text-xs">
            {data?.items.length} أطباق
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {data?.items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 flex items-start justify-between gap-4 transition-all hover:border-amber-500/40 shadow-xl"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <h3 className="font-bold text-white text-base">{tf(item, "name")}</h3>
                <p className="line-clamp-2 text-xs text-slate-400 leading-relaxed">
                  {tf(item, "description") || "طبق صحي طازج محضر بأعلى معايير الجودة"}
                </p>
                <p className="font-black text-amber-400 font-mono text-sm pt-1">
                  {item.price} ر.س
                </p>
              </div>

              <Button
                size="icon"
                disabled={!item.is_available}
                aria-label={t("addToCart")}
                className="size-10 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20 shrink-0"
                onClick={() => {
                  sounds.playClick();
                  cart.add({
                    id: item.id,
                    restaurant_id: item.restaurant_id,
                    name_ar: item.name_ar,
                    name_en: item.name_en,
                    price: Number(item.price),
                  });
                  toast.success(t("addToCart"));
                }}
              >
                <Plus className="size-5" />
              </Button>
            </div>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

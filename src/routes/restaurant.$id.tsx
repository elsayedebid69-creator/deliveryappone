import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Star, Clock, Bike } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { AppFooter, AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/restaurant/$id")({
  head: () => ({
    meta: [
      { title: "قائمة المطعم | Food Hub" },
      { name: "description", content: "تصفح قائمة الطعام واطلب أطباقك المفضلة عبر Food Hub." },
      { property: "og:title", content: "قائمة المطعم | Food Hub" },
      { property: "og:description", content: "تصفح قائمة الطعام واطلب أطباقك المفضلة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RestaurantPage,
});

function RestaurantPage() {
  const { id } = Route.useParams();
  const { t, tf } = useI18n();
  const cart = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const [{ data: restaurant, error: e1 }, { data: items, error: e2 }] = await Promise.all([
        supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
        supabase.from("menu_items").select("*").eq("restaurant_id", id).order("category_ar"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return { restaurant, items: items ?? [] };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="mx-auto max-w-4xl space-y-4 p-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  const r = data?.restaurant;
  if (!r) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="mx-auto max-w-4xl p-10 text-center">
          <Link to="/" className="underline">
            {t("browseMenu")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="hero-gradient">
        <div className="mx-auto max-w-4xl px-4 py-12 text-primary-foreground">
          <p className="text-sm opacity-90">{tf(r, "cuisine")}</p>
          <h1 className="mt-1 text-3xl font-extrabold">{tf(r, "name")}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1">
              <Star className="size-4 fill-current" /> {r.rating}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-4" /> {r.eta_minutes} {t("min")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bike className="size-4" /> {r.delivery_fee} {t("sar")}
            </span>
            <span>
              {t("minOrder")}: {r.min_order} {t("sar")}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="mb-5 text-xl font-bold">{t("menu")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.items.map((item) => (
            <div key={item.id} className="surface flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <h3 className="font-semibold">{tf(item, "name")}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {tf(item, "description")}
                </p>
                <p className="mt-2 font-bold text-primary">
                  {item.price} {t("sar")}
                </p>
              </div>
              <Button
                size="icon"
                disabled={!item.is_available}
                aria-label={t("addToCart")}
                onClick={() => {
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
                <Plus className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

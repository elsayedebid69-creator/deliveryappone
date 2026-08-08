import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "طلباتي | سُفرة" },
      { name: "description", content: "تابع حالة طلباتك الحالية والسابقة على منصة سُفرة." },
      { property: "og:title", content: "طلباتي | سُفرة" },
      { property: "og:description", content: "تابع حالة طلباتك الحالية والسابقة." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { t, tStatus, tf, tn } = useI18n();
  const { user } = useSession();

  const { data } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, restaurants(name_ar,name_en), order_items(*)")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">{t("orders")}</h1>
        {!data?.length ? (
          <div className="surface p-10 text-center">
            <p className="text-muted-foreground">{t("noOrders")}</p>
            <Button asChild className="mt-4">
              <Link to="/">{t("browseRestaurants")}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((o) => (
              <div key={o.id} className="surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      {o.restaurants ? tf(o.restaurants, "name") : t("order")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{tStatus(o.status)}</Badge>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {o.order_items.map((it) => (
                    <li key={it.id}>
                      {it.quantity}× {tn(it)}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-bold text-primary">
                  {t("total")}: {o.total} {t("sar")}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

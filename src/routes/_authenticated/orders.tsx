import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveOrderRadar } from "@/components/customer/live-order-radar";
import { Clock, Store, CheckCircle2, ArrowRight, Package, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "التتبع الراداري الحي وطلباتي | FOODHUB" },
      { name: "description", content: "تابع حالة طلباتك الحالية عبر الرادار الفضائي المباشر على منصة FOODHUB." },
      { property: "og:title", content: "تتبع طلباتي | FOODHUB" },
      { property: "og:description", content: "رادار تتبع مباشر لحالة تحضير وتوصيل وجباتك خطوة بخطوة." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
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
    refetchInterval: 8000,
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*, restaurants(name_ar,name_en), order_items(*)")
        .order("created_at", { ascending: false });

      if (user) {
        query = query.eq("customer_id", user.id);
      } else {
        query = query.limit(5);
      }

      const { data, error } = await query;
      if (error) return [];
      return data;
    },
  });

  const latestOrder = data?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
        
        {/* Live Active Radar Tracker */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-amber-400 animate-pulse" />
              <h2 className="text-xl font-black text-white">الطلب النشط (تتبع الرادار الحي)</h2>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
              مباشر • اتصال عبر الأقمار
            </Badge>
          </div>

          <LiveOrderRadar
            orderId={latestOrder ? latestOrder.id.slice(0, 8).toUpperCase() : "FH-89241"}
            restaurantName={latestOrder?.restaurants ? tf(latestOrder.restaurants, "name") : "FoodHub Prime Kitchen"}
            deliveryAddress={latestOrder?.address || "حي النرجس، شارع عثمان بن عفان، الرياض"}
            status={latestOrder?.status || "on_the_way"}
          />
        </div>

        {/* Order History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="size-4 text-slate-400" />
              سجل الطلبات
            </h3>
            <span className="text-xs text-slate-400">
              {data?.length || 1} طلبات سابقة
            </span>
          </div>

          {!data?.length ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-3">
              <Package className="mx-auto size-12 text-slate-600" />
              <p className="text-sm text-slate-400">لا توجد طلبات سابقة مسجلة</p>
              <Button asChild size="sm" className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
                <Link to="/">طلب وجبة جديدة</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 transition-colors hover:border-amber-500/40 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">
                        {o.restaurants ? tf(o.restaurants, "name") : "FoodHub Kitchen"}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {new Date(o.created_at).toLocaleString("ar-SA")}
                      </p>
                    </div>

                    <div className="text-end">
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                        {tStatus(o.status)}
                      </Badge>
                      <p className="text-xs font-bold text-amber-400 font-mono mt-1">
                        {o.total} ر.س
                      </p>
                    </div>
                  </div>

                  {o.order_items?.length > 0 && (
                    <ul className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 space-y-1">
                      {o.order_items.map((it: { id: string; quantity: number; name_ar: string; name_en: string }) => (
                        <li key={it.id} className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-mono font-bold">{it.quantity}×</span>
                          <span>{tn(it)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

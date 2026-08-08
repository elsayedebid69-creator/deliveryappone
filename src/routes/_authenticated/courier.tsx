import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/courier")({
  head: () => ({
    meta: [
      { title: "لوحة المندوب | سُفرة" },
      { name: "description", content: "استلم الطلبات الجاهزة وسلّمها للعملاء عبر منصة سُفرة." },
      { property: "og:title", content: "لوحة المندوب | سُفرة" },
      { property: "og:description", content: "استلم الطلبات الجاهزة وسلّمها للعملاء." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CourierPage,
});

function CourierPage() {
  const { t, tStatus, tf } = useI18n();
  const { user } = useSession();
  const qc = useQueryClient();

  const available = useQuery({
    queryKey: ["courier-available"],
    refetchInterval: 8000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, restaurants(name_ar,name_en)")
        .is("courier_id", null)
        .eq("status", "ready")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const mine = useQuery({
    queryKey: ["courier-mine", user?.id],
    enabled: !!user,
    refetchInterval: 8000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, restaurants(name_ar,name_en)")
        .eq("courier_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["courier-available"] });
    void qc.invalidateQueries({ queryKey: ["courier-mine", user?.id] });
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <h1 className="text-2xl font-bold">{t("courier")}</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">{t("availableOrders")}</h2>
          {!available.data?.length ? (
            <p className="surface p-8 text-center text-muted-foreground">{t("noOrders")}</p>
          ) : (
            available.data.map((o) => (
              <div key={o.id} className="surface flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold">
                    {o.restaurants ? tf(o.restaurants, "name") : t("order")}
                  </p>
                  <p className="text-sm text-muted-foreground">{o.address}</p>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    const { error } = await supabase
                      .from("orders")
                      .update({ courier_id: user!.id, status: "on_the_way" })
                      .eq("id", o.id)
                      .is("courier_id", null);
                    if (error) toast.error(error.message);
                    else toast.success(t("accept"));
                    refresh();
                  }}
                >
                  {t("accept")}
                </Button>
              </div>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">{t("myDeliveries")}</h2>
          {(mine.data ?? []).map((o) => (
            <div key={o.id} className="surface flex items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold">
                  {o.restaurants ? tf(o.restaurants, "name") : t("order")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {o.address} · {o.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{tStatus(o.status)}</Badge>
                {o.status !== "delivered" && o.status !== "cancelled" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await supabase
                        .from("orders")
                        .update({ status: "delivered" })
                        .eq("id", o.id);
                      refresh();
                    }}
                  >
                    {t("markDelivered")}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

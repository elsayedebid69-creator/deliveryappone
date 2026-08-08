import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, ORDER_STATUSES } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({
    meta: [
      { title: "لوحة المطعم | سُفرة" },
      { name: "description", content: "إدارة قائمة الطعام ومتابعة طلبات مطعمك على سُفرة." },
      { property: "og:title", content: "لوحة المطعم | سُفرة" },
      { property: "og:description", content: "إدارة قائمة الطعام ومتابعة الطلبات." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VendorPage,
});

function VendorPage() {
  const { t, tStatus, tf, tn } = useI18n();
  const { user } = useSession();
  const qc = useQueryClient();

  const restaurant = useQuery({
    queryKey: ["my-restaurant", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const restaurantId = restaurant.data?.id;

  const items = useQuery({
    queryKey: ["vendor-items", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const orders = useQuery({
    queryKey: ["vendor-orders", restaurantId],
    enabled: !!restaurantId,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [item, setItem] = useState({
    name_ar: "",
    name_en: "",
    category_ar: "",
    category_en: "",
    price: "",
  });

  const addItem = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("menu_items").insert({
        restaurant_id: restaurantId!,
        name_ar: item.name_ar,
        name_en: item.name_en,
        category_ar: item.category_ar,
        category_en: item.category_en,
        price: Number(item.price),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("created"));
      setItem({ name_ar: "", name_en: "", category_ar: "", category_en: "", price: "" });
      void qc.invalidateQueries({ queryKey: ["vendor-items", restaurantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!restaurant.isLoading && !restaurant.data) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <p className="p-10 text-center text-muted-foreground">
          {t("vendor")} — {t("none")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <h1 className="text-2xl font-bold">
          {t("vendor")}
          {restaurant.data ? ` · ${tf(restaurant.data, "name")}` : ""}
        </h1>

        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">{t("incomingOrders")}</TabsTrigger>
            <TabsTrigger value="menu">{t("menu")}</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="pt-6">
            <div className="space-y-4">
              {(orders.data ?? []).map((o) => (
                <div key={o.id} className="surface p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {o.total} {t("sar")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString()} · {o.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tStatus(o.status)}</Badge>
                      <Select
                        value={o.status}
                        onValueChange={async (v) => {
                          const { error } = await supabase
                            .from("orders")
                            .update({ status: v as (typeof ORDER_STATUSES)[number] })
                            .eq("id", o.id);
                          if (error) toast.error(error.message);
                          void qc.invalidateQueries({ queryKey: ["vendor-orders", restaurantId] });
                        }}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {tStatus(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <ul className="mt-3 text-sm text-muted-foreground">
                    {o.order_items.map((it) => (
                      <li key={it.id}>
                        {it.quantity}× {tn(it)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {!orders.data?.length ? (
                <p className="surface p-10 text-center text-muted-foreground">{t("noOrders")}</p>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6 pt-6">
            <form
              className="surface grid gap-4 p-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                addItem.mutate();
              }}
            >
              <h2 className="text-lg font-bold sm:col-span-2">{t("addItem")}</h2>
              <div className="space-y-2">
                <Label>{t("itemNameAr")}</Label>
                <Input
                  required
                  maxLength={80}
                  value={item.name_ar}
                  onChange={(e) => setItem({ ...item, name_ar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("itemNameEn")}</Label>
                <Input
                  required
                  maxLength={80}
                  value={item.name_en}
                  onChange={(e) => setItem({ ...item, name_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("category")} (AR)</Label>
                <Input
                  maxLength={40}
                  value={item.category_ar}
                  onChange={(e) => setItem({ ...item, category_ar: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("category")} (EN)</Label>
                <Input
                  maxLength={40}
                  value={item.category_en}
                  onChange={(e) => setItem({ ...item, category_en: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("price")}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={item.price}
                  onChange={(e) => setItem({ ...item, price: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={addItem.isPending}>
                  {t("add")}
                </Button>
              </div>
            </form>

            <div className="surface divide-y divide-border">
              {(items.data ?? []).map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{tf(it, "name")}</p>
                    <p className="text-sm text-muted-foreground">
                      {it.price} {t("sar")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={it.is_available}
                      onCheckedChange={async (v) => {
                        await supabase
                          .from("menu_items")
                          .update({ is_available: v })
                          .eq("id", it.id);
                        void qc.invalidateQueries({ queryKey: ["vendor-items", restaurantId] });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await supabase.from("menu_items").delete().eq("id", it.id);
                        void qc.invalidateQueries({ queryKey: ["vendor-items", restaurantId] });
                      }}
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

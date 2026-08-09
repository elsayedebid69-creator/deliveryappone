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
import {
  Store,
  ClipboardCheck,
  UtensilsCrossed,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Power,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({
    meta: [
      { title: "لوحة المطعم | Food Hub" },
      { name: "description", content: "إدارة قائمة الطعام ومتابعة طلبات مطعمك على Food Hub." },
      { property: "og:title", content: "لوحة المطعم | Food Hub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VendorPage,
});

function VendorPage() {
  const { t, tStatus, tf, tn, lang } = useI18n();
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
      <div className="min-h-screen bg-gray-50/50">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="surface mx-auto max-w-md p-8">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <Store className="size-8 text-[#2ECC71]" />
            </div>
            <h2 className="text-xl font-bold">{t("vendor")}</h2>
            <p className="mt-2 text-gray-500">
              {lang === "ar"
                ? "لم يتم إنشاء مطعمك بعد. يرجى التواصل مع الإدارة."
                : "Your restaurant hasn't been created yet. Please contact the admin."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const todayOrders = (orders.data ?? []).filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = (orders.data ?? []).filter((o) => o.status === "pending");
  const completedOrders = (orders.data ?? []).filter((o) => o.status === "delivered");

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              {restaurant.data ? tf(restaurant.data, "name") : t("vendor")}
            </h1>
            <p className="text-sm text-gray-500">
              {restaurant.data ? tf(restaurant.data, "cuisine") : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {restaurant.data?.is_active ? t("active") : t("inactive")}
            </span>
            <Switch
              checked={restaurant.data?.is_active ?? false}
              onCheckedChange={async (v) => {
                await supabase
                  .from("restaurants")
                  .update({ is_active: v })
                  .eq("id", restaurantId!);
                void qc.invalidateQueries({ queryKey: ["my-restaurant", user?.id] });
              }}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="surface p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ClipboardCheck className="size-4" />
              {lang === "ar" ? "طلبات اليوم" : "Today's orders"}
            </div>
            <p className="mt-1 text-xl font-bold">{todayOrders.length}</p>
          </div>
          <div className="surface p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="size-4" />
              {lang === "ar" ? "إيرادات اليوم" : "Today's revenue"}
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">
              {todayRevenue.toFixed(0)} {t("sar")}
            </p>
          </div>
          <div className="surface p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="size-4" />
              {t("pending")}
            </div>
            <p className="mt-1 text-xl font-bold text-orange-600">{pendingOrders.length}</p>
          </div>
          <div className="surface p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle2 className="size-4" />
              {lang === "ar" ? "مكتملة" : "Completed"}
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">{completedOrders.length}</p>
          </div>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="bg-white">
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardCheck className="size-4" />
              {t("incomingOrders")}
              {pendingOrders.length > 0 && (
                <Badge className="ml-1 bg-[#F5A623] text-white">{pendingOrders.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              <UtensilsCrossed className="size-4" />
              {t("menu")}
              <Badge variant="secondary">{items.data?.length ?? 0}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="pt-6">
            <div className="space-y-4">
              {!orders.data?.length ? (
                <div className="surface flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                    <ClipboardCheck className="size-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">{t("noOrders")}</p>
                </div>
              ) : (
                orders.data.map((o) => (
                  <div key={o.id} className="surface overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-10 items-center justify-center rounded-full ${
                              o.status === "delivered"
                                ? "bg-green-100 text-green-600"
                                : o.status === "pending"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {o.status === "delivered" ? (
                              <CheckCircle2 className="size-5" />
                            ) : (
                              <ClipboardCheck className="size-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold">
                              {o.total} {t("sar")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(o.created_at).toLocaleString()} · {o.address}
                            </p>
                          </div>
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
                      <ul className="mt-3 space-y-1 text-sm text-gray-500">
                        {o.order_items.map((it) => (
                          <li key={it.id}>
                            {it.quantity}× {tn(it)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6 pt-6">
            {/* Add Item Form */}
            <div className="surface p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Plus className="size-5 text-[#2ECC71]" />
                {t("addItem")}
              </h2>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  addItem.mutate();
                }}
              >
                <div className="space-y-2">
                  <Label>{t("itemNameAr")}</Label>
                  <Input
                    required
                    maxLength={80}
                    value={item.name_ar}
                    onChange={(e) => setItem({ ...item, name_ar: e.target.value })}
                    placeholder={lang === "ar" ? "مثال: شاورما دجاج" : "e.g. Chicken Shawarma"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("itemNameEn")}</Label>
                  <Input
                    required
                    maxLength={80}
                    value={item.name_en}
                    onChange={(e) => setItem({ ...item, name_en: e.target.value })}
                    placeholder="e.g. Chicken Shawarma"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("category")} (AR)</Label>
                  <Input
                    maxLength={40}
                    value={item.category_ar}
                    onChange={(e) => setItem({ ...item, category_ar: e.target.value })}
                    placeholder={lang === "ar" ? "مثال: ساندويتشات" : "e.g. Sandwiches"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("category")} (EN)</Label>
                  <Input
                    maxLength={40}
                    value={item.category_en}
                    onChange={(e) => setItem({ ...item, category_en: e.target.value })}
                    placeholder="e.g. Sandwiches"
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
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full bg-[#2ECC71] hover:bg-[#27AE60]" disabled={addItem.isPending}>
                    <Plus className="mr-2 size-4" />
                    {t("add")}
                  </Button>
                </div>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="space-y-3">
              {items.data?.map((it) => (
                <div key={it.id} className="surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-green-100">
                        <UtensilsCrossed className="size-5 text-[#2ECC71]" />
                      </div>
                      <div>
                        <p className="font-semibold">{tf(it, "name")}</p>
                        <p className="text-sm text-gray-500">
                          {it.price} {t("sar")}
                          {it.category_ar ? ` · ${tf(it, "category")}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {it.is_available ? t("active") : t("inactive")}
                        </span>
                        <Switch
                          checked={it.is_available}
                          onCheckedChange={async (v) => {
                            await supabase
                              .from("menu_items")
                              .update({ is_available: v })
                              .eq("id", it.id);
                            void qc.invalidateQueries({ queryKey: ["vendor-items", restaurantId] });
                          }}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={async () => {
                          await supabase.from("menu_items").delete().eq("id", it.id);
                          void qc.invalidateQueries({ queryKey: ["vendor-items", restaurantId] });
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {items.data?.length === 0 && (
                <div className="surface flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
                    <UtensilsCrossed className="size-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    {lang === "ar" ? "لم تضف أصناف بعد" : "No items added yet"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

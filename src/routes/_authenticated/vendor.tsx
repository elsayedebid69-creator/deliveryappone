import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { useRealtime } from "@/lib/realtime";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Store,
  ClipboardCheck,
  UtensilsCrossed,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  ChefHat,
  PackageCheck,
  Bike,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({
    meta: [
      { title: "لوحة المطعم | FoodHub" },
      { name: "description", content: "إدارة قائمة الطعام ومتابعة طلبات مطعمك لحظياً على FoodHub." },
      { property: "og:title", content: "لوحة المطعم | FoodHub" },
      { property: "og:description", content: "إدارة المنيو ومتابعة الطلبات لحظياً." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VendorPage,
});

type OrderStatus = "pending" | "accepted" | "preparing" | "ready" | "on_the_way" | "delivered" | "cancelled";

const COLUMNS: { status: OrderStatus; ar: string; en: string; next?: OrderStatus; icon: typeof Clock }[] = [
  { status: "pending", ar: "جديدة", en: "New", next: "preparing", icon: Clock },
  { status: "preparing", ar: "قيد التحضير", en: "Preparing", next: "ready", icon: ChefHat },
  { status: "ready", ar: "جاهزة للاستلام", en: "Ready", icon: PackageCheck },
  { status: "on_the_way", ar: "مع المندوب", en: "With courier", icon: Bike },
];

function VendorPage() {
  const { t, tStatus, tf, tn, lang } = useI18n();
  const { user } = useSession();
  const qc = useQueryClient();
  const [section, setSection] = useState<string | undefined>(undefined);

  useRealtime(["orders", "order_items", "menu_items"], ["vendor-orders", "vendor-items"], "vendor");

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

  const setStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else void qc.invalidateQueries({ queryKey: ["vendor-orders", restaurantId] });
  };

  const list = orders.data ?? [];
  const todayOrders = list.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString(),
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = list.filter((o) => o.status === "pending");
  const completedOrders = list.filter((o) => o.status === "delivered");

  if (!restaurant.isLoading && !restaurant.data) {
    return (
      <DashboardShell role="restaurant" title={t("vendor")}>
        <div className="surface mx-auto max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#FFC72C]/20">
            <Store className="size-8 text-[#FFC72C]" />
          </div>
          <h2 className="text-xl font-bold">{t("vendor")}</h2>
          <p className="mt-2 text-gray-500">
            {lang === "ar"
              ? "لم يتم إنشاء مطعمك بعد. يرجى التواصل مع الإدارة."
              : "Your restaurant hasn't been created yet. Please contact the admin."}
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      role="restaurant"
      title={restaurant.data ? tf(restaurant.data, "name") : t("vendor")}
      subtitle={restaurant.data ? tf(restaurant.data, "cuisine") : undefined}
      active={section}
      onNavigate={setSection}
      actions={
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-gray-500 sm:inline">
            {restaurant.data?.is_active ? t("openNow") : t("closed")}
          </span>
          <Switch
            checked={restaurant.data?.is_active ?? false}
            onCheckedChange={async (v) => {
              await supabase.from("restaurants").update({ is_active: v }).eq("id", restaurantId!);
              void qc.invalidateQueries({ queryKey: ["my-restaurant", user?.id] });
            }}
            className="data-[state=checked]:bg-[#FFC72C]"
          />
        </div>
      }
    >
      {/* Overview */}
      {(!section || section === "orders") && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon={ClipboardCheck}
            label={lang === "ar" ? "طلبات اليوم" : "Today's orders"}
            value={String(todayOrders.length)}
          />
          <StatCard
            icon={TrendingUp}
            label={lang === "ar" ? "إيرادات اليوم" : "Today's revenue"}
            value={`${todayRevenue.toFixed(0)} ${t("sar")}`}
            accent
          />
          <StatCard icon={Clock} label={tStatus("pending")} value={String(pendingOrders.length)} />
          <StatCard
            icon={CheckCircle2}
            label={lang === "ar" ? "مكتملة" : "Completed"}
            value={String(completedOrders.length)}
          />
        </div>
      )}

      {section === "menu" ? (
        <div className="space-y-6">
          <div className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Plus className="size-5 text-[#FFC72C]" />
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
                <Button
                  type="submit"
                  className="w-full bg-[#FFC72C] text-[#2B1B12] hover:bg-[#E6B800]"
                  disabled={addItem.isPending}
                >
                  <Plus className="me-2 size-4" />
                  {t("add")}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {items.data?.map((it) => (
              <div key={it.id} className="surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#FFC72C]/20">
                      <UtensilsCrossed className="size-5 text-[#FFC72C]" />
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
                    <span className="text-xs text-gray-500">
                      {it.is_available ? t("active") : t("inactive")}
                    </span>
                    <Switch
                      checked={it.is_available}
                      onCheckedChange={async (v) => {
                        await supabase.from("menu_items").update({ is_available: v }).eq("id", it.id);
                        void qc.invalidateQueries({ queryKey: ["vendor-items", restaurantId] });
                      }}
                      className="data-[state=checked]:bg-[#FFC72C]"
                    />
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
            {items.data?.length === 0 ? (
              <div className="surface p-10 text-center text-gray-500">
                {lang === "ar" ? "لا توجد أصناف بعد" : "No menu items yet"}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Kanban board */
        <div className="grid gap-4 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const colOrders = list.filter((o) => o.status === col.status);
            const Icon = col.icon;
            return (
              <div key={col.status} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#2B1B12]">
                    <Icon className="size-4 text-[#FFC72C]" />
                    {lang === "ar" ? col.ar : col.en}
                  </div>
                  <Badge variant="secondary">{colOrders.length}</Badge>
                </div>
                <div className="space-y-3">
                  {colOrders.length === 0 ? (
                    <p className="rounded-xl bg-gray-50 py-6 text-center text-xs text-gray-400">
                      {t("noOrders")}
                    </p>
                  ) : (
                    colOrders.map((o) => (
                      <div key={o.id} className="rounded-xl border border-gray-100 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#2B1B12]">
                            {o.total} {t("sar")}
                          </p>
                          <span className="text-[11px] text-gray-400">
                            {new Date(o.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-gray-500">{o.address}</p>
                        <ul className="mt-2 space-y-0.5 text-xs text-gray-500">
                          {o.order_items.map((it) => (
                            <li key={it.id}>
                              {it.quantity}× {tn(it)}
                            </li>
                          ))}
                        </ul>
                        {col.next ? (
                          <Button
                            size="sm"
                            className="mt-3 w-full bg-[#FFC72C] text-[#2B1B12] hover:bg-[#E6B800]"
                            onClick={() => setStatus(o.id, col.next!)}
                          >
                            {lang === "ar" ? "نقل إلى " : "Move to "}
                            {tStatus(col.next)}
                          </Button>
                        ) : null}
                        {col.status === "pending" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-1 w-full text-red-500 hover:bg-red-50"
                            onClick={() => setStatus(o.id, "cancelled")}
                          >
                            {t("reject")}
                          </Button>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="surface p-4">
      <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
        <Icon className="size-4" />
        <span className="truncate">{label}</span>
      </div>
      <p className={`mt-1 text-xl font-bold ${accent ? "text-[#E6B800]" : "text-[#2B1B12]"}`}>{value}</p>
    </div>
  );
}

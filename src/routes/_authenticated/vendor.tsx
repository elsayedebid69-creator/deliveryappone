import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  Phone,
  Search,
  Pencil,
  Check,
  X,
  BarChart3,
  Star,
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
  const [menuSearch, setMenuSearch] = useState("");
  const [editing, setEditing] = useState<{ id: string; price: string } | null>(null);

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

  const savePrice = async () => {
    if (!editing) return;
    const price = Number(editing.price);
    if (!Number.isFinite(price) || price < 0) return;
    const { error } = await supabase.from("menu_items").update({ price }).eq("id", editing.id);
    if (error) toast.error(error.message);
    else {
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["vendor-items", restaurantId] });
    }
  };

  const list = useMemo(() => orders.data ?? [], [orders.data]);
  const todayOrders = list.filter(
    (o) => new Date(o.created_at).toDateString() === new Date().toDateString(),
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = list.filter((o) => o.status === "pending");
  const completedOrders = list.filter((o) => o.status === "delivered");

  /* ---- reports ---- */
  const days = useMemo(() => {
    const out: { label: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const dayOrders = list.filter(
        (o) => new Date(o.created_at).toDateString() === key && o.status !== "cancelled",
      );
      out.push({
        label: d.toLocaleDateString(lang === "ar" ? "ar" : "en", { weekday: "short" }),
        total: dayOrders.reduce((s, o) => s + Number(o.total), 0),
        count: dayOrders.length,
      });
    }
    return out;
  }, [list, lang]);

  const maxDay = Math.max(1, ...days.map((d) => d.total));

  const topItems = useMemo(() => {
    const map = new Map<string, { name_ar: string; name_en: string; qty: number; total: number }>();
    for (const o of list) {
      if (o.status === "cancelled") continue;
      for (const it of o.order_items) {
        const cur = map.get(it.name_en) ?? {
          name_ar: it.name_ar,
          name_en: it.name_en,
          qty: 0,
          total: 0,
        };
        cur.qty += it.quantity;
        cur.total += Number(it.price) * it.quantity;
        map.set(it.name_en, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [list]);

  const avgTicket = completedOrders.length
    ? completedOrders.reduce((s, o) => s + Number(o.total), 0) / completedOrders.length
    : 0;

  const filteredItems = (items.data ?? []).filter((it) => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return true;
    return `${it.name_ar} ${it.name_en} ${it.category_ar} ${it.category_en}`.toLowerCase().includes(q);
  });

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
      {/* Overview stats */}
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

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-gray-400 ltr:left-3 rtl:right-3" />
            <Input
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث في المنيو…" : "Search menu…"}
              className="ps-9"
            />
          </div>

          <div className="space-y-3">
            {filteredItems.map((it) => (
              <div key={it.id} className="surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#FFC72C]/20">
                      <UtensilsCrossed className="size-5 text-[#FFC72C]" />
                    </div>
                    <div>
                      <p className="font-semibold">{tf(it, "name")}</p>
                      {editing?.id === it.id ? (
                        <div className="mt-1 flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={editing.price}
                            onChange={(e) => setEditing({ id: it.id, price: e.target.value })}
                            className="h-8 w-24"
                          />
                          <Button size="sm" variant="ghost" onClick={savePrice}>
                            <Check className="size-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                            <X className="size-4 text-gray-400" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 hover:text-[#2B1B12]"
                          onClick={() => setEditing({ id: it.id, price: String(it.price) })}
                        >
                          {it.price} {t("sar")}
                          {it.category_ar ? ` · ${tf(it, "category")}` : ""}
                          <Pencil className="size-3" />
                        </button>
                      )}
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
            {filteredItems.length === 0 ? (
              <div className="surface p-10 text-center text-gray-500">
                {lang === "ar" ? "لا توجد أصناف" : "No menu items"}
              </div>
            ) : null}
          </div>
        </div>
      ) : section === "reports" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              icon={TrendingUp}
              label={lang === "ar" ? "إيرادات الأسبوع" : "Weekly revenue"}
              value={`${days.reduce((s, d) => s + d.total, 0).toFixed(0)} ${t("sar")}`}
              accent
            />
            <StatCard
              icon={ClipboardCheck}
              label={lang === "ar" ? "طلبات الأسبوع" : "Weekly orders"}
              value={String(days.reduce((s, d) => s + d.count, 0))}
            />
            <StatCard
              icon={BarChart3}
              label={lang === "ar" ? "متوسط الطلب" : "Avg. order"}
              value={`${avgTicket.toFixed(0)} ${t("sar")}`}
            />
            <StatCard
              icon={UtensilsCrossed}
              label={lang === "ar" ? "عدد الأصناف" : "Menu items"}
              value={String(items.data?.length ?? 0)}
            />
          </div>

          <div className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <BarChart3 className="size-5 text-[#FFC72C]" />
              {lang === "ar" ? "مبيعات آخر 7 أيام" : "Last 7 days"}
            </h2>
            <div className="flex h-40 items-end gap-2">
              {days.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] text-gray-400">{d.total.toFixed(0)}</span>
                  <div
                    className="w-full rounded-t-lg bg-[#FFC72C]"
                    style={{ height: `${Math.max(4, (d.total / maxDay) * 110)}px` }}
                  />
                  <span className="text-[11px] text-gray-500">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Star className="size-5 text-[#FFC72C]" />
              {lang === "ar" ? "الأصناف الأكثر مبيعاً" : "Best sellers"}
            </h2>
            {topItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                {lang === "ar" ? "لا توجد مبيعات بعد" : "No sales yet"}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {topItems.map((it, i) => (
                  <li key={it.name_en} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium">{lang === "ar" ? it.name_ar : it.name_en}</span>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-bold text-[#2B1B12]">
                        {it.total.toFixed(0)} {t("sar")}
                      </p>
                      <p className="text-xs text-gray-400">×{it.qty}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
                        {o.notes ? (
                          <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                            {o.notes}
                          </p>
                        ) : null}
                        <a
                          href={`tel:${o.phone}`}
                          className="mt-2 flex items-center gap-1 text-xs font-medium text-[#E6B800]"
                        >
                          <Phone className="size-3" />
                          {o.phone}
                        </a>
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

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { useRealtime } from "@/lib/realtime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bike,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Package,
  Navigation,
  Phone,
  Store,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/courier")({
  head: () => ({
    meta: [
      { title: "لوحة المندوب | FoodHub" },
      { name: "description", content: "استلم الطلبات الجاهزة وسلّمها للعملاء عبر منصة FoodHub." },
      { property: "og:title", content: "لوحة المندوب | FoodHub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CourierPage,
});

type Section = "overview" | "available" | "mine";

const STEPS = [
  { key: "ready", ar: "استلام من المطعم", en: "Pick up" },
  { key: "on_the_way", ar: "في الطريق", en: "On the way" },
  { key: "delivered", ar: "تم التسليم", en: "Delivered" },
];

function CourierPage() {
  const { t, tStatus, tf, lang } = useI18n();
  const { user } = useSession();
  const qc = useQueryClient();

  const [isOnline, setIsOnline] = useState(true);
  const [section, setSection] = useState<Section>("overview");
  const ar = lang === "ar";

  useRealtime(["orders"], ["courier-available", "courier-mine", "courier-earnings"], "courier");

  const available = useQuery({
    queryKey: ["courier-available"],
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

  const earnings = useQuery({
    queryKey: ["courier-earnings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("total, delivery_fee, created_at")
        .eq("courier_id", user!.id)
        .eq("status", "delivered");
      if (error) throw error;
      const total = data.reduce((sum, o) => sum + Number(o.delivery_fee || 0), 0);
      const today = new Date().toDateString();
      const todayTotal = data
        .filter((o) => new Date(o.created_at).toDateString() === today)
        .reduce((sum, o) => sum + Number(o.delivery_fee || 0), 0);
      return { total, today: todayTotal, count: data.length };
    },
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["courier-available"] });
    void qc.invalidateQueries({ queryKey: ["courier-mine", user?.id] });
    void qc.invalidateQueries({ queryKey: ["courier-earnings", user?.id] });
  };

  const setStatus = async (id: string, status: "on_the_way" | "delivered") => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success(status === "delivered" ? t("markDelivered") : ar ? "في الطريق" : "On the way");
    refresh();
  };

  const activeDeliveries = (mine.data ?? []).filter(
    (o) => o.status === "ready" || o.status === "on_the_way",
  );
  const history = (mine.data ?? []).filter(
    (o) => o.status === "delivered" || o.status === "cancelled",
  );

  const stats = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="surface p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <DollarSign className="size-4" />
          {t("todayEarnings")}
        </div>
        <p className="mt-1 text-xl font-bold text-[#FFC72C]">
          {earnings.data?.today ?? 0} {t("sar")}
        </p>
      </div>
      <div className="surface p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="size-4" />
          {t("totalEarnings")}
        </div>
        <p className="mt-1 text-xl font-bold">
          {earnings.data?.total ?? 0} {t("sar")}
        </p>
      </div>
      <div className="surface p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Package className="size-4" />
          {t("completedDeliveries")}
        </div>
        <p className="mt-1 text-xl font-bold">{earnings.data?.count ?? 0}</p>
      </div>
    </div>
  );

  const activeCards = activeDeliveries.map((o) => {
    const stepIndex = o.status === "on_the_way" ? 1 : 0;
    return (
      <div key={o.id} className="surface overflow-hidden border-s-4 border-[#FFC72C]">
        <div className="flex items-center justify-between bg-[#FFC72C]/10 px-5 py-3">
          <h3 className="flex items-center gap-2 font-semibold text-[#2B1B12]">
            <Navigation className="size-4" />
            {t("currentOrder")}
          </h3>
          <Badge className="bg-[#FFC72C]/20 text-[#2B1B12]">{tStatus(o.status)}</Badge>
        </div>
        <div className="p-5">
          {/* steps */}
          <div className="mb-5 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i <= stepIndex ? "bg-[#FFC72C] text-[#2B1B12]" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`hidden text-xs sm:inline ${
                    i <= stepIndex ? "font-medium text-[#2B1B12]" : "text-gray-400"
                  }`}
                >
                  {ar ? s.ar : s.en}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 ${i < stepIndex ? "bg-[#FFC72C]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          <p className="flex items-center gap-2 text-lg font-bold">
            <Store className="size-4 text-[#FFC72C]" />
            {o.restaurants ? tf(o.restaurants, "name") : t("order")}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="size-4" />
            {o.address}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <Phone className="size-4" />
            {o.phone}
          </p>
          {o.notes && <p className="mt-2 text-sm text-gray-500">{o.notes}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" className="flex-1">
              <a href={`tel:${o.phone}`}>
                <Phone className="me-2 size-4" />
                {ar ? "اتصال بالعميل" : "Call customer"}
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="me-2 size-4" />
                {ar ? "الاتجاهات" : "Directions"}
              </a>
            </Button>
            {o.status === "ready" ? (
              <Button
                className="w-full bg-[#FFC72C] text-[#2B1B12] hover:bg-[#E6B800]"
                onClick={() => void setStatus(o.id, "on_the_way")}
              >
                <Bike className="me-2 size-4" />
                {ar ? "استلمت الطلب — في الطريق" : "Picked up — on the way"}
              </Button>
            ) : (
              <Button
                className="w-full bg-[#FFC72C] text-[#2B1B12] hover:bg-[#E6B800]"
                onClick={() => void setStatus(o.id, "delivered")}
              >
                <CheckCircle2 className="me-2 size-4" />
                {t("markDelivered")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  });

  const availableSection = (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Clock className="size-5 text-[#FFC72C]" />
        {t("availableOrders")}
        <Badge variant="secondary">{available.data?.length ?? 0}</Badge>
      </h2>
      {!isOnline ? (
        <div className="surface p-8 text-center text-gray-500">
          {ar ? "أنت غير متصل — فعّل الاتصال لاستقبال الطلبات" : "You are offline — go online to receive orders"}
        </div>
      ) : !available.data?.length ? (
        <div className="surface flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
            <Package className="size-8 text-gray-400" />
          </div>
          <p className="text-gray-500">{t("noOrders")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {available.data.map((o) => (
            <div key={o.id} className="surface overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold">
                      {o.restaurants ? tf(o.restaurants, "name") : t("order")}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="size-4" />
                      {o.address}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      {new Date(o.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-lg font-bold text-[#FFC72C]">
                      {o.delivery_fee} {t("sar")}
                    </p>
                    <p className="text-xs text-gray-400">{t("deliveryFee")}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-border p-4">
                <Button
                  className="w-full bg-[#FFC72C] text-[#2B1B12] hover:bg-[#E6B800]"
                  onClick={async () => {
                    const { error } = await supabase
                      .from("orders")
                      .update({ courier_id: user!.id })
                      .eq("id", o.id)
                      .is("courier_id", null);
                    if (error) toast.error(error.message);
                    else {
                      toast.success(t("accept"));
                      setSection("mine");
                    }
                    refresh();
                  }}
                >
                  {t("accept")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const historySection = history.length > 0 && (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{t("myDeliveries")}</h2>
      <div className="space-y-3">
        {history.map((o) => (
          <div key={o.id} className="surface p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${
                    o.status === "delivered"
                      ? "bg-[#FFC72C]/20 text-[#FFC72C]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {o.status === "delivered" ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <Bike className="size-5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {o.restaurants ? tf(o.restaurants, "name") : t("order")}
                  </p>
                  <p className="text-sm text-gray-500">{o.address}</p>
                </div>
              </div>
              <div className="text-end">
                <Badge variant="secondary" className="bg-[#FFC72C]/20 text-[#2B1B12]">
                  {tStatus(o.status)}
                </Badge>
                <p className="mt-1 text-sm text-gray-500">
                  {o.delivery_fee} {t("sar")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <DashboardShell
      role="courier"
      title={t("courier")}
      subtitle={ar ? "مرحباً بك" : "Welcome back"}
      active={section === "overview" ? undefined : section}
      onNavigate={(s) => setSection((s as Section) ?? "overview")}
      actions={
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-gray-500 sm:inline">
            {isOnline ? t("online") : t("offline")}
          </span>
          <Switch
            checked={isOnline}
            onCheckedChange={setIsOnline}
            className="data-[state=checked]:bg-[#FFC72C]"
          />
        </div>
      }
    >
      <div className="space-y-6">
        {section === "overview" && (
          <>
            {stats}
            {activeCards.length > 0 ? (
              <div className="space-y-4">{activeCards}</div>
            ) : (
              <div className="surface p-8 text-center text-gray-500">
                {ar ? "لا توجد توصيلة نشطة الآن" : "No active delivery right now"}
              </div>
            )}
            {availableSection}
          </>
        )}

        {section === "available" && availableSection}

        {section === "mine" && (
          <>
            {activeCards.length > 0 && <div className="space-y-4">{activeCards}</div>}
            {historySection}
            {activeCards.length === 0 && history.length === 0 && (
              <div className="surface p-12 text-center text-gray-500">{t("noOrders")}</div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

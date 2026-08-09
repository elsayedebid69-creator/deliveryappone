import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
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
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/courier")({
  head: () => ({
    meta: [
      { title: "لوحة المندوب | Food Hub" },
      { name: "description", content: "استلم الطلبات الجاهزة وسلّمها للعملاء عبر منصة Food Hub." },
      { property: "og:title", content: "لوحة المندوب | Food Hub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CourierPage,
});

function CourierPage() {
  const { t, tStatus, tf, lang } = useI18n();
  const { user } = useSession();
  const qc = useQueryClient();

  const [isOnline, setIsOnline] = useState(false);

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

  const currentDelivery = mine.data?.find(
    (o) => o.status === "on_the_way" || o.status === "preparing"
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppHeader />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("courier")}</h1>
            <p className="text-sm text-gray-500">
              {lang === "ar" ? "مرحباً بك" : "Welcome back"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {isOnline ? t("online") : t("offline")}
            </span>
            <Switch
              checked={isOnline}
              onCheckedChange={setIsOnline}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="surface p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <DollarSign className="size-4" />
              {t("todayEarnings")}
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">
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

        {/* Current Delivery */}
        {currentDelivery && (
          <div className="surface overflow-hidden border-l-4 border-green-500">
            <div className="bg-green-50 px-5 py-3">
              <h3 className="flex items-center gap-2 font-semibold text-green-700">
                <Navigation className="size-4" />
                {t("currentOrder")}
              </h3>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-lg font-bold">
                    {currentDelivery.restaurants
                      ? tf(currentDelivery.restaurants, "name")
                      : t("order")}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="size-4" />
                    {currentDelivery.address}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="size-4" />
                    {currentDelivery.phone}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  {tStatus(currentDelivery.status)}
                </Badge>
              </div>
              <div className="mt-4 flex gap-2">
                {currentDelivery.status !== "delivered" && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      await supabase
                        .from("orders")
                        .update({ status: "delivered" })
                        .eq("id", currentDelivery.id);
                      toast.success(t("markDelivered"));
                      refresh();
                    }}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    {t("markDelivered")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available Orders */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock className="size-5 text-[#F5A623]" />
            {t("availableOrders")}
            <Badge variant="secondary">{available.data?.length ?? 0}</Badge>
          </h2>
          {!available.data?.length ? (
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
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {o.delivery_fee} {t("sar")}
                        </p>
                        <p className="text-xs text-gray-400">{t("deliveryFee")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border p-4">
                    <Button
                      className="w-full bg-[#2ECC71] hover:bg-[#27AE60]"
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
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Delivery History */}
        {mine.data && mine.data.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">{t("myDeliveries")}</h2>
            <div className="space-y-3">
              {mine.data.map((o) => (
                <div key={o.id} className="surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-full ${
                          o.status === "delivered"
                            ? "bg-green-100 text-green-600"
                            : o.status === "on_the_way"
                              ? "bg-blue-100 text-blue-600"
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
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className={
                          o.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
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
        )}
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createAccount, listAccounts } from "@/lib/admin.functions";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | سُفرة" },
      { name: "description", content: "إدارة الحسابات والمطاعم والطلبات في منصة سُفرة." },
      { property: "og:title", content: "لوحة الإدارة | سُفرة" },
      { property: "og:description", content: "إدارة الحسابات والمطاعم والطلبات." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t, tStatus, tf } = useI18n();
  const { role } = useSession();
  const qc = useQueryClient();

  const accounts = useQuery({ queryKey: ["accounts"], queryFn: () => listAccounts() });
  const restaurants = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurants").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const orders = useQuery({
    queryKey: ["admin-orders"],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, restaurants(name_ar,name_en)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const [acc, setAcc] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "restaurant" as "admin" | "restaurant" | "courier" | "customer",
  });
  const [rest, setRest] = useState({
    name_ar: "",
    name_en: "",
    cuisine_ar: "",
    cuisine_en: "",
    owner_id: "none",
    delivery_fee: "10",
    min_order: "25",
    eta_minutes: "35",
  });

  const createAcc = useMutation({
    mutationFn: () => createAccount({ data: acc }),
    onSuccess: () => {
      toast.success(t("created"));
      setAcc({ ...acc, email: "", password: "", full_name: "", phone: "" });
      void qc.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createRest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("restaurants").insert({
        name_ar: rest.name_ar,
        name_en: rest.name_en,
        cuisine_ar: rest.cuisine_ar,
        cuisine_en: rest.cuisine_en,
        owner_id: rest.owner_id === "none" ? null : rest.owner_id,
        delivery_fee: Number(rest.delivery_fee),
        min_order: Number(rest.min_order),
        eta_minutes: Number(rest.eta_minutes),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("created"));
      setRest({ ...rest, name_ar: "", name_en: "", cuisine_ar: "", cuisine_en: "" });
      void qc.invalidateQueries({ queryKey: ["admin-restaurants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (role && role !== "admin") {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <p className="p-10 text-center text-muted-foreground">403</p>
      </div>
    );
  }

  const revenue = (orders.data ?? []).reduce((n, o) => n + Number(o.total), 0);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <h1 className="text-2xl font-bold">{t("admin")}</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label={t("totalOrders")} value={String(orders.data?.length ?? 0)} />
          <Stat label={t("revenue")} value={`${revenue.toFixed(0)} ${t("sar")}`} />
          <Stat label={t("users")} value={String(accounts.data?.length ?? 0)} />
        </div>

        <Tabs defaultValue="accounts">
          <TabsList>
            <TabsTrigger value="accounts">{t("accounts")}</TabsTrigger>
            <TabsTrigger value="restaurants">{t("restaurants")}</TabsTrigger>
            <TabsTrigger value="orders">{t("incomingOrders")}</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6 pt-6">
            <form
              className="surface grid gap-4 p-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                createAcc.mutate();
              }}
            >
              <h2 className="text-lg font-bold sm:col-span-2">{t("createAccount")}</h2>
              <Field label={t("fullName")}>
                <Input
                  required
                  minLength={2}
                  maxLength={100}
                  value={acc.full_name}
                  onChange={(e) => setAcc({ ...acc, full_name: e.target.value })}
                />
              </Field>
              <Field label={t("phone")}>
                <Input
                  maxLength={20}
                  value={acc.phone}
                  onChange={(e) => setAcc({ ...acc, phone: e.target.value })}
                />
              </Field>
              <Field label={t("email")}>
                <Input
                  type="email"
                  required
                  maxLength={255}
                  value={acc.email}
                  onChange={(e) => setAcc({ ...acc, email: e.target.value })}
                />
              </Field>
              <Field label={t("password")}>
                <Input
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={acc.password}
                  onChange={(e) => setAcc({ ...acc, password: e.target.value })}
                />
              </Field>
              <Field label={t("accountType")}>
                <Select
                  value={acc.role}
                  onValueChange={(v) => setAcc({ ...acc, role: v as typeof acc.role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">{t("restaurantAccount")}</SelectItem>
                    <SelectItem value="courier">{t("courierAccount")}</SelectItem>
                    <SelectItem value="customer">{t("customerAccount")}</SelectItem>
                    <SelectItem value="admin">{t("adminAccount")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={createAcc.isPending}>
                  {t("createAccount")}
                </Button>
              </div>
            </form>

            <div className="surface divide-y divide-border">
              {(accounts.data ?? []).map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{u.full_name || u.email}</p>
                    <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant="secondary">{u.role}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-6 pt-6">
            <form
              className="surface grid gap-4 p-5 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                createRest.mutate();
              }}
            >
              <h2 className="text-lg font-bold sm:col-span-2">{t("addRestaurant")}</h2>
              <Field label={t("restaurantNameAr")}>
                <Input
                  required
                  maxLength={80}
                  value={rest.name_ar}
                  onChange={(e) => setRest({ ...rest, name_ar: e.target.value })}
                />
              </Field>
              <Field label={t("restaurantNameEn")}>
                <Input
                  required
                  maxLength={80}
                  value={rest.name_en}
                  onChange={(e) => setRest({ ...rest, name_en: e.target.value })}
                />
              </Field>
              <Field label={t("cuisineAr")}>
                <Input
                  maxLength={60}
                  value={rest.cuisine_ar}
                  onChange={(e) => setRest({ ...rest, cuisine_ar: e.target.value })}
                />
              </Field>
              <Field label={t("cuisineEn")}>
                <Input
                  maxLength={60}
                  value={rest.cuisine_en}
                  onChange={(e) => setRest({ ...rest, cuisine_en: e.target.value })}
                />
              </Field>
              <Field label={t("owner")}>
                <Select
                  value={rest.owner_id}
                  onValueChange={(v) => setRest({ ...rest, owner_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("none")}</SelectItem>
                    {(accounts.data ?? [])
                      .filter((u) => u.role === "restaurant")
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.full_name || u.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("deliveryFee")}>
                <Input
                  type="number"
                  min="0"
                  value={rest.delivery_fee}
                  onChange={(e) => setRest({ ...rest, delivery_fee: e.target.value })}
                />
              </Field>
              <Field label={t("minOrder")}>
                <Input
                  type="number"
                  min="0"
                  value={rest.min_order}
                  onChange={(e) => setRest({ ...rest, min_order: e.target.value })}
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={createRest.isPending}>
                  {t("add")}
                </Button>
              </div>
            </form>

            <div className="surface divide-y divide-border">
              {(restaurants.data ?? []).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{tf(r, "name")}</p>
                    <p className="text-sm text-muted-foreground">{tf(r, "cuisine")}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await supabase
                        .from("restaurants")
                        .update({ is_active: !r.is_active })
                        .eq("id", r.id);
                      void qc.invalidateQueries({ queryKey: ["admin-restaurants"] });
                    }}
                  >
                    {r.is_active ? t("active") : t("inactive")}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="pt-6">
            <div className="surface divide-y divide-border">
              {(orders.data ?? []).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">
                      {o.restaurants ? tf(o.restaurants, "name") : t("order")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {o.total} {t("sar")} · {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{tStatus(o.status)}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

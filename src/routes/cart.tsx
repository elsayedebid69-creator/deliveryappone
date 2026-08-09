import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة الطلبات | Food Hub" },
      { name: "description", content: "راجع أصناف سلتك وأكمل طلبك بسهولة عبر منصة Food Hub." },
      { property: "og:title", content: "سلة الطلبات | Food Hub" },
      { property: "og:description", content: "راجع أصناف سلتك وأكمل طلبك." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { t, tn } = useI18n();
  const cart = useCart();
  const { user } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);

  const { data: restaurant } = useQuery({
    queryKey: ["cart-restaurant", cart.restaurantId],
    enabled: !!cart.restaurantId,
    queryFn: async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", cart.restaurantId!)
        .maybeSingle();
      return data;
    },
  });

  const deliveryFee = Number(restaurant?.delivery_fee ?? 0);
  const total = cart.subtotal + deliveryFee;
  const belowMin = restaurant ? cart.subtotal < Number(restaurant.min_order) : false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t("loginRequired"));
      void navigate({ to: "/auth" });
      return;
    }
    if (!cart.restaurantId || belowMin) return;
    setBusy(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_id: user.id,
        restaurant_id: cart.restaurantId,
        address: form.address.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim() || null,
        subtotal: cart.subtotal,
        delivery_fee: deliveryFee,
        total,
      })
      .select("id")
      .single();

    if (error || !order) {
      setBusy(false);
      toast.error(error?.message ?? "Error");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      cart.lines.map((l) => ({
        order_id: order.id,
        menu_item_id: l.id,
        name_ar: l.name_ar,
        name_en: l.name_en,
        price: l.price,
        quantity: l.quantity,
      })),
    );
    setBusy(false);
    if (itemsError) {
      toast.error(itemsError.message);
      return;
    }
    cart.clear();
    toast.success(t("created"));
    void navigate({ to: "/orders" });
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-bold">{t("cart")}</h1>

        {cart.lines.length === 0 ? (
          <div className="surface p-10 text-center">
            <p className="text-muted-foreground">{t("emptyCart")}</p>
            <Button asChild className="mt-4">
              <Link to="/">{t("browseRestaurants")}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="surface divide-y divide-border">
              {cart.lines.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{tn(l)}</p>
                    <p className="text-sm text-muted-foreground">
                      {l.price} {t("sar")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="-"
                      onClick={() => cart.setQty(l.id, l.quantity - 1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-6 text-center font-semibold">{l.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="+"
                      onClick={() => cart.setQty(l.id, l.quantity + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={t("delete")}
                      onClick={() => cart.remove(l.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="surface space-y-4 p-5">
              <h2 className="text-lg font-bold">{t("checkout")}</h2>
              <div className="space-y-2">
                <Label htmlFor="address">{t("address")}</Label>
                <Input
                  id="address"
                  required
                  maxLength={200}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  required
                  maxLength={20}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t("notes")}</Label>
                <Textarea
                  id="notes"
                  maxLength={300}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <dl className="space-y-1 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt>{t("subtotal")}</dt>
                  <dd>
                    {cart.subtotal.toFixed(2)} {t("sar")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t("deliveryFee")}</dt>
                  <dd>
                    {deliveryFee.toFixed(2)} {t("sar")}
                  </dd>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <dt>{t("total")}</dt>
                  <dd>
                    {total.toFixed(2)} {t("sar")}
                  </dd>
                </div>
              </dl>

              {belowMin ? (
                <p className="text-sm text-destructive">
                  {t("minOrderNotMet")} ({restaurant?.min_order} {t("sar")})
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={busy || belowMin}>
                {user ? t("placeOrder") : t("loginRequired")}
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

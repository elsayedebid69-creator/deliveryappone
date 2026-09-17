import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SmartAddressPicker } from "@/components/customer/smart-address-picker";
import { sounds } from "@/lib/sound-effects";

export const Route = createFileRoute("/cart")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "سلة الطلبات الذكية | FoodHub 3.0" },
      { name: "description", content: "إتمام الطلب الذكي وتحديد العنوان بالذكاء الاصطناعي عبر منصة FoodHub." },
      { property: "og:title", content: "سلة الطلبات الذكية | FoodHub" },
      { property: "og:description", content: "إتمام طلب الوجبات الصحية وتحديد العنوان الفوري بالذكاء الاصطناعي." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { t, tn, lang } = useI18n();
  const cart = useCart();
  const { user } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    address: "حي النرجس، شارع عثمان بن عفان، عمارة 14 - الرياض",
    phone: "0551234567",
    notes: "يرجى ترك الطلب عند الباب والدق خفيفاً",
  });
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

  const deliveryFee = 12;
  const total = cart.subtotal + deliveryFee;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.lines.length === 0) {
      toast.error(lang === "ar" ? "سلة الطلبات فارغة!" : "Your cart is empty!");
      return;
    }

    setBusy(true);
    sounds.playClick();

    const customerId = user?.id || "demo-customer-" + Math.random().toString(36).substring(7);
    const targetRestaurantId = cart.restaurantId || "food-hub-prime";

    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          restaurant_id: targetRestaurantId,
          address: form.address.trim(),
          phone: form.phone.trim(),
          notes: form.notes.trim() || null,
          subtotal: cart.subtotal,
          delivery_fee: deliveryFee,
          total,
          status: "pending",
        })
        .select("id")
        .single();

      if (error || !order) {
        console.error("Order creation failed in Supabase:", error);
        toast.error(
          lang === "ar"
            ? "تعذر حفظ الطلب في قاعدة البيانات. يرجى التحقق من الاتصال والمحاولة مجدداً."
            : "Failed to save order to database. Please check your connection and try again."
        );
        return;
      }

      if (cart.lines.length > 0) {
        const { error: itemsError } = await supabase.from("order_items").insert(
          cart.lines.map((l) => ({
            order_id: order.id,
            menu_item_id: l.id.startsWith("rec-") ? null : l.id,
            name_ar: l.name_ar,
            name_en: l.name_en,
            price: l.price,
            quantity: l.quantity,
          }))
        );

        if (itemsError) {
          console.warn("Could not insert some order items:", itemsError);
        }
      }

      cart.clear();
      sounds.playSuccess();
      toast.success(
        lang === "ar"
          ? "🎉 تم تأكيد طلبك بنجاح وجاري ربطه بالرادار الفضائي!"
          : "🎉 Order confirmed and sent to kitchen!"
      );
      void navigate({ to: "/orders" });
    } catch (err) {
      console.error("Unexpected checkout error:", err);
      toast.error(
        lang === "ar"
          ? "حدث خطأ غير متوقع أثناء معالجة الطلب. يرجى المحاولة مرة أخرى."
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-10">
        
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">سلة الطلبات الذكية</h1>
              <p className="text-xs text-slate-400">راجع أصناف وجبتك وأكد عنوان التوصيل بالذكاء الاصطناعي</p>
            </div>
          </div>

          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
            {cart.lines.length} وجبات مختارة
          </Badge>
        </div>

        {cart.lines.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-4 shadow-xl">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-800 text-slate-500">
              <ShoppingBag className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-white">سلة طلباتك فارغة حالياً</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              تصفح قائمتنا الصحية الذكية أو اطلب من مساعد الذكاء الاصطناعي ترشيح وجبة مناسبة لك.
            </p>
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 shadow-lg shadow-amber-500/20">
              <Link to="/">
                تصفح قائمة الأطباق
                <ArrowRight className="ms-2 size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Left: Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 divide-y divide-slate-800/80 shadow-xl space-y-4">
                {cart.lines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-4 pt-4 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-sm sm:text-base">{tn(l)}</p>
                      <p className="text-xs text-amber-400 font-mono font-semibold mt-0.5">
                        {l.price} {t("sar")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="-"
                        className="size-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-xl"
                        onClick={() => {
                          sounds.playClick();
                          cart.setQty(l.id, l.quantity - 1);
                        }}
                      >
                        <Minus className="size-3.5" />
                      </Button>

                      <span className="w-6 text-center font-bold text-white font-mono text-sm">
                        {l.quantity}
                      </span>

                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="+"
                        className="size-8 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-xl"
                        onClick={() => {
                          sounds.playClick();
                          cart.setQty(l.id, l.quantity + 1);
                        }}
                      >
                        <Plus className="size-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={t("delete")}
                        className="size-8 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl ms-1"
                        onClick={() => {
                          sounds.playClick();
                          cart.remove(l.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Smart Suggestion Banner */}
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-cyan-300 font-medium">
                  <Sparkles className="size-4 text-cyan-400 shrink-0" />
                  <span>تم تطبيق خصم التوصيل الذكي بالذكاء الاصطناعي للأوردر الأول!</span>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
                  توفير 15 ر.س
                </Badge>
              </div>
            </div>

            {/* Right: Checkout & Smart Address Picker Form */}
            <div className="lg:col-span-5">
              <form
                onSubmit={submit}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-2xl sticky top-20"
              >
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="size-5 text-amber-400" />
                  إتمام الطلب وتحديد التوصيل
                </h2>

                {/* AI Smart Address Picker */}
                <SmartAddressPicker
                  value={form.address}
                  notes={form.notes}
                  onChange={(addr, nts) =>
                    setForm((prev) => ({
                      ...prev,
                      address: addr,
                      notes: nts || prev.notes,
                    }))
                  }
                />

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-300">
                    رقم الهاتف للتواصل
                  </Label>
                  <Input
                    id="phone"
                    required
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-slate-100 text-sm font-mono focus-visible:ring-amber-500 rounded-xl"
                  />
                </div>

                {/* Financial Breakdown */}
                <dl className="space-y-2 border-t border-slate-800 pt-4 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <dt>قيمة الوجبات</dt>
                    <dd className="font-mono text-slate-200">{cart.subtotal.toFixed(2)} ر.س</dd>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <dt>رسوم التوصيل السريع (GPS)</dt>
                    <dd className="font-mono text-slate-200">{deliveryFee.toFixed(2)} ر.س</dd>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                    <dt>الإجمالي النهائي</dt>
                    <dd className="text-amber-400 font-mono">{total.toFixed(2)} ر.س</dd>
                  </div>
                </dl>

                {/* Place Order CTA */}
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black hover:from-amber-400 hover:to-orange-400 py-6 text-base rounded-2xl shadow-xl shadow-amber-500/25 glow-gold"
                >
                  <Zap className="me-2 size-5" />
                  {busy ? "جاري المعالجة الفورية..." : "تأكيد الطلب وبدء التتبع الراداري"}
                </Button>
              </form>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

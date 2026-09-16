import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Store,
  Bike,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Zap,
  Flame,
  Clock,
  CheckCircle2,
  ChevronRight,
  Activity,
  Layers,
  Bot,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCcw,
  Volume2,
  Lock,
  Compass,
  CreditCard,
  Send,
  Eye,
  Terminal,
  ChefHat,
  PackageCheck,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomerApp } from "@/components/storefront/customer-app";
import { FoodHubLogo } from "@/components/food-hub-logo";

type AppType = "customer" | "kitchen" | "courier" | "admin" | "radar";
type DeviceFrame = "iphone" | "tablet" | "desktop";

export function AppSimulatorWorkspace() {
  const { lang, t, setLang } = useI18n();
  const [activeApp, setActiveApp] = useState<AppType>("customer");
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>("iphone");
  const [simulatedOrdersCount, setSimulatedOrdersCount] = useState(14);
  const [activeCouriersCount, setActiveCouriersCount] = useState(8);
  const [activeKitchensCount, setActiveKitchensCount] = useState(6);
  const [isSimulatingOrder, setIsSimulatingOrder] = useState(false);
  const [isSecurityShieldActive, setIsSecurityShieldActive] = useState(true);

  // Simulated Kitchen orders
  const [kitchenOrders, setKitchenOrders] = useState([
    {
      id: "ORD-9421",
      customerName: "سارة عبد العزيز",
      items: ["سلطة الكينوا بالأفوكادو (x1)", "سموذي التوت البري (x1)"],
      total: 60,
      status: "preparing",
      timer: "06:45 د",
      tag: "⚡ أولوية سريعة",
    },
    {
      id: "ORD-9422",
      customerName: "محمد الشمري",
      items: ["صدر دجاج تندرلوين مشوي (x2)", "أرز بني محمص (x1)"],
      total: 98,
      status: "pending",
      timer: "09:12 د",
      tag: "🥩 بروتين عالي",
    },
    {
      id: "ORD-9419",
      customerName: "فهد القحطاني",
      items: ["وعاء السلمون البري والأفوكادو (x1)"],
      total: 52,
      status: "ready",
      timer: "جاهز للاستلام",
      tag: "🛵 كابتن بالطريق",
    },
  ]);

  // Trigger test live order
  const handleSimulateNewOrder = () => {
    setIsSimulatingOrder(true);
    sounds.playNewOrder();
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newId,
      customerName: lang === "ar" ? "عميل تجريبي جديد" : "New Test Customer",
      items: [
        lang === "ar"
          ? "وجبة بروتين تندرلوين + كينوا (x1)"
          : "Tenderloin Protein Meal + Quinoa (x1)",
      ],
      total: 45,
      status: "pending",
      timer: "10:00 د",
      tag: "🔥 طلب جديد حي",
    };

    setKitchenOrders((prev) => [newOrder, ...prev]);
    setSimulatedOrdersCount((prev) => prev + 1);

    toast.success(
      lang === "ar"
        ? `🔔 تم إرسال طلب محاكاة جديد (${newId}) إلى شاشات المطبخ والمندوب!`
        : `🔔 New simulated order (${newId}) broadcasted to Kitchen & Courier!`,
      {
        description:
          lang === "ar"
            ? "تم بث الطلب عبر قنوات الـ Realtime الفورية."
            : "Broadcasted live across Realtime WebSocket channels.",
      }
    );

    setTimeout(() => setIsSimulatingOrder(false), 800);
  };

  // Move kitchen order status
  const advanceKitchenOrder = (orderId: string) => {
    sounds.playSuccess();
    setKitchenOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          if (ord.status === "pending") return { ...ord, status: "preparing", timer: "07:30 د" };
          if (ord.status === "preparing") return { ...ord, status: "ready", timer: "جاهز للاستلام" };
          return { ...ord, status: "delivered", timer: "تم التسليم بنجاح" };
        }
        return ord;
      })
    );
    toast.info(
      lang === "ar"
        ? `👨‍🍳 تم تحديث مرحلة تحضير الطلب ${orderId}`
        : `👨‍🍳 Order ${orderId} preparation stage advanced!`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Master Developer & Ecosystem Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Ecosystem Badge */}
          <div className="flex items-center gap-3">
            <FoodHubLogo size={36} showText />
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Sparkles className="size-3 text-amber-400 animate-pulse" />
              <span>{lang === "ar" ? "استوديو التطوير والمحاكاة 3.0" : "Dev & Simulator Studio"}</span>
            </div>
          </div>

          {/* Quick Real-Time Telemetry Pills */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-400 font-medium">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{lang === "ar" ? "الشبكة متصلة (18ms)" : "Live Network (18ms)"}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-cyan-300">
              <ShieldCheck className="size-3.5 text-cyan-400" />
              <span>{lang === "ar" ? "درع أمان IP الفردي" : "Single-IP Shield Active"}</span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-300">
              <Bot className="size-3.5 text-amber-400" />
              <span>{lang === "ar" ? "ذكاء اصطناعي نشط" : "Multi-Agent AI Active"}</span>
            </div>
          </div>

          {/* Top Actions: Language & Standalone Launchers */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playClick();
                setLang(lang === "ar" ? "en" : "ar");
              }}
              className="border-slate-800 bg-slate-900/80 text-xs font-semibold hover:border-amber-500/40 hover:text-amber-400"
            >
              {lang === "ar" ? "English" : "عربي"}
            </Button>

            <Button
              size="sm"
              onClick={handleSimulateNewOrder}
              disabled={isSimulatingOrder}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 text-xs gap-1.5 shadow-md shadow-amber-500/20"
            >
              <Play className="size-3.5 fill-slate-950" />
              <span>{lang === "ar" ? "إرسال طلب تجريبي" : "Simulate Test Order"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Workspace Overview & Ecosystem Launch Matrix */}
      <section className="border-b border-slate-900 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header Info Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Layers className="size-6 text-amber-400" />
                <span>
                  {lang === "ar"
                    ? "لوحة تطوير وتحكم منظومة FoodHub المتكاملة"
                    : "FoodHub Integrated Ecosystem & Multi-App Studio"}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
                {lang === "ar"
                  ? "المتجر والتطبيقات مدمجة ومحفوظة داخل بيئة التطوير. يمكنك محاكاة واختبار تطبيق العميل (PedidosYa/Foodpanda)، شاشة المطبخ KDS، لوحة المندوب، ولوحة الإدارة المركزية مباشرة."
                  : "Storefront & sub-apps are integrated inside this development workspace. Simulate, test, and launch Customer App, Kitchen KDS, Courier HUD, and Master Admin in real time."}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">{lang === "ar" ? "الطلبات الحية:" : "Active Orders:"}</span>
                <span className="font-bold text-white">{simulatedOrdersCount}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
                <Bike className="size-3.5 text-cyan-400" />
                <span className="text-slate-400">{lang === "ar" ? "الكباتن النشطون:" : "Couriers:"}</span>
                <span className="font-bold text-white">{activeCouriersCount}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs">
                <Store className="size-3.5 text-amber-400" />
                <span className="text-slate-400">{lang === "ar" ? "المطابخ السحابية:" : "Kitchens:"}</span>
                <span className="font-bold text-white">{activeKitchensCount}</span>
              </div>
            </div>
          </div>

          {/* 3. The 4 Application Launcher Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Customer Super-App */}
            <div
              onClick={() => {
                sounds.playClick();
                setActiveApp("customer");
              }}
              className={`cursor-pointer group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                activeApp === "customer"
                  ? "border-amber-500 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                    <Smartphone className="size-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-300">
                    Zomato Style UI
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                    {lang === "ar" ? "📱 تطبيق العميل (Zomato Storefront)" : "📱 Customer Super-App (Zomato)"}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {lang === "ar"
                      ? "شريط البحث المزدوج، المجموعات المختارة، أحياء الرياض، حساب الماكروز والسعرات، والمساعد الذكي AI."
                      : "Dual search bar, curated collections, Riyadh localities, macro telemetry, and AI dietitian."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Play className="size-3" />
                  {lang === "ar" ? "المحاكاة الفورية" : "Live Simulate"}
                </span>
                <Link
                  to="/store"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] hover:underline"
                >
                  <ExternalLink className="size-3" />
                  {lang === "ar" ? "شاشة كاملة" : "Fullscreen"}
                </Link>
              </div>
            </div>

            {/* Card 2: Kitchen KDS (Restaurant App) */}
            <div
              onClick={() => {
                sounds.playClick();
                setActiveApp("kitchen");
              }}
              className={`cursor-pointer group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                activeApp === "kitchen"
                  ? "border-emerald-500 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-900 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    <ChefHat className="size-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    KDS Live Kanban
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                    {lang === "ar" ? "🍳 تطبيق شاشة المطبخ (KDS)" : "🍳 Kitchen & Merchant KDS"}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {lang === "ar"
                      ? "إدارة تذاكر الطلبات، عدادات التحضير، منشئ الأطباق بالذكاء الاصطناعي، وتأمين IP المطبخ."
                      : "Live order Kanban tickets, prep timers, AI dish generator, and hardware IP lock."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Play className="size-3" />
                  {lang === "ar" ? "المحاكاة الفورية" : "Live Simulate"}
                </span>
                <Link
                  to="/vendor"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] hover:underline"
                >
                  <ExternalLink className="size-3" />
                  {lang === "ar" ? "شاشة كاملة" : "Fullscreen"}
                </Link>
              </div>
            </div>

            {/* Card 3: Courier HUD (Delivery Driver App) */}
            <div
              onClick={() => {
                sounds.playClick();
                setActiveApp("courier");
              }}
              className={`cursor-pointer group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                activeApp === "courier"
                  ? "border-cyan-500 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-slate-900 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                    <Bike className="size-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                    GPS & AI Proof
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                    {lang === "ar" ? "🛵 تطبيق مندوب التوصيل (HUD)" : "🛵 Courier & Fleet HUD"}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {lang === "ar"
                      ? "الملاحة الذكية، بث إحداثيات GPS، إثبات التسليم بالكاميرا والـ AI، ومحفظة الأرباح."
                      : "Turn-by-turn navigation, GPS telemetry broadcast, AI photo delivery proof, and earnings."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  <Play className="size-3" />
                  {lang === "ar" ? "المحاكاة الفورية" : "Live Simulate"}
                </span>
                <Link
                  to="/courier"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] hover:underline"
                >
                  <ExternalLink className="size-3" />
                  {lang === "ar" ? "شاشة كاملة" : "Fullscreen"}
                </Link>
              </div>
            </div>

            {/* Card 4: Master Admin & Security Hub */}
            <div
              onClick={() => {
                sounds.playClick();
                setActiveApp("admin");
              }}
              className={`cursor-pointer group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-300 ${
                activeApp === "admin"
                  ? "border-rose-500 bg-gradient-to-br from-rose-500/15 via-slate-900 to-slate-900 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/30"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                    <ShieldCheck className="size-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-rose-500/30 bg-rose-500/10 text-rose-300">
                    Anti-Fraud Ops
                  </Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-rose-400 transition-colors">
                    {lang === "ar" ? "🛡️ لوحة الإدارة والأمان (Master)" : "🛡️ Master Admin & Security"}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {lang === "ar"
                      ? "الموافقة على الشركاء، توليد كود AI، تأمين IP الأجهزة، منع التلاعب المالي والرقابة."
                      : "Partner approvals, AI ID generator, IP fraud lock/unlock, platform financial ledger."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <Play className="size-3" />
                  {lang === "ar" ? "المحاكاة الفورية" : "Live Simulate"}
                </span>
                <Link
                  to="/admin"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] hover:underline"
                >
                  <ExternalLink className="size-3" />
                  {lang === "ar" ? "شاشة كاملة" : "Fullscreen"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Multi-Device Interactive Sandbox & Frame Viewport */}
      <section className="flex-1 px-4 py-8 sm:px-6 bg-slate-950">
        <div className="mx-auto max-w-7xl space-y-4">
          {/* Viewport Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 backdrop-blur-md">
            {/* Active App Tabs inside Simulator */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveApp("customer");
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeApp === "customer"
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Smartphone className="size-3.5" />
                <span>{lang === "ar" ? "📱 متجر العميل" : "Customer App"}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveApp("kitchen");
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeApp === "kitchen"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ChefHat className="size-3.5" />
                <span>{lang === "ar" ? "🍳 شاشة المطبخ KDS" : "Kitchen KDS"}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveApp("courier");
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeApp === "courier"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Bike className="size-3.5" />
                <span>{lang === "ar" ? "🛵 لوحة المندوب" : "Courier HUD"}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveApp("admin");
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeApp === "admin"
                    ? "bg-rose-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ShieldCheck className="size-3.5" />
                <span>{lang === "ar" ? "🛡️ لوحة الإدارة" : "Master Admin"}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveApp("radar");
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeApp === "radar"
                    ? "bg-purple-500 text-slate-950 shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Radio className="size-3.5" />
                <span>{lang === "ar" ? "🛰️ رادار التتبع" : "Radar Tracking"}</span>
              </button>
            </div>

            {/* Device Frame Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  sounds.playClick();
                  setDeviceFrame("iphone");
                }}
                title="iPhone Frame"
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  deviceFrame === "iphone" ? "bg-slate-800 text-amber-400 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="size-3.5" />
                <span className="hidden sm:inline">iPhone</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setDeviceFrame("tablet");
                }}
                title="iPad / Tablet Frame"
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  deviceFrame === "tablet" ? "bg-slate-800 text-amber-400 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <Tablet className="size-3.5" />
                <span className="hidden sm:inline">iPad Tablet</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setDeviceFrame("desktop");
                }}
                title="Desktop Canvas"
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  deviceFrame === "desktop" ? "bg-slate-800 text-amber-400 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="size-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
            </div>
          </div>

          {/* Device Simulator Container */}
          <div className="flex justify-center items-center py-4">
            {/* Mode A: iPhone 16 Pro Frame */}
            {deviceFrame === "iphone" && (
              <div className="relative mx-auto w-full max-w-[390px] rounded-[52px] border-[10px] border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-slate-950/80 ring-1 ring-slate-700/50">
                {/* Dynamic Island / Speaker */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex h-6 w-28 items-center justify-between rounded-full bg-black px-3">
                  <div className="size-2.5 rounded-full bg-slate-900 border border-slate-800" />
                  <div className="size-2 rounded-full bg-cyan-500/80 animate-pulse" />
                </div>

                {/* Simulated iOS Status Bar */}
                <div className="flex h-10 items-center justify-between px-6 pt-2 text-[10px] font-bold text-slate-400 select-none">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span>5G</span>
                    <div className="h-2.5 w-4 rounded-xs border border-slate-400 p-0.5 flex items-center">
                      <div className="h-full w-full bg-emerald-400 rounded-xs" />
                    </div>
                  </div>
                </div>

                {/* Inner Device Viewport */}
                <div className="h-[740px] overflow-y-auto rounded-[40px] bg-slate-950">
                  {renderActiveAppContent(activeApp, lang, kitchenOrders, advanceKitchenOrder)}
                </div>

                {/* iOS Home Indicator Bar */}
                <div className="py-2 flex justify-center">
                  <div className="h-1 w-32 rounded-full bg-slate-700" />
                </div>
              </div>
            )}

            {/* Mode B: iPad Pro / Tablet Frame */}
            {deviceFrame === "tablet" && (
              <div className="relative mx-auto w-full max-w-[820px] rounded-[36px] border-[12px] border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-slate-950/80 ring-1 ring-slate-700/50">
                {/* Tablet Camera dot */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 size-2 rounded-full bg-slate-800" />

                {/* Inner Device Viewport */}
                <div className="h-[700px] overflow-y-auto rounded-[24px] bg-slate-950">
                  {renderActiveAppContent(activeApp, lang, kitchenOrders, advanceKitchenOrder)}
                </div>
              </div>
            )}

            {/* Mode C: Desktop Full Width Canvas */}
            {deviceFrame === "desktop" && (
              <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
                {/* Browser Mock Chrome Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-rose-500/80" />
                    <span className="size-3 rounded-full bg-yellow-500/80" />
                    <span className="size-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-1 text-[11px] text-slate-400 border border-slate-800 w-96 justify-center">
                    <Lock className="size-3 text-emerald-400" />
                    <span>https://foodhub.internal/ecosystem/{activeApp}</span>
                  </div>
                  <div className="w-12" />
                </div>

                {/* Inner Content Viewport */}
                <div className="min-h-[700px] p-2 sm:p-6 bg-slate-950">
                  {renderActiveAppContent(activeApp, lang, kitchenOrders, advanceKitchenOrder)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Sub-renderer for whichever app is selected in simulator
function renderActiveAppContent(
  app: AppType,
  lang: "ar" | "en",
  kitchenOrders: any[],
  advanceKitchenOrder: (id: string) => void
) {
  if (app === "customer") {
    return <CustomerApp isEmbedded={true} />;
  }

  if (app === "kitchen") {
    return (
      <div className="p-4 space-y-4">
        {/* Kitchen KDS Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ChefHat className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {lang === "ar" ? "شاشة المطبخ KDS (Healthy Kitchen #01)" : "Kitchen KDS Ticket Display"}
              </h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                {lang === "ar" ? "استقبال مباشر للطلبات • IP موثق" : "Live Tickets • Verified IP"}
              </p>
            </div>
          </div>
          <Link
            to="/vendor"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            {lang === "ar" ? "فتح KDS الكامل" : "Open Full KDS"}
            <ExternalLink className="size-3" />
          </Link>
        </div>

        {/* Live Orders Kanban Columns */}
        <div className="space-y-3">
          {kitchenOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-2 shadow-md transition-all hover:border-emerald-500/40"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-white">{order.id}</span>
                <span className="rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                  {order.tag}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <p className="text-slate-300 font-medium">{order.customerName}</p>
                <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                  {order.items.map((it: string, idx: number) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                  <Clock className="size-3" />
                  <span>{order.timer}</span>
                </div>

                <Button
                  size="sm"
                  onClick={() => advanceKitchenOrder(order.id)}
                  className={`h-7 px-3 text-xs font-bold rounded-xl ${
                    order.status === "pending"
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                      : order.status === "preparing"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {order.status === "pending" && (lang === "ar" ? "قبول وبدء التحضير" : "Accept & Cook")}
                  {order.status === "preparing" && (lang === "ar" ? "جاهز للاستلام (إشعار الكابتن)" : "Mark Ready")}
                  {order.status === "ready" && (lang === "ar" ? "تم تسليمه للكابتن" : "Handed to Courier")}
                  {order.status === "delivered" && (lang === "ar" ? "مكتمل ✓" : "Completed ✓")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (app === "courier") {
    return (
      <div className="p-4 space-y-4">
        {/* Courier HUD Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Bike className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {lang === "ar" ? "لوحة المندوب الذكي (كابتن #409)" : "Courier HUD & GPS Nav"}
              </h3>
              <p className="text-[10px] text-cyan-400 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-ping" />
                {lang === "ar" ? "نظام الملاحة نشط • بث GPS فوري" : "GPS Telemetry Broadcasting"}
              </p>
            </div>
          </div>
          <Link
            to="/courier"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            {lang === "ar" ? "فتح اللوحة كاملة" : "Open Full HUD"}
            <ExternalLink className="size-3" />
          </Link>
        </div>

        {/* Courier Active Mission Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs">
              ⚡ {lang === "ar" ? "مهمة نشطة: طلب #9419" : "Active Mission: #9419"}
            </Badge>
            <span className="text-xs font-black text-amber-400">18.50 {lang === "ar" ? "ر.س" : "SAR"}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Store className="size-4 text-emerald-400 shrink-0" />
              <span>{lang === "ar" ? "المطبخ: هيلثي جورميه (السليمانية)" : "Pickup: Healthy Gourmet Cloud Kitchen"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="size-4 text-rose-400 shrink-0" />
              <span>{lang === "ar" ? "التسليم: حي العليا، برج المملكة" : "Dropoff: Al-Olaya, Kingdom Tower"}</span>
            </div>
          </div>

          {/* Delivery Step Progression */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-cyan-300 font-bold">
              1. {lang === "ar" ? "استلام الطلب" : "Picked up"}
            </div>
            <div className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-black animate-pulse">
              2. {lang === "ar" ? "في الطريق" : "On the way"}
            </div>
            <div className="p-2 rounded-xl bg-slate-800/50 text-slate-400">
              3. {lang === "ar" ? "إثبات الـ AI" : "AI Proof"}
            </div>
          </div>
        </div>

        {/* Live Earnings & Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[10px] text-slate-400">{lang === "ar" ? "أرباح اليوم:" : "Today's Earnings:"}</span>
            <p className="text-base font-black text-white mt-0.5">245.00 {lang === "ar" ? "ر.س" : "SAR"}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[10px] text-slate-400">{lang === "ar" ? "الطلبات المكتملة:" : "Completed Trips:"}</span>
            <p className="text-base font-black text-emerald-400 mt-0.5">11 {lang === "ar" ? "رحلة" : "trips"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (app === "admin") {
    return (
      <div className="p-4 space-y-4">
        {/* Admin Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {lang === "ar" ? "لوحة الإدارة المركزية والأمان (Single-IP Shield)" : "Master Admin & Anti-Fraud Security"}
              </h3>
              <p className="text-[10px] text-rose-400">
                {lang === "ar" ? "الرقابة المالية • اعتماد الشركاء • قفل العتاد" : "Hardware Lock • Partner Approvals"}
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            {lang === "ar" ? "فتح الإدارة الكاملة" : "Open Master Admin"}
            <ExternalLink className="size-3" />
          </Link>
        </div>

        {/* Security & Approvals Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[10px] text-slate-400">{lang === "ar" ? "الشركاء المعتمدون:" : "Approved Partners:"}</span>
            <p className="text-sm font-black text-white mt-0.5">48 {lang === "ar" ? "شريك" : "Partners"}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[10px] text-slate-400">{lang === "ar" ? "أجهزة IP المقفلة:" : "Locked IP Devices:"}</span>
            <p className="text-sm font-black text-cyan-400 mt-0.5">48/48 (100%)</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-[10px] text-slate-400">{lang === "ar" ? "محاولات الاختراق الممنوعة:" : "Blocked Conflicts:"}</span>
            <p className="text-sm font-black text-rose-400 mt-0.5">0 (محمي تماماً)</p>
          </div>
        </div>

        {/* Partners Quick List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300">
            {lang === "ar" ? "سجل الشركاء وشهادات الأمان:" : "Active Partners Security Ledgers:"}
          </h4>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800 text-xs">
            <div className="p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">FH-KITCHEN-8421</span>
                <p className="text-[10px] text-slate-400">مطبخ هيلثي جورميه • IP: 192.168.1.104</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                مؤمن ✓
              </Badge>
            </div>
            <div className="p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">FH-COURIER-3912</span>
                <p className="text-[10px] text-slate-400">كابتن أحمد خالد • IP: 10.0.4.22</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                مؤمن ✓
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Radar App
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Radio className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              {lang === "ar" ? "رادار التتبع الحي بالـ GPS" : "Live GPS Order Radar"}
            </h3>
            <p className="text-[10px] text-purple-400">
              {lang === "ar" ? "تتبع فوري لمسار الكابتن على الخريطة" : "Realtime Courier Telemetry"}
            </p>
          </div>
        </div>
        <Link
          to="/orders"
          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
        >
          {lang === "ar" ? "فتح صفحة الطلبات" : "Open Orders"}
          <ExternalLink className="size-3" />
        </Link>
      </div>

      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3 text-center">
        <div className="relative mx-auto size-28 rounded-full border-2 border-purple-500/40 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-purple-400/30 animate-ping" />
          <Bike className="size-8 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">
            {lang === "ar" ? "الكابتن يقترب من موقعك (4 دقائق)" : "Courier arriving in 4 mins"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "ar" ? "الموقع الحالي: تقاطع شارع التحلية مع العليا" : "Current location: Tahlia & Olaya Junction"}
          </p>
        </div>
      </div>
    </div>
  );
}

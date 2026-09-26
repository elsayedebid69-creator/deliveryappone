import { useState, useEffect } from "react";
import {
  Bike,
  Navigation,
  Phone,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Camera,
  KeyRound,
  ExternalLink,
  Power,
  Sparkles,
} from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActiveDelivery {
  id: string;
  orderNumber: string;
  kitchenName: string;
  kitchenAddress: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string[];
  earnings: number;
  step: 1 | 2 | 3 | 4; // 1: go to kitchen, 2: pick up, 3: go to customer, 4: delivered
  otp: string;
}

export function CourierMobileApp() {
  const { lang, tn } = useI18n();
  const ar = lang === "ar";

  const [isOnline, setIsOnline] = useState(true);
  const [showIncomingOrder, setShowIncomingOrder] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>({
    id: "del-771",
    orderNumber: "ORD-8942",
    kitchenName: "مطبخ FoodHub المركزي (فرع النرجس)",
    kitchenAddress: "طريق عثمان بن عفان، الرياض",
    customerName: "عبدالله العتيبي",
    customerPhone: "0559123456",
    customerAddress: "حي الياسمين، شارع 12، فيلا 24 - الرياض",
    items: ["2x سماش برجر كلاسيك دبل", "1x شاورما عربي دجاج", "2x كولا دايت"],
    earnings: 26.5,
    step: 2,
    otp: "8492",
  });

  const [inputOtp, setInputOtp] = useState("");
  const [showProofModal, setShowProofModal] = useState(false);

  // Incoming order countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showIncomingOrder && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0 && showIncomingOrder) {
      setShowIncomingOrder(false);
      setCountdown(15);
      toast.info(ar ? "انتهى وقت قبول الطلب" : "Order expired");
    }
    return () => clearTimeout(timer);
  }, [showIncomingOrder, countdown, ar]);

  const toggleAvailability = () => {
    sounds.playClick();
    const next = !isOnline;
    setIsOnline(next);
    toast.success(
      next
        ? ar
          ? "🟢 أنت الآن متصل! الرادار يبحث عن أقرب الطلبات"
          : "🟢 You are ONLINE! Radar is actively searching for orders"
        : ar
        ? "🔴 تم إيقاف الاستقبال مؤقتاً"
        : "🔴 Shift paused"
    );
  };

  const simulateNewOrderDispatch = () => {
    sounds.playNewOrder();
    setCountdown(15);
    setShowIncomingOrder(true);
  };

  const acceptIncomingOrder = () => {
    sounds.playSuccess();
    setShowIncomingOrder(false);
    setActiveDelivery({
      id: `del-${Math.floor(100 + Math.random() * 900)}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      kitchenName: "مطبخ FoodHub المركزي - فرع النرجس",
      kitchenAddress: "طريق عثمان بن عفان، الرياض",
      customerName: "سلطان الشمري",
      customerPhone: "0551122334",
      customerAddress: "حي النرجس، مخرج 7، شقة 104 - الرياض",
      items: ["1x وعاء كيتو سلمون أفوكادو", "1x سبانش لاتيه بارد"],
      earnings: 28.0,
      step: 1,
      otp: "3914",
    });
    toast.success(ar ? "⚡ تم قبول الطلب بنجاح! توجه إلى المطبخ" : "⚡ Order Accepted! Head to the Kitchen");
  };

  const advanceDeliveryStep = () => {
    if (!activeDelivery) return;
    sounds.playSuccess();

    if (activeDelivery.step === 1) {
      setActiveDelivery({ ...activeDelivery, step: 2 });
      toast.success(ar ? "📦 وصلت إلى المطبخ! استلم الوجبات" : "📦 Arrived at kitchen! Pick up food");
    } else if (activeDelivery.step === 2) {
      setActiveDelivery({ ...activeDelivery, step: 3 });
      toast.success(ar ? "🛵 تم الاستلام! توجه الآن إلى موقع العميل" : "🛵 Food picked up! Head to customer");
    } else if (activeDelivery.step === 3) {
      setShowProofModal(true);
    }
  };

  const completeDeliveryWithOtp = () => {
    if (!activeDelivery) return;
    if (inputOtp.trim() !== activeDelivery.otp && inputOtp.trim() !== "1234") {
      sounds.playClick();
      toast.error(ar ? "رمز التحقق OTP غير صحيح (جرب 8492 أو 1234)" : "Invalid OTP (try 8492 or 1234)");
      return;
    }
    sounds.playSuccess();
    setShowProofModal(false);
    setInputOtp("");
    setActiveDelivery({ ...activeDelivery, step: 4 });
    toast.success(
      ar
        ? `🎉 تم تسليم الطلب بنجاح! أضيفت ${activeDelivery.earnings} ر.س لمحفظتك`
        : `🎉 Delivered! Added ${activeDelivery.earnings} SAR to wallet`
    );
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. TOP CAPTAIN COCKPIT HEADER */}
      <header className="sticky top-11 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-cyan-900/40 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Captain Info */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="size-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/20">
                <Bike className="size-5" />
              </div>
              {isOnline && (
                <span className="absolute -bottom-0.5 -end-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-white">
                  {ar ? "الكابتن أحمد الزهراني" : "Captain Ahmed"}
                </h2>
                <Badge className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0 border-amber-500/30">
                  ⭐ 4.96
                </Badge>
              </div>
              <p className="text-[10px] text-cyan-400 font-mono font-bold">
                {ar ? "أسطول كباتن FOODHUB الذكي" : "FOODHUB Smart Fleet"}
              </p>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            onClick={toggleAvailability}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isOnline
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-400"
            }`}
          >
            <Power className="size-3.5" />
            <span>{isOnline ? (ar ? "متصل 🟢" : "ONLINE 🟢") : (ar ? "غير متاح 🔴" : "OFFLINE 🔴")}</span>
          </button>
        </div>
      </header>

      {/* 2. DAILY WALLET & EARNINGS METRICS */}
      <section className="px-4 pt-3">
        <div className="max-w-md mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/40 p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <TrendingUp className="size-3.5 text-cyan-400" />
              {ar ? "أرباح الكابتن اليوم" : "Today's Driver Earnings"}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {ar ? "+15 ر.س إكراميات 💖" : "+15 SAR Tips 💖"}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-white">
              248.50 <span className="text-sm font-bold text-cyan-400">{ar ? "ر.س" : "SAR"}</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                sounds.playSuccess();
                toast.success(ar ? "تم تحويل 248.50 ر.س لمحفظة STC Pay بنجاح!" : "Withdrawn to STC Pay!");
              }}
              className="h-8 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20"
            >
              {ar ? "سحب فوري STC Pay" : "Instant Cashout"}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">{ar ? "المشاوير" : "Trips"}</div>
              <div className="font-black text-white text-sm">9</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">{ar ? "ساعات العمل" : "Hours"}</div>
              <div className="font-black text-white text-sm">4.2 س</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">{ar ? "متوسط السرعة" : "Avg Speed"}</div>
              <div className="font-black text-emerald-400 text-sm">17 د</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIMULATE DISPATCH TEST BUTTON */}
      <section className="px-4 pt-3">
        <div className="max-w-md mx-auto flex items-center justify-between bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-cyan-400" />
            {ar ? "اختبار رادار الطلبات الحية" : "Test Live Order Radar"}
          </span>
          <Button
            size="sm"
            onClick={simulateNewOrderDispatch}
            className="h-7 px-3 text-[11px] font-bold rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40"
          >
            {ar ? "إرسال طلب جديد للكابتن 🔔" : "Simulate Dispatch 🔔"}
          </Button>
        </div>
      </section>

      {/* 4. ACTIVE ORDER NAVIGATION COCKPIT */}
      {activeDelivery && (
        <section className="px-4 pt-4 space-y-3">
          <div className="max-w-md mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-4 shadow-xl">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white">{activeDelivery.orderNumber}</span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">
                    +{activeDelivery.earnings} {ar ? "ر.س أرباح" : "SAR"}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeDelivery.kitchenName}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${activeDelivery.customerPhone}`}
                  className="size-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:bg-emerald-500/30"
                  title="Call Customer"
                >
                  <Phone className="size-4" />
                </a>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="size-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/30"
                  title="Google Maps"
                >
                  <Navigation className="size-4" />
                </a>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>{ar ? "مرحلة مسار التوصيل:" : "Delivery Stage:"}</span>
                <span className="text-cyan-400 font-mono">
                  {activeDelivery.step === 1 && (ar ? "1. التوجه للمطبخ" : "1. To Kitchen")}
                  {activeDelivery.step === 2 && (ar ? "2. استلام الوجبات" : "2. Food Pickup")}
                  {activeDelivery.step === 3 && (ar ? "3. التوجه للعميل" : "3. To Customer")}
                  {activeDelivery.step === 4 && (ar ? "4. تم التسليم ✓" : "4. Delivered ✓")}
                </span>
              </div>

              {/* Step indicator bar */}
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      activeDelivery.step >= s ? "bg-cyan-400 shadow-sm shadow-cyan-400/50" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Simulated Live Route Map Viewport */}
            <div className="relative h-32 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden p-3 flex flex-col justify-between">
              {/* Radar waves simulation */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,transparent_70%)] pointer-events-none" />

              <div className="flex items-center justify-between text-xs relative z-10">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
                  {ar ? "نظام الملاحة الذكي المتصل" : "Connected GPS Nav"}
                </span>
                <span className="font-mono text-[11px] text-slate-400">24.7891° N, 46.6853° E</span>
              </div>

              <div className="relative z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Navigation className="size-4 text-cyan-400 rotate-45" />
                  <span className="text-white font-bold text-[11px]">
                    {activeDelivery.step <= 2
                      ? ar
                        ? "انعطف يميناً بعد 200م باتجاه مطبخ FoodHub"
                        : "Turn right in 200m towards FoodHub Kitchen"
                      : ar
                      ? "المسافة للعميل: 1.2 كم (3 دقائق)"
                      : "Distance to customer: 1.2 km (3 mins)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items Checklist */}
            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
              <span className="font-bold text-slate-400 block mb-1">
                {ar ? "محتويات الطلب:" : "Order Items:"}
              </span>
              {activeDelivery.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="size-3 text-cyan-400 shrink-0" />
                  <span>{it}</span>
                </div>
              ))}
            </div>

            {/* Customer Details */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs">
              <MapPin className="size-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">{activeDelivery.customerName}</div>
                <div className="text-[11px] text-slate-400">{activeDelivery.customerAddress}</div>
              </div>
            </div>

            {/* Action button to advance */}
            {activeDelivery.step < 4 ? (
              <Button
                onClick={advanceDeliveryStep}
                className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-cyan-500/20"
              >
                {activeDelivery.step === 1 && (ar ? "وصلت للمطبخ ➔ استلام الوجبات" : "Arrived at Kitchen ➔ Pickup")}
                {activeDelivery.step === 2 && (ar ? "تأكيد الاستلام ➔ التوجه للعميل" : "Confirmed Pickup ➔ To Customer")}
                {activeDelivery.step === 3 && (ar ? "وصلت للعميل ➔ إثبات التسليم و OTP" : "Arrived ➔ Verify OTP & Deliver")}
              </Button>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <div className="text-emerald-400 font-bold text-xs">
                  {ar ? "✓ اكتمل هذا المشوار بنجاح!" : "✓ Delivery Completed!"}
                </div>
                <Button
                  size="sm"
                  onClick={simulateNewOrderDispatch}
                  className="bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  {ar ? "استقبال مشوار جديد 🛵" : "Next Delivery 🛵"}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. INCOMING ORDER DISPATCH MODAL */}
      {showIncomingOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-cyan-400 p-5 space-y-4 shadow-2xl shadow-cyan-500/30 animate-in slide-in-from-bottom-8 duration-300">
            {/* Header with Countdown */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-3 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="font-black text-sm text-white">
                  {ar ? "🔔 طلب توصيل جديد لك!" : "🔔 Incoming Order Alert!"}
                </h3>
              </div>
              <div className="size-8 rounded-full border-2 border-cyan-400 flex items-center justify-center font-mono font-black text-cyan-400 text-xs">
                {countdown}
              </div>
            </div>

            {/* Earnings & Distances */}
            <div className="rounded-2xl bg-slate-950 p-4 space-y-2 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">{ar ? "قيمة المشوار المكتسبة" : "Trip Earnings"}</div>
              <div className="text-3xl font-black text-cyan-400">
                +28.00 <span className="text-sm">{ar ? "ر.س" : "SAR"}</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <span>📍 1.8 كم للمطبخ</span>
                <span>•</span>
                <span>🏁 3.2 كم للعميل</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  sounds.playClick();
                  setShowIncomingOrder(false);
                }}
                className="border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
              >
                {ar ? "تخطي" : "Decline"}
              </Button>

              <Button
                onClick={acceptIncomingOrder}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-cyan-500/30"
              >
                {ar ? "قبول المشوار ⚡" : "Accept ⚡"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. OTP & PROOF OF DELIVERY MODAL */}
      {showProofModal && activeDelivery && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-cyan-500/40 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="size-5 text-cyan-400" />
                <h3 className="font-black text-sm text-white">
                  {ar ? "إثبات تسليم الطلب للعميل" : "Proof of Delivery"}
                </h3>
              </div>
              <button
                onClick={() => setShowProofModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {ar
                ? "اطلب من العميل رمز التحقق المكون من 4 أرقام لتأكيد التسليم الرسمي:"
                : "Ask customer for their 4-digit OTP code to confirm delivery:"}
            </p>

            <div className="space-y-2">
              <input
                type="text"
                maxLength={4}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="مثال: 8492"
                className="w-full h-12 text-center text-xl font-mono font-black tracking-widest rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400 focus:outline-none focus:border-cyan-400"
              />
              <div className="text-[10px] text-slate-500 text-center">
                {ar ? `رمز التجربة التلقائي: ${activeDelivery.otp}` : `Demo OTP: ${activeDelivery.otp}`}
              </div>
            </div>

            <Button
              onClick={completeDeliveryWithOtp}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-2xl text-xs"
            >
              {ar ? "تأكيد التسليم بالـ OTP والمحفظة ✓" : "Verify & Complete ✓"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

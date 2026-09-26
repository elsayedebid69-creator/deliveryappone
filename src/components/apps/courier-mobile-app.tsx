import { useState, useEffect } from "react";
import {
  Bike,
  Navigation,
  Phone,
  MessageSquare,
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
  Headphones,
  Menu as MenuIcon,
  X,
  CreditCard,
  Calendar,
  Inbox,
  Award,
  Settings as SettingsIcon,
  User,
  Flame,
  BookOpen,
  DollarSign,
  ChevronLeft,
  Bell,
  Check,
  Radio,
  Share2,
  Gift,
  HelpCircle,
  LogOut,
  Sliders,
  Send,
  ArrowRight,
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
  distance: string;
  eta: string;
  step: 1 | 2 | 3 | 4; // 1: go to kitchen, 2: pick up, 3: go to customer, 4: delivered
  otp: string;
}

export function CourierMobileApp() {
  const { lang, tn } = useI18n();
  const ar = lang === "ar";

  // Captain status
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "map" | "drawer" | "wallet" | "payouts" | "inbox" | "schedule" | "scoring" | "rewards" | "quests" | "settings" | "profile"
  >("map");

  // Incoming Order State
  const [showIncomingOrder, setShowIncomingOrder] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);

  // Delivery Execution State
  const [inputOtp, setInputOtp] = useState("");
  const [showProofModal, setShowProofModal] = useState(false);

  // Sub-screen States
  const [walletSubTab, setWalletSubTab] = useState<"main" | "deposit" | "withdraw_alert">("main");
  const [depositProvider, setDepositProvider] = useState<"stc_pay" | "onecard">("stc_pay");
  const [oneCardCode, setOneCardCode] = useState("");
  const [payoutCalendarOpen, setPayoutCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(26);
  const [inboxCategory, setInboxCategory] = useState<"all" | "actions" | "alerts" | "offers">("all");
  const [scheduleSubTab, setScheduleSubTab] = useState<"my_shifts" | "history" | "leaves">("my_shifts");
  const [scoringSubTab, setScoringSubTab] = useState<"current" | "history">("current");
  const [rewardsSubTab, setRewardsSubTab] = useState<"vouchers" | "achievements">("vouchers");
  const [selectedVoucherModal, setSelectedVoucherModal] = useState<any | null>(null);
  const [notificationTestBanner, setNotificationTestBanner] = useState(false);
  const [chatLanguage, setChatLanguage] = useState<"ar" | "en" | "ur">("ar");
  const [selectedNavigationApp, setSelectedNavigationApp] = useState<"mapbox" | "google_maps">("mapbox");

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
          ? "🟢 متصل الآن! رادار FOODHUB يبحث عن أقرب الطلبات"
          : "🟢 ONLINE! Searching for nearby dispatches"
        : ar
        ? "⚪ تم إيقاف العمل مؤقتاً (لا يعمل)"
        : "⚪ Offline / Shift paused"
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
      id: "del-948",
      orderNumber: "ORD-9482",
      kitchenName: "مطبخ FoodHub المركزي - فرع النرجس",
      kitchenAddress: "طريق عثمان بن عفان، الرياض",
      customerName: "فارس موسى المطيري",
      customerPhone: "0556133915",
      customerAddress: "حي النرجس، مخرج 7، فيلا 18 - الرياض",
      items: ["2x سماش برجر كلاسيك دبل", "1x شاورما عربي دجاج", "2x كولا دايت"],
      earnings: 24.5,
      distance: "2.8 كم",
      eta: "14 دقيقة",
      step: 1,
      otp: "5821",
    });
    toast.success(ar ? "⚡ تم قبول الطلب! توجه فوراً إلى المطبخ" : "⚡ Order Accepted! Head to the Kitchen");
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
      toast.error(ar ? "رمز التحقق OTP غير صحيح (جرب 5821 أو 1234)" : "Invalid OTP (try 5821 or 1234)");
      return;
    }
    sounds.playSuccess();
    setShowProofModal(false);
    setInputOtp("");
    const earnings = activeDelivery.earnings;
    setActiveDelivery(null);
    toast.success(
      ar
        ? `🎉 تم تسليم الطلب بنجاح! أضيفت ${earnings} ر.س لمحفظتك`
        : `🎉 Delivered! Added ${earnings} SAR to wallet`
    );
  };

  // Test Notification Diagnostic
  const runNotificationDiagnostic = () => {
    sounds.playClick();
    toast.loading(ar ? "جارٍ التحقق من إعدادات الإشعارات..." : "Checking notification permissions...");
    setTimeout(() => {
      sounds.playSuccess();
      toast.dismiss();
      setNotificationTestBanner(true);
      toast.success(ar ? "🎉 All good! إشعاراتك تعمل وجاهزة لاستقبال الطلبات" : "All good! Notifications ready");
      setTimeout(() => setNotificationTestBanner(false), 5000);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center selection:bg-amber-500 selection:text-slate-950 md:py-6 md:px-4">
      {/* 
        SMARTPHONE DEVICE WRAPPER:
        - Mobile View: 100% full screen edge-to-edge native app experience
        - Desktop / Lovable Preview: High-end smartphone container with notch and status bar
      */}
      <div className="w-full md:max-w-[420px] min-h-screen md:min-h-[860px] md:h-[92vh] md:max-h-[920px] bg-slate-950 flex flex-col md:rounded-[48px] md:border-[7px] md:border-slate-800 md:shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)] relative overflow-hidden">
        {/* TOP STATUS BAR (On Desktop Mockup) */}
        <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 select-none text-[11px] font-semibold text-slate-400 bg-slate-950 z-30 shrink-0">
          <span>5:24</span>
          {/* Dynamic Island Notch */}
          <div className="h-5 w-24 bg-black rounded-full flex items-center justify-center border border-slate-800/80 shadow-inner">
            <span className={`size-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="font-bold text-slate-300">4G LTE</span>
            <div className="w-4 h-2.5 rounded-sm border border-slate-400 p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-300 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* TEST NOTIFICATION BANNER POPUP (Simulating OS Notification) */}
        {notificationTestBanner && (
          <div className="absolute top-10 inset-x-3 z-50 p-3 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-2xl text-white animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-start gap-2.5">
              <div className="size-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                FH
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400">FOODHUB Captain</span>
                  <span className="text-[9px] text-slate-400">منذ لحظات</span>
                </div>
                <h4 className="text-xs font-black text-white mt-0.5">هذا إشعار اختبار 🔔</h4>
                <p className="text-[10px] text-slate-300 leading-tight">
                  هذا ما يبدو عليه إشعار الطلبات والإسناد في تطبيق FOODHUB Rider.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: RADAR & MAP SCREEN (THE MAIN COCKPIT) */}
        {/* ============================================================== */}
        {activeTab === "map" && (
          <div className="flex-1 relative flex flex-col overflow-hidden bg-slate-950">
            {/* Top Bar on Radar */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4">
              {/* Support Headset */}
              <button
                onClick={() => {
                  sounds.playClick();
                  toast.info(ar ? "📞 جاري الاتصال بالدعم الفني للكباتن..." : "Contacting Captain Support...");
                }}
                className="size-10 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                title="الدعم الفني"
              >
                <Headphones className="size-5" />
              </button>

              {/* Status Capsule Toggle */}
              <button
                onClick={toggleAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md text-xs font-black shadow-xl transition-all active:scale-95 ${
                  isOnline
                    ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-emerald-500/20"
                    : "bg-slate-900/90 border-slate-800 text-slate-300"
                }`}
              >
                <span className={`size-2.5 rounded-full ${isOnline ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                <span>
                  {isOnline
                    ? (ar ? "الحالة: يعمل 🟢" : "Status: Online 🟢")
                    : (ar ? "الحالة: لا يعمل" : "Status: Offline")}
                </span>
              </button>

              {/* Drawer Menu Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("drawer");
                }}
                className="relative size-10 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                title="القائمة"
              >
                <MenuIcon className="size-5" />
                <span className="absolute 0 end-0 size-2.5 rounded-full bg-red-500 ring-2 ring-slate-950" />
              </button>
            </div>

            {/* Dark Styled Map Simulator */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a1122] to-slate-950 select-none">
              {/* Subtle Road & District Grid Lines */}
              <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="roadGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                    <circle cx="60" cy="60" r="1.5" fill="#334155" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#roadGrid)" />
                <path d="M -20 180 Q 150 240 450 160" fill="none" stroke="#334155" strokeWidth="4" />
                <path d="M 220 -20 Q 200 280 180 600" fill="none" stroke="#334155" strokeWidth="3" />
                <path d="M 80 400 Q 250 350 450 480" fill="none" stroke="#334155" strokeWidth="2.5" />
              </svg>

              {/* District Labels */}
              <div className="absolute top-28 start-10 text-[10px] font-bold text-slate-500 tracking-wider">
                حي النرجس
              </div>
              <div className="absolute top-36 end-12 text-[10px] font-bold text-slate-500 tracking-wider">
                طريق عثمان بن عفان
              </div>
              <div className="absolute top-64 start-14 text-[10px] font-bold text-slate-500 tracking-wider">
                حي الياسمين
              </div>
              <div className="absolute bottom-48 end-16 text-[10px] font-bold text-slate-500 tracking-wider">
                طريق أنس بن مالك
              </div>

              {/* Hotspot Alert Circle (Demand zone from video) */}
              <div className="absolute top-44 start-20 size-14 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-sm">2</span>
              </div>

              {/* Captain GPS Beacon Position (Heading Cone & Blue Pulse) */}
              <div className="absolute top-[48%] start-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                {/* Heading Beam / Cone */}
                <div className="w-16 h-20 bg-gradient-to-t from-cyan-400/30 to-transparent clip-triangle blur-[1px] -mb-4 pointer-events-none" />
                {/* Glowing Dot */}
                <div className="relative size-6 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative size-4 rounded-full bg-cyan-400 ring-4 ring-white shadow-xl shadow-cyan-500/50" />
                </div>
              </div>

              {/* Simulator Action Chip (Floating Test Dispatch Button) */}
              <div className="absolute bottom-44 inset-x-4 flex justify-center pointer-events-auto">
                <button
                  onClick={simulateNewOrderDispatch}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md text-xs font-bold hover:bg-amber-500/30 transition-all shadow-lg active:scale-95"
                >
                  <Sparkles className="size-3.5 text-amber-400" />
                  <span>{ar ? "🔔 تجربة وصول طلب جديد (محاكاة)" : "Simulate Incoming Dispatch"}</span>
                </button>
              </div>
            </div>

            {/* Bottom Sheet Card ("التسليم" / Active Delivery) */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3 z-20 shrink-0">
              {activeDelivery ? (
                /* ACTIVE DELIVERY CARD */
                <div className="space-y-3 animate-in slide-in-from-bottom-3 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-xs">
                        {activeDelivery.orderNumber}
                      </span>
                      <span className="text-xs font-black text-white">{activeDelivery.kitchenName}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400">
                      +{activeDelivery.earnings} {ar ? "ر.س" : "SAR"}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>{ar ? "العميل:" : "Customer:"} {activeDelivery.customerName}</span>
                      <a
                        href={`tel:${activeDelivery.customerPhone}`}
                        onClick={() => sounds.playClick()}
                        className="text-cyan-400 font-bold flex items-center gap-1"
                      >
                        <Phone className="size-3" />
                        <span>{activeDelivery.customerPhone}</span>
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{activeDelivery.customerAddress}</p>
                  </div>

                  {/* Step Action Button */}
                  <Button
                    onClick={advanceDeliveryStep}
                    className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                  >
                    {activeDelivery.step === 1 && (ar ? "📍 وصلت إلى المطبخ" : "Arrived at Kitchen")}
                    {activeDelivery.step === 2 && (ar ? "📦 تأكيد استلام الوجبات والتحرك للعميل" : "Pick Up & Head to Customer")}
                    {activeDelivery.step === 3 && (ar ? "✨ تسليم الطلب للعميل (إدخال OTP)" : "Deliver & Enter OTP")}
                  </Button>
                </div>
              ) : (
                /* DEFAULT GO ONLINE SHEET (As seen in video) */
                <div className="space-y-2.5">
                  <div className="text-start">
                    <h3 className="font-black text-sm text-white">{ar ? "التسليم" : "Delivery Shift"}</h3>
                    <p className="text-xs text-slate-400">
                      {isOnline
                        ? (ar ? "أنت متصل الآن وتستقبل أقرب الطلبات" : "You are currently online receiving orders")
                        : (ar ? "ابدأ التسليم الآن وتوقف متى شئت" : "Start delivering now and stop whenever you want")}
                    </p>
                  </div>

                  <Button
                    onClick={toggleAvailability}
                    className={`w-full h-12 text-sm font-black rounded-2xl transition-all shadow-xl active:scale-[0.99] ${
                      isOnline
                        ? "bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/30"
                        : "bg-white text-slate-950 hover:bg-slate-200"
                    }`}
                  >
                    {isOnline ? (ar ? "إيقاف العمل مؤقتاً" : "Pause Shift") : (ar ? "إبدأ العمل" : "Go Online")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: THE HUNGERSTATION-STYLE SIDE DRAWER */}
        {/* ============================================================== */}
        {activeTab === "drawer" && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-right duration-200">
            {/* Header Greeting */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 p-0.5 shadow-md shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-black text-base text-amber-400">
                    ف.م
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">
                    {ar ? "مرحبا، فارس موسى المطيري 👋" : "Welcome, Faris Al-Mutairi 👋"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-0.5">
                    <span className="text-amber-400">فئة Silver ⭐</span>
                    <span>•</span>
                    <span className="text-emerald-400">قبول 100%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("map");
                }}
                className="size-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 4 Quick Tiles Grid (علبة الوارد، الجدول، المحفظة، الدفعات) */}
            <div className="p-4 grid grid-cols-2 gap-2.5 border-b border-slate-800">
              {/* 1. Inbox */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("inbox");
                }}
                className="relative p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center gap-1 text-center transition-all group"
              >
                <Inbox className="size-5 text-slate-300 group-hover:text-amber-400" />
                <span className="text-xs font-black text-white">{ar ? "علبة الوارد" : "Inbox"}</span>
                <span className="absolute top-2 start-2 px-1.5 py-0.2 rounded-full bg-red-500 text-white font-black text-[9px]">
                  65
                </span>
              </button>

              {/* 2. Schedule */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("schedule");
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center gap-1 text-center transition-all group"
              >
                <Clock className="size-5 text-slate-300 group-hover:text-amber-400" />
                <span className="text-xs font-black text-white">{ar ? "الجدول" : "Schedule"}</span>
              </button>

              {/* 3. Wallet */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("wallet");
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center gap-1 text-center transition-all group"
              >
                <CreditCard className="size-5 text-slate-300 group-hover:text-amber-400" />
                <span className="text-xs font-black text-white">{ar ? "المحفظة" : "Wallet"}</span>
              </button>

              {/* 4. Payouts */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("payouts");
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col items-center justify-center gap-1 text-center transition-all group"
              >
                <DollarSign className="size-5 text-slate-300 group-hover:text-amber-400" />
                <span className="text-xs font-black text-white">{ar ? "الدفعات" : "Payouts"}</span>
              </button>
            </div>

            {/* Menu List Items */}
            <div className="p-3 space-y-1 text-xs font-bold">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("profile");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="size-4 text-slate-400" />
                  <span>{ar ? "ملفي الشخصي والوثائق" : "My Profile & Docs"}</span>
                </div>
                <ChevronLeft className="size-4 rtl:rotate-0 rotate-180 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("quests");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="size-4 text-amber-400" />
                  <span>{ar ? "الفرص والمهام (Quests)" : "Quests & Tasks"}</span>
                </div>
                <ChevronLeft className="size-4 rtl:rotate-0 rotate-180 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("rewards");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="size-4 text-yellow-400" />
                  <span>{ar ? "متجر المكافآت (193 نقطة)" : "Rewards Store (193 pts)"}</span>
                </div>
                <ChevronLeft className="size-4 rtl:rotate-0 rotate-180 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("scoring");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="size-4 text-cyan-400" />
                  <span>{ar ? "تقييم الأداء (Scoring & Tiers)" : "Scoring & Guidance"}</span>
                </div>
                <ChevronLeft className="size-4 rtl:rotate-0 rotate-180 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("settings");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <SettingsIcon className="size-4 text-slate-400" />
                  <span>{ar ? "الإعدادات وفحص الإشعارات" : "Settings"}</span>
                </div>
                <ChevronLeft className="size-4 rtl:rotate-0 rotate-180 text-slate-500" />
              </button>
            </div>

            <div className="p-4 mt-auto border-t border-slate-900 text-[10px] text-slate-500 flex items-center justify-between">
              <span>FOODHUB Captain v4.2639.1</span>
              <span>أسطول الرياض</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: WALLET SCREEN (المحفظة - As seen in video) */}
        {/* ============================================================== */}
        {activeTab === "wallet" && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-left duration-200">
            {/* Header with Back button */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("map");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ChevronRight className="size-4 rtl:rotate-0 rotate-180" />
                <span>{ar ? "المحفظة" : "Wallet"}</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Balance Card */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
                <div className="text-[11px] text-slate-400 font-bold">{ar ? "الرصيد الحالي" : "Current Balance"}</div>
                <div className="text-3xl font-black text-white">
                  16.78 <span className="text-sm font-bold text-amber-400">{ar ? "ر.س." : "SAR"}</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  {ar ? "الرصيد بما في ذلك الموجود في قائمة الانتظار: 16.78 ر.س." : "Including pending: 16.78 SAR"}
                </p>

                {/* Threshold Slider Bar */}
                <div className="pt-2">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="w-2/3 h-full bg-amber-500" />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 pt-1">
                    <span>-1 ر.س.</span>
                    <span>0 ر.س.</span>
                  </div>
                </div>

                {/* Action Buttons: Pay & Top up */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => {
                      sounds.playClick();
                      toast.error(
                        ar
                          ? "لا يمكنك السحب الآن: رصيد محفظتك أقل من الحد الأدنى المطلوب لبدء التحويل (100 ر.س)."
                          : "Cannot withdraw now: Balance is below threshold."
                      );
                    }}
                    className="w-full h-11 bg-white hover:bg-slate-200 text-slate-950 font-black rounded-xl text-xs"
                  >
                    {ar ? "الدفع" : "Payout / Withdraw"}
                  </Button>

                  <Button
                    onClick={() => {
                      sounds.playClick();
                      setWalletSubTab("deposit");
                    }}
                    className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black rounded-xl text-xs"
                  >
                    {ar ? "شحن (إيداع)" : "Deposit / Top up"}
                  </Button>
                </div>
              </div>

              {/* Deposit Submodal */}
              {walletSubTab === "deposit" && (
                <div className="rounded-3xl bg-slate-900 border border-amber-500/40 p-4 space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white">
                      {ar ? "حدد مزود الخدمة الخاص بك للمتابعة" : "Select Payment Provider"}
                    </h4>
                    <button
                      onClick={() => setWalletSubTab("main")}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setDepositProvider("stc_pay");
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                        depositProvider === "stc_pay"
                          ? "bg-amber-500/20 border-amber-400 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <span>STC Pay</span>
                      <span className="text-[10px] text-amber-400">سداد فوري ⚡</span>
                    </button>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setDepositProvider("onecard");
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                        depositProvider === "onecard"
                          ? "bg-amber-500/20 border-amber-400 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <span>OneCard</span>
                      <span className="text-[10px] text-slate-400">بطاقات مسبقة الدفع</span>
                    </button>
                  </div>

                  {depositProvider === "stc_pay" ? (
                    <div className="pt-2 space-y-2">
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {ar ? "نفّذ إيداعاً عبر STC Pay لإكمال شحن المحفظة فوراً." : "Make a deposit via STC Pay."}
                      </p>
                      <Button
                        onClick={() => {
                          sounds.playSuccess();
                          toast.success(ar ? "تم التحويل إلى تطبيق STC Pay" : "Redirecting to STC Pay");
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl h-10"
                      >
                        {ar ? "الذهاب إلى STC Pay" : "Open STC Pay"}
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-2 space-y-2">
                      <input
                        type="text"
                        maxLength={14}
                        value={oneCardCode}
                        onChange={(e) => setOneCardCode(e.target.value)}
                        placeholder="أدخل الرمز المكون من 14 رقماً"
                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                      <Button
                        onClick={() => {
                          if (oneCardCode.length < 10) {
                            toast.error(ar ? "يرجى كتابة رمز الكرت الصحيح" : "Invalid code");
                            return;
                          }
                          sounds.playSuccess();
                          toast.success(ar ? "تم شحن المحفظة بنجاح بمبلغ 100 ر.س" : "Top up successful!");
                          setWalletSubTab("main");
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl h-10"
                      >
                        {ar ? "تأكيد الشحن" : "Confirm"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Transactions List */}
              <div className="space-y-2">
                <h4 className="font-black text-xs text-white">{ar ? "المعاملات الحديثة" : "Recent Transactions"}</h4>

                <div className="space-y-1.5">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-400">{ar ? "الدفعة الأساسية" : "Base Pay"}</div>
                      <div className="text-[10px] text-slate-500">السبت، 26 سبتمبر • 13:16</div>
                    </div>
                    <span className="text-xs font-black text-emerald-400">+14.30 ر.س.</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-300">{ar ? "التحصيل" : "Collection"}</div>
                      <div className="text-[10px] text-slate-500">السبت، 26 سبتمبر • 13:16</div>
                    </div>
                    <span className="text-xs font-black text-red-400">-200.54 ر.س.</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{ar ? "إيداع مالي" : "Deposit"}</div>
                      <div className="text-[10px] text-slate-500">السبت، 26 سبتمبر • 13:16</div>
                    </div>
                    <span className="text-xs font-black text-white">+150.00 ر.س.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: PAYOUTS SCREEN (الدفعات الأسبوعية) */}
        {/* ============================================================== */}
        {activeTab === "payouts" && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("map");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ChevronRight className="size-4 rtl:rotate-0 rotate-180" />
                <span>{ar ? "الدفعات" : "Payouts"}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setPayoutCalendarOpen(true);
                }}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Calendar className="size-4 text-amber-400" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold">{ar ? "أسبوع 39 • 21 - 27 سبتمبر" : "Week 39"}</div>
                <div className="text-2xl font-black text-white">
                  827.75 <span className="text-sm font-bold text-amber-400">{ar ? "ر.س." : "SAR"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>المتوسط في الساعة: 14.20 ر.س.</span>
                  <span>18 ساعة و 58 دقيقة</span>
                </div>
              </div>

              {/* Days breakdown list */}
              <div className="space-y-2">
                {[
                  { dayAr: "السبت، 26 سبتمبر", earnings: "193.28", count: 13 },
                  { dayAr: "الخميس، 24 سبتمبر", earnings: "87.27", count: 7 },
                  { dayAr: "الأربعاء، 23 سبتمبر", earnings: "149.81", count: 9 },
                  { dayAr: "الثلاثاء، 22 سبتمبر", earnings: "190.52", count: 15 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.dayAr}</div>
                      <div className="text-[10px] text-slate-500">تم إكمال {item.count} deliveries</div>
                    </div>
                    <span className="text-xs font-black text-emerald-400">{item.earnings} ر.س.</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout Calendar Modal */}
            {payoutCalendarOpen && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-4">
                <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 animate-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white">{ar ? "سبتمبر 2026" : "September 2026"}</h4>
                    <button
                      onClick={() => setPayoutCalendarOpen(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
                    {["ن", "ث", "ر", "خ", "ج", "س", "ح"].map((d, i) => (
                      <span key={i} className="text-slate-500">{d}</span>
                    ))}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const day = i + 1;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDate(day)}
                          className={`h-7 rounded-lg flex items-center justify-center transition-all ${
                            selectedDate === day
                              ? "bg-amber-500 text-slate-950 font-black"
                              : "text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => {
                      sounds.playClick();
                      setPayoutCalendarOpen(false);
                      toast.success(`تم اختيار يوم ${selectedDate} سبتمبر`);
                    }}
                    className="w-full bg-white text-slate-950 font-black text-xs rounded-xl h-10"
                  >
                    {ar ? "اختر التاريخ" : "Select Date"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: INBOX SCREEN (علبة الوارد) */}
        {/* ============================================================== */}
        {activeTab === "inbox" && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("map");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ChevronRight className="size-4 rtl:rotate-0 rotate-180" />
                <span>{ar ? "علبة الوارد" : "Inbox"}</span>
              </button>
            </div>

            {/* Sub-tabs: جميع الرسائل، ما يجب القيام به، تنبيهات */}
            <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar scrollbar-none">
              {[
                { id: "all", label: "جميع الرسائل (65)" },
                { id: "actions", label: "ما يجب القيام به (44)" },
                { id: "alerts", label: "تنبيهات (21)" },
                { id: "offers", label: "العروض" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setInboxCategory(tab.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                    inboxCategory === tab.id
                      ? "bg-white text-slate-950"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Messages Cards */}
            <div className="p-4 space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-bold text-red-400">COMPLIANCE ⚠️</span>
                  <span>08:47</span>
                </div>
                <h4 className="text-xs font-black text-white">التعرف على الوجه</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  عزيزي المندوب، لقد لاحظنا أن صورة التحقق من الهوية الخاصة بك غير متطابقة لصورتك الشخصية...
                </p>
                <button
                  onClick={() => toast.info("توجه لتحديث صورة التحقق")}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-amber-400 font-bold text-[10px]"
                >
                  ما يجب القيام به
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-bold text-emerald-400">تم السداد بنجاح ✓</span>
                  <span>01:34</span>
                </div>
                <h4 className="text-xs font-black text-white">تم سداد الرصيد المستحق</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  تم سداد الرصيد المستحق في حسابك وتم تفعيل حسابك بنجاح. يمكنك استئناف العمل الآن.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-bold text-cyan-400">ANNOUNCEMENTS 📢</span>
                  <span>أمس</span>
                </div>
                <h4 className="text-xs font-black text-white">خاصية الترجمة الفورية</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  لتسهيل تواصلك مع العملاء، يرجى العلم أننا قمنا بتحسين خاصية الترجمة اللحظية داخل المحادثة.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: SCORING & GUIDANCE SCREEN (التقدم والإرشادات) */}
        {/* ============================================================== */}
        {activeTab === "scoring" && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("map");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ChevronRight className="size-4 rtl:rotate-0 rotate-180" />
                <span>{ar ? "التقدم والإرشادات" : "Scoring"}</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Tier Progress Card */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white">ستُحتسب فئتك التالية</h4>
                  <p className="text-[10px] text-slate-400">بعد 1 من الأيام، في 28 سبتمبر</p>
                  <span className="text-[11px] text-amber-400 font-bold mt-1 inline-block">اكتشاف المزيد &gt;</span>
                </div>
                <div className="size-16 rounded-full border-4 border-amber-500/80 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] text-slate-400">اليوم</span>
                  <span className="text-xs font-black text-white">6/7</span>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-white">عرض أدائك الآن</h4>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">معدل القبول</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-500/30">
                    100.00%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">عمليات التسليم</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-white font-black text-xs">
                    56 طلب
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">الساعات النشطة</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs">
                    57H 42M
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">الساعات المميزة (Peak)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-black text-xs">
                    6H 34M
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 7: SETTINGS SCREEN (الإعدادات وفحص الإشعارات) */}
        {/* ============================================================== */}
        {activeTab === "settings" && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("map");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ChevronRight className="size-4 rtl:rotate-0 rotate-180" />
                <span>{ar ? "الإعدادات" : "Settings"}</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Notification Diagnostic Box */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Bell className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">التحقق من الإشعارات</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      تأكد من عدم تفويت أي إشعار أو طلب إسناد من التطبيق.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={runNotificationDiagnostic}
                  className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  {ar ? "تحقق الآن" : "Check Now"}
                </Button>
              </div>

              {/* Preferences List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-white">تفضيلاتك</h4>

                {/* Chat Language */}
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">لغة المحادثة</span>
                  <div className="flex gap-1.5">
                    {["ar", "en", "ur"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setChatLanguage(l as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          chatLanguage === l ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {l === "ar" ? "العربية" : l === "en" ? "English" : "الأردية"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation App Preference */}
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">تطبيق الملاحة</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedNavigationApp("mapbox")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        selectedNavigationApp === "mapbox"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      مدمج (Mapbox)
                    </button>
                    <button
                      onClick={() => setSelectedNavigationApp("google_maps")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        selectedNavigationApp === "google_maps"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Google Maps
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">المظهر</span>
                  <span className="text-xs font-bold text-amber-400">داكن (Dark) ✓</span>
                </div>
              </div>

              {/* Legal & Version */}
              <div className="pt-2 text-xs space-y-2 border-t border-slate-900">
                <button
                  onClick={() => toast.info("فتح سياسة الخصوصية")}
                  className="w-full text-start text-slate-400 hover:text-white"
                >
                  سياسة الخصوصية
                </button>
                <button
                  onClick={() => toast.info("فتح تراخيص مفتوحة المصدر")}
                  className="w-full text-start text-slate-400 hover:text-white"
                >
                  تراخيص مفتوحة المصدر
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    toast.success("تم تسجيل الخروج");
                  }}
                  className="w-full text-start text-red-400 font-bold pt-2"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 8: REWARDS STORE (المكافآت - 193 نقطة) */}
        {/* ============================================================== */}
        {activeTab === "rewards" && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto no-scrollbar scrollbar-none animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab("map");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ChevronRight className="size-4 rtl:rotate-0 rotate-180" />
                <span>{ar ? "المكافآت" : "Rewards"}</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">رصيد النقاط (نقطة واحدة لكل طلب)</span>
                  <div className="text-2xl font-black text-amber-400 flex items-center gap-1 mt-0.5">
                    <span>193</span>
                    <span className="text-sm text-yellow-300">🪙</span>
                  </div>
                </div>
                <Button
                  onClick={() => toast.info("أكمل 5 طلبات لكسب 50 نقطة إضافية")}
                  className="bg-slate-800 text-white text-[10px] h-8 rounded-xl"
                >
                  كسب المزيد
                </Button>
              </div>

              {/* Vouchers Cards */}
              <div className="space-y-2.5">
                {[
                  { cost: 250, title: "5 SAR قسيمة في متجر المندوب" },
                  { cost: 500, title: "10 SAR قسيمة في متجر المندوب" },
                  { cost: 1000, title: "20 SAR قسيمة في متجر المندوب" },
                  { cost: 2500, title: "50 SAR قسيمة في متجر المندوب" },
                ].map((v, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-black text-white">{v.title}</div>
                      <div className="text-[10px] text-amber-400 font-bold mt-0.5">{v.cost} نقطة 🪙</div>
                    </div>
                    <Button
                      onClick={() => {
                        sounds.playClick();
                        toast.info(`تحتاج إلى ${v.cost - 193} نقطة إضافية للمطالبة بهذه القسيمة.`);
                      }}
                      className="h-8 bg-slate-800 text-slate-300 hover:text-white text-[11px] rounded-xl"
                    >
                      شاهد التفاصيل
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 9: INCOMING ORDER DISPATCH OVERLAY MODAL (SIREN ALERT) */}
        {/* ============================================================== */}
        {showIncomingOrder && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-end p-4 animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-full rounded-3xl bg-slate-900 border-2 border-amber-500 p-5 space-y-4 shadow-2xl">
              {/* Countdown Bar & Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500 animate-ping" />
                  <span className="font-black text-xs text-amber-400 uppercase tracking-wider">
                    {ar ? "طلب إسناد جديد فوري ⚡" : "New Dispatch Alert ⚡"}
                  </span>
                </div>
                <div className="size-8 rounded-full border-2 border-amber-400 flex items-center justify-center font-mono font-black text-xs text-white">
                  {countdown}
                </div>
              </div>

              {/* Payout & Distance */}
              <div className="flex items-baseline justify-between border-y border-slate-800 py-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold">{ar ? "أجر التوصيل للكابتن" : "Payout"}</span>
                  <div className="text-2xl font-black text-amber-400">
                    24.50 <span className="text-xs font-bold text-white">{ar ? "ر.س" : "SAR"}</span>
                  </div>
                </div>
                <div className="text-end">
                  <span className="text-[10px] text-slate-400 font-bold">{ar ? "المسافة والزمن" : "Distance & ETA"}</span>
                  <div className="text-sm font-black text-white">2.8 كم • 14 دقيقة</div>
                </div>
              </div>

              {/* Route Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 font-black">1.</span>
                  <div>
                    <div className="font-black text-white">مطبخ FoodHub المركزي (فرع النرجس)</div>
                    <div className="text-[10px] text-slate-400">طريق عثمان بن عفان، الرياض</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-black">2.</span>
                  <div>
                    <div className="font-black text-white">حي النرجس، مخرج 7 (العميل)</div>
                    <div className="text-[10px] text-slate-400">فيلا 18، بالقرب من المسجد</div>
                  </div>
                </div>
              </div>

              {/* Accept & Decline Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={acceptIncomingOrder}
                  className="h-12 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30"
                >
                  {ar ? "قبول الطلب ⚡" : "Accept Dispatch"}
                </Button>

                <Button
                  onClick={() => {
                    sounds.playClick();
                    setShowIncomingOrder(false);
                    toast.info(ar ? "تم تخطي الطلب" : "Declined order");
                  }}
                  className="h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl"
                >
                  {ar ? "رفض الطلب" : "Decline"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 10: OTP CONFIRMATION MODAL (HANDOVER) */}
        {/* ============================================================== */}
        {showProofModal && activeDelivery && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-center shadow-2xl">
              <div className="size-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <KeyRound className="size-7" />
              </div>

              <div>
                <h3 className="font-black text-sm text-white">
                  {ar ? "تأكيد تسليم الطلب للعميل" : "Confirm Delivery Handover"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {ar ? "اطلب من العميل رمز التحقق المكون من 4 أرقام" : "Ask customer for the 4-digit OTP"}
                </p>
                <span className="text-[10px] text-amber-400 font-mono">
                  {ar ? "(رمز الاختبار: 5821 أو 1234)" : "(Test OTP: 5821)"}
                </span>
              </div>

              <input
                type="text"
                maxLength={4}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value)}
                placeholder="• • • •"
                className="w-36 mx-auto h-12 text-center font-mono font-black text-2xl tracking-widest rounded-xl bg-slate-950 border border-slate-700 text-amber-400 focus:outline-none focus:border-amber-400"
              />

              <div className="space-y-2">
                <Button
                  onClick={completeDeliveryWithOtp}
                  className="w-full h-11 bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 font-black text-xs rounded-xl"
                >
                  {ar ? "تأكيد التسليم وإنهاء المشوار ✓" : "Confirm Delivery ✓"}
                </Button>

                <button
                  onClick={() => setShowProofModal(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {ar ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

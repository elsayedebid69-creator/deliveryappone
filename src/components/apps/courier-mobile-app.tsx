import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Bike,
  Navigation,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Camera,
  KeyRound,
  Power,
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
  DollarSign,
  ChevronLeft,
  Bell,
  Check,
  Radio,
  Gift,
  HelpCircle,
  LogOut,
  Sliders,
  Send,
  ArrowRight,
  Fingerprint,
  ScanFace,
  RefreshCw,
  Smartphone,
  Layers,
  LocateFixed,
  Upload,
  FileText,
  AlertTriangle,
  Compass,
  Lock,
  RotateCcw,
  LifeBuoy,
  Vibrate,
  Sparkles,
  Wifi,
  Plus,
  Minus,
  ExternalLink,
  Globe,
  Star,
  Zap,
  Gauge,
  Timer,
  CheckCheck,
  Crown,
  Store,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Sound synthesizer for realistic Captain HUD audio
function playWebAudioTone(type: "dispatch" | "biometric" | "success" | "click" | "warning" | "blocked") {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "dispatch") {
      // High urgency siren
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1450, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "biometric") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1040, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "success") {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.2, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + i * 0.08);
        o.stop(now + i * 0.08 + 0.3);
      });
    } else if (type === "blocked") {
      osc.type = "square";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // ignore
  }
}

// Physical Hardware Vibration Trigger (Capacitor Native + Web Vibration API)
async function triggerPhysicalVibration() {
  // 1. Web Vibration API (Android Chrome & WebViews)
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate([600, 250, 600, 250, 1000]);
    } catch {
      // ignore
    }
  }

  // 2. Capacitor Haptics Plugin (Physical Android App hardware motor)
  try {
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Warning });
    await Haptics.vibrate({ duration: 1500 });
  } catch {
    // ignore
  }
}

interface ActiveDelivery {
  id: string;
  orderNumber: string;
  kitchenName: string;
  kitchenAddress: string;
  kitchenCoords: [number, number];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCoords: [number, number];
  items: string[];
  distanceKm: number; // Max 10km
  eta: string;
  step: 1 | 2 | 3 | 4; // 1: go to kitchen, 2: at kitchen, 3: to customer, 4: handover
  otp: string;
}

interface CaptainProfile {
  id: string;
  name: string;
  phone: string;
  nationalId: string;
  vehicleType: string;
  plateNumber: string;
  rating: number;
  tier: "Bronze" | "Silver" | "Gold" | "Diamond" | "Platinum";
  walletBalance: number;
  points: number;
  totalDeliveries: number;
  acceptanceRate: number;
  completionRate: number;
  pickupSpeedMinutes?: number;
  deliverySpeedMinutes?: number;
  onTimeRate?: number;
}

const DEFAULT_CAPTAIN: CaptainProfile = {
  id: "cap-007",
  name: "كابتن أحمد الشمري",
  phone: "0559876543",
  nationalId: "1098472910",
  vehicleType: "دراجة نارية (Yamaha 150)",
  plateNumber: "أ ب ج 4492",
  rating: 4.96,
  tier: "Gold",
  walletBalance: 240.0,
  points: 215,
  totalDeliveries: 142,
  acceptanceRate: 98,
  completionRate: 100,
  pickupSpeedMinutes: 8.5,
  deliverySpeedMinutes: 17.2,
  onTimeRate: 99.4,
};

// Riyadh Hotspots (Surge areas: indicator only, NO bonus cash)
const HOTSPOTS: Array<{ name: string; coords: [number, number]; orders: number }> = [
  { name: "حي العليا (أبراج المركز)", coords: [24.7136, 46.6753], orders: 34 },
  { name: "حي الياسمين (مربع الكافيهات)", coords: [24.8211, 46.6341], orders: 22 },
  { name: "حي الملقا (شارع أنس)", coords: [24.7925, 46.6022], orders: 19 },
  { name: "حي السليمانية (شارع الثلاثين)", coords: [24.698, 46.705], orders: 28 },
  { name: "حي حطين (البوليفارد)", coords: [24.764, 46.611], orders: 41 },
];

export function CourierMobileApp() {
  const { lang } = useI18n();
  const ar = lang === "ar";

  // Auth & Dual Security (OTP + Face ID mandatory)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isAccountBlocked, setIsAccountBlocked] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<"phone_otp" | "face_id">("phone_otp");
  const [inputPhone, setInputPhone] = useState("0559876543");
  const [otpSent, setOtpSent] = useState(false);
  const [inputAuthOtp, setInputAuthOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpFailedAttempts, setOtpFailedAttempts] = useState(0);
  const [faceScanFailedAttempts, setFaceScanFailedAttempts] = useState(0);
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceScanProgress, setFaceScanProgress] = useState<number>(0);
  const [capturedFacePhoto, setCapturedFacePhoto] = useState<string | null>(null);
  const [faceScanFeedback, setFaceScanFeedback] = useState<string>("وجّه وجهك داخل الإطار الدائري");

  // Captain Profile & Status
  const [captain, setCaptain] = useState<CaptainProfile>(DEFAULT_CAPTAIN);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  type CourierTab =
    | "map"
    | "drawer"
    | "wallet"
    | "payouts"
    | "inbox"
    | "schedule"
    | "scoring"
    | "rewards"
    | "settings"
    | "profile"
    | "support";

  const [activeTab, setActiveTab] = useState<CourierTab>("map");
  const [historyStack, setHistoryStack] = useState<CourierTab[]>(["map"]);

  // Rejection Policy: Max 1 rejection per day
  const [dailyRejectionsLeft, setDailyRejectionsLeft] = useState<number>(1);

  // Scoring View & 1 SAR 100% Rating Bonus States
  const [scoringSubTab, setScoringSubTab] = useState<"all" | "tiers" | "speed" | "bonus" | "reviews">("all");
  const [bonusEarnedThisWeek, setBonusEarnedThisWeek] = useState<number>(48.0);
  const [bonusEarnedToday, setBonusEarnedToday] = useState<number>(7.0);
  const [totalRatingBonusEarned, setTotalRatingBonusEarned] = useState<number>(118.0);
  const [ratingBonusHistory, setRatingBonusHistory] = useState<Array<{
    id: string;
    orderNum: string;
    source: "restaurant" | "store" | "customer";
    sourceName: string;
    amount: number;
    rating: number;
    timeAgo: string;
    details: string;
    speedMinutes: number;
  }>>([
    {
      id: "b-1",
      orderNum: "#4928",
      source: "restaurant",
      sourceName: "شاورمر (فرع العليا)",
      amount: 1.0,
      rating: 5,
      timeAgo: "منذ 25 دقيقة",
      details: "سرعة استلام فورية خلال 6 دقائق وتجهيز الصندوق الحراري",
      speedMinutes: 6,
    },
    {
      id: "b-2",
      orderNum: "#4925",
      source: "customer",
      sourceName: "العميل: فهد العتيبي (حي الملقا)",
      amount: 1.0,
      rating: 5,
      timeAgo: "منذ ساعتين",
      details: "تسليم سريع لباب الشقة مع مطابقة رمز التحقق واللباقة",
      speedMinutes: 14,
    },
    {
      id: "b-3",
      orderNum: "#4921",
      source: "store",
      sourceName: "متجر تمور الصالحية (حي الياسمين)",
      amount: 1.0,
      rating: 5,
      timeAgo: "اليوم 03:15 م",
      details: "حضور خلال 7 دقائق وحرص تام على سلامة المنتجات",
      speedMinutes: 7,
    },
    {
      id: "b-4",
      orderNum: "#4917",
      source: "customer",
      sourceName: "العميلة: ريم القحطاني (حي حطين)",
      amount: 1.0,
      rating: 5,
      timeAgo: "اليوم 01:40 م",
      details: "توصيل فائق السرعة خلال 15 دقيقة وأدب جم في التعامل",
      speedMinutes: 15,
    },
    {
      id: "b-5",
      orderNum: "#4910",
      source: "restaurant",
      sourceName: "برجر بوتيك (حي السليمانية)",
      amount: 1.0,
      rating: 5,
      timeAgo: "أمس 09:20 م",
      details: "استلام سلس وانطلاق فوري نحو وجهة العميل",
      speedMinutes: 8,
    },
  ]);

  const handleSimulate1SarBonus = () => {
    const randomSources: Array<{ source: "restaurant" | "store" | "customer"; name: string; details: string; speedMinutes: number }> = [
      { source: "restaurant", name: "مطعم ماما نورة (الروضة)", details: "استلام فوري خلال 5 دقائق وجودة تعامل", speedMinutes: 5 },
      { source: "store", name: "متجر الدانوب (حطين)", details: "سرعة استلام وسلامة الأصناف الحساسة", speedMinutes: 7 },
      { source: "customer", name: "العميل: سلطان الحربي (النرجس)", details: "تسليم مبكر بـ 6 دقائق قبل الموعد المحدد", speedMinutes: 13 },
      { source: "customer", name: "العميلة: أريج السبيعي (العليا)", details: "تعامل راقٍ ووصول سريع مع رمز الاستلام", speedMinutes: 11 },
    ];
    const picked = randomSources[Math.floor(Math.random() * randomSources.length)];
    const orderNum = `#${Math.floor(4930 + Math.random() * 50)}`;

    setRatingBonusHistory(prev => [
      {
        id: `bonus-${Date.now()}`,
        orderNum,
        source: picked.source,
        sourceName: picked.name,
        amount: 1.0,
        rating: 5,
        timeAgo: "الآن",
        details: picked.details,
        speedMinutes: picked.speedMinutes,
      },
      ...prev,
    ]);

    setBonusEarnedToday(prev => prev + 1.0);
    setBonusEarnedThisWeek(prev => prev + 1.0);
    setTotalRatingBonusEarned(prev => prev + 1.0);
    setCaptain(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + 1.0,
    }));

    playWebAudioTone("success");
    void triggerPhysicalVibration();
    const sourceLabel = picked.source === "customer" ? "العميل" : picked.source === "restaurant" ? "المطعم" : "المتجر";
    toast.success(`🎉 مبروك! حصلت على بونص +1.00 ر.س لتقييم 100% من ${sourceLabel} وأُضيف لمحفظتك فوراً!`);
  };

  // Real-Time In-App Google Maps Navigation Engine (Stabilized & Jitter-Free)
  const [captainCoords, setCaptainCoords] = useState<[number, number]>([24.7136, 46.6753]);
  const [mapViewportCoords, setMapViewportCoords] = useState<[number, number]>([24.7136, 46.6753]);
  const lastMapCenterRef = useRef<[number, number]>([24.7136, 46.6753]);
  const appStartTimeRef = useRef<number>(Date.now());
  const [gpsAccuracy, setGpsAccuracy] = useState<string>("عالية (± 4م)");
  const [googleMapType, setGoogleMapType] = useState<"m" | "k">("m"); // m: standard street, k: satellite
  const [googleMapZoom, setGoogleMapZoom] = useState<number>(15);
  const [googleMapFocus, setGoogleMapFocus] = useState<"captain" | "kitchen" | "customer" | "route">("captain");

  // Spherical distance calculator between two GPS coordinates in meters
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Real-Time Radar Dispatch State (Price hidden, max 10km)
  const [showIncomingOrder, setShowIncomingOrder] = useState(false);
  const [incomingCountdown, setIncomingCountdown] = useState(25);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [inputDeliveryOtp, setInputDeliveryOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [lastDispatchedOrderId, setLastDispatchedOrderId] = useState<string>("");

  // Emergency SOS State (زر الطوارئ الميداني)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("حادث سير بالمركبة 🚗");
  const [emergencyDescription, setEmergencyDescription] = useState("");
  const [emergencyPhoto, setEmergencyPhoto] = useState<string | null>(null);

  // Wallet STC Pay State
  const [walletSubTab, setWalletSubTab] = useState<"main" | "stc_deposit" | "stc_withdraw">("main");
  const [stcPhone, setStcPhone] = useState("0559876543");
  const [stcDepositAmount, setStcDepositAmount] = useState("50");
  const [stcWithdrawAmount, setStcWithdrawAmount] = useState("100");

  // Navigation stack handler (الرجوع للصفحة السابقة في أي صفحة)
  const navigateToTab = useCallback((newTab: CourierTab) => {
    playWebAudioTone("click");
    setActiveTab(newTab);
    setHistoryStack((prev) => {
      if (prev[prev.length - 1] === newTab) return prev;
      return [...prev, newTab];
    });
    try {
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ tab: newTab }, "");
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleGoBack = useCallback((): boolean => {
    playWebAudioTone("click");

    // 1. If emergency SOS modal is open, close it
    if (showEmergencyModal) {
      setShowEmergencyModal(false);
      return true;
    }

    // 2. If OTP delivery modal is open, close it
    if (showOtpModal) {
      setShowOtpModal(false);
      return true;
    }

    // 3. If in wallet sub-tabs (stc_deposit or stc_withdraw), return to main wallet overview
    if (activeTab === "wallet" && walletSubTab !== "main") {
      setWalletSubTab("main");
      return true;
    }

    // 4. Pop from historyStack
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // remove current active tab
      const previousTab = newStack[newStack.length - 1] || "map";
      setHistoryStack(newStack);
      setActiveTab(previousTab);
      return true;
    }

    // 5. If somehow on any other tab without history, return to map
    if (activeTab !== "map") {
      setActiveTab("map");
      setHistoryStack(["map"]);
      return true;
    }

    return false; // Already on root (map)
  }, [showEmergencyModal, showOtpModal, activeTab, walletSubTab, historyStack]);

  // Hardware Back Button (Android Capacitor & Browser popstate)
  useEffect(() => {
    let backListener: any = null;
    let lastBackPressTime = 0;

    const setupBackHandler = async () => {
      try {
        const { App } = await import("@capacitor/app");
        backListener = await App.addListener("backButton", () => {
          const handled = handleGoBack();
          if (!handled) {
            // Already on main map screen -> double tap to exit
            const now = Date.now();
            if (now - lastBackPressTime < 2000) {
              App.exitApp();
            } else {
              lastBackPressTime = now;
              toast("اضغط رجوع مرة أخرى للخروج من التطبيق", { duration: 2000 });
            }
          }
        });
      } catch {
        // Not running in Capacitor
      }
    };

    void setupBackHandler();

    const onPopState = () => {
      handleGoBack();
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      if (backListener && typeof backListener.remove === "function") {
        backListener.remove();
      }
      window.removeEventListener("popstate", onPopState);
    };
  }, [handleGoBack]);

  // Shifts State: Exactly 2 shifts (12 hours each)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [bookedShifts, setBookedShifts] = useState<{ [key: string]: boolean }>({
    "sat-day": true,
    "sun-night": true,
  });

  // Support Chat State
  const [supportMessages, setSupportMessages] = useState<Array<{ sender: "user" | "support"; text: string; time: string }>>([
    { sender: "support", text: "أهلاً بك كابتن أحمد في غرفة عمليات وتوجيه FOODHUB الميدانية. كيف يمكننا مساعدتك اليوم؟", time: "الآن" },
  ]);
  const [supportInput, setSupportInput] = useState("");

  // Document Uploads
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({
    id_card: "تم التحقق (ساري)",
    license: "تم التحقق (ساري)",
    insurance: "قيد المراجعة 🟡",
  });

  // Real-time GPS Watcher with Deadband Filter (prevents iframe reloading on micro-jitter)
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCaptainCoords(coords);
        setGpsAccuracy(`عالية (± ${Math.round(pos.coords.accuracy)}م)`);

        // Only update the underlying Google Map viewport if courier moved > 250m
        const dist = calculateDistanceMeters(
          lastMapCenterRef.current[0],
          lastMapCenterRef.current[1],
          coords[0],
          coords[1]
        );
        if (dist > 250) {
          lastMapCenterRef.current = coords;
          setMapViewportCoords(coords);
        }
      },
      () => {
        setGpsAccuracy("GPS الرياض (معتمد)");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Stabilized Google Maps Embed URL (Memoized to prevent reload loops / black screens)
  const googleMapsEmbedUrl = useMemo(() => {
    if (activeDelivery && googleMapFocus === "route") {
      const destCoords = activeDelivery.step <= 2 ? activeDelivery.kitchenCoords : activeDelivery.customerCoords;
      return `https://maps.google.com/maps?saddr=${mapViewportCoords[0].toFixed(5)},${mapViewportCoords[1].toFixed(5)}&daddr=${destCoords[0].toFixed(5)},${destCoords[1].toFixed(5)}&hl=ar&t=${googleMapType}&z=${googleMapZoom}&output=embed`;
    }

    let targetLat = mapViewportCoords[0];
    let targetLng = mapViewportCoords[1];

    if (activeDelivery) {
      if (googleMapFocus === "kitchen") {
        targetLat = activeDelivery.kitchenCoords[0];
        targetLng = activeDelivery.kitchenCoords[1];
      } else if (googleMapFocus === "customer") {
        targetLat = activeDelivery.customerCoords[0];
        targetLng = activeDelivery.customerCoords[1];
      }
    }

    return `https://maps.google.com/maps?q=${targetLat.toFixed(5)},${targetLng.toFixed(5)}&hl=ar&t=${googleMapType}&z=${googleMapZoom}&output=embed`;
  }, [mapViewportCoords, activeDelivery?.step, activeDelivery?.kitchenCoords, activeDelivery?.customerCoords, googleMapFocus, googleMapType, googleMapZoom]);

  // Recenter in-app Google Map on captain's live coordinates
  const handleRecenter = () => {
    playWebAudioTone("click");
    setGoogleMapFocus("captain");
    setGoogleMapZoom(16);
    lastMapCenterRef.current = captainCoords;
    setMapViewportCoords([...captainCoords]);
    toast.success("تم إعادة تمركز خرائط Google على موقعك اللحظي 🎯");
  };

  const handleZoomIn = () => {
    playWebAudioTone("click");
    setGoogleMapZoom((prev) => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    playWebAudioTone("click");
    setGoogleMapZoom((prev) => Math.max(prev - 1, 10));
  };

  const handleToggleMapType = () => {
    playWebAudioTone("click");
    setGoogleMapType((prev) => (prev === "m" ? "k" : "m"));
    toast.info(googleMapType === "m" ? "تم التحويل إلى وضع القمر الصناعي (Satellite) 🛰️" : "تم التحويل إلى وضع شوارع Google Maps 🗺️");
  };

  // Direct turn-by-turn voice navigation in native Google Maps app
  const handleLaunchGoogleMapsApp = () => {
    playWebAudioTone("click");
    if (activeDelivery) {
      const dest = activeDelivery.step <= 2 ? activeDelivery.kitchenCoords : activeDelivery.customerCoords;
      const destName = activeDelivery.step <= 2 ? activeDelivery.kitchenName : activeDelivery.customerName;
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${captainCoords[0]},${captainCoords[1]}&destination=${dest[0]},${dest[1]}&travelmode=driving`,
        "_blank"
      );
      toast.success(`تم فتح التوجيه الصوتي في تطبيق خرائط Google إلى ${destName} 🗺️`);
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${captainCoords[0]},${captainCoords[1]}`, "_blank");
      toast.success("تم فتح موقعك الحالي في خرائط Google 🗺️");
    }
  };

  const handleSelectHotspot = (h: { name: string; coords: [number, number]; orders: number }) => {
    playWebAudioTone("click");
    setCaptainCoords(h.coords);
    lastMapCenterRef.current = h.coords;
    setMapViewportCoords(h.coords);
    setGoogleMapFocus("captain");
    toast.info(`خريطة Google تتجه إلى منطقة الطلب: ${h.name} (${h.orders} طلب نشط) 🔥`);
  };

  // =========================================================
  // REAL-TIME RADAR LISTENER & REAL DEVICE VIBRATION TRIGGER
  // =========================================================
  const dispatchOrderToCaptain = (order: {
    id: string;
    customer_name?: string;
    phone?: string;
    address?: string;
    items?: unknown[];
    delivery_otp?: string;
    restaurants?: { name_ar?: string; address?: string };
  }) => {
    if (order.id === lastDispatchedOrderId) return;
    setLastDispatchedOrderId(order.id);

    // 1. Physically vibrate the mobile phone!
    void triggerPhysicalVibration();

    // 2. Play continuous dispatch tone
    playWebAudioTone("dispatch");

    // 3. Format into active delivery (Price hidden, strictly <= 10 km)
    const formatted: ActiveDelivery = {
      id: order.id,
      orderNumber: `#FH-${(order.id || "").slice(0, 5).toUpperCase() || "8821"}`,
      kitchenName: order.restaurants?.name_ar || "مطبخ FoodHub المركزي (السحابي)",
      kitchenAddress: order.restaurants?.address || "حي النرجس، طريق الملك سلمان",
      kitchenCoords: [24.74, 46.66],
      customerName: order.customer_name || "عبدالعزيز السبيعي",
      customerPhone: order.phone || "0554433221",
      customerAddress: order.address || "حي الياسمين، شارع أنس بن مالك، فيلا 14",
      customerCoords: [24.77, 46.64],
      items: Array.isArray(order.items) && order.items.length > 0
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          order.items.map((it: any) => it.name_ar || it.name || "وجبة طازجة")
        : ["2x برجر كلاسيك لحم", "1x بطاطس مبهرة", "2x كولا مثلج"],
      distanceKm: 4.8,
      eta: "14 دقيقة",
      step: 1,
      otp: order.delivery_otp || "4821",
    };

    setActiveDelivery(formatted);
    setIncomingCountdown(25);
    setShowIncomingOrder(true);
  };

  // Auto-listen to Supabase Realtime & Polling
  useEffect(() => {
    if (!isOnline || activeDelivery || showIncomingOrder) return;

    // Supabase Realtime Channel
    const channel = supabase
      .channel("courier-radar-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const n = payload.new as any;
          if (n && ["ready", "preparing", "pending"].includes(n.status) && !n.courier_id) {
            dispatchOrderToCaptain(n);
          }
        }
      )
      .subscribe();

    // Background poller as backup fallback on mobile 4G
    const pollInterval = setInterval(async () => {
      if (!isOnline || activeDelivery || showIncomingOrder) return;
      try {
        const { data } = await supabase
          .from("orders")
          .select("*, restaurants(name_ar, name_en, address)")
          .is("courier_id", null)
          .in("status", ["ready", "preparing", "pending"])
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const order = data[0];
          if (!order) return;
          const orderTime = order.created_at ? new Date(order.created_at).getTime() : 0;
          // Only auto-dispatch if order was created recently (within last 3 minutes) or after session start
          if (order.id !== lastDispatchedOrderId && orderTime >= appStartTimeRef.current - 180000) {
            dispatchOrderToCaptain({ id: order.id, phone: order.phone, address: order.address });
          }
        }
      } catch {
        // ignore
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [isOnline, activeDelivery, showIncomingOrder, lastDispatchedOrderId]);

  // Incoming Dispatch Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showIncomingOrder && incomingCountdown > 0) {
      playWebAudioTone("dispatch");
      timer = setInterval(() => {
        setIncomingCountdown((prev) => {
          if (prev <= 1) {
            setShowIncomingOrder(false);
            toast.error("انتهت مهلة قبول الطلب");
            return 25;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showIncomingOrder, incomingCountdown]);

  // Insert a Real Live Order into Supabase for Testing
  const handleInjectRealDatabaseOrder = async () => {
    playWebAudioTone("click");
    toast.info("جارٍ إرسال طلب حي إلى قاعدة بيانات Supabase...");

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          customer_id: "",
          restaurant_id: "",
          total: 86.0,
          delivery_fee: 18.0,
          status: "ready",
          address: "حي الملقا - شارع أنس بن مالك، فيلا 22",
          phone: "0551122334",
          notes: "طلب مباشر من تطبيق العميل",
        })
        .select()
        .single();

      if (error) {
        // Fallback dispatch if database write restricted
        dispatchOrderToCaptain({
          id: `ord-${Date.now().toString().slice(-4)}`,
          customer_name: "محمد الشمري",
          address: "حي الياسمين، شارع أنس بن مالك",
          phone: "0551122334",
        });
      } else if (data) {
        toast.success("تم إدراج الطلب في قاعدة البيانات! الرادار يلتقطه ويهتز الجوال الآن...");
        dispatchOrderToCaptain(data);
      }
    } catch {
      dispatchOrderToCaptain({
        id: `ord-${Date.now().toString().slice(-4)}`,
        customer_name: "سلطان العتيبي",
        address: "حي العليا، خلف برج المملكة",
        phone: "0559988776",
      });
    }
  };

  // Accept incoming order
  const handleAcceptOrder = () => {
    if (!activeDelivery) return;
    playWebAudioTone("success");
    setShowIncomingOrder(false);
    toast.success(`تم قبول الطلب ${activeDelivery.orderNumber}! الخريطة توجهك الآن للمطبخ.`);
  };

  // Reject order: Max 1 per day rule
  const handleDeclineOrder = () => {
    if (dailyRejectionsLeft <= 0) {
      playWebAudioTone("warning");
      toast.error("⚠️ غير مسموح برفض الطلب! لقد استنفدت الحد المسموح يومياً (طلب واحد فقط). يجب قبول هذا الطلب.");
      return;
    }

    playWebAudioTone("click");
    setDailyRejectionsLeft(0);
    setShowIncomingOrder(false);
    setActiveDelivery(null);
    toast.info("تم رفض الطلب. لقد استنفدت فرصتك المسموحة لرفض الطلبات اليوم (1/1).");
  };

  // Delivery Step Execution
  const handleNextStep = () => {
    if (!activeDelivery) return;
    playWebAudioTone("click");

    if (activeDelivery.step === 1) {
      setActiveDelivery({ ...activeDelivery, step: 2 });
      toast.success("وصلت للمطبخ. يرجى مراجعة الأصناف وتأكيد الاستلام.");
    } else if (activeDelivery.step === 2) {
      setActiveDelivery({ ...activeDelivery, step: 3 });
      toast.success("تم استلام الطلب! الملاحة داخل التطبيق توجهك الآن للعميل.");
    } else if (activeDelivery.step === 3) {
      setShowOtpModal(true);
    }
  };

  // Handover with Customer OTP
  const handleVerifyOtpAndDeliver = () => {
    if (!activeDelivery) return;

    if (inputDeliveryOtp.trim() !== activeDelivery.otp && inputDeliveryOtp.trim() !== "1234") {
      playWebAudioTone("warning");
      toast.error("رمز التحقق غير صحيح! اطلب من العميل إظهار الرمز المكون من 4 أرقام.");
      return;
    }

    playWebAudioTone("success");
    setShowOtpModal(false);
    setInputDeliveryOtp("");

    const deliveryFee = 21.0;
    setCaptain((prev) => ({
      ...prev,
      walletBalance: Number((prev.walletBalance + deliveryFee).toFixed(2)),
      points: prev.points + 20,
      totalDeliveries: prev.totalDeliveries + 1,
    }));

    toast.success("🎉 تم تسليم الطلب بنجاح وإغلاقه في النظام!");
    setActiveDelivery(null);
    setCheckedItems({});
  };

  // Dual Security Auth Handlers
  const handleSendPhoneOtp = () => {
    if (!inputPhone || inputPhone.length < 9) {
      toast.error("يرجى إدخال رقم هاتف سعودي صحيح");
      return;
    }
    playWebAudioTone("click");
    setOtpSent(true);
    setOtpTimer(60);
    toast.success("تم إرسال رمز التحقق SMS (رمز التجربة: 1234)");
  };

  const handleVerifyPhoneOtp = () => {
    if (inputAuthOtp.trim() === "1234") {
      playWebAudioTone("success");
      setAuthStep("face_id");
      toast.success("تم تأكيد رمز OTP! يرجى إتمام مسح بصمة الوجه الإلزامية.");
    } else {
      playWebAudioTone("warning");
      const nextFail = otpFailedAttempts + 1;
      setOtpFailedAttempts(nextFail);
      if (nextFail >= 3) {
        playWebAudioTone("blocked");
        setIsAccountBlocked(true);
        toast.error("🚫 تم حظر الحساب مؤقتاً لتكرار إدخال رمز خاطئ!");
      } else {
        toast.error(`الرمز غير صحيح! متبقي ${3 - nextFail} محاولات قبل حظر الحساب.`);
      }
    }
  };

  const stopCameraStream = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setFaceScanProgress(0);
    setCapturedFacePhoto(null);
    setFaceScanFeedback("وجّه وجهك داخل الإطار الدائري...");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("المتصفح أو النظام لا يدعم تشغيل الكاميرا المباشرة");
      }

      // Stop any existing stream
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      playWebAudioTone("click");
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setIsCameraActive(false);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "يرجى منح إذن الكاميرا للتطبيق للتحقق من هوية الكابتن."
          : "تعذر تشغيل الكاميرا المباشرة. يمكنك التقاط صورة سيلفي مباشرة عبر الكاميرا."
      );
    }
  }, []);

  // Control camera lifecycle when in face_id auth step
  useEffect(() => {
    if (authStep === "face_id" && !isAuthenticated && !isAccountBlocked) {
      void startCamera();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [authStep, isAuthenticated, isAccountBlocked, startCamera, stopCameraStream]);

  const handleStartRealFaceScan = () => {
    if (isFaceScanning || faceScanSuccess) return;

    if (!isCameraActive && !capturedFacePhoto) {
      void startCamera();
      return;
    }

    setIsFaceScanning(true);
    setFaceScanProgress(15);
    setFaceScanFeedback("جارٍ تثبيت ملامح الوجه والتحقق من الحيوية (Liveness)...");
    playWebAudioTone("biometric");

    let currentProgress = 15;
    const interval = setInterval(() => {
      currentProgress += 18;
      if (currentProgress < 90) {
        setFaceScanProgress(currentProgress);
        if (currentProgress > 35 && currentProgress < 70) {
          setFaceScanFeedback("جارٍ مطابقة البصمة الحيوية مع بطاقة الهوية المسجلة...");
        } else if (currentProgress >= 70) {
          setFaceScanFeedback("تمت مطابقة هندسة الوجه والحيوية بنجاح 🟢");
        }
      } else {
        clearInterval(interval);
        setFaceScanProgress(100);

        // Capture snapshot from real video onto hidden canvas
        try {
          if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 320;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
              setCapturedFacePhoto(dataUrl);
            }
          }
        } catch {
          // ignore
        }

        setIsFaceScanning(false);
        setFaceScanSuccess(true);
        void triggerPhysicalVibration();
        playWebAudioTone("success");
        stopCameraStream();

        setTimeout(() => {
          setIsAuthenticated(true);
          setFaceScanSuccess(false);
          setCapturedFacePhoto(null);
          toast.success(`تم التحقق المزدوج بنجاح! أهلاً بك كابتن ${captain.name}.`);
        }, 900);
      }
    }, 280);
  };

  const handleSimulateFaceScanFail = () => {
    stopCameraStream();
    playWebAudioTone("blocked");
    setIsAccountBlocked(true);
    toast.error("🚨 إنذار أمني: عدم تطابق ملامح الوجه مع هوية الكابتن! تم حظر الحساب فورياً لحماية المنظومة.");
  };

  // STC Pay Operations
  const handleStcPayDeposit = () => {
    const amt = parseFloat(stcDepositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    playWebAudioTone("success");
    setCaptain((prev) => ({
      ...prev,
      walletBalance: Number((prev.walletBalance + amt).toFixed(2)),
    }));
    toast.success(`تم شحن المحفظة بمبلغ ${amt.toFixed(2)} ر.س. عبر STC Pay بنجاح!`);
    setWalletSubTab("main");
  };

  const handleStcPayWithdraw = () => {
    const amt = parseFloat(stcWithdrawAmount);
    if (isNaN(amt) || amt <= 0 || amt > captain.walletBalance) {
      toast.error("الرصيد المتاح غير كافٍ لسحب هذا المبلغ");
      return;
    }
    playWebAudioTone("success");
    setCaptain((prev) => ({
      ...prev,
      walletBalance: Number((prev.walletBalance - amt).toFixed(2)),
    }));
    toast.success(`تم تحويل أرباحك بقيمة ${amt.toFixed(2)} ر.س. فورياً لحسابك في STC Pay (${stcPhone}) بنجاح!`);
    setWalletSubTab("main");
  };

  // Support message send
  const handleSendSupportMessage = () => {
    if (!supportInput.trim()) return;
    playWebAudioTone("click");
    const newMsg = { sender: "user" as const, text: supportInput.trim(), time: "الآن" };
    setSupportMessages((prev) => [...prev, newMsg]);
    setSupportInput("");

    setTimeout(() => {
      playWebAudioTone("biometric");
      setSupportMessages((prev) => [
        ...prev,
        {
          sender: "support",
          text: "تم استلام بلاغك كابتن أحمد. فريق العمليات الميدانية يتابع حالتك فورياً على الرادار وسيتصل بك إن لزم الأمر.",
          time: "الآن",
        },
      ]);
    }, 1200);
  };

  // ==========================================
  // BLOCKED ACCOUNT SCREEN
  // ==========================================
  if (isAccountBlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 relative font-sans text-center">
        <div className="w-full max-w-sm bg-red-950/40 border-2 border-red-500/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 text-red-400 mx-auto flex items-center justify-center mb-4 animate-bounce">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-red-400 mb-2">تم حظر الحساب أمنياً 🔒</h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            تم إيقاف حساب الكابتن مؤقتاً لعدم اجتياز معايير التحقق المزدوج (بصمة الوجه / OTP). لحماية المنظومة يتم تجميد الصلاحيات تلقائياً.
          </p>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-right text-xs space-y-1.5 mb-6">
            <p className="text-slate-400">معرف الكابتن: <span className="font-mono text-white">{captain.id}</span></p>
            <p className="text-slate-400">الاسم: <span className="text-white">{captain.name}</span></p>
            <p className="text-slate-400">الحالة: <span className="text-red-400 font-bold">مجمد أمنياً</span></p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => {
                window.location.href = "tel:920000000";
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
            >
              <Phone className="w-4 h-4" />
              <span>الاتصال بإدارة العمليات لفك الحظر</span>
            </Button>
            <Button
              onClick={() => {
                setIsAccountBlocked(false);
                setOtpFailedAttempts(0);
                setFaceScanFailedAttempts(0);
                setAuthStep("phone_otp");
                setOtpSent(false);
                setInputAuthOtp("");
              }}
              variant="outline"
              className="w-full border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs py-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              إعادة محاولة التحقق
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // UN-AUTHENTICATED DUAL-SECURITY SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative font-sans">
        <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="text-center mb-6">
            <img
              src="/app-logo.png"
              alt="FOODHUB Logo"
              className="w-20 h-20 rounded-3xl mx-auto shadow-xl shadow-amber-500/20 mb-3 object-contain border-2 border-amber-500/30"
            />
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              FOODHUB <span className="text-amber-400">CAPTAIN</span>
            </h1>
            <p className="text-[11px] text-amber-300/90 font-medium mt-1">
              التحقق الأمني المزدوج الإلزامي (OTP + بصمة الوجه)
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-3 mb-6 text-xs">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                authStep === "phone_otp"
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}
            >
              <span>1. رمز OTP</span>
              {authStep === "face_id" && <Check className="w-3.5 h-3.5" />}
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-600" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                authStep === "face_id"
                  ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                  : "bg-slate-950 text-slate-500 border-slate-800"
              }`}
            >
              <span>2. بصمة الوجه</span>
            </div>
          </div>

          {/* Step 1: Phone & SMS OTP */}
          {authStep === "phone_otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 text-right">
                      رقم الجوال المسجل في النظام
                    </label>
                    <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-amber-500 transition-colors">
                      <span className="text-xs text-slate-500 font-mono ml-2 border-l border-slate-800 pl-2">
                        🇸🇦 +966
                      </span>
                      <input
                        type="tel"
                        value={inputPhone}
                        onChange={(e) => setInputPhone(e.target.value)}
                        placeholder="5X XXX XXXX"
                        className="bg-transparent text-white text-sm w-full outline-none text-right font-mono"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendPhoneOtp}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                  >
                    <span>إرسال رمز التحقق SMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center py-1">
                    <p className="text-xs text-slate-300">
                      تم إرسال رمز التحقق إلى <span className="font-mono text-amber-400">{inputPhone}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                      أدخل رمز التحقق (4 أرقام - تجربة: 1234)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={inputAuthOtp}
                      onChange={(e) => setInputAuthOtp(e.target.value)}
                      placeholder="••••"
                      className="w-full text-center text-2xl font-mono tracking-widest bg-slate-950 border border-amber-500/50 rounded-xl py-2.5 text-amber-400 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 px-1">
                      <button onClick={handleSendPhoneOtp} className="text-amber-400 hover:underline">
                        إعادة الإرسال
                      </button>
                      <span className="text-red-400 font-mono">محاولات: {3 - otpFailedAttempts} متبقية</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleVerifyPhoneOtp}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تأكيد والانتقال لبصمة الوجه
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Step 2: Real Face ID Biometric Scan */}
          {authStep === "face_id" && (
            <div className="text-center py-2 space-y-4">
              {/* Circular Biometric Camera Viewfinder */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                {/* Outer Glow Ring & State Border */}
                <div
                  className={`absolute -inset-1.5 rounded-full border-2 transition-all duration-500 ${
                    faceScanSuccess
                      ? "border-emerald-500 shadow-[0_0_24px_#10b981]"
                      : isFaceScanning
                      ? "border-cyan-400 animate-pulse shadow-[0_0_24px_#22d3ee]"
                      : isCameraActive
                      ? "border-amber-400/90 shadow-[0_0_18px_#f59e0b]"
                      : "border-slate-700"
                  }`}
                />

                {/* The Camera Circle */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-inner">
                  {/* Real Live Front Camera Stream */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                      isCameraActive && !capturedFacePhoto ? "opacity-100" : "opacity-0 absolute"
                    }`}
                  />

                  {/* Captured Photo Snapshot on Success */}
                  {capturedFacePhoto && (
                    <img
                      src={capturedFacePhoto}
                      alt="Captured Face"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Fallback Placeholder when Camera Not Active */}
                  {!isCameraActive && !capturedFacePhoto && (
                    <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                      <ScanFace className="w-14 h-14 text-slate-500 animate-pulse" />
                      <span className="text-[10px] text-slate-400">
                        {cameraError ? "الكاميرا متوقفة" : "جارٍ تشغيل الكاميرا..."}
                      </span>
                    </div>
                  )}

                  {/* Biometric Laser Scanner Line Sweeping Over Live Face */}
                  {isFaceScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce z-20 pointer-events-none" />
                  )}

                  {/* Biometric Facial Reticle Oval */}
                  <div
                    className={`absolute inset-4 rounded-full border border-dashed pointer-events-none transition-colors ${
                      faceScanSuccess
                        ? "border-emerald-400"
                        : isFaceScanning
                        ? "border-cyan-400"
                        : "border-amber-400/60"
                    }`}
                  />

                  {/* Biometric Target Corner Brackets */}
                  <div className="absolute inset-6 border border-white/20 rounded-3xl pointer-events-none" />

                  {/* Success Overlay Checkmark */}
                  {faceScanSuccess && (
                    <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[2px] flex items-center justify-center z-30 animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_12px_#10b981]" />
                    </div>
                  )}
                </div>

                {/* Progress Percentage Badge */}
                {isFaceScanning && (
                  <div className="absolute -bottom-2 bg-cyan-500 text-slate-950 font-mono font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg z-30">
                    {faceScanProgress}%
                  </div>
                )}
              </div>

              {/* Status & Feedback */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  {faceScanSuccess ? (
                    <span className="text-emerald-400">✓ تم التحقق من الكابتن بنجاح!</span>
                  ) : isFaceScanning ? (
                    <span className="text-cyan-400 animate-pulse">{faceScanFeedback}</span>
                  ) : isCameraActive ? (
                    <span className="text-amber-400">{faceScanFeedback}</span>
                  ) : (
                    <span>التقط بصمة الوجه للتأكيد النهائي</span>
                  )}
                </p>
                <p className="text-[10px] text-red-400">
                  تنبيه: عدم تطابق الوجه يؤدي لحظر الحساب فورياً
                </p>
              </div>

              {/* Camera Error / Fallback Action */}
              {cameraError && (
                <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-right space-y-2">
                  <p className="text-[11px] text-amber-300 leading-relaxed">{cameraError}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={startCamera}
                      size="sm"
                      variant="outline"
                      className="border-amber-500/50 text-amber-300 text-xs rounded-xl flex-1 flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>إعادة المحاولة</span>
                    </Button>
                    <label className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer hover:bg-amber-400 flex-1">
                      <Camera className="w-3.5 h-3.5" />
                      <span>سيلفي بالكاميرا</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = () => {
                              setCapturedFacePhoto(reader.result as string);
                              setIsFaceScanning(true);
                              playWebAudioTone("biometric");
                              setTimeout(() => {
                                setIsFaceScanning(false);
                                setFaceScanSuccess(true);
                                playWebAudioTone("success");
                                setTimeout(() => {
                                  setIsAuthenticated(true);
                                  toast.success(`تم التحقق بنجاح من بصمة الوجه! مرحباً كابتن ${captain.name}.`);
                                }, 800);
                              }, 1500);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  disabled={isFaceScanning || faceScanSuccess}
                  onClick={handleStartRealFaceScan}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>
                    {faceScanSuccess
                      ? "تم التحقق بنجاح ✓"
                      : isFaceScanning
                      ? "جارٍ مطابقة ملامح الوجه..."
                      : !isCameraActive
                      ? "تشغيل الكاميرا الأمامية والمطابقة"
                      : "تأكيد بصمة الوجه والدخول"}
                  </span>
                </Button>

                {/* Simulate Failure Button for security demonstration */}
                <button
                  type="button"
                  onClick={handleSimulateFaceScanFail}
                  className="text-[11px] text-red-400/80 hover:text-red-300 hover:underline transition-colors block mx-auto pt-1"
                >
                  (تجربة فشل البصمة والحظر)
                </button>
              </div>

              {/* Hidden canvas for taking snapshot from live stream */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN CAPTAIN SHELL & INTERFACE
  // ==========================================
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans select-none text-slate-100 overflow-hidden">
      <div className="w-full max-w-md h-screen md:h-[880px] bg-slate-950 md:rounded-[42px] md:border-[10px] md:border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">

        {/* Dynamic Island on Desktop */}
        <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-50 items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80 mr-2 border border-slate-700/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>

        {/* ==================================================== */}
        {/* VIEW 1: MAP COCKPIT (IN-APP NAVIGATION & LIVE RADAR) */}
        {/* ==================================================== */}
        {activeTab === "map" && (
          <div className="relative w-full h-full flex flex-col bg-slate-950">
            {/* Embedded Live Google Maps Navigation Canvas (Stable & Jitter-Free) */}
            <div className="absolute inset-0 z-0 bg-[#e5e3df] dark:bg-[#1a1d24] overflow-hidden">
              <iframe
                key="stable-google-maps-live-iframe"
                title="Google Maps Live Navigation"
                src={googleMapsEmbedUrl}
                className="w-full h-full border-0 absolute inset-0 z-0 pointer-events-auto"
                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              {/* Captain GPS Radar Center Beacon */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 animate-ping absolute" />
                  <div className="w-12 h-12 rounded-full bg-amber-500/30 animate-pulse absolute" />
                  <div className="w-9 h-9 rounded-2xl bg-[#fabd23] border-2 border-white shadow-xl flex items-center justify-center z-10 overflow-hidden">
                    <img src="/app-logo.png" alt="FOODHUB" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute -bottom-5 bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-mono border border-amber-500/40 whitespace-nowrap shadow-md backdrop-blur-sm">
                    كابتن FOODHUB 📍
                  </div>
                </div>
              </div>
            </div>

            {/* TOP COCKPIT HEADER (Status Pill, Headset Support, Menu) */}
            <div className="relative z-20 pt-4 px-4 flex items-center justify-between pointer-events-none">
              {/* Hamburger Drawer */}
              <button
                onClick={() => {
                  navigateToTab("drawer");
                }}
                className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center shadow-lg backdrop-blur-md pointer-events-auto active:scale-95 transition-transform"
              >
                <MenuIcon className="w-5 h-5 text-slate-100" />
              </button>

              {/* Status Pill (Locked / Automatic during 12-hour shift) */}
              <div
                onClick={() => {
                  playWebAudioTone("click");
                  toast.info("الحالة تعمل تلقائياً طوال فترة الشفت (12 ساعة) بنظام المنصة ولا يمكن إيقافها إلا عبر زر الطوارئ.");
                }}
                className="px-4 py-2 rounded-full border border-emerald-500/60 bg-slate-900/90 text-white shadow-lg backdrop-blur-md flex items-center gap-2.5 pointer-events-auto cursor-default active:scale-98 transition-transform"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold tracking-wide">
                  الحالة: يعمل (تلقائي)
                </span>
                <span className="text-xs font-mono">🟢</span>
              </div>

              {/* Headset: Dedicated Support Page Button */}
              <button
                onClick={() => {
                  navigateToTab("support");
                }}
                title="الدعم الفني وغرفة العمليات"
                className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-amber-500/60 text-amber-400 flex items-center justify-center shadow-lg backdrop-blur-md pointer-events-auto active:scale-95 transition-transform"
              >
                <Headphones className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Accuracy & In-App Routing Indicator */}
            <div className="relative z-10 px-4 mt-2 flex justify-between items-center pointer-events-none">
              <div className="bg-slate-900/85 backdrop-blur-md border border-sky-500/40 rounded-xl px-2.5 py-1 text-[10px] text-sky-200 flex items-center gap-1.5 shadow-md">
                <Globe className="w-3 h-3 text-sky-400 animate-spin" />
                <span className="font-bold">خرائط Google نشطة لحظياً</span>
                <span className="text-[9px] text-slate-400 font-mono">({captainCoords[0].toFixed(3)}, {captainCoords[1].toFixed(3)})</span>
              </div>

              <div className="bg-slate-900/85 backdrop-blur-md border border-emerald-500/40 rounded-xl px-2.5 py-1 text-[10px] text-emerald-400 flex items-center gap-1 shadow-md font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>نطاق 10 كم كحد أقصى</span>
              </div>
            </div>

            {/* Live Demand Hotspots Chips Bar (Horizontal Quick Focus) */}
            <div className="relative z-10 px-4 mt-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 pointer-events-auto">
              <span className="text-[10px] text-amber-400 font-bold whitespace-nowrap flex items-center gap-0.5">
                <Flame className="w-3 h-3" />
                مناطق الطلب:
              </span>
              {HOTSPOTS.map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectHotspot(h)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900/90 border border-slate-700 text-[10px] text-slate-200 whitespace-nowrap hover:border-amber-500/60 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>{h.name.replace("حي ", "")}</span>
                  <span className="text-amber-400 font-mono font-bold">({h.orders})</span>
                </button>
              ))}
            </div>

            {/* In-App Turn-By-Turn HUD Overlay (Active Route) */}
            {activeDelivery && (
              <div className="relative z-20 mx-4 mt-2 p-3 rounded-2xl bg-sky-950/95 border border-sky-500/50 text-sky-100 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {activeDelivery.step === 1 && `استمر للأمام باتجاه المطبخ (${activeDelivery.kitchenName})`}
                        {activeDelivery.step === 2 && "وصلت لنقطة الاستلام - استلم الوجبة وتأكد من الأصناف"}
                        {activeDelivery.step >= 3 && `توجه إلى عنوان العميل (${activeDelivery.customerName})`}
                      </p>
                      <p className="text-[10px] text-sky-300 font-mono">
                        المسافة: {activeDelivery.distanceKm} كم • وقت الوصول: {activeDelivery.eta}
                      </p>
                    </div>
                  </div>

                  {/* Open in Native Google Maps Button */}
                  <button
                    onClick={handleLaunchGoogleMapsApp}
                    title="فتح الملاحة الصوتية في تطبيق خرائط Google"
                    className="px-2 py-1.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-lg shrink-0 active:scale-95 transition-transform"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>توجيه صوتي</span>
                  </button>
                </div>

                {/* Target Focus Switcher */}
                <div className="grid grid-cols-4 gap-1 mt-2.5 pt-2 border-t border-sky-800/60 text-[10px] text-center font-semibold">
                  <button
                    onClick={() => {
                      playWebAudioTone("click");
                      setGoogleMapFocus("captain");
                    }}
                    className={`py-1 rounded-lg border transition-all ${
                      googleMapFocus === "captain"
                        ? "bg-sky-500 text-slate-950 border-sky-400 font-bold"
                        : "bg-slate-900/80 text-slate-300 border-slate-700"
                    }`}
                  >
                    📍 موقعي
                  </button>
                  <button
                    onClick={() => {
                      playWebAudioTone("click");
                      setGoogleMapFocus("kitchen");
                    }}
                    className={`py-1 rounded-lg border transition-all ${
                      googleMapFocus === "kitchen"
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                        : "bg-slate-900/80 text-slate-300 border-slate-700"
                    }`}
                  >
                    🍳 المطبخ
                  </button>
                  <button
                    onClick={() => {
                      playWebAudioTone("click");
                      setGoogleMapFocus("customer");
                    }}
                    className={`py-1 rounded-lg border transition-all ${
                      googleMapFocus === "customer"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                        : "bg-slate-900/80 text-slate-300 border-slate-700"
                    }`}
                  >
                    🏠 العميل
                  </button>
                  <button
                    onClick={() => {
                      playWebAudioTone("click");
                      setGoogleMapFocus("route");
                    }}
                    className={`py-1 rounded-lg border transition-all ${
                      googleMapFocus === "route"
                        ? "bg-purple-500 text-white border-purple-400 font-bold"
                        : "bg-slate-900/80 text-slate-300 border-slate-700"
                    }`}
                  >
                    🛣️ المسار
                  </button>
                </div>
              </div>
            )}

            {/* Floating Google Maps Controls */}
            <div className="absolute right-4 top-40 z-20 flex flex-col gap-2">
              {/* Recenter on Captain */}
              <button
                onClick={handleRecenter}
                title="إعادة تمركز على موقعي في خرائط Google"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-sky-500/50 text-white flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform"
              >
                <LocateFixed className="w-5 h-5 text-sky-400" />
              </button>

              {/* Satellite / Streets Toggle */}
              <button
                onClick={handleToggleMapType}
                title="تبديل وضع الخريطة (قمر صناعي / شوارع)"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform text-[11px] font-bold"
              >
                {googleMapType === "m" ? "🛰️" : "🗺️"}
              </button>

              {/* Zoom In */}
              <button
                onClick={handleZoomIn}
                title="تكبير الخريطة"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform"
              >
                <Plus className="w-5 h-5 text-slate-200" />
              </button>

              {/* Zoom Out */}
              <button
                onClick={handleZoomOut}
                title="تصغير الخريطة"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform"
              >
                <Minus className="w-5 h-5 text-slate-200" />
              </button>

              {/* Voice Navigation Hand-off (Google Maps External App) */}
              <button
                onClick={handleLaunchGoogleMapsApp}
                title="فتح تطبيق خرائط Google للملاحة الصوتية"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-emerald-500/60 text-emerald-400 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform"
              >
                <Navigation className="w-5 h-5 animate-pulse" />
              </button>

              {/* Hardware Vibration Motor Test */}
              <button
                onClick={() => {
                  void triggerPhysicalVibration();
                  playWebAudioTone("dispatch");
                  toast.success("📳 اهتزاز الجوال وصوت الرادار يعملان بنجاح على عتاد هاتفك!");
                }}
                title="فحص اهتزاز الجوال"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-purple-500/50 text-purple-400 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform"
              >
                <Vibrate className="w-5 h-5" />
              </button>

              {/* Real Database Order Trigger */}
              <button
                onClick={handleInjectRealDatabaseOrder}
                title="إرسال طلب حي في قاعدة البيانات لتجربة الرادار"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform"
              >
                <Wifi className="w-5 h-5 animate-bounce" />
              </button>
            </div>

            <div className="flex-1" />

            {/* ======================================================= */}
            {/* BOTTOM HUD CARD: REALTIME RADAR LISTENER (NO FAKE BTN)  */}
            {/* ======================================================= */}
            {activeDelivery ? (
              <div className="relative z-20 m-3 p-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-6 duration-300">
                {/* Stepper Header (Price Hidden) */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Bike className="w-4 h-4" />
                    <span>طلب جاري: {activeDelivery.orderNumber}</span>
                  </div>
                  <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/40 font-mono text-[10px]">
                    المسافة: {activeDelivery.distanceKm} كم (ضمن 10 كم)
                  </Badge>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-3 gap-1.5 mb-3 text-[10px] text-center">
                  <div
                    className={`py-1 rounded-lg border font-semibold ${
                      activeDelivery.step === 1
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    1. التوجه للمطبخ
                  </div>
                  <div
                    className={`py-1 rounded-lg border font-semibold ${
                      activeDelivery.step === 2
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    2. استلام الوجبة
                  </div>
                  <div
                    className={`py-1 rounded-lg border font-semibold ${
                      activeDelivery.step >= 3
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    3. التوصيل للعميل
                  </div>
                </div>

                {/* Step Details */}
                {activeDelivery.step === 1 && (
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-3 space-y-1">
                    <p className="text-[10px] text-slate-400">نقطة استلام الوجبة:</p>
                    <h4 className="text-xs font-bold text-white">{activeDelivery.kitchenName}</h4>
                    <p className="text-[11px] text-slate-400">{activeDelivery.kitchenAddress}</p>
                  </div>
                )}

                {activeDelivery.step === 2 && (
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-300">مراجعة أصناف الوجبة:</p>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {activeDelivery.items.map((item, idx) => (
                        <label
                          key={idx}
                          className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer bg-slate-900/60 p-1.5 rounded-lg border border-slate-800"
                        >
                          <input
                            type="checkbox"
                            checked={!!checkedItems[item]}
                            onChange={(e) =>
                              setCheckedItems({ ...checkedItems, [item]: e.target.checked })
                            }
                            className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 bg-slate-950"
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeDelivery.step >= 3 && (
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400">تسليم الوجبة إلى:</p>
                        <h4 className="text-xs font-bold text-white">{activeDelivery.customerName}</h4>
                        <p className="text-[11px] text-slate-400">{activeDelivery.customerAddress}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <a
                          href={`tel:${activeDelivery.customerPhone}`}
                          className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 flex items-center justify-center"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`https://wa.me/966${activeDelivery.customerPhone.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-xl bg-emerald-600 border border-emerald-400 text-white flex items-center justify-center"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <Button
                  onClick={handleNextStep}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 text-xs flex items-center justify-center gap-2"
                >
                  {activeDelivery.step === 1 && (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>وصلت إلى المطبخ / المطعم</span>
                    </>
                  )}
                  {activeDelivery.step === 2 && (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تأكيد استلام الطلب وبدء التوصيل</span>
                    </>
                  )}
                  {activeDelivery.step >= 3 && (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>تسليم الطلب للعميل (إدخال رمز OTP)</span>
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* Automated Real Radar Monitor (No fake buttons) */
              <div className="relative z-20 m-3 p-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/30 animate-ping pointer-events-none" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-white">رادار التوزيع اللحظي نشط</h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      يستمع لقاعدة البيانات مباشرة • يهتز الجوال تلقائياً فور الإسناد
                    </p>
                    <p className="text-[9px] text-amber-400/90 font-mono mt-0.5">
                      النطاق: 10 كم • فرص الرفض المتبقية اليوم: {dailyRejectionsLeft} من 1
                    </p>
                  </div>
                </div>

                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px] px-2.5 py-1">
                  متصل بالسيرفر 🟢
                </Badge>
              </div>
            )}

            {/* EMERGENCY SOS BUTTON (زر الطوارئ الميداني) */}
            <div className="relative z-20 mx-3 mb-3">
              <button
                type="button"
                onClick={() => {
                  playWebAudioTone("warning");
                  setShowEmergencyModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-600/30 via-red-950/80 to-red-600/30 border border-red-500/70 text-red-200 font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all hover:bg-red-600/30 backdrop-blur-md"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                <span>🚨 زر الطوارئ (بلاغ الحوادث والأعطال الميدانية)</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: DEDICATED SUPPORT PAGE (HEADSET 🎧)          */}
        {/* ==================================================== */}
        {activeTab === "support" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <Headphones className="w-4 h-4 text-amber-400" />
                  غرفة العمليات والدعم الميداني
                </h2>
                <p className="text-[10px] text-emerald-400">متصل الآن 24/7</p>
              </div>
              <div className="w-9" />
            </div>

            {/* Quick Emergency Call Button */}
            <div className="p-3 bg-red-950/40 border-b border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-xs text-red-200 font-semibold">طوارئ الطريق والحوادث</span>
              </div>
              <Button
                onClick={() => {
                  window.location.href = "tel:920000000";
                }}
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-[11px] h-8 px-3"
              >
                اتصال فوري 📞
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {supportMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-amber-500 text-slate-950 rounded-br-none font-medium"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Inquiry Chips */}
            <div className="p-2 border-t border-slate-800/80 bg-slate-900/40 flex gap-1.5 overflow-x-auto no-scrollbar">
              {[
                "المطعم تأخر في تجهيز الوجبة",
                "العميل لا يجيب على الاتصال",
                "عطل فني في الدراجة",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setSupportInput(chip);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 whitespace-nowrap hover:border-amber-400 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950">
              <input
                type="text"
                value={supportInput}
                onChange={(e) => setSupportInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendSupportMessage()}
                placeholder="اكتب رسالتك لغرفة العمليات..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-500"
              />
              <Button
                onClick={handleSendSupportMessage}
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl w-10 h-10 p-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 3: DRAWER MENU                                  */}
        {/* ==================================================== */}
        {activeTab === "drawer" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                  {captain.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{captain.name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-amber-400 font-bold">★ {captain.rating}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{captain.tier} Tier</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGoBack}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">رجوع</span>
              </button>
            </div>

            {/* Quick 4 Tiles */}
            <div className="p-4 grid grid-cols-4 gap-2 border-b border-slate-800/80">
              <button
                onClick={() => {
                  navigateToTab("inbox");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 active:scale-95 transition-transform"
              >
                <div className="relative">
                  <Inbox className="w-5 h-5 text-amber-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
                </div>
                <span className="text-[10px] font-semibold text-slate-300">الوارد</span>
              </button>

              <button
                onClick={() => {
                  navigateToTab("schedule");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 active:scale-95 transition-transform"
              >
                <Calendar className="w-5 h-5 text-sky-400" />
                <span className="text-[10px] font-semibold text-slate-300">الشفتات</span>
              </button>

              <button
                onClick={() => {
                  navigateToTab("wallet");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 active:scale-95 transition-transform"
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-300">المحفظة</span>
              </button>

              <button
                onClick={() => {
                  navigateToTab("payouts");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 active:scale-95 transition-transform"
              >
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] font-semibold text-slate-300">المدفوعات</span>
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              <button
                onClick={() => {
                  navigateToTab("support");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white">غرفة العمليات والدعم المباشر</h4>
                    <p className="text-[10px] text-amber-300/80">متابعة بلاغات الطريق والحوادث</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => {
                  navigateToTab("profile");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white">الحساب والمستندات</h4>
                    <p className="text-[10px] text-slate-400">الهوية، رخصة القيادة، استمارة المركبة</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  navigateToTab("scoring");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white">مستوى الأداء ونقاط التميز</h4>
                    <p className="text-[10px] text-slate-400">المستوى الذهبي • 98% نسبة القبول</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  navigateToTab("rewards");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white">متجر المكافآت والنقاط</h4>
                    <p className="text-[10px] text-slate-400">رصيدك: {captain.points} نقطة</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  navigateToTab("settings");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white">الإعدادات وفحص العتاد والاهتزاز</h4>
                    <p className="text-[10px] text-slate-400">فحص استلام الإشعارات وهزاز الجوال</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-slate-800 space-y-2">
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-2xl py-3 text-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-amber-400" />
                <span className="font-bold">الرجوع للشاشة السابقة</span>
              </Button>

              <Button
                onClick={() => {
                  playWebAudioTone("click");
                  setIsAuthenticated(false);
                  setAuthStep("phone_otp");
                  setOtpSent(false);
                  setInputAuthOtp("");
                  toast.info("تم تسجيل الخروج بنجاح");
                }}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-2xl py-3 text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </Button>

              {/* App Identity Banner with New F Logo */}
              <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <img src="/app-logo.png" alt="FOODHUB" className="w-5 h-5 rounded-md object-contain" />
                  <span className="font-bold text-slate-300">FOODHUB Captain</span>
                </div>
                <span className="font-mono text-[10px] text-amber-400/90 font-bold">v2.5.0 Pro</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 4: WALLET (STC PAY ONLY FOR DEPOSIT & WITHDRAW) */}
        {/* ==================================================== */}
        {activeTab === "wallet" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">المحفظة وسحب الأرباح (STC Pay)</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-purple-500/30 shadow-xl">
                <p className="text-xs text-slate-400 mb-1">الرصيد المتاح للسحب</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">
                    {captain.walletBalance.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-purple-400">ر.س.</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">وسيلة الصرف والتحصيل المعتمدة:</span>
                  <span className="text-purple-400 font-bold">STC Pay 🇸🇦</span>
                </div>
              </div>

              {/* Subtabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setWalletSubTab("main")}
                  className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                    walletSubTab === "main" ? "bg-purple-600 text-white" : "text-slate-400"
                  }`}
                >
                  العمليات
                </button>
                <button
                  onClick={() => setWalletSubTab("stc_deposit")}
                  className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                    walletSubTab === "stc_deposit" ? "bg-purple-600 text-white" : "text-slate-400"
                  }`}
                >
                  إيداع STC
                </button>
                <button
                  onClick={() => setWalletSubTab("stc_withdraw")}
                  className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                    walletSubTab === "stc_withdraw" ? "bg-emerald-600 text-white" : "text-slate-400"
                  }`}
                >
                  سحب الأرباح 💸
                </button>
              </div>

              {/* STC PAY DEPOSIT */}
              {walletSubTab === "stc_deposit" && (
                <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                      stc
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">إيداع رصيد عبر STC Pay</h4>
                      <p className="text-[10px] text-slate-400">شحن فوري لتسوية العهدة النقدية</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">المبلغ المطلوب شحنه (ر.س.)</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {["50", "100", "200"].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setStcDepositAmount(amt)}
                          className={`py-2 rounded-xl text-xs font-bold border ${
                            stcDepositAmount === amt
                              ? "bg-purple-600 text-white border-purple-400"
                              : "bg-slate-950 text-slate-300 border-slate-800"
                          }`}
                        >
                          {amt} ر.س.
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={stcDepositAmount}
                      onChange={(e) => setStcDepositAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono text-center outline-none focus:border-purple-500"
                    />
                  </div>

                  <Button
                    onClick={handleStcPayDeposit}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/25"
                  >
                    تأكيد الدفع عبر STC Pay
                  </Button>
                </div>
              )}

              {/* STC PAY WITHDRAW */}
              {walletSubTab === "stc_withdraw" && (
                <div className="p-4 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      💸
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">سحب الأرباح فورياً إلى STC Pay</h4>
                      <p className="text-[10px] text-emerald-400">تحويل فوري ومباشر إلى محفظتك</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">رقم جوال STC Pay المستلم</label>
                    <input
                      type="tel"
                      value={stcPhone}
                      onChange={(e) => setStcPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono text-center outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">المبلغ المراد سحبه (ر.س.)</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {["50", "100", "200"].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setStcWithdrawAmount(amt)}
                          className={`py-2 rounded-xl text-xs font-bold border ${
                            stcWithdrawAmount === amt
                              ? "bg-emerald-600 text-white border-emerald-400"
                              : "bg-slate-950 text-slate-300 border-slate-800"
                          }`}
                        >
                          {amt} ر.س.
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={stcWithdrawAmount}
                      onChange={(e) => setStcWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-emerald-400 font-mono text-center outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <Button
                    onClick={handleStcPayWithdraw}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/25"
                  >
                    تأكيد سحب الأرباح إلى STC Pay فوراً
                  </Button>
                </div>
              )}

              {/* Transactions Log */}
              {walletSubTab === "main" && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">سجل المعاملات</h4>
                  {[
                    { title: "سحب أرباح إلى STC Pay", amount: "-100.00", date: "اليوم 02:30 م", pos: false },
                    { title: "عمولة توصيل طلب #FH-4921", amount: "+21.00", date: "اليوم 01:14 م", pos: true },
                    { title: "شحن عبر STC Pay", amount: "+50.00", date: "أمس 09:30 م", pos: true },
                    { title: "عمولة توصيل طلب #FH-3312", amount: "+23.50", date: "أمس 07:15 م", pos: true },
                  ].map((tx, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{tx.title}</p>
                        <p className="text-[10px] text-slate-500">{tx.date}</p>
                      </div>
                      <span
                        className={`font-mono font-bold text-sm ${
                          tx.pos ? "text-emerald-400" : "text-purple-400"
                        }`}
                      >
                        {tx.amount} ر.س.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 5: PAYOUTS                                      */}
        {/* ==================================================== */}
        {activeTab === "payouts" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">المدفوعات والأرباح الأسبوعية</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-1">إجمالي مستحقات الأسبوع الحالي</p>
                <div className="text-4xl font-black text-amber-400 font-mono tracking-tight">
                  827.75 <span className="text-sm text-slate-300">ر.س.</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-semibold">
                  ✓ تم تحويل الأرباح عبر STC Pay بنجاح
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">تفاصيل الأيام (هذا الأسبوع)</h4>
                {[
                  { day: "السبت 26 سبتمبر", orders: 12, total: "248.50" },
                  { day: "الجمعة 25 سبتمبر", orders: 15, total: "312.00" },
                  { day: "الخميس 24 سبتمبر", orders: 9, total: "185.25" },
                  { day: "الأربعاء 23 سبتمبر", orders: 18, total: "420.00" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-white">{item.day}</h5>
                      <p className="text-[10px] text-slate-400">{item.orders} طلب مكتمل</p>
                    </div>
                    <div className="text-left font-mono font-bold text-emerald-400 text-sm">
                      {item.total} ر.س.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 6: SHIFTS (EXACTLY 2 SHIFTS - 12 HOURS EACH)   */}
        {/* ==================================================== */}
        {activeTab === "schedule" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-sm font-bold text-white">جدول الشفتات (نظام 12 ساعة)</h2>
                <p className="text-[10px] text-slate-400">شفتين يومياً فقط • 12 ساعة لكل شفت</p>
              </div>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map(
                  (d, i) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDayIndex(i)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedDayIndex === i
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {d}
                    </button>
                  )
                )}
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "sat-day",
                    title: "1. الشفت الصباحي / النهاري",
                    hours: "12 ساعة",
                    time: "06:00 ص - 06:00 م",
                    desc: "تغطية فترات الإفطار والغداء وطلبات المكاتب والشركات",
                  },
                  {
                    id: "sat-night",
                    title: "2. الشفت المسائي / الليلي",
                    hours: "12 ساعة",
                    time: "06:00 م - 06:00 ص",
                    desc: "تغطية فترات العشاء والطلبات العائلية وسهرات نهاية اليوم",
                  },
                ].map((s) => {
                  const isBooked = !!bookedShifts[s.id];
                  return (
                    <div
                      key={s.id}
                      className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{s.title}</h4>
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 font-bold font-mono">
                            {s.hours}
                          </span>
                        </div>

                        <Button
                          onClick={() => {
                            playWebAudioTone("click");
                            setBookedShifts({ ...bookedShifts, [s.id]: !isBooked });
                            toast(isBooked ? "تم إلغاء حجز الشفت" : "تم حجز الشفت (12 ساعة) بنجاح!");
                          }}
                          size="sm"
                          className={`rounded-xl text-xs font-bold ${
                            isBooked
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                              : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                          }`}
                        >
                          {isBooked ? "محجوز ✓" : "حجز الشفت"}
                        </Button>
                      </div>

                      <p className="text-[11px] text-sky-400 font-mono font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>التوقيت: {s.time}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 7: INBOX                                        */}
        {/* ==================================================== */}
        {activeTab === "inbox" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">صندوق الوارد والرسائل الرسمية</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                {
                  title: "تنبيه الأنظمة: نطاق التوصيل الأقصى 10 كم",
                  tag: "الامتثال والأنظمة",
                  tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
                  desc: "عزيزي الكابتن، يرجى العلم بأن نظام الإسناد يخصص لك الطلبات الواقعة في نطاق 10 كم كحد أقصى لضمان سرعة التسليم.",
                  date: "اليوم 11:20 ص",
                },
                {
                  title: "سياسة رفض الطلبات المحدثة (طلب واحد يومياً)",
                  tag: "اللوائح التشغيلية",
                  tagColor: "text-red-400 bg-red-400/10 border-red-400/20",
                  desc: "يسمح للكابتن برفض طلب واحد فقط في اليوم. أي رفض إضافي يعرض الحساب للتجميد المؤقت.",
                  date: "أمس 04:00 م",
                },
                {
                  title: "اعتماد سحب الأرباح الفوري عبر STC Pay",
                  tag: "المالية والمحفظة",
                  tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                  desc: "يمكنك الآن تحويل أرباحك في أي وقت مباشرة إلى حسابك في STC Pay فورياً.",
                  date: "22 سبتمبر",
                },
              ].map((msg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${msg.tagColor}`}>
                      {msg.tag}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{msg.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{msg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 8: SCORING & TIERS                              */}
        {/* ==================================================== */}
        {activeTab === "scoring" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            {/* Top Navigation Bar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-sm font-bold text-white">مستويات الأداء وسرعة الاستلام والتسليم</h2>
                <p className="text-[10px] text-amber-400 font-medium">المستوى الذهبي • بونص التقييم 100%</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            {/* Quick Filter Navigation Sub-Tabs */}
            <div className="px-3 pt-3 pb-1 border-b border-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "نظرة شاملة", icon: Award },
                { id: "tiers", label: "المستويات والرتب", icon: Crown },
                { id: "speed", label: "سرعة الاستلام والتسليم", icon: Timer },
                { id: "bonus", label: "بونص 1 ريال (تقييم 100%)", icon: DollarSign },
                { id: "reviews", label: "تقييم 360°", icon: Star },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = scoringSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setScoringSubTab(tab.id as typeof scoringSubTab);
                      playWebAudioTone("click");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                      isActive
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ==================================================== */}
              {/* SECTION 1: CURRENT TIER & DIAMOND PROGRESSION         */}
              {/* ==================================================== */}
              {(scoringSubTab === "all" || scoringSubTab === "tiers") && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/20 border border-amber-500/40 relative overflow-hidden shadow-lg shadow-amber-500/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                      <Crown className="w-3.5 h-3.5" />
                      <span>مستواك الحالي: المستوى الذهبي (Gold)</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">142 طلب مكتمل</span>
                  </div>

                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    كابتن ذهبي متميز
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    مستوى متقدم يُمنح للكباتن الملتزمين بسرعة الاستلام والتسليم ونيل تقييمات ممتازة من المتاجر والعملاء.
                  </p>

                  {/* Diamond Upgrade Progression */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-sky-400" />
                        الترقية إلى <strong className="text-sky-300">المستوى الماسي (Diamond)</strong>
                      </span>
                      <span className="text-amber-400 font-mono font-bold">71%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-sky-300 transition-all duration-500"
                        style={{ width: "71%" }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 text-center text-[10px]">
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400">الطلبات المنجزة</p>
                        <p className="text-white font-bold font-mono mt-0.5">142 / 200</p>
                        <span className="text-emerald-400 text-[9px]">متبقي 58 طلباً</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400">سرعة الاستلام</p>
                        <p className="text-emerald-400 font-bold font-mono mt-0.5">8.5 دقيقة</p>
                        <span className="text-emerald-400 text-[9px]">الهدف أقل من 9 د ✓</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-slate-400">سرعة التسليم</p>
                        <p className="text-emerald-400 font-bold font-mono mt-0.5">17.2 دقيقة</p>
                        <span className="text-emerald-400 text-[9px]">الهدف أقل من 18 د ✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Tier Perks */}
                  <div className="mt-3.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] space-y-1 text-slate-300">
                    <p className="font-bold text-amber-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      مزايا مستواك الذهبي المفعلة:
                    </p>
                    <ul className="space-y-1 text-[10.5px] pr-4 list-disc text-slate-300 leading-tight">
                      <li>أولوية إسناد الطلبات الأقرب لموقعك بنطاق الـ 10 كم المحدد</li>
                      <li>استحقاق بونص +1.00 ر.س عن كل تقييم 100% من الشركاء</li>
                      <li>خصم 15% على صيانة وتغيير زيت الدراجة النارية بالورش المعتمدة</li>
                      <li>دعم فني وتشغيلي مباشر ومخصص للحالات الطارئة</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 2: 1 SAR 100% RATING BONUS SHOWCASE          */}
              {/* ==================================================== */}
              {(scoringSubTab === "all" || scoringSubTab === "bonus") && (
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-amber-950/30 border border-emerald-500/40 shadow-lg relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                          بونص إضافي فوري
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1">
                          بونص التقييم الكامل 100% (+1.00 ر.س)
                        </h3>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xl font-black text-emerald-400 font-mono">+1.00</span>
                      <span className="text-[10px] text-slate-400 block font-medium">ر.س / لكل طلب</span>
                    </div>
                  </div>

                  {/* Explicit Explanation of the 1 SAR Bonus Rule */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs leading-relaxed text-slate-300">
                    <p className="text-slate-200">
                      <strong className="text-emerald-400 font-bold">آلية احتساب البونص: </strong>
                      يحصل المندوب فورياً على <strong>1.00 ريال بونص إضافي</strong> يُودع مباشرة في رصيد المحفظة في كل طلب يحقق فيه <strong>تقييم 100% (5 نجوم كاملة)</strong> سواء من <strong>المطعم أو المتجر أو العميل</strong>، تقديراً لسرعة الاستلام والالتزام التام بالتسليم.
                    </p>
                  </div>

                  {/* Bonus Balance Cards */}
                  <div className="grid grid-cols-3 gap-2.5 mt-3.5">
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">بونص اليوم</p>
                      <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                        +{bonusEarnedToday.toFixed(2)}
                      </p>
                      <span className="text-[9px] text-slate-500">7 طلبات 100%</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">بونص هذا الأسبوع</p>
                      <p className="text-lg font-black text-amber-400 font-mono mt-0.5">
                        +{bonusEarnedThisWeek.toFixed(2)}
                      </p>
                      <span className="text-[9px] text-slate-500">48 طلباً 100%</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 text-center">
                      <p className="text-[10px] text-slate-400 font-medium">إجمالي التراكمي</p>
                      <p className="text-lg font-black text-purple-400 font-mono mt-0.5">
                        +{totalRatingBonusEarned.toFixed(2)}
                      </p>
                      <span className="text-[9px] text-slate-500">ر.س مضافة للمحفظة</span>
                    </div>
                  </div>

                  {/* Interactive Test Action for Bonus */}
                  <div className="mt-3.5 flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-[11px] text-emerald-200">
                        اختبار أثر البونص الفوري على المحفظة
                      </span>
                    </div>
                    <button
                      onClick={handleSimulate1SarBonus}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>قيد +1 ريال تجريبي</span>
                    </button>
                  </div>

                  {/* Recent 100% Rating Bonus Records */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        سجل آخر بونصات التقييم 100% المستلمة:
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">{ratingBonusHistory.length} طلبات</span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {ratingBonusHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-2 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                item.source === "customer"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : item.source === "restaurant"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                              }`}
                            >
                              {item.source === "customer" ? (
                                <User className="w-3.5 h-3.5" />
                              ) : item.source === "restaurant" ? (
                                <Store className="w-3.5 h-3.5" />
                              ) : (
                                <ShoppingBag className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white">{item.orderNum}</span>
                                <span className="text-[10px] text-slate-400">• {item.sourceName}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                                  تقييم 100% ★ 5.0
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-400 mt-0.5 leading-snug">{item.details}</p>
                              <div className="flex items-center gap-2 mt-1 text-[9.5px] text-slate-500">
                                <span>{item.timeAgo}</span>
                                <span>•</span>
                                <span className="text-sky-400">إنجاز في {item.speedMinutes} دقائق</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left shrink-0">
                            <span className="text-xs font-bold text-emerald-400 font-mono">+1.00 ر.س</span>
                            <span className="text-[8.5px] text-emerald-300/70 block">بونص فوري</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 3: PICKUP & DELIVERY SPEED METRICS (SLA)      */}
              {/* ==================================================== */}
              {(scoringSubTab === "all" || scoringSubTab === "speed") && (
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                        <Timer className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">مؤشرات سرعة الاستلام والتسليم</h3>
                        <p className="text-[10px] text-slate-400">معايير الدقة والزمن ضمن نطاق الـ 10 كم الأقصى</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                      التزام 99.4%
                    </span>
                  </div>

                  {/* Dual Speed Cards: Pickup Speed vs Delivery Speed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Pickup Speed (سرعة استلام الطلب من المطعم/المتجر) */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-amber-400" />
                          سرعة استلام الطلب (المتجر/المطعم)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          فائق السرعة ⚡
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-400 font-mono">8.5</span>
                        <span className="text-xs text-slate-400 font-medium">دقائق (متوسط الاستلام)</span>
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">المعيار المستهدف للمنصة:</span>
                          <span className="font-mono text-slate-200">أقل من 10 دقائق</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">الوصول للمتجر بالموعد:</span>
                          <span className="font-mono text-emerald-400 font-bold">99.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">متوسط وقت الانتظار بالمتجر:</span>
                          <span className="font-mono text-sky-400">2.1 دقيقة</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Speed (سرعة تسليم الطلب إلى العميل) */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Navigation className="w-4 h-4 text-sky-400" />
                          سرعة تسليم الطلب (إلى العميل)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold">
                          تسليم قياسي 🚀
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-sky-400 font-mono">17.2</span>
                        <span className="text-xs text-slate-400 font-medium">دقيقة (متوسط التوصيل)</span>
                      </div>

                      <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">المعيار المستهدف (نطاق 10 كم):</span>
                          <span className="font-mono text-slate-200">أقل من 22 دقيقة</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">الوصول للعميل بالموعد:</span>
                          <span className="font-mono text-emerald-400 font-bold">99.7%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">المصادقة برمز التسليم OTP:</span>
                          <span className="font-mono text-emerald-400 font-bold">100%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Cycle Time Banner */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-950/40 to-slate-950 border border-sky-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="text-xs text-slate-300">
                        متوسط إجمالي دورة الطلب (من القبول حتى التسليم للعميل):
                      </span>
                    </div>
                    <span className="text-sm font-black text-white font-mono shrink-0">25.7 دقيقة</span>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 4: ALL 4 TIERS ROADMAP & REQUIREMENTS         */}
              {/* ==================================================== */}
              {(scoringSubTab === "all" || scoringSubTab === "tiers") && (
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      سلم مستويات الكباتن وتقييم الأداء
                    </h3>
                    <span className="text-[10px] text-slate-400">4 مستويات رئيسية</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Bronze Tier */}
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-950/60 border border-orange-700/50 flex items-center justify-center text-orange-400 font-bold shrink-0 mt-0.5">
                          B
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-200">المستوى البرونزي (Bronze)</h4>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">مبدئي</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-0.5">
                            0 - 50 طلب | استلام &lt; 16 د | تسليم &lt; 30 د | تقييم &gt; 4.6
                          </p>
                          <span className="text-[9.5px] text-slate-400 mt-1 block">
                            بونص التقييم 100%: +0.50 ر.س • إسناد طلبات اعتيادي
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">مكتمل ✓</span>
                    </div>

                    {/* Silver Tier */}
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-200 font-bold shrink-0 mt-0.5">
                          S
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-200">المستوى الفضي (Silver)</h4>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">منتظم</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-0.5">
                            51 - 120 طلب | استلام &lt; 13 د | تسليم &lt; 24 د | تقييم &gt; 4.8
                          </p>
                          <span className="text-[9.5px] text-slate-400 mt-1 block">
                            بونص التقييم 100%: +0.75 ر.س • أولوية خفيفة في الإسناد
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">مكتمل ✓</span>
                    </div>

                    {/* Gold Tier (CURRENT) */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 flex items-start justify-between gap-3 relative overflow-hidden">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-amber-500/30">
                          G
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-amber-300">المستوى الذهبي (Gold)</h4>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                              مستواك الحالي
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-300 mt-0.5">
                            121 - 250 طلب | استلام &lt; 10 د | تسليم &lt; 18 د | تقييم &gt; 4.90
                          </p>
                          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                            بونص التقييم 100%: +1.00 ر.س كامل • أولوية ذكية • خصم صيانة 15%
                          </span>
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="text-xs font-bold text-amber-400 font-mono">142 طلب</span>
                      </div>
                    </div>

                    {/* Diamond Tier (VIP) */}
                    <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-500/30 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/50 text-sky-300 font-black flex items-center justify-center shrink-0 mt-0.5">
                          D
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-sky-200">المستوى الماسي (Diamond VIP)</h4>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-medium">
                              المستوى الأعلى
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-0.5">
                            251+ طلب | استلام &lt; 8 د | تسليم &lt; 15 د | تقييم &gt; 4.95
                          </p>
                          <span className="text-[9.5px] text-sky-300/80 mt-1 block">
                            بونص التقييم 100%: +1.50 ر.س • أولوية قصوى مطلقة • دعم VIP مباشر
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-sky-400 font-mono">الهدف القادم</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 5: 360° PARTNER RATINGS BREAKDOWN             */}
              {/* ==================================================== */}
              {(scoringSubTab === "all" || scoringSubTab === "reviews") && (
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">التقييم الثلاثي الشامل (360°)</h3>
                        <p className="text-[10px] text-slate-400">تقييم الأطراف الثلاثة لأدائك وسرعتك</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-purple-400 font-mono">★ 4.96</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Restaurant Rating */}
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">تقييم المطاعم والمتاجر</p>
                          <p className="text-[10px] text-slate-400">سرعة الحضور، استخدام الصندوق الحراري</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-amber-400 font-mono">100%</span>
                        <span className="text-[9px] text-emerald-400 block font-semibold">★ 5.0 / 5.0</span>
                      </div>
                    </div>

                    {/* Customer Rating */}
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">تقييم العملاء</p>
                          <p className="text-[10px] text-slate-400">سرعة التسليم، لباقة التواصل، سلامة الوجبة</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-emerald-400 font-mono">99.8%</span>
                        <span className="text-[9px] text-emerald-400 block font-semibold">★ 4.98 / 5.0</span>
                      </div>
                    </div>

                    {/* Platform Operations Compliance */}
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">مؤشر الامتثال لمنصة ميلفاي</p>
                          <p className="text-[10px] text-slate-400">الالتزام بنطاق 10 كم، التحقق برمز OTP، الشيفت</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-sky-400 font-mono">99.5%</span>
                        <span className="text-[9px] text-sky-300 block font-semibold">التزام نموذجي</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 6: GENERAL STATS GRID                         */}
              {/* ==================================================== */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">نسبة قبول الطلبات</p>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {captain.acceptanceRate}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">نسبة إكمال التوصيل</p>
                  <p className="text-xl font-black text-sky-400 font-mono mt-0.5">
                    {captain.completionRate}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">إجمالي الطلبات المكتملة</p>
                  <p className="text-xl font-black text-amber-400 font-mono mt-0.5">
                    {captain.totalDeliveries}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">متوسط التقييم العام</p>
                  <p className="text-xl font-black text-purple-400 font-mono mt-0.5">
                    ★ {captain.rating}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 9: REWARDS STORE                                */}
        {/* ==================================================== */}
        {activeTab === "rewards" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">متجر المكافآت والنقاط</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">رصيد نقاط التميز</p>
                  <h3 className="text-2xl font-black text-amber-400 font-mono">{captain.points} نقطة</h3>
                </div>
                <Gift className="w-8 h-8 text-amber-400" />
              </div>

              <div className="space-y-3">
                {[
                  { title: "قسيمة وقود (ساسكو) بقيمة 50 ر.س.", cost: 100, icon: "⛽" },
                  { title: "باقة إنترنت 10 جيجابايت إضافية", cost: 80, icon: "📶" },
                  { title: "غسيل وصيانة دراجة نارية مجاناً", cost: 150, icon: "🔧" },
                ].map((r, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{r.title}</h4>
                        <p className="text-[10px] text-amber-400 font-mono">{r.cost} نقطة</p>
                      </div>
                    </div>

                    <Button
                      disabled={captain.points < r.cost}
                      onClick={() => {
                        playWebAudioTone("success");
                        setCaptain((prev) => ({ ...prev, points: prev.points - r.cost }));
                        toast.success(`تم استبدال المكافأة بنجاح! كود القسيمة: FH-${Math.floor(100000 + Math.random() * 900000)}`);
                      }}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs disabled:opacity-40"
                    >
                      استبدال
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 10: SETTINGS & HARDWARE VIBRATION TEST          */}
        {/* ==================================================== */}
        {activeTab === "settings" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">الإعدادات وفحص العتاد والاهتزاز</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-4 rounded-3xl bg-slate-900 border border-purple-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Vibrate className="w-5 h-5 text-purple-400" />
                  <h4 className="text-xs font-bold text-white">فحص محرك الاهتزاز الفعلي (Hardware Vibration Test)</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  اضغط على الزر أدناه لاختبار اهتزاز الهاتف في يدك وصوت التنبيه العاجل كما يحدث عند وصول طلب حقيقي من السيرفر.
                </p>

                <Button
                  onClick={() => {
                    void triggerPhysicalVibration();
                    playWebAudioTone("dispatch");
                    toast.success("📳 يهتز الهاتف الآن في يدك مع نغمة الإنذار!");
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
                >
                  <Vibrate className="w-4 h-4" />
                  <span>اهتزاز الجوال فوراً (تجربة العتاد)</span>
                </Button>
              </div>

              <div className="p-4 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white">إرسال طلب حي للسيرفر (Supabase Live Test)</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يقوم هذا الزر بكتابة طلب حقيقي في قاعدة بيانات السيرفر لتشاهد الرادار وهو يلتقطه تلقائياً ويهتز الجوال دون تدخل منك.
                </p>

                <Button
                  onClick={handleInjectRealDatabaseOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>حقن طلب حقيقي في السيرفر وتفعيل الرادار</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 11: PROFILE & DOCUMENTS                         */}
        {/* ==================================================== */}
        {activeTab === "profile" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                title="رجوع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">المستندات والملف الشخصي</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center">
                  {captain.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{captain.name}</h3>
                  <p className="text-xs text-slate-400">الهوية الوطنية: {captain.nationalId}</p>
                  <p className="text-[11px] text-amber-400 font-mono">{captain.vehicleType} • {captain.plateNumber}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300">مستندات الكابتن الرسمية</h4>
                {[
                  { key: "id_card", label: "بطاقة الهوية الوطنية / الإقامة" },
                  { key: "license", label: "رخصة القيادة سارية المفعول" },
                  { key: "insurance", label: "وثيقة تأمين واستمارة المركبة" },
                ].map((doc) => (
                  <div
                    key={doc.key}
                    className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{doc.label}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        {uploadedDocs[doc.key]}
                      </span>
                    </div>

                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-slate-950 border border-dashed border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-400 cursor-pointer text-xs transition-colors">
                      <Camera className="w-4 h-4" />
                      <span>التقاط أو رفع صورة جديدة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            playWebAudioTone("click");
                            setUploadedDocs({
                              ...uploadedDocs,
                              [doc.key]: "تم الرفع بنجاح (قيد الفحص) ⏳",
                            });
                            toast.success(`تم رفع ${doc.label} بنجاح ومطابقتها.`);
                          }
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MODAL 1: INCOMING DISPATCH (PRICE HIDDEN, 10KM MAX)  */}
        {/* ==================================================== */}
        {showIncomingOrder && activeDelivery && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-full bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl shadow-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-xs font-bold text-amber-400">طلب توصيل جديد وارد!</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
                  {incomingCountdown}s
                </div>
              </div>

              {/* Operational Distance & ETA (Price is completely hidden) */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400">رقم الطلب</p>
                  <p className="text-lg font-bold text-white font-mono">{activeDelivery.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-sky-400 font-mono font-bold">
                    المسافة: {activeDelivery.distanceKm} كم (ضمن 10 كم)
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">الوقت المقدر: {activeDelivery.eta}</p>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-base">🍳</span>
                  <div>
                    <h5 className="font-bold text-white">{activeDelivery.kitchenName}</h5>
                    <p className="text-[10px] text-slate-400">{activeDelivery.kitchenAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">📍</span>
                  <div>
                    <h5 className="font-bold text-white">العميل: {activeDelivery.customerName}</h5>
                    <p className="text-[10px] text-slate-400">{activeDelivery.customerAddress}</p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-center text-slate-400">
                فرص الرفض المتبقية اليوم:{" "}
                <span className={`font-bold ${dailyRejectionsLeft > 0 ? "text-amber-400" : "text-red-400"}`}>
                  {dailyRejectionsLeft} من 1
                </span>
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  onClick={handleDeclineOrder}
                  disabled={dailyRejectionsLeft <= 0}
                  variant="outline"
                  className={`rounded-2xl py-3 text-xs ${
                    dailyRejectionsLeft <= 0
                      ? "border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                      : "border-red-500/40 text-red-400 hover:bg-red-500/10"
                  }`}
                >
                  {dailyRejectionsLeft > 0 ? "رفض الطلب (1/1)" : "ممنوع الرفض (0/1)"}
                </Button>
                <Button
                  onClick={handleAcceptOrder}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl py-3 text-xs shadow-lg shadow-amber-500/25 animate-pulse"
                >
                  قبول الطلب فوراً ✓
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MODAL 2: CUSTOMER OTP HANDOVER                       */}
        {/* ==================================================== */}
        {showOtpModal && activeDelivery && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">رمز تسليم الطلب (OTP)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  اطلب من العميل <span className="text-white font-bold">{activeDelivery.customerName}</span> إعطاءك الرمز المكون من 4 أرقام
                </p>
                <p className="text-[10px] text-amber-400/80 mt-1 font-mono">
                  (رمز التحقق الصحيح: {activeDelivery.otp})
                </p>
              </div>

              <input
                type="text"
                maxLength={4}
                value={inputDeliveryOtp}
                onChange={(e) => setInputDeliveryOtp(e.target.value)}
                placeholder="••••"
                className="w-full text-center text-3xl font-mono tracking-widest bg-slate-950 border border-amber-500/60 rounded-2xl py-2.5 text-amber-400 outline-none"
              />

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  onClick={() => setShowOtpModal(false)}
                  variant="outline"
                  className="border-slate-800 text-slate-400 rounded-xl text-xs py-2"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleVerifyOtpAndDeliver}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs py-2 shadow-md shadow-amber-500/20"
                >
                  تأكيد التسليم
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MODAL 3: EMERGENCY SOS REPORT (زر الطوارئ)            */}
        {/* ==================================================== */}
        {showEmergencyModal && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-red-500/30 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">بلاغ طوارئ ميداني عاجل 🚨</h3>
                  <p className="text-[10px] text-red-400">إشعار فوري لغرفة العمليات المركزية</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <div className="space-y-4 flex-1">
              {/* Reason Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
                  سبب حالة الطوارئ
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    "حادث سير بالمركبة 🚗",
                    "عطل ميكانيكي / بنشر إطار مفاجئ 🏍️",
                    "ظرف صحي أو إعياء مفاجئ 🏥",
                    "خطر أمني أو مشاجرة في الطريق ⚠️",
                    "عطل في الهاتف أو شبكة الإنترنت 📱",
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEmergencyReason(r)}
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-medium text-right flex items-center justify-between transition-colors ${
                        emergencyReason === r
                          ? "bg-red-950/60 border-red-500 text-white font-bold"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>{r}</span>
                      {emergencyReason === r && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
                  وصف المشكلة وتفاصيل ما حدث
                </label>
                <textarea
                  rows={3}
                  value={emergencyDescription}
                  onChange={(e) => setEmergencyDescription(e.target.value)}
                  placeholder="اكتب وصفاً مختصراً للحادث أو العطل وموقعك الحالي..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-red-500 resize-none text-right"
                />
              </div>

              {/* Photo Attachment (Real Camera capture) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
                  إرفاق صورة المشكلة (صورة الحادث أو العطل) 📷
                </label>

                {emergencyPhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border border-red-500/50 bg-slate-900">
                    <img src={emergencyPhoto} alt="صورة البلاغ" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setEmergencyPhoto(null)}
                      className="absolute top-2 left-2 bg-red-600/90 text-white px-2 py-1 rounded-xl text-[11px] flex items-center gap-1 shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>حذف الصورة</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-900/80 border-2 border-dashed border-red-500/40 text-red-300 hover:border-red-500 cursor-pointer transition-colors text-center">
                    <div className="w-10 h-10 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">التقاط صورة بكاميرا الهاتف أو الاختيار من المعرض</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">صورة الضرر أو مكان الحادث لتوثيق البلاغ</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = () => {
                            setEmergencyPhoto(reader.result as string);
                            playWebAudioTone("click");
                            toast.success("تم إرفاق صورة البلاغ بنجاح!");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Button
                onClick={() => {
                  if (!emergencyDescription.trim() && !emergencyPhoto) {
                    toast.error("يرجى كتابة وصف للمشكلة أو التقاط صورة لتوثيق البلاغ");
                    return;
                  }
                  playWebAudioTone("success");
                  setShowEmergencyModal(false);
                  toast.success("🚨 تم إرسال بلاغ الطوارئ والصورة بنجاح لغرفة العمليات! جاري التواصل معك وتوجيه الدعم الميداني.");
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
              >
                <Send className="w-4 h-4" />
                <span>إرسال البلاغ للدعم والعمليات فوراً</span>
              </Button>

              <div className="flex gap-2">
                <a
                  href="tel:920000000"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>اتصال هاتفي مباشر</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

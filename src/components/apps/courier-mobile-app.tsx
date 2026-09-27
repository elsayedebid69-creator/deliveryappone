import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Web Audio sound synthesizer for realistic Captain HUD audio
function playWebAudioTone(type: "dispatch" | "biometric" | "success" | "click" | "warning" | "blocked") {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "dispatch") {
      // High urgency double-frequency radar alert
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1450, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "biometric") {
      // High tech biometric chime
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
      // Triad celebration
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
      // Heavy warning tone
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
    // Web Audio blocked or not supported
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
  tier: "Silver" | "Gold" | "Platinum";
  walletBalance: number;
  points: number;
  totalDeliveries: number;
  acceptanceRate: number;
  completionRate: number;
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

  // Captain Profile & Status
  const [captain, setCaptain] = useState<CaptainProfile>(DEFAULT_CAPTAIN);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "map" | "drawer" | "wallet" | "payouts" | "inbox" | "schedule" | "scoring" | "rewards" | "settings" | "profile" | "support"
  >("map");

  // Rejection Policy: Max 1 rejection per day
  const [dailyRejectionsLeft, setDailyRejectionsLeft] = useState<number>(1);

  // In-App Leaflet Navigation Map
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const captainMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routePolylineRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const targetMarkersGroupRef = useRef<any>(null);
  const [captainCoords, setCaptainCoords] = useState<[number, number]>([24.7136, 46.6753]);
  const [gpsAccuracy, setGpsAccuracy] = useState<string>("عالية (± 4م)");
  const [showHotspotLayers, setShowHotspotLayers] = useState(true);

  // Active Dispatch State (Price hidden, max 10km)
  const [showIncomingOrder, setShowIncomingOrder] = useState(false);
  const [incomingCountdown, setIncomingCountdown] = useState(25);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [inputDeliveryOtp, setInputDeliveryOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Wallet STC Pay State
  const [walletSubTab, setWalletSubTab] = useState<"main" | "stc_deposit" | "stc_withdraw">("main");
  const [stcPhone, setStcPhone] = useState("0559876543");
  const [stcDepositAmount, setStcDepositAmount] = useState("50");
  const [stcWithdrawAmount, setStcWithdrawAmount] = useState("100");

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

  // Real-time GPS Watcher
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setCaptainCoords(coords);
        setGpsAccuracy(`عالية (± ${Math.round(pos.coords.accuracy)}م)`);
        if (captainMarkerRef.current) {
          captainMarkerRef.current.setLatLng(coords);
        }
      },
      () => {
        setGpsAccuracy("محاكاة GPS (الرياض)");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // In-App Leaflet Map Initialization
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: captainCoords,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // Dark CartoDB Matter Tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      targetMarkersGroupRef.current = L.layerGroup().addTo(map);

      // Captain Beacon Icon
      const captainIcon = L.divIcon({
        className: "custom-captain-beacon",
        html: `
          <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(14,165,233,0.3); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(14,165,233,0.5);"></div>
            <div style="width:24px; height:24px; border-radius:50%; background:#0284c7; border:3px solid #ffffff; box-shadow:0 0 14px #38bdf8; display:flex; align-items:center; justify-content:center;">
              <div style="width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:7px solid #ffffff; transform:rotate(-45deg);"></div>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      captainMarkerRef.current = L.marker(captainCoords, { icon: captainIcon }).addTo(map);

      // Add Hotspots (Demand indicator without cash bonus)
      HOTSPOTS.forEach((h) => {
        const circle = L.circle(h.coords, {
          color: "#f59e0b",
          fillColor: "#f59e0b",
          fillOpacity: 0.15,
          radius: 650,
          weight: 2,
          dashArray: "4, 6",
        });

        circle.bindPopup(`
          <div style="direction:rtl; font-family:Cairo,sans-serif; text-align:right; padding:4px;">
            <strong style="color:#d97706; font-size:13px;">🔥 ${h.name}</strong><br/>
            <span style="font-size:12px; color:#333;">كثافة الطلب: <b>مرتفعة</b></span><br/>
            <span style="font-size:11px; color:#666;">الطلبات الجارية: ${h.orders} طلب</span>
          </div>
        `);

        if (targetMarkersGroupRef.current) {
          targetMarkersGroupRef.current.addLayer(circle);
        }
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update In-App Route Polyline & Markers
  useEffect(() => {
    if (typeof window === "undefined" || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }

      if (activeDelivery) {
        const points = [
          captainCoords,
          activeDelivery.kitchenCoords,
          activeDelivery.customerCoords,
        ];

        const polyline = L.polyline(points, {
          color: "#06b6d4",
          weight: 5,
          opacity: 0.85,
          dashArray: "8, 12",
        }).addTo(map);

        routePolylineRef.current = polyline;

        const kitchenIcon = L.divIcon({
          className: "custom-kitchen-marker",
          html: `
            <div style="background:#10b981; color:#fff; padding:6px 10px; border-radius:12px; border:2px solid #fff; font-family:Cairo,sans-serif; font-size:11px; font-weight:bold; box-shadow:0 4px 12px rgba(0,0,0,0.5); display:flex; align-items:center; gap:4px; white-space:nowrap;">
              <span>🍳</span> <span>المطبخ: ${activeDelivery.kitchenName}</span>
            </div>
          `,
          iconSize: [120, 32],
          iconAnchor: [60, 16],
        });

        const customerIcon = L.divIcon({
          className: "custom-customer-marker",
          html: `
            <div style="background:#ef4444; color:#fff; padding:6px 10px; border-radius:12px; border:2px solid #fff; font-family:Cairo,sans-serif; font-size:11px; font-weight:bold; box-shadow:0 4px 12px rgba(0,0,0,0.5); display:flex; align-items:center; gap:4px; white-space:nowrap;">
              <span>📍</span> <span>العميل: ${activeDelivery.customerName}</span>
            </div>
          `,
          iconSize: [120, 32],
          iconAnchor: [60, 16],
        });

        const m1 = L.marker(activeDelivery.kitchenCoords, { icon: kitchenIcon });
        const m2 = L.marker(activeDelivery.customerCoords, { icon: customerIcon });

        if (targetMarkersGroupRef.current) {
          targetMarkersGroupRef.current.addLayer(m1);
          targetMarkersGroupRef.current.addLayer(m2);
        }

        map.fitBounds(polyline.getBounds(), { padding: [60, 60] });
      }
    });
  }, [activeDelivery, captainCoords]);

  // Recenter in-app map on captain
  const handleRecenter = () => {
    playWebAudioTone("click");
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(captainCoords, 16, { animate: true });
    }
  };

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

  // Check incoming dispatch (Price is hidden, distance within 10 km)
  const checkForIncomingDispatch = async () => {
    triggerIncomingAlert({
      id: `ord-live-${Date.now().toString().slice(-4)}`,
      orderNumber: `#FH-${Math.floor(1000 + Math.random() * 9000)}`,
      kitchenName: "مطبخ FoodHub المركزي (السحابي)",
      kitchenAddress: "حي النرجس، تقاطع طريق الملك سلمان - الرياض",
      kitchenCoords: [24.74, 46.66],
      customerName: "سلطان الشمري",
      customerPhone: "0554321987",
      customerAddress: "حي الياسمين، شارع القادسية، عمارة 4، شقة 12",
      customerCoords: [24.77, 46.64],
      items: ["1x وجبة شاورما دجاج جامبو", "1x حمص بيروتي خاص", "1x مشروب موهيتو توت"],
      distanceKm: 4.8, // strictly under 10 km
      eta: "14 دقيقة",
      step: 1,
      otp: "5912",
    });
  };

  const triggerIncomingAlert = (delivery: ActiveDelivery) => {
    // Enforce 10 km rule
    if (delivery.distanceKm > 10) {
      toast.error("تم استبعاد الطلب: يتجاوز النطاق الجغرافي الأقصى للمندوب (10 كم)");
      return;
    }
    setActiveDelivery(delivery);
    setIncomingCountdown(25);
    setShowIncomingOrder(true);
    playWebAudioTone("dispatch");
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

    // Fee earned without displaying to courier during delivery
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

  // ==========================================
  // DUAL SECURITY AUTHENTICATION (OTP + FACE ID)
  // ==========================================
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

  const handleStartFaceIdScan = () => {
    setIsFaceScanning(true);
    playWebAudioTone("biometric");

    setTimeout(() => {
      setIsFaceScanning(false);
      setFaceScanSuccess(true);
      playWebAudioTone("success");

      setTimeout(() => {
        setIsAuthenticated(true);
        setFaceScanSuccess(false);
        toast.success(`تم التحقق المزدوج بنجاح! أهلاً بك كابتن ${captain.name}.`);
      }, 700);
    }, 2000);
  };

  const handleSimulateFaceIdFail = () => {
    setIsFaceScanning(true);
    playWebAudioTone("biometric");

    setTimeout(() => {
      setIsFaceScanning(false);
      const nextFail = faceScanFailedAttempts + 1;
      setFaceScanFailedAttempts(nextFail);
      playWebAudioTone("warning");

      if (nextFail >= 2) {
        playWebAudioTone("blocked");
        setIsAccountBlocked(true);
        toast.error("🚫 تم حظر الحساب لعدم تطابق بصمة الوجه المعتمدة!");
      } else {
        toast.error("فشل التعرف على الوجه! متبقي محاولة واحدة قبل حظر الحساب.");
      }
    }, 1500);
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
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/25 mb-3">
              <Bike className="w-9 h-9 text-slate-950 stroke-[2.2]" />
            </div>
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

          {/* Step 2: Face ID Scan */}
          {authStep === "face_id" && (
            <div className="text-center py-2 space-y-4">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
                    faceScanSuccess
                      ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/30"
                      : isFaceScanning
                      ? "border-sky-400 bg-sky-500/10 animate-pulse shadow-lg shadow-sky-500/30"
                      : "border-slate-700 bg-slate-950/60"
                  }`}
                />

                {isFaceScanning && (
                  <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" />
                )}

                {faceScanSuccess ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-in zoom-in-75 duration-300" />
                ) : (
                  <ScanFace
                    className={`w-16 h-16 transition-colors ${
                      isFaceScanning ? "text-sky-400" : "text-slate-400"
                    }`}
                  />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-white">
                  {faceScanSuccess
                    ? "تم التعرف على الوجه بنجاح!"
                    : isFaceScanning
                    ? "جارٍ مطابقة الملامح مع بطاقة الهوية..."
                    : "التقط بصمة الوجه للتأكيد النهائي"}
                </p>
                <p className="text-[10px] text-red-400 mt-1">
                  تنبيه: عدم تطابق الوجه يؤدي لحظر الحساب فورياً
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  disabled={isFaceScanning || faceScanSuccess}
                  onClick={handleStartFaceIdScan}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-4 h-4" />
                  {isFaceScanning ? "جارٍ المسح..." : "تأكيد بصمة الوجه والدخول"}
                </Button>

                <button
                  onClick={handleSimulateFaceIdFail}
                  className="text-[10px] text-red-400/80 hover:text-red-400 hover:underline block mx-auto pt-1"
                >
                  (تجربة فشل البصمة والحظر)
                </button>
              </div>
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
        {/* VIEW 1: MAP COCKPIT (IN-APP NAVIGATION ONLY)         */}
        {/* ==================================================== */}
        {activeTab === "map" && (
          <div className="relative w-full h-full flex flex-col bg-slate-950">
            {/* Embedded In-App Leaflet Map Canvas */}
            <div
              ref={mapContainerRef}
              className="absolute inset-0 z-0 w-full h-full bg-slate-950"
              style={{ filter: "brightness(0.92) contrast(1.08)" }}
            />

            {/* TOP COCKPIT HEADER (Status Pill, Headset Support, Menu) */}
            <div className="relative z-20 pt-4 px-4 flex items-center justify-between pointer-events-none">
              {/* Hamburger Drawer */}
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("drawer");
                }}
                className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center shadow-lg backdrop-blur-md pointer-events-auto active:scale-95 transition-transform"
              >
                <MenuIcon className="w-5 h-5 text-slate-100" />
              </button>

              {/* Status Pill */}
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setIsOnline(!isOnline);
                  toast(isOnline ? "أنت الآن غير متصل 🔴" : "أنت الآن متصل وجاهز لتلقي الطلبات 🟢");
                }}
                className={`px-4 py-2 rounded-full border shadow-lg backdrop-blur-md flex items-center gap-2.5 pointer-events-auto transition-all active:scale-95 ${
                  isOnline
                    ? "bg-slate-900/90 border-emerald-500/60 text-white"
                    : "bg-slate-900/90 border-red-500/60 text-slate-300"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline ? "bg-emerald-500 animate-ping" : "bg-red-500"
                  }`}
                />
                <span className="text-xs font-bold tracking-wide">
                  الحالة: {isOnline ? "يعمل" : "لا يعمل"}
                </span>
                <span className="text-xs font-mono">{isOnline ? "🟢" : "🔴"}</span>
              </button>

              {/* Headset: Dedicated Support Page Button */}
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("support");
                }}
                title="الدعم الفني وغرفة العمليات"
                className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-amber-500/60 text-amber-400 flex items-center justify-center shadow-lg backdrop-blur-md pointer-events-auto active:scale-95 transition-transform"
              >
                <Headphones className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Accuracy & In-App Routing Indicator */}
            <div className="relative z-10 px-4 mt-2 flex justify-between items-center pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] text-slate-300 flex items-center gap-1.5 shadow-md">
                <Compass className="w-3 h-3 text-sky-400 animate-spin" />
                <span>نظام الملاحة داخل التطبيق نشط</span>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] text-emerald-400 flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>نطاق التوصيل: 10 كم كحد أقصى</span>
              </div>
            </div>

            {/* In-App Turn-By-Turn HUD Overlay (Active Route) */}
            {activeDelivery && (
              <div className="relative z-20 mx-4 mt-2 p-3 rounded-2xl bg-sky-950/90 border border-sky-500/40 text-sky-100 shadow-xl backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {activeDelivery.step === 1 && "استمر للأمام 450 م باتجاه المطبخ"}
                      {activeDelivery.step === 2 && "وصلت لنقطة الاستلام - استلم الوجبة"}
                      {activeDelivery.step >= 3 && "بعد 200 م انعطف يميناً لشارع العميل"}
                    </p>
                    <p className="text-[10px] text-sky-300 font-mono">
                      المسافة: {activeDelivery.distanceKm} كم • {activeDelivery.eta}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Floating Map Controls */}
            <div className="absolute right-4 top-40 z-20 flex flex-col gap-2.5">
              <button
                onClick={handleRecenter}
                title="إعادة تمركز على موقعي"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform"
              >
                <LocateFixed className="w-5 h-5 text-sky-400" />
              </button>

              <button
                onClick={checkForIncomingDispatch}
                title="محاكاة وصول طلب جديد"
                className="w-10 h-10 rounded-xl bg-amber-500/90 border border-amber-300 text-slate-950 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <Radio className="w-5 h-5 animate-spin" />
              </button>
            </div>

            <div className="flex-1" />

            {/* ============================================ */}
            {/* BOTTOM HUD CARD (DELIVERY PRICE IS HIDDEN)   */}
            {/* ============================================ */}
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
              <div className="relative z-20 m-3 p-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">رادار التوزيع اللحظي نشط</h3>
                    <p className="text-[10px] text-slate-400">
                      فرص الرفض المتبقية اليوم:{" "}
                      <span className="text-amber-400 font-bold">{dailyRejectionsLeft} من 1</span>
                    </p>
                  </div>
                </div>

                <Button
                  onClick={checkForIncomingDispatch}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs px-3 shadow-md shadow-amber-500/20"
                >
                  طلب تجريبي
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: DEDICATED SUPPORT PAGE (HEADSET 🎧)          */}
        {/* ==================================================== */}
        {activeTab === "support" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
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
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 4 Tiles */}
            <div className="p-4 grid grid-cols-4 gap-2 border-b border-slate-800/80">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("inbox");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40"
              >
                <div className="relative">
                  <Inbox className="w-5 h-5 text-amber-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></span>
                </div>
                <span className="text-[10px] font-semibold text-slate-300">الوارد</span>
              </button>

              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("schedule");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40"
              >
                <Calendar className="w-5 h-5 text-sky-400" />
                <span className="text-[10px] font-semibold text-slate-300">الشفتات</span>
              </button>

              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("wallet");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40"
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-300">المحفظة</span>
              </button>

              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("payouts");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40"
              >
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] font-semibold text-slate-300">المدفوعات</span>
              </button>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("support");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
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
                  playWebAudioTone("click");
                  setActiveTab("profile");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60"
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
                  playWebAudioTone("click");
                  setActiveTab("scoring");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60"
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
                  playWebAudioTone("click");
                  setActiveTab("rewards");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60"
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
                  playWebAudioTone("click");
                  setActiveTab("settings");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white">الإعدادات وفحص التنبيهات</h4>
                    <p className="text-[10px] text-slate-400">فحص استلام الإشعارات والأصوات</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-slate-800">
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
                <span>تسجيل الخروج والتبديل</span>
              </Button>
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
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">المحفظة وسحب الأرباح (STC Pay)</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Balance Card */}
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

              {/* Subtabs: Operations / STC Pay Deposit / STC Pay Withdraw */}
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

              {/* STC PAY DEPOSIT TAB */}
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

              {/* STC PAY WITHDRAW TAB (خاصية سحب الأرباح) */}
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
        {/* VIEW 5: PAYOUTS (WEEKLY EARNINGS)                    */}
        {/* ==================================================== */}
        {activeTab === "payouts" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
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
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
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
              {/* Day Selector */}
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

              {/* Exact 2 Shifts Cards (12 Hours Each) */}
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
        {/* VIEW 7: INBOX (صندوق الوارد)                         */}
        {/* ==================================================== */}
        {activeTab === "inbox" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
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
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">مستوى الأداء ونقاط التميز</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-center">
                <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">المستوى الذهبي (Gold Captain)</h3>
                <p className="text-xs text-slate-300 mt-1">
                  أنت من أفضل 5% من كباتن المنصة في الرياض!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">نسبة قبول الطلبات</p>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-1">
                    {captain.acceptanceRate}%
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">نسبة إكمال التوصيل</p>
                  <p className="text-xl font-black text-sky-400 font-mono mt-1">
                    {captain.completionRate}%
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">إجمالي الطلبات المكتملة</p>
                  <p className="text-xl font-black text-amber-400 font-mono mt-1">
                    {captain.totalDeliveries}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">متوسط التقييم</p>
                  <p className="text-xl font-black text-purple-400 font-mono mt-1">
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
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
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
        {/* VIEW 10: SETTINGS                                    */}
        {/* ==================================================== */}
        {activeTab === "settings" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-white">الإعدادات وفحص التنبيهات</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white">فحص التنبيهات والأصوات</h4>
                <p className="text-[11px] text-slate-400">
                  تأكد من قدرة التطبيق على تشغيل نغمة إنذار الطلب العاجلة عند ورود طلب جديد من غرفة العمليات.
                </p>

                <Button
                  onClick={() => {
                    playWebAudioTone("dispatch");
                    toast.success("🔔 تجربة التنبيه: يعمل الصوت والإنذار بشكل سليم 100%");
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>تشغيل نغمة اختبار الرادار</span>
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
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("map");
                }}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center"
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
              {/* Header */}
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

              {/* Rejection allowance reminder */}
              <p className="text-[10px] text-center text-slate-400">
                فرص الرفض المتبقية اليوم:{" "}
                <span className={`font-bold ${dailyRejectionsLeft > 0 ? "text-amber-400" : "text-red-400"}`}>
                  {dailyRejectionsLeft} من 1
                </span>
              </p>

              {/* Action Buttons */}
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

      </div>
    </div>
  );
}

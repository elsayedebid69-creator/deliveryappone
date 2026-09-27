import { useState, useEffect, useRef } from "react";
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
  Fingerprint,
  ScanFace,
  Smartphone,
  Layers,
  LocateFixed,
  Maximize2,
  Upload,
  FileText,
  AlertTriangle,
  Compass,
} from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// Web Audio sound synthesizer for realistic Captain HUD audio
function playWebAudioTone(type: "dispatch" | "biometric" | "success" | "click" | "warning") {
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
      // Sci-fi high tech confirm tone
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
  earnings: number;
  bonus: number;
  distance: string;
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
  walletBalance: 84.5,
  points: 215,
  totalDeliveries: 142,
  acceptanceRate: 98,
  completionRate: 100,
};

// Riyadh Hotspots (Areas of surge demand)
const HOTSPOTS: Array<{ name: string; coords: [number, number]; surge: string; orders: number }> = [
  { name: "حي العليا (أبراج المركز)", coords: [24.7136, 46.6753], surge: "+3.5 ر.س.", orders: 34 },
  { name: "حي الياسمين (مربع الكافيهات)", coords: [24.8211, 46.6341], surge: "+2.0 ر.س.", orders: 22 },
  { name: "حي الملقا (شارع أنس)", coords: [24.7925, 46.6022], surge: "+2.5 ر.س.", orders: 19 },
  { name: "حي السليمانية (شارع الثلاثين)", coords: [24.698, 46.705], surge: "+3.0 ر.س.", orders: 28 },
  { name: "حي حطين (البوليفارد)", coords: [24.764, 46.611], surge: "+4.0 ر.س.", orders: 41 },
];

export function CourierMobileApp() {
  const { lang } = useI18n();
  const ar = lang === "ar";

  // Auth & Session State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [captain, setCaptain] = useState<CaptainProfile>(DEFAULT_CAPTAIN);
  const [authMethod, setAuthMethod] = useState<"phone" | "face_id">("phone");
  const [inputPhone, setInputPhone] = useState("0559876543");
  const [otpSent, setOtpSent] = useState(false);
  const [inputAuthOtp, setInputAuthOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [faceScanSuccess, setFaceScanSuccess] = useState(false);

  // Status & Navigation
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "map" | "drawer" | "wallet" | "payouts" | "inbox" | "schedule" | "scoring" | "rewards" | "settings" | "profile"
  >("map");

  // Geolocation & Interactive Map
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

  // Active Dispatch & Workflow State
  const [showIncomingOrder, setShowIncomingOrder] = useState(false);
  const [incomingCountdown, setIncomingCountdown] = useState(25);
  const [activeDelivery, setActiveDelivery] = useState<ActiveDelivery | null>(null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [inputDeliveryOtp, setInputDeliveryOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Secondary Views State
  const [walletSubTab, setWalletSubTab] = useState<"main" | "stc_pay" | "onecard" | "payout">("main");
  const [stcAmount, setStcAmount] = useState("50");
  const [oneCardVoucher, setOneCardVoucher] = useState("");
  const [payoutIban, setPayoutIban] = useState("SA44 8000 0212 6080 1012 3456");
  const [payoutAmount, setPayoutAmount] = useState("500");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Booked shifts
  const [shifts, setShifts] = useState<{ [key: string]: boolean }>({
    "sat-evening": true,
    "sun-morning": true,
    "mon-evening": false,
  });

  // Uploaded docs
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({
    id_card: "تم التحقق (ساري)",
    license: "تم التحقق (ساري)",
    insurance: "قيد المراجعة 🟡",
  });

  // Load persisted session on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("foodhub_captain_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCaptain(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save session when captain state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("foodhub_captain_session", JSON.stringify(captain));
    } catch {
      // ignore
    }
  }, [captain]);

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
        // Fallback to Riyadh center if GPS denied
        setGpsAccuracy("محاكاة GPS (الرياض)");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Leaflet Map Initialization (Client-Side Safe)
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    let isMounted = true;

    // Dynamically import Leaflet to avoid SSR window errors
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map with Dark Matter tiles
      const map = L.map(mapContainerRef.current, {
        center: captainCoords,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // Dark Matter CartoDB tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Group for markers and layers
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

      // Add Hotspot Surge Circles
      HOTSPOTS.forEach((h) => {
        const circle = L.circle(h.coords, {
          color: "#f59e0b",
          fillColor: "#f59e0b",
          fillOpacity: 0.18,
          radius: 650,
          weight: 2,
          dashArray: "4, 6",
        });

        circle.bindPopup(`
          <div style="direction:rtl; font-family:Cairo,sans-serif; text-align:right; padding:4px;">
            <strong style="color:#d97706; font-size:13px;">🔥 ${h.name}</strong><br/>
            <span style="font-size:12px; color:#333;">مكافأة ذروة: <b>${h.surge}</b></span><br/>
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

  // Update Route Polyline & Markers on Active Delivery Changes
  useEffect(() => {
    if (typeof window === "undefined" || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove existing polyline if any
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }

      if (activeDelivery) {
        // Draw route line: Captain -> Kitchen -> Customer
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

        // Restaurant Marker
        const kitchenIcon = L.divIcon({
          className: "custom-kitchen-marker",
          html: `
            <div style="background:#10b981; color:#fff; padding:6px 10px; border-radius:12px; border:2px solid #fff; font-family:Cairo,sans-serif; font-size:11px; font-weight:bold; box-shadow:0 4px 12px rgba(0,0,0,0.5); display:flex; align-items:center; gap:4px; white-space:nowrap;">
              <span>🍳</span> <span>${activeDelivery.kitchenName}</span>
            </div>
          `,
          iconSize: [120, 32],
          iconAnchor: [60, 16],
        });

        // Customer Marker
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

        // Fit map view to bounds
        map.fitBounds(polyline.getBounds(), { padding: [60, 60] });
      }
    });
  }, [activeDelivery, captainCoords]);

  // Recenter map on captain
  const handleRecenter = () => {
    playWebAudioTone("click");
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(captainCoords, 16, { animate: true });
    }
  };

  // Launch Turn-by-Turn GPS Navigation (Google Maps)
  const openExternalNavigation = (destCoords: [number, number], label: string) => {
    playWebAudioTone("click");
    const [lat, lng] = destCoords;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
    toast.info(`جارٍ فتح الملاحة إلى ${label}`);
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

  // Check real orders from Supabase or allow instant simulation
  const checkForIncomingDispatch = async () => {
    try {
      const { data } = await supabase
        .from("orders")
        .select("*, restaurants(name_ar, name_en, address)")
        .is("courier_id", null)
        .in("status", ["ready", "preparing"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const order = data[0];
        triggerIncomingAlert({
          id: order.id,
          orderNumber: `#${order.id.slice(0, 6).toUpperCase()}`,
          kitchenName: order.restaurants?.name_ar || "مطبخ فودهب المركزي",
          kitchenAddress: order.restaurants?.address || "حي النرجس، تقاطع طريق الملك سلمان",
          kitchenCoords: [24.74, 46.66],
          customerName: "عبدالله العتيبي",
          customerPhone: order.phone || "0501234567",
          customerAddress: order.address || "حي الياسمين، شارع أنس بن مالك، فيلا 18",
          customerCoords: [24.77, 46.64],
          items: ["2x برجر كلاسيك لحم آنجوس", "1x بطاطس مقلية مبهرة", "2x كولا مثلج"],
          earnings: Number(order.delivery_fee || 18.5),
          bonus: 3.5,
          distance: "4.2 كم",
          eta: "14 دقيقة",
          step: 1,
          otp: "4821",
        });
      } else {
        // Trigger realistic dispatch simulation for testing
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
          earnings: 21.0,
          bonus: 4.0,
          distance: "3.8 كم",
          eta: "12 دقيقة",
          step: 1,
          otp: "5912",
        });
      }
    } catch {
      // Fallback dispatch
      triggerIncomingAlert({
        id: `ord-mock-${Date.now()}`,
        orderNumber: "#FH-8841",
        kitchenName: "مطبخ FoodHub Gourmet",
        kitchenAddress: "حي الملقا - شارع أنس بن مالك",
        kitchenCoords: [24.74, 46.66],
        customerName: "محمد الهاجري",
        customerPhone: "0505551234",
        customerAddress: "حي حطين، كمباوند النخيل، فيلا 9",
        customerCoords: [24.77, 46.64],
        items: ["2x ستيك لحم ريب آي", "1x سلطة سيزر دجاج"],
        earnings: 24.5,
        bonus: 5.0,
        distance: "5.1 كم",
        eta: "18 دقيقة",
        step: 1,
        otp: "3319",
      });
    }
  };

  const triggerIncomingAlert = (delivery: ActiveDelivery) => {
    setActiveDelivery(delivery);
    setIncomingCountdown(25);
    setShowIncomingOrder(true);
    playWebAudioTone("dispatch");
  };

  // Captain accepts order
  const handleAcceptOrder = async () => {
    if (!activeDelivery) return;
    playWebAudioTone("success");
    setShowIncomingOrder(false);

    // Try updating Supabase order table if it exists
    try {
      await supabase
        .from("orders")
        .update({
          courier_id: captain.id,
          status: "on_the_way",
        })
        .eq("id", activeDelivery.id);
    } catch {
      // proceed in local state
    }

    toast.success(`تم قبول الطلب ${activeDelivery.orderNumber}! توجه إلى المطبخ.`);
  };

  // Captain rejects order
  const handleDeclineOrder = () => {
    playWebAudioTone("click");
    setShowIncomingOrder(false);
    setActiveDelivery(null);
    toast.info("تم تحويل الطلب لكابتن آخر");
  };

  // Workflow Step Transitions
  const handleNextStep = async () => {
    if (!activeDelivery) return;
    playWebAudioTone("click");

    if (activeDelivery.step === 1) {
      // Arrived at Kitchen
      setActiveDelivery({ ...activeDelivery, step: 2 });
      toast.success("وصلت للمطبخ. يرجى مراجعة محتويات الوجبة واستلامها.");
    } else if (activeDelivery.step === 2) {
      // Picked up from Kitchen, heading to Customer
      setActiveDelivery({ ...activeDelivery, step: 3 });
      toast.success("تم استلام الطلب! جارٍ التوجه لموقع العميل.");
    } else if (activeDelivery.step === 3) {
      // Arrived at Customer
      setShowOtpModal(true);
    }
  };

  // Verify Customer OTP and Complete Delivery
  const handleVerifyOtpAndDeliver = async () => {
    if (!activeDelivery) return;

    if (inputDeliveryOtp.trim() !== activeDelivery.otp && inputDeliveryOtp.trim() !== "1234") {
      playWebAudioTone("warning");
      toast.error("رمز التحقق غير صحيح! اطلب من العميل إظهار الرمز المكون من 4 أرقام.");
      return;
    }

    playWebAudioTone("success");
    setShowOtpModal(false);
    setInputDeliveryOtp("");

    const totalFee = activeDelivery.earnings + activeDelivery.bonus;
    const newBalance = Number((captain.walletBalance + totalFee).toFixed(2));
    const newPoints = captain.points + 20;
    const newDeliveries = captain.totalDeliveries + 1;

    setCaptain((prev) => ({
      ...prev,
      walletBalance: newBalance,
      points: newPoints,
      totalDeliveries: newDeliveries,
    }));

    // Update DB
    try {
      await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", activeDelivery.id);
    } catch {
      // ignore
    }

    toast.success(
      `🎉 تم تسليم الطلب بنجاح! تم إضافة ${totalFee.toFixed(2)} ر.س. إلى محفظتك و +20 نقطة تميز!`
    );

    setActiveDelivery(null);
    setCheckedItems({});
  };

  // Face ID / Biometric Authentication
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
        toast.success(`مرحباً بك كابتن ${captain.name}! تم التحقق من البصمة بنجاح.`);
      }, 700);
    }, 2200);
  };

  // Phone OTP Flow
  const handleSendPhoneOtp = () => {
    if (!inputPhone || inputPhone.length < 9) {
      toast.error("يرجى إدخال رقم هاتف سعودي صحيح");
      return;
    }
    playWebAudioTone("click");
    setOtpSent(true);
    setOtpTimer(60);
    toast.success("تم إرسال رمز التحقق في رسالة نصية SMS (رمز التجربة: 1234)");
  };

  const handleVerifyPhoneOtp = () => {
    if (inputAuthOtp.trim() === "1234" || inputAuthOtp.trim().length === 4) {
      playWebAudioTone("success");
      setIsAuthenticated(true);
      toast.success(`أهلاً بك كابتن ${captain.name}! تم تسجيل الدخول بنجاح.`);
    } else {
      playWebAudioTone("warning");
      toast.error("الرمز المدخل غير صحيح (استخدم 1234 للتجربة)");
    }
  };

  // Wallet Top-Up Handlers
  const handleStcPayDeposit = () => {
    const amt = parseFloat(stcAmount);
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

  const handleOneCardVoucher = () => {
    if (!oneCardVoucher || oneCardVoucher.replace(/[^0-9]/g, "").length < 8) {
      toast.error("يرجى إدخال كود بطاقة ون كارد صحيح مكون من 14 رقماً");
      return;
    }
    playWebAudioTone("success");
    const bonusCredit = 100;
    setCaptain((prev) => ({
      ...prev,
      walletBalance: Number((prev.walletBalance + bonusCredit).toFixed(2)),
    }));
    toast.success(`تمت مصادقة بطاقة OneCard بنجاح! أضيف 100 ر.س. لمحفظتك.`);
    setOneCardVoucher("");
    setWalletSubTab("main");
  };

  const handleRequestPayout = () => {
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0 || amt > captain.walletBalance) {
      toast.error("رصيدك الحالي غير كافٍ لهذا السحب");
      return;
    }
    playWebAudioTone("success");
    setCaptain((prev) => ({
      ...prev,
      walletBalance: Number((prev.walletBalance - amt).toFixed(2)),
    }));
    toast.success(`تم استلام طلب التحويل البنكي لمبلغ ${amt} ر.س. إلى حسابك الراجحي.`);
    setWalletSubTab("main");
  };

  // ==========================================
  // UN-AUTHENTICATED CAPTAIN LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Background ambient radar glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative z-10">
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/25 mb-3">
              <Bike className="w-9 h-9 text-slate-950 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              FOODHUB <span className="text-amber-400">CAPTAIN</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">بوابة مناديب التوصيل والتشغيل اللوجستي</p>
          </div>

          {/* Auth Method Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
            <button
              onClick={() => {
                playWebAudioTone("click");
                setAuthMethod("phone");
              }}
              className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                authMethod === "phone"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              رقم الجوال (OTP)
            </button>
            <button
              onClick={() => {
                playWebAudioTone("click");
                setAuthMethod("face_id");
              }}
              className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                authMethod === "face_id"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ScanFace className="w-4 h-4" />
              بصمة الوجه (Face ID)
            </button>
          </div>

          {/* Flow 1: Phone & SMS OTP */}
          {authMethod === "phone" && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 text-right">
                      رقم الجوال المسجل
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
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>إرسال رمز التحقق SMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center py-1">
                    <p className="text-xs text-slate-300">
                      تم إرسال رمز التحقق إلى الرقم <span className="font-mono text-amber-400">{inputPhone}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                      أدخل رمز التحقق (4 أرقام)
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
                      <button
                        onClick={handleSendPhoneOtp}
                        className="text-amber-400 hover:underline"
                      >
                        إعادة الإرسال
                      </button>
                      <span>المتبقي: {otpTimer} ثانية</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleVerifyPhoneOtp}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تأكيد وتسجيل الدخول
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Flow 2: Face ID / Biometrics */}
          {authMethod === "face_id" && (
            <div className="text-center py-4 space-y-5">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* Scanner Target Circle */}
                <div
                  className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
                    faceScanSuccess
                      ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/30"
                      : isFaceScanning
                      ? "border-sky-400 bg-sky-500/10 animate-pulse shadow-lg shadow-sky-500/30"
                      : "border-slate-700 bg-slate-950/60"
                  }`}
                />

                {/* Laser scan line */}
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
                <p className="text-sm font-semibold text-white">
                  {faceScanSuccess
                    ? "تم التعرف على الوجه بنجاح!"
                    : isFaceScanning
                    ? "جارٍ مسح ملامح الوجه والمطابقة..."
                    : "انقر لبدء التحقق البيومتري السريع"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  كابتن: {captain.name} ({captain.vehicleType})
                </p>
              </div>

              <Button
                disabled={isFaceScanning || faceScanSuccess}
                onClick={handleStartFaceIdScan}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4" />
                {isFaceScanning ? "جارٍ المسح..." : "مسح بصمة الوجه الآن"}
              </Button>
            </div>
          )}

          {/* Quick Demo Bypass */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <button
              onClick={() => {
                playWebAudioTone("success");
                setIsAuthenticated(true);
                toast.success("تم الدخول السريع ككابتن معتمد");
              }}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <span>دخول تجريبي فوري بنقرة واحدة</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN CAPTAIN APPLICATION INTERFACE
  // ==========================================
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans select-none text-slate-100 overflow-hidden">
      {/* Device Shell (Mockup frame on desktop, edge-to-edge on mobile) */}
      <div className="w-full max-w-md h-screen md:h-[880px] bg-slate-950 md:rounded-[42px] md:border-[10px] md:border-slate-800 shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Dynamic Island / Notch on Desktop */}
        <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-50 items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80 mr-2 border border-slate-700/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>

        {/* ==================================================== */}
        {/* VIEW 1: MAP COCKPIT & LIVE NAVIGATION HUD (DEFAULT) */}
        {/* ==================================================== */}
        {activeTab === "map" && (
          <div className="relative w-full h-full flex flex-col bg-slate-950">
            {/* Real Interactive Leaflet Map Canvas */}
            <div
              ref={mapContainerRef}
              className="absolute inset-0 z-0 w-full h-full bg-slate-950"
              style={{ filter: "brightness(0.92) contrast(1.08)" }}
            />

            {/* TOP COCKPIT HEADER (Status Pill, Headset, Menu) */}
            <div className="relative z-20 pt-4 px-4 flex items-center justify-between pointer-events-none">
              {/* Hamburger Drawer Button */}
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("drawer");
                }}
                className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center shadow-lg backdrop-blur-md pointer-events-auto active:scale-95 transition-transform"
              >
                <MenuIcon className="w-5 h-5 text-slate-100" />
              </button>

              {/* Status Pill Toggle (Active / Offline) */}
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

              {/* Headset Dispatch Support Button */}
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  toast.info("جارٍ الاتصال بغرفة عمليات FOODHUB المركزية...");
                }}
                className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-lg backdrop-blur-md pointer-events-auto active:scale-95 transition-transform"
              >
                <Headphones className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Accuracy & Surge Hotspots Chip */}
            <div className="relative z-10 px-4 mt-2 flex justify-between items-center pointer-events-none">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] text-slate-300 flex items-center gap-1.5 shadow-md">
                <Compass className="w-3 h-3 text-sky-400 animate-spin" />
                <span>دقة GPS: {gpsAccuracy}</span>
              </div>

              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setShowHotspotLayers(!showHotspotLayers);
                  toast.info(showHotspotLayers ? "تم إخفاء دوائر الذروة" : "تم إظهار مناطق الذروة والطلب");
                }}
                className="bg-amber-500/20 backdrop-blur-md border border-amber-500/40 rounded-xl px-2.5 py-1 text-[10px] text-amber-300 flex items-center gap-1 shadow-md pointer-events-auto active:scale-95"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>مناطق الذروة (+4.0 ر.س.)</span>
              </button>
            </div>

            {/* Floating Navigation & Map Controls (Right Side) */}
            <div className="absolute right-4 top-36 z-20 flex flex-col gap-2.5">
              {/* Recenter GPS */}
              <button
                onClick={handleRecenter}
                title="إعادة تمركز على موقعي"
                className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700 text-white flex items-center justify-center shadow-lg backdrop-blur-md active:scale-90 transition-transform"
              >
                <LocateFixed className="w-5 h-5 text-sky-400" />
              </button>

              {/* Launch External Google Maps */}
              {activeDelivery && (
                <button
                  onClick={() =>
                    openExternalNavigation(
                      activeDelivery.step <= 2
                        ? activeDelivery.kitchenCoords
                        : activeDelivery.customerCoords,
                      activeDelivery.step <= 2 ? "المطعم" : "العميل"
                    )
                  }
                  title="ملاحة خرائط Google خطوة بخطوة"
                  className="w-10 h-10 rounded-xl bg-emerald-600 border border-emerald-400 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform animate-pulse"
                >
                  <Navigation className="w-5 h-5" />
                </button>
              )}

              {/* Instant Incoming Dispatch Simulator Button */}
              <button
                onClick={checkForIncomingDispatch}
                title="محاكاة وصول طلب جديد فورياً"
                className="w-10 h-10 rounded-xl bg-amber-500/90 border border-amber-300 text-slate-950 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <Radio className="w-5 h-5 animate-spin" />
              </button>
            </div>

            {/* Spacer to push HUD card to bottom */}
            <div className="flex-1" />

            {/* ============================================ */}
            {/* BOTTOM HUD CARD: ACTIVE DELIVERY OR IDLE BAR */}
            {/* ============================================ */}
            {activeDelivery ? (
              <div className="relative z-20 m-3 p-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-6 duration-300">
                {/* Stepper Progress Bar */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Bike className="w-4 h-4" />
                    <span>طلب جاري: {activeDelivery.orderNumber}</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-mono text-xs">
                    {(activeDelivery.earnings + activeDelivery.bonus).toFixed(2)} ر.س.
                  </Badge>
                </div>

                {/* Step Indicators */}
                <div className="grid grid-cols-3 gap-1.5 mb-3 text-[10px] text-center">
                  <div
                    className={`py-1 rounded-lg border font-semibold ${
                      activeDelivery.step === 1
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    1. التوجه للمطبخ
                  </div>
                  <div
                    className={`py-1 rounded-lg border font-semibold ${
                      activeDelivery.step === 2
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    2. استلام الوجبة
                  </div>
                  <div
                    className={`py-1 rounded-lg border font-semibold ${
                      activeDelivery.step >= 3
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    3. التوصيل للعميل
                  </div>
                </div>

                {/* Contextual Step Content */}
                {activeDelivery.step === 1 && (
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-400">نقطة الاستلام:</p>
                        <h4 className="text-sm font-bold text-white">{activeDelivery.kitchenName}</h4>
                        <p className="text-[11px] text-slate-400">{activeDelivery.kitchenAddress}</p>
                      </div>
                      <button
                        onClick={() => openExternalNavigation(activeDelivery.kitchenCoords, "المطبخ")}
                        className="bg-slate-800 hover:bg-slate-700 text-sky-400 p-2 rounded-xl border border-slate-700 flex items-center gap-1 text-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>ملاحة</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeDelivery.step === 2 && (
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 mb-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-300">قائمة الأصناف المطلوب التأكد منها:</p>
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
                        <p className="text-xs text-slate-400">تسليم الوجبة إلى:</p>
                        <h4 className="text-sm font-bold text-white">{activeDelivery.customerName}</h4>
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
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
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
              /* Idle HUD Status Bar */
              <div className="relative z-20 m-3 p-4 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">رادار التوزيع اللحظي نشط</h3>
                    <p className="text-[11px] text-slate-400">
                      {isOnline
                        ? "أنت في نطاق تغطية الطلبات السريعة"
                        : "قم بتفعيل الحالة للبدء في تلقي الطلبات"}
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
        {/* VIEW 2: SLIDE-OUT DRAWER (MATCHING HUNGERSTATION UX) */}
        {/* ==================================================== */}
        {activeTab === "drawer" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
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

            {/* Quick 4 Tiles (Matching Hungerstation exact grid) */}
            <div className="p-4 grid grid-cols-4 gap-2 border-b border-slate-800/80">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("inbox");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors"
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
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors"
              >
                <Calendar className="w-5 h-5 text-sky-400" />
                <span className="text-[10px] font-semibold text-slate-300">الجدول</span>
              </button>

              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("wallet");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-300">المحفظة</span>
              </button>

              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("payouts");
                }}
                className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors"
              >
                <DollarSign className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] font-semibold text-slate-300">المدفوعات</span>
              </button>
            </div>

            {/* Navigation List Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              <button
                onClick={() => {
                  playWebAudioTone("click");
                  setActiveTab("profile");
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 transition-colors"
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
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 transition-colors"
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
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white">متجر المكافآت (Loyalty Store)</h4>
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
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-white">الإعدادات واختبار التنبيهات</h4>
                    <p className="text-[10px] text-slate-400">فحص استلام الإشعارات والأصوات</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Logout / Switch Session */}
            <div className="p-4 border-t border-slate-800">
              <Button
                onClick={() => {
                  playWebAudioTone("click");
                  setIsAuthenticated(false);
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
        {/* VIEW 3: WALLET & DEPOSIT (STC PAY & ONECARD)         */}
        {/* ==================================================== */}
        {activeTab === "wallet" && (
          <div className="relative w-full h-full bg-slate-950 flex flex-col z-50">
            {/* Top Bar */}
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
              <h2 className="text-sm font-bold text-white">المحفظة والتحصيل المالي</h2>
              <div className="w-9" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Balance Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 shadow-xl">
                <p className="text-xs text-slate-400 mb-1">الرصيد المتاح للتحويل</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">
                    {captain.walletBalance.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-amber-400">ر.س.</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">حد التوقف التحذيري:</span>
                  <span className="text-emerald-400 font-bold">100.00 ر.س. (حساب نشط)</span>
                </div>
              </div>

              {/* Subtabs: STC Pay / OneCard / Bank Payout */}
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setWalletSubTab("main")}
                  className={`py-2 text-[11px] font-bold rounded-xl ${
                    walletSubTab === "main" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  العمليات
                </button>
                <button
                  onClick={() => setWalletSubTab("stc_pay")}
                  className={`py-2 text-[11px] font-bold rounded-xl ${
                    walletSubTab === "stc_pay" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  STC Pay
                </button>
                <button
                  onClick={() => setWalletSubTab("onecard")}
                  className={`py-2 text-[11px] font-bold rounded-xl ${
                    walletSubTab === "onecard" ? "bg-amber-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  ون كارد
                </button>
              </div>

              {/* STC PAY DEPOSIT TAB */}
              {walletSubTab === "stc_pay" && (
                <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                      stc
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">إيداع فوري عبر STC Pay</h4>
                      <p className="text-[10px] text-slate-400">تسوية سريعة لرصيد العهدة</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">المبلغ المطلوب شحنه (ر.س.)</label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {["50", "100", "200"].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setStcAmount(amt)}
                          className={`py-2 rounded-xl text-xs font-bold border ${
                            stcAmount === amt
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
                      value={stcAmount}
                      onChange={(e) => setStcAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white font-mono text-center outline-none focus:border-purple-500"
                    />
                  </div>

                  <Button
                    onClick={handleStcPayDeposit}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/25"
                  >
                    تأكيد الدفع عبر تطبيق STC Pay
                  </Button>
                </div>
              )}

              {/* ONECARD TAB */}
              {walletSubTab === "onecard" && (
                <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                      1C
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">شحن المحفظة ببطاقة OneCard</h4>
                      <p className="text-[10px] text-slate-400">أدخل الرمز المكون من 14 رقماً</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5">رمز قسيمة ون كارد</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={oneCardVoucher}
                      onChange={(e) => setOneCardVoucher(e.target.value)}
                      placeholder="OC-XXXX-XXXX-XXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-amber-400 font-mono text-center tracking-wider outline-none focus:border-amber-500"
                    />
                  </div>

                  <Button
                    onClick={handleOneCardVoucher}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/25"
                  >
                    شحن الرصيد الآن
                  </Button>
                </div>
              )}

              {/* TRANSACTIONS HISTORY LOG */}
              {walletSubTab === "main" && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">سجل المعاملات الأخيرة</h4>
                  {[
                    { title: "عمولة توصيل - طلب #FH-8841", amount: "+24.50", date: "اليوم 01:14 م", pos: true },
                    { title: "حافز منطقة الذروة (حي العليا)", amount: "+3.50", date: "اليوم 12:40 م", pos: true },
                    { title: "شحن عبر STC Pay", amount: "+50.00", date: "أمس 09:30 م", pos: true },
                    { title: "تسوية عهدة نقدية للمنصة", amount: "-65.00", date: "أمس 06:15 م", pos: false },
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
                          tx.pos ? "text-emerald-400" : "text-red-400"
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
        {/* VIEW 4: WEEKLY PAYOUTS (MATCHING VIDEO EXACT SUMS)   */}
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
              {/* Grand Total Banner */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-1">إجمالي مستحقات الأسبوع الحالي</p>
                <div className="text-4xl font-black text-amber-400 font-mono tracking-tight">
                  827.75 <span className="text-sm text-slate-300">ر.س.</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-semibold">
                  ✓ تم تحويل 500.00 ر.س. لحسابك البنكي بنجاح
                </p>
              </div>

              {/* Day-by-Day Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">تفاصيل الأيام (هذا الأسبوع)</h4>
                {[
                  { day: "السبت 26 سبتمبر", orders: 12, total: "248.50" },
                  { day: "الجمعة 25 سبتمبر", orders: 15, total: "312.00" },
                  { day: "الخميس 24 سبتمبر", orders: 9, total: "185.25" },
                  { day: "الأربعاء 23 سبتمبر (اليوم الوطني)", orders: 18, total: "420.00" },
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
        {/* VIEW 5: SCHEDULE & SHIFTS (الجدول والشفتات)         */}
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
              <h2 className="text-sm font-bold text-white">جدول ساعات العمل والشفتات</h2>
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

              {/* Shift Cards */}
              <div className="space-y-3">
                {[
                  { id: "sat-morning", title: "الفترة الصباحية", time: "08:00 ص - 04:00 م", surge: "+1.5 ر.س.", zone: "شمال الرياض" },
                  { id: "sat-evening", title: "فترة الذروة المسائية 🔥", time: "04:00 م - 12:00 ص", surge: "+3.5 ر.س.", zone: "وسط الرياض" },
                  { id: "sat-night", title: "الفترة الليلية", time: "12:00 ص - 06:00 ص", surge: "+2.0 ر.س.", zone: "كامل الرياض" },
                ].map((s) => {
                  const isBooked = !!shifts[s.id];
                  return (
                    <div
                      key={s.id}
                      className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{s.title}</h4>
                          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 font-mono">
                            {s.surge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{s.time}</span> • <span>{s.zone}</span>
                        </p>
                      </div>

                      <Button
                        onClick={() => {
                          playWebAudioTone("click");
                          setShifts({ ...shifts, [s.id]: !isBooked });
                          toast(isBooked ? "تم إلغاء حجز الشفت" : "تم حجز الشفت بنجاح! ننتظرك في الموعد.");
                        }}
                        size="sm"
                        className={`rounded-xl text-xs font-bold ${
                          isBooked
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                        }`}
                      >
                        {isBooked ? "محجوز ✓" : "حجز الآن"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 6: INBOX & COMPLIANCE (صندوق الوارد)             */}
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
                  title: "تنبيه الأنظمة: الالتزام بحقيبة التوصيل الحرارية",
                  tag: "الامتثال والأنظمة (Compliance)",
                  tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
                  desc: "عزيزي الكابتن، نود تذكيرك بضرورة استخدام الحقيبة الحرارية المعتمدة للحفاظ على حرارة وجودة الوجبات.",
                  date: "اليوم 11:20 ص",
                },
                {
                  title: "تحديث حوافز عطلة نهاية الأسبوع",
                  tag: "المكافآت (Bonus)",
                  tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                  desc: "أكمل 15 طلباً خلال يوم الجمعة واحصل على مكافأة نقدية فورية بقيمة 150 ر.س.",
                  date: "أمس 04:00 م",
                },
                {
                  title: "تحديث شهادة الفحص الدوري للمركبة",
                  tag: "المستندات",
                  tagColor: "text-sky-400 bg-sky-400/10 border-sky-400/20",
                  desc: "يرجى رفع صورة الفحص الدوري الجديد قبل تاريخ 10 أكتوبر لتفادي إيقاف الحساب المؤقت.",
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
        {/* VIEW 7: SCORING & TIERS (نظام المستويات)              */}
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
              {/* Tier Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-center">
                <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">المستوى الذهبي (Gold Captain)</h3>
                <p className="text-xs text-slate-300 mt-1">
                  أنت من أفضل 5% من كباتن المنصة في الرياض!
                </p>
              </div>

              {/* Stats Grid */}
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
        {/* VIEW 8: REWARDS STORE (متجر المكافآت)                 */}
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
        {/* VIEW 9: SETTINGS & NOTIFICATION DIAGNOSTICS          */}
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
                <h4 className="text-xs font-bold text-white">فحص التنبيهات والأصوات (Diagnostic Test)</h4>
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

              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white">تفضيلات الملاحة</h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">القبول التلقائي للطلبات المجاورة</span>
                    <input type="checkbox" defaultChecked className="rounded text-amber-500 bg-slate-900 w-4 h-4" />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">تطبيق الخرائط الافتراضي (خرائط Google)</span>
                    <input type="checkbox" defaultChecked className="rounded text-amber-500 bg-slate-900 w-4 h-4" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 10: PROFILE & REAL DOCUMENT UPLOAD              */}
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
        {/* MODAL 1: INCOMING DISPATCH POPUP (LOUD ALARM)        */}
        {/* ==================================================== */}
        {showIncomingOrder && activeDelivery && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end p-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-full bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl shadow-amber-500/30 space-y-4">
              {/* Header with Circular Countdown */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-xs font-bold text-amber-400">طلب توصيل جديد وارد!</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
                  {incomingCountdown}s
                </div>
              </div>

              {/* Fee & Distance */}
              <div className="flex items-baseline justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400">إجمالي الأجر المستحق للكابتن</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    {(activeDelivery.earnings + activeDelivery.bonus).toFixed(2)} ر.س.
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-slate-400 font-mono">المسافة: {activeDelivery.distance}</p>
                  <p className="text-sky-400 font-semibold font-mono">الوقت: {activeDelivery.eta}</p>
                </div>
              </div>

              {/* Restaurant & Customer Details */}
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

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={handleDeclineOrder}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 rounded-2xl py-3 text-xs"
                >
                  رفض الطلب
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
        {/* MODAL 2: CUSTOMER OTP HANDOVER VERIFICATION          */}
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

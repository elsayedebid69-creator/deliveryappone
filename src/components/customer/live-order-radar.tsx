import { useState, useEffect } from "react";
import {
  Bike,
  Store,
  Clock,
  CheckCircle2,
  Navigation,
  Phone,
  MessageCircle,
  Thermometer,
  Gauge,
  MapPin,
  Sparkles,
  ShieldCheck,
  Radio,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sounds } from "@/lib/sound-effects";

interface LiveOrderRadarProps {
  orderId?: string;
  restaurantName?: string;
  deliveryAddress?: string;
  status?: string;
  createdTime?: string;
}

const STAGES = [
  { id: "pending", titleAr: "تم تأكيد الطلب", descAr: "تم إرسال الطلب للمطعم بنجاح", icon: Clock },
  { id: "preparing", titleAr: "في مطبخ التحضير", descAr: "الشيف يجهز وجبتك الطازجة الآن", icon: Flame },
  { id: "ready", titleAr: "جاهز للاستلام", descAr: "الكابتن بانتظار استلام الوجبة", icon: Store },
  { id: "on_the_way", titleAr: "في الطريق إليك", descAr: "الكابتن متوجه لبابك مباشرة عبر أقصر مسار", icon: Bike },
  { id: "delivered", titleAr: "تم التسليم بنجاح", descAr: "بالهناء والشفاء! نتمنى لك وجبة شهية", icon: CheckCircle2 },
];

export function LiveOrderRadar({
  orderId = "FH-89241",
  restaurantName = "FoodHub Prime Kitchen",
  deliveryAddress = "حي النرجس، شارع عثمان بن عفان، الرياض",
  status = "on_the_way",
}: LiveOrderRadarProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(
    status === "delivered" ? 4 : status === "on_the_way" ? 3 : status === "ready" ? 2 : status === "preparing" ? 1 : 0
  );
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [etaSeconds, setEtaSeconds] = useState(30);
  const [courierSpeed, setCourierSpeed] = useState(38);
  const [distanceKm, setDistanceKm] = useState(1.4);

  // Live Telemetry countdown simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev > 0) return prev - 1;
        setEtaMinutes((m) => Math.max(1, m - 1));
        return 59;
      });

      // Small jitter for realistic telemetry HUD
      setCourierSpeed(Math.floor(34 + Math.random() * 8));
      setDistanceKm((prev) => Math.max(0.1, Number((prev - 0.01).toFixed(2))));
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-5 sm:p-7 text-slate-100 shadow-2xl overflow-hidden relative">
      
      {/* Background Cyber Ambient Glow */}
      <div className="absolute -top-24 -end-24 size-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -start-24 size-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Top Header: Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-amber-500" />
            </span>
            <h3 className="text-xl font-black text-white tracking-wide">
              تتبع الرادار الحي للطلب
            </h3>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-mono">
              #{orderId}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Store className="size-3.5 text-amber-400" />
            {restaurantName}
          </p>
        </div>

        {/* Live ETA Box */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-slate-900 px-4 py-2 text-center glow-gold">
          <span className="text-[10px] text-amber-200/80 uppercase tracking-wider block font-semibold">
            الوصول التقديري الذكي
          </span>
          <span className="font-mono text-2xl font-black text-amber-400">
            {etaMinutes}:{etaSeconds < 10 ? `0${etaSeconds}` : etaSeconds}
          </span>
          <span className="text-[10px] text-slate-400 block">دقيقة</span>
        </div>
      </div>

      {/* Radar Map & Telemetry HUD Grid */}
      <div className="relative h-64 sm:h-72 w-full rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Holographic Radar Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        
        {/* Concentric Radar Rings */}
        <div className="absolute size-44 rounded-full border border-cyan-500/20 animate-radar" />
        <div className="absolute size-64 rounded-full border border-cyan-500/15" />
        <div className="absolute size-80 rounded-full border border-cyan-500/10" />

        {/* Center Target: Customer Home */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/40 glow-gold animate-bounce">
            <MapPin className="size-7" />
          </div>
          <span className="mt-2 rounded-full bg-slate-950/90 border border-slate-700 px-3 py-0.5 text-xs font-bold text-amber-300 backdrop-blur-md">
            موقعك (الوجهة)
          </span>
        </div>

        {/* Moving Courier Beacon */}
        <div className="absolute top-1/4 start-1/4 z-10 flex flex-col items-center animate-pulse">
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 glow-cyan">
            <Bike className="size-5" />
          </div>
          <span className="mt-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
            الكابتن فهد (38 كم/س)
          </span>
        </div>

        {/* Floating Telemetry Stats on Radar Screen */}
        <div className="absolute bottom-3 start-3 end-3 flex flex-wrap items-center justify-between gap-2 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Gauge className="size-4 text-cyan-400" />
            <span>سرعة المندوب:</span>
            <span className="font-bold text-white font-mono">{courierSpeed} كم/س</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Navigation className="size-4 text-amber-400" />
            <span>المسافة المتبقية:</span>
            <span className="font-bold text-amber-400 font-mono">{distanceKm} كم</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Thermometer className="size-4 text-emerald-400" />
            <span>حرارة الحقيبة:</span>
            <span className="font-bold text-emerald-400 font-mono">68°C (ساخن وطازج)</span>
          </div>
        </div>
      </div>

      {/* 5 Stages Progress Tracker */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Radio className="size-3.5 text-amber-400" />
          مراحل تجهيز وتوصيل الوجبة
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stage.id}
                onClick={() => {
                  sounds.playClick();
                  setCurrentStageIndex(idx);
                }}
                className={`cursor-pointer rounded-2xl p-3 border transition-all duration-200 ${
                  isCurrent
                    ? "border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/10 scale-[1.02]"
                    : isCompleted
                    ? "border-slate-700 bg-slate-900/80 text-slate-300"
                    : "border-slate-800/60 bg-slate-950/40 text-slate-600 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`flex size-7 items-center justify-center rounded-xl text-xs font-bold ${
                      isCurrent
                        ? "bg-amber-500 text-slate-950"
                        : isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {isCompleted && !isCurrent ? <CheckCircle2 className="size-4" /> : idx + 1}
                  </div>
                  <stage.icon
                    className={`size-4 ${
                      isCurrent ? "text-amber-400" : isCompleted ? "text-slate-400" : "text-slate-700"
                    }`}
                  />
                </div>
                <h5 className={`text-xs font-bold ${isCurrent ? "text-white" : ""}`}>
                  {stage.titleAr}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {stage.descAr}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courier Profile & Direct Contact Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop"
              alt="مندوب التوصيل"
              className="size-12 rounded-full object-cover border-2 border-amber-500"
            />
            <span className="absolute bottom-0 end-0 size-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-bold text-white text-sm">الكابتن / فهد الشمري</h5>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                ⭐ 4.9 (1,420 توصيلة)
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              دراجة ياماها رياضية • متوافق مع معايير الحفظ الحراري للوجبات
            </p>
          </div>
        </div>

        {/* Contact Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            onClick={() => {
              sounds.playClick();
              window.open("tel:0500000000");
            }}
          >
            <Phone className="size-3.5 me-1.5 text-emerald-400" />
            اتصال هاتفي
          </Button>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20"
            onClick={() => {
              sounds.playClick();
              window.open("https://wa.me/966500000000", "_blank");
            }}
          >
            <MessageCircle className="size-3.5 me-1.5" />
            مراسلة واتساب
          </Button>
        </div>
      </div>

    </div>
  );
}

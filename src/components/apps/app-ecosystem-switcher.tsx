import { useState, useEffect } from "react";
import { User, Store, Bike, Globe, Sparkles, Volume2, VolumeX, Smartphone } from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

export type ActiveAppId = "customer" | "courier" | "kitchen" | "portal";

interface AppEcosystemSwitcherProps {
  activeApp: ActiveAppId;
  onSelectApp: (app: ActiveAppId) => void;
  compact?: boolean;
}

export function AppEcosystemSwitcher({
  activeApp,
  onSelectApp,
  compact = false,
}: AppEcosystemSwitcherProps) {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [soundActive, setSoundActive] = useState(sounds.isEnabled());

  const apps = [
    {
      id: "customer" as ActiveAppId,
      nameAr: "تطبيق العميل",
      nameEn: "Customer App",
      icon: User,
      badgeAr: "طلب وتتبع",
      badgeEn: "Order & Radar",
      color: "from-amber-500 to-yellow-400 text-slate-950",
      activeBorder: "border-amber-400 ring-2 ring-amber-400/30",
    },
    {
      id: "courier" as ActiveAppId,
      nameAr: "تطبيق المندوب",
      nameEn: "Captain App",
      icon: Bike,
      badgeAr: "ملاحة ورادار",
      badgeEn: "HUD & Radar",
      color: "from-cyan-500 to-blue-600 text-white",
      activeBorder: "border-cyan-400 ring-2 ring-cyan-400/30",
    },
    {
      id: "kitchen" as ActiveAppId,
      nameAr: "تطبيق المتجر والمطبخ",
      nameEn: "Kitchen KDS",
      icon: Store,
      badgeAr: "شاشة KDS حية",
      badgeEn: "Live KDS",
      color: "from-emerald-500 to-teal-600 text-white",
      activeBorder: "border-emerald-400 ring-2 ring-emerald-400/30",
    },
  ];

  const handleSelect = (appId: ActiveAppId) => {
    sounds.playClick();
    onSelectApp(appId);
    try {
      localStorage.setItem("foodhub_active_app_view", appId);
    } catch {
      // ignore
    }
    const appName =
      appId === "customer"
        ? ar ? "تطبيق العميل (FoodHub Customer)" : "Customer App"
        : appId === "courier"
        ? ar ? "تطبيق المندوب والكابتن (FoodHub Captain)" : "Captain App"
        : appId === "kitchen"
        ? ar ? "تطبيق المتجر والمطبخ (Kitchen KDS)" : "Kitchen KDS App"
        : ar ? "الموقع التسويقي الكامل" : "Main Portal";

    toast.success(ar ? `تم التبديل إلى: ${appName}` : `Switched to: ${appName}`, {
      duration: 1800,
    });
  };

  const toggleSound = () => {
    const nextState = sounds.toggle();
    setSoundActive(nextState);
    if (nextState) sounds.playClick();
    toast.info(nextState ? (ar ? "تم تفعيل المؤثرات الصوتية 🔊" : "Sound Enabled 🔊") : (ar ? "تم كتم الصوت 🔇" : "Sound Muted 🔇"));
  };

  return (
    <div className="w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 py-2 px-2 sm:px-4 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Branding & Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
            <Smartphone className="size-3.5 text-amber-400" />
            <span className="hidden sm:inline">{ar ? "منظومة التطبيقات الثلاثة" : "FoodHub 3-Apps"}</span>
            <Badge className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0 border-amber-500/30">
              {ar ? "تجربة حية" : "Live Demo"}
            </Badge>
          </div>
        </div>

        {/* Center: 3 Apps Pill Selector */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto max-w-full">
          {apps.map((app) => {
            const Icon = app.icon;
            const isActive = activeApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => handleSelect(app.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 select-none ${
                  isActive
                    ? `bg-gradient-to-r ${app.color} shadow-lg ${app.activeBorder} scale-[1.02]`
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`size-3.5 sm:size-4 ${isActive ? "" : "text-slate-400"}`} />
                <span className="truncate">{ar ? app.nameAr : app.nameEn}</span>
                {isActive && (
                  <span className="hidden md:inline text-[10px] opacity-80 font-bold px-1.5 py-0.5 rounded-md bg-black/20">
                    {ar ? app.badgeAr : app.badgeEn}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Sound Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleSound}
            title={soundActive ? "Mute" : "Unmute"}
            className="size-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-slate-700 transition-colors"
          >
            {soundActive ? <Volume2 className="size-4 text-amber-400" /> : <VolumeX className="size-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </div>
  );
}

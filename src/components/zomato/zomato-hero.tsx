import React from "react";
import {
  MapPin,
  ChevronDown,
  Search,
  ArrowDown,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { FoodHubLogo } from "@/components/food-hub-logo";
import { Input } from "@/components/ui/input";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";

export interface Locality {
  id: string;
  nameAr: string;
  nameEn: string;
  places: number;
}

interface ZomatoHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLocId: string;
  setSelectedLocId: (id: string) => void;
  activeLocation: string;
  isLocationDropdownOpen: boolean;
  setIsLocationDropdownOpen: (open: boolean) => void;
  localities: Locality[];
  onSelectCategory: (cat: string) => void;
  onScrollToExplore: () => void;
}

export function ZomatoHero({
  searchQuery,
  setSearchQuery,
  selectedLocId,
  setSelectedLocId,
  activeLocation,
  isLocationDropdownOpen,
  setIsLocationDropdownOpen,
  localities,
  onSelectCategory,
  onScrollToExplore,
}: ZomatoHeroProps) {
  const { lang } = useI18n();

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] w-full flex flex-col justify-between items-center overflow-hidden bg-slate-950 text-white">
      {/* 1. Cinematic Rich Food Backdrop Image with Vignette Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&h=1080&fit=crop&q=85"
          alt="Delicious chocolate cake and gourmet food background"
          className="size-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Dark Vignette & Brand Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-slate-950" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90" />
      </div>

      {/* Decorative top spacer */}
      <div className="w-full pt-6 sm:pt-10" />

      {/* 2. Main Hero Centerpiece (Zomato Exact Layout) */}
      <div className="relative z-10 w-full max-w-4xl px-4 text-center space-y-6 sm:space-y-8 my-auto">
        {/* Brand Logo */}
        <div className="flex justify-center items-center transform transition-transform hover:scale-105 duration-300">
          <FoodHubLogo size={72} showText />
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-2xl">
            {lang === "ar" ? (
              <>
                تطبيق توصيل الطعام <span className="text-amber-400">#1</span> في المملكة
              </>
            ) : (
              <>
                Kingdom’s <span className="text-amber-400">#1</span> food delivery app
              </>
            )}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-slate-200/90 max-w-2xl mx-auto font-medium drop-shadow-md">
            {lang === "ar"
              ? "عش تجربة طلب الطعام الأسرع والأوفر عبر تطبيق فودهَب بأقل سعر توصيل"
              : "Experience fast & easy online ordering on the FoodHub app"}
          </p>
        </div>

        {/* App Store & Google Play Download Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
          {/* Google Play Button */}
          <a
            href="#download-app"
            onClick={(e) => {
              e.preventDefault();
              sounds.playClick();
              onScrollToExplore();
            }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-black/80 hover:bg-black border border-slate-700/80 hover:border-amber-500/80 text-white transition-all shadow-xl hover:scale-105 active:scale-95 backdrop-blur-md group"
          >
            <svg
              className="size-7 text-amber-400 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3.609 1.814L13.792 12 3.61 22.186a1.5 1.5 0 0 1-.61-.714V2.528c.157-.279.37-.52.61-.714zm11.24 11.24l2.122 2.121-12.02 6.94 9.898-9.061zm0-2.108L4.952 1.884l12.02 6.94-2.122 2.122zm1.06 1.054l3.882 2.241a1.5 1.5 0 0 1 0 2.518l-3.882 2.241-1.06-1.06 1.06-5.94z" />
            </svg>
            <div className="text-start leading-tight">
              <span className="block text-[10px] text-slate-400 uppercase font-medium">
                GET IT ON
              </span>
              <span className="block text-sm font-black text-white">
                Google Play
              </span>
            </div>
          </a>

          {/* Apple App Store Button */}
          <a
            href="#download-app"
            onClick={(e) => {
              e.preventDefault();
              sounds.playClick();
              onScrollToExplore();
            }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-black/80 hover:bg-black border border-slate-700/80 hover:border-amber-500/80 text-white transition-all shadow-xl hover:scale-105 active:scale-95 backdrop-blur-md group"
          >
            <svg
              className="size-7 text-white group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.65-.79 1.09-1.89.97-3-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.76-.95 2.84 1.04.08 2.06-.45 2.71-1.24z" />
            </svg>
            <div className="text-start leading-tight">
              <span className="block text-[10px] text-slate-400 font-medium">
                Download on the
              </span>
              <span className="block text-sm font-black text-white">
                App Store
              </span>
            </div>
          </a>
        </div>

        {/* 3. Intelligent Location & Dish Search Box */}
        <div className="pt-2 max-w-3xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-center rounded-2xl sm:rounded-full bg-slate-900/90 border border-slate-700/80 p-1.5 sm:p-2 shadow-2xl shadow-slate-950 backdrop-blur-xl transition-all focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
            
            {/* Location Selector */}
            <div className="relative w-full sm:w-5/12">
              <button
                type="button"
                aria-label={lang === "ar" ? "اختر حي ومنطقة التوصيل" : "Select delivery neighborhood"}
                onClick={() => {
                  sounds.playClick();
                  setIsLocationDropdownOpen(!isLocationDropdownOpen);
                }}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl sm:rounded-full text-xs font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="size-4 text-rose-500 shrink-0 animate-bounce" />
                  <span className="truncate">{activeLocation}</span>
                </div>
                <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Location Dropdown Modal */}
              {isLocationDropdownOpen && (
                <div className="absolute top-full start-0 z-50 mt-2 w-72 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl animate-in fade-in zoom-in-95 text-start">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {lang === "ar" ? "اختر الحي / منطقة التوصيل:" : "Select Delivery Neighborhood:"}
                  </p>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {localities.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setSelectedLocId(loc.id);
                          setIsLocationDropdownOpen(false);
                          toast.info(lang === "ar" ? `📍 تم تحديد: ${loc.nameAr}` : `📍 Location set: ${loc.nameEn}`);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          selectedLocId === loc.id
                            ? "bg-amber-500/20 text-amber-400 font-bold"
                            : "text-slate-200 hover:bg-amber-500/10 hover:text-amber-400"
                        }`}
                      >
                        <span className="font-medium">{lang === "ar" ? loc.nameAr : loc.nameEn}</span>
                        <span className="text-[10px] text-slate-400">{loc.places} {lang === "ar" ? "مكان" : "places"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-slate-700 mx-1" />

            {/* Dish / Restaurant Search Input */}
            <div className="relative flex-1 w-full flex items-center">
              <Search className="absolute start-3.5 size-4 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === "ar"
                    ? "ابحث عن وجبة، مطعم، كيتو، بروتين أو سموذي..."
                    : "Search for restaurant, cuisine, or a dish..."
                }
                className="w-full h-11 ps-10 pe-4 bg-transparent border-0 text-xs sm:text-sm text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label={lang === "ar" ? "مسح البحث" : "Clear search"}
                  onClick={() => setSearchQuery("")}
                  className="absolute end-3 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Trending Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
            <span className="text-slate-300 text-[11px] me-1 font-medium">
              {lang === "ar" ? "الأكثر طلباً الآن:" : "Trending Searches:"}
            </span>
            {[
              { ar: "🔥 مشويات بروتين", en: "🔥 Protein Grills", cat: "protein" },
              { ar: "🥑 كيتو دايت", en: "🥑 Keto Meals", cat: "healthy" },
              { ar: "🥗 سلطات كينوا", en: "🥗 Quinoa Bowls", cat: "healthy" },
              { ar: "🥤 سموذي طاقة", en: "🥤 Power Smoothies", cat: "smoothie" },
            ].map((pill, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sounds.playClick();
                  onSelectCategory(pill.cat);
                }}
                className="rounded-full bg-slate-900/80 border border-slate-700/80 px-3 py-1 text-[11px] text-slate-200 hover:border-amber-500/80 hover:text-amber-400 transition-all active:scale-95 backdrop-blur-md"
              >
                {lang === "ar" ? pill.ar : pill.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Scroll Down Indicator (Zomato Style) */}
      <div className="relative z-10 w-full pb-6 flex justify-center">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onScrollToExplore();
          }}
          className="group flex flex-col items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <span className="text-xs font-semibold tracking-wider uppercase">
            {lang === "ar" ? "مرر للأسفل" : "Scroll down"}
          </span>
          <ArrowDown className="size-4 animate-bounce text-amber-400 group-hover:translate-y-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}

import React from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import {
  ShoppingBag,
  Store,
  Bike,
  Sparkles,
  ArrowRight,
  Utensils,
  ChevronRight,
} from "lucide-react";
import { FoodHubLogo } from "@/components/food-hub-logo";

interface ZomatoEcosystemProps {
  onSelectStore: () => void;
}

export function ZomatoEcosystem({ onSelectStore }: ZomatoEcosystemProps) {
  const { lang } = useI18n();

  return (
    <section className="relative w-full py-16 sm:py-24 bg-white text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 space-y-12 sm:space-y-16">
        
        {/* Section Header (Zomato Eternal Branding) */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {lang === "ar" ? "منظومة فودهَب" : "foodhub ecosystem"}
          </h2>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 uppercase">
            {lang === "ar"
              ? "نقود مستقبل خدمات وتوصيل الطعام والتموين الذكي"
              : "POWERING THE REGION’S CHANGING LIFESTYLES"}
          </p>
        </div>

        {/* 4 Pastel Cards Grid (Matching Screenshot 5) */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: FoodHub Main App */}
          <div className="group flex flex-col justify-between rounded-3xl border border-rose-100 bg-gradient-to-b from-rose-50/80 via-pink-50/40 to-white p-6 shadow-xl shadow-rose-950/5 hover:-translate-y-1.5 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 text-center">
            <div className="space-y-4">
              {/* App Icon Square */}
              <div className="size-20 mx-auto rounded-3xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
                <FoodHubLogo size={36} showText={false} />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {lang === "ar" ? "تطبيق فودهَب" : "foodhub"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "ar"
                  ? "احصل على التطبيق الآن وابدأ بطلب وجباتك ومطابخك المفضلة بأسرع توصيل وأقل سعر!"
                  : "Get the app now to start ordering your favorite dishes and cloud kitchens!"}
              </p>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectStore();
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 group-hover:text-rose-700 transition-colors"
              >
                <span>{lang === "ar" ? "تصفح القائمة والطلب" : "Check it out"}</span>
                <ChevronRight className={`size-3.5 transition-transform ${lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Card 2: FoodHub Quick (15-min mart) */}
          <div className="group flex flex-col justify-between rounded-3xl border border-amber-100 bg-gradient-to-b from-amber-50/80 via-yellow-50/40 to-white p-6 shadow-xl shadow-amber-950/5 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-300 transition-all duration-300 text-center">
            <div className="space-y-4">
              {/* App Icon Square */}
              <div className="size-20 mx-auto rounded-3xl bg-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-400/30 group-hover:scale-105 transition-transform">
                <div className="font-black text-xl tracking-tighter">
                  quick
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {lang === "ar" ? "فودهَب كويك" : "foodhub quick"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "ar"
                  ? "اختر من أكثر من 30,000 صنف وبقالة ومشروبات طازجة تصلك خلال 15 دقيقة فقط."
                  : "Choose from 30,000+ products & daily essentials delivered to your doorstep in 15 mins."}
              </p>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSelectStore();
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:text-amber-700 transition-colors"
              >
                <span>{lang === "ar" ? "تسوق البقالة السريعة" : "Check it out"}</span>
                <ChevronRight className={`size-3.5 transition-transform ${lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Card 3: FoodHub Kitchen KDS */}
          <div className="group flex flex-col justify-between rounded-3xl border border-purple-100 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-white p-6 shadow-xl shadow-purple-950/5 hover:-translate-y-1.5 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 text-center">
            <div className="space-y-4">
              {/* App Icon Square */}
              <div className="size-20 mx-auto rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Store className="size-9" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {lang === "ar" ? "فودهَب كيتشن" : "foodhub kitchen"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "ar"
                  ? "نظام متكامل لشاشات المطبخ الذكية (KDS) وإدارة الطلبات السحابية ومضاعفة مبيعات المطاعم."
                  : "Offering complete cloud kitchen management and smart live KDS order dispatching."}
              </p>
            </div>

            <div className="pt-6">
              <Link
                to="/join/restaurant"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors"
              >
                <span>{lang === "ar" ? "انضمام كشريك مطعم" : "Check it out"}</span>
                <ChevronRight className={`size-3.5 transition-transform ${lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </Link>
            </div>
          </div>

          {/* Card 4: FoodHub Captain */}
          <div className="group flex flex-col justify-between rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50/80 via-teal-50/40 to-white p-6 shadow-xl shadow-emerald-950/5 hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-300 transition-all duration-300 text-center">
            <div className="space-y-4">
              {/* App Icon Square */}
              <div className="size-20 mx-auto rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <Bike className="size-9" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {lang === "ar" ? "فودهَب كابتن" : "foodhub captain"}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === "ar"
                  ? "رادار ملاحة حي، استلام طلبات فوري، وسحب أرباح يومي فوري لأبطال التوصيل."
                  : "Smart GPS navigation, instant order routing, and daily payouts for couriers."}
              </p>
            </div>

            <div className="pt-6">
              <Link
                to="/join/courier"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors"
              >
                <span>{lang === "ar" ? "انضمام كابتن توصيل" : "Check it out"}</span>
                <ChevronRight className={`size-3.5 transition-transform ${lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

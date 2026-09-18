import React from "react";
import { useI18n } from "@/lib/i18n";
import { Crown, Sparkles, Bike, Ticket, Zap } from "lucide-react";

export function ZomatoGoldBanner() {
  const { lang } = useI18n();

  return (
    <section className="relative w-full py-20 sm:py-28 bg-slate-950 text-white overflow-hidden">
      {/* 1. Curved Dark Banner Shell with Golden Glow */}
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="relative rounded-[40px] sm:rounded-[50px] border border-amber-500/30 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 px-6 py-14 sm:px-12 sm:py-20 shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden text-center">
          
          {/* Subtle Geometric Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* 2. Floating 3D Golden Medals / Coins in Corners */}
          {/* Top Left Coin */}
          <div className="absolute top-4 start-4 sm:top-8 sm:start-8 z-10 animate-bounce duration-[4000ms] select-none pointer-events-none">
            <div className="size-14 sm:size-20 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-700 p-1 shadow-2xl shadow-amber-500/50 flex items-center justify-center transform -rotate-12">
              <div className="size-full rounded-full border-2 border-yellow-200/80 flex items-center justify-center bg-gradient-to-tr from-amber-500 to-yellow-300">
                <Crown className="size-6 sm:size-9 text-slate-950 fill-slate-950/20" />
              </div>
            </div>
          </div>

          {/* Top Right Coin */}
          <div className="absolute top-4 end-4 sm:top-8 sm:end-8 z-10 animate-pulse duration-[5000ms] select-none pointer-events-none">
            <div className="size-16 sm:size-24 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-700 p-1 shadow-2xl shadow-amber-500/50 flex items-center justify-center transform rotate-12">
              <div className="size-full rounded-full border-2 border-yellow-200/80 flex items-center justify-center bg-gradient-to-tr from-amber-500 to-yellow-300">
                <Crown className="size-8 sm:size-11 text-slate-950 fill-slate-950/20" />
              </div>
            </div>
          </div>

          {/* Bottom Center Floating Coin */}
          <div className="absolute -bottom-4 end-1/4 sm:end-1/3 z-10 animate-pulse duration-[6000ms] select-none pointer-events-none">
            <div className="size-10 sm:size-14 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/40 flex items-center justify-center transform rotate-45">
              <div className="size-full rounded-full border border-yellow-200/80 flex items-center justify-center bg-gradient-to-tr from-amber-500 to-yellow-300">
                <Crown className="size-5 sm:size-7 text-slate-950" />
              </div>
            </div>
          </div>

          {/* 3. Header Content */}
          <div className="relative z-20 space-y-4 max-w-2xl mx-auto">
            {/* Small Top Brand Badge */}
            <div className="text-xs sm:text-sm font-black tracking-widest text-slate-400 uppercase">
              FOODHUB
            </div>

            {/* Luxurious GOLD Emblem */}
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(245,158,11,0.4)]">
                GOLD
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-amber-200/90 font-medium">
              {lang === "ar"
                ? "برنامج التوفير الأكبر لعشاق الطعام في المملكة"
                : "Kingdom's Top Savings Program for Food Lovers"}
            </p>

            {/* Gold Benefits Star Label */}
            <div className="pt-3">
              <span className="inline-flex items-center gap-2 text-xs font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30">
                <Sparkles className="size-3.5" />
                {lang === "ar" ? "★ مميزات العضوية الذهبية ★" : "★ GOLD BENEFITS ★"}
                <Sparkles className="size-3.5" />
              </span>
            </div>
          </div>

          {/* 4. Benefits Cards Grid */}
          <div className="relative z-20 mt-10 grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            {/* Benefit 1: Free Delivery */}
            <div className="flex items-center gap-4 rounded-3xl bg-zinc-900/90 border border-amber-500/30 p-4 sm:p-5 text-start hover:border-amber-400 transition-all hover:scale-105 duration-300 shadow-xl">
              <div className="size-12 sm:size-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Ticket className="size-6 sm:size-7" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {lang === "ar" ? "توصيل مجاني" : "Free Delivery"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === "ar"
                    ? "لجميع المطاعم والمطابخ ضمن مسافة 7 كم"
                    : "At all restaurants within 7 km"}
                </p>
              </div>
            </div>

            {/* Benefit 2: Up to 30% Extra Off */}
            <div className="flex items-center gap-4 rounded-3xl bg-zinc-900/90 border border-amber-500/30 p-4 sm:p-5 text-start hover:border-amber-400 transition-all hover:scale-105 duration-300 shadow-xl">
              <div className="size-12 sm:size-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Bike className="size-6 sm:size-7" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {lang === "ar" ? "خصم إضافي حتى 30%" : "Up to 30% extra off"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === "ar"
                    ? "في أكثر من 2,000 مطعم ومطبخ شريك"
                    : "At 2,000+ partner restaurants"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

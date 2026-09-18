import React from "react";
import { useI18n } from "@/lib/i18n";
import {
  Salad,
  Sparkles,
  Percent,
  Calendar,
  Gift,
  PartyPopper,
  Zap,
  Bookmark,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { FoodHubLogo } from "@/components/food-hub-logo";

export function ZomatoAppFeatures() {
  const { lang } = useI18n();

  return (
    <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-slate-950 text-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-rose-500 leading-tight">
            {lang === "ar"
              ? "ماذا ينتظرك في تطبيق FoodHub؟"
              : "What’s waiting for you on the app?"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {lang === "ar"
              ? "تطبيقنا مزوّد بمميزات ذكية تجعل تجربة طلب الطعام أسهل، أسرع، وأكثر توفيراً من أي وقت مضى."
              : "Our app is packed with features that enable you to experience food delivery like never before"}
          </p>
        </div>

        {/* Interactive Center Phone Mockup & Surrounding Feature Badges */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          
          {/* Left Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto z-10">
            {/* Card 1: Healthy */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-950/5 hover:-translate-y-1 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 group cursor-default">
              <div className="size-12 sm:size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Salad className="size-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === "ar" ? "وجبات صحية" : "Healthy"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === "ar" ? "محسوبة السعرات" : "Calorie Tracked"}
              </span>
            </div>

            {/* Card 2: Veg Mode */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-950/5 hover:-translate-y-1 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 group cursor-default">
              <div className="size-12 sm:size-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <div className="w-9 h-5 rounded-full bg-green-500 p-0.5 flex items-center justify-end shadow-sm">
                  <div className="size-4 rounded-full bg-white shadow-md" />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === "ar" ? "وضع نباتي" : "Veg Mode"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === "ar" ? "100% نقي" : "100% Green"}
              </span>
            </div>

            {/* Card 3: Plan a Party */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-950/5 hover:-translate-y-1 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 group cursor-default">
              <div className="size-12 sm:size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <PartyPopper className="size-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === "ar" ? "وجبات التجمعات" : "Plan a Party"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === "ar" ? "بوكسات عائلية" : "Catering & Groups"}
              </span>
            </div>

            {/* Card 4: Gift Cards */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-950/5 hover:-translate-y-1 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 group cursor-default">
              <div className="size-12 sm:size-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Gift className="size-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === "ar" ? "بطاقات إهداء" : "Gift Cards"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === "ar" ? "أهدِ من تحب" : "Share Good Food"}
              </span>
            </div>
          </div>

          {/* Center Smartphone Mockup Frame */}
          <div className="relative w-64 sm:w-72 shrink-0 z-20">
            <div className="relative rounded-[46px] border-[9px] border-slate-900 bg-slate-950 p-2.5 shadow-2xl shadow-slate-950 ring-2 ring-slate-800/80">
              {/* Top Dynamic Island / Speaker */}
              <div className="h-4.5 w-24 rounded-full bg-slate-900 mx-auto mb-2 flex items-center justify-center">
                <div className="size-2 rounded-full bg-slate-800" />
              </div>

              {/* Phone Inner Display Screen */}
              <div className="rounded-[34px] overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-4 space-y-4 text-white">
                {/* Header in Phone */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <FoodHubLogo size={22} showText={false} />
                  <span className="text-[11px] font-bold text-amber-400">
                    FoodHub Live
                  </span>
                  <div className="size-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                {/* Main Feature Highlight in Mockup: Schedule your order */}
                <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 text-center space-y-2">
                  <div className="size-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                    <Calendar className="size-6 animate-pulse" />
                  </div>
                  <div className="text-xs font-black text-white">
                    {lang === "ar" ? "جدولة موعد طلبك" : "Schedule your order"}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    {lang === "ar"
                      ? "حدد موعد الغداء أو العشاء واستلم وجبتك ساخنة في الدقيقة المحددة"
                      : "Set exact delivery time and receive freshly prepared meals on time"}
                  </p>
                </div>

                {/* Radar Status Tracker inside phone */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Zap className="size-3" />
                      {lang === "ar" ? "توصيل سريع" : "Express Hub"}
                    </span>
                    <span>15 min</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse" />
                  </div>
                </div>

                {/* Order Confirmation Badge */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span className="text-[10px] text-slate-300 font-medium">
                    {lang === "ar" ? "أقل سعر توصيل في المملكة" : "Lowest delivery fee guaranteed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto z-10">
            {/* Card 5: Gourmet */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-950/5 hover:-translate-y-1 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 group cursor-default">
              <div className="size-12 sm:size-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="size-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === "ar" ? "أطباق فاخرة" : "Gourmet"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === "ar" ? "اختيار الشيف" : "Chef Specials"}
              </span>
            </div>

            {/* Card 6: Offers */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-950/5 hover:-translate-y-1 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 group cursor-default">
              <div className="size-12 sm:size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Percent className="size-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === "ar" ? "عروض وخصومات" : "Offers"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === "ar" ? "حتى 50% توفير" : "Up to 50% Off"}
              </span>
            </div>

            {/* Card 7: Express Delivery */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-950/5 hover:-translate-y-1 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 group cursor-default">
              <div className="size-12 sm:size-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Clock className="size-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === "ar" ? "توصيل البرق" : "Lightning Fast"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === "ar" ? "خلال 15 دقيقة" : "15 Mins Speed"}
              </span>
            </div>

            {/* Card 8: Collections */}
            <div className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-950/5 hover:-translate-y-1 hover:shadow-2xl hover:border-rose-300 transition-all duration-300 group cursor-default">
              <div className="size-12 sm:size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Bookmark className="size-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {lang === "ar" ? "قوائم منسقة" : "Collections"}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {lang === "ar" ? "أفضل الترشيحات" : "Curated Picks"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

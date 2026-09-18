import React from "react";
import { useI18n } from "@/lib/i18n";
import { Store, MapPin, PackageCheck } from "lucide-react";

export function ZomatoBetterFood() {
  const { lang } = useI18n();

  return (
    <section className="relative w-full py-16 sm:py-24 bg-white text-slate-900 overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* 1. Playful Pink Curving Line Graphic Background (Zomato Vector Paths) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        <svg
          viewBox="0 0 1440 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          <path
            d="M-100 250 C 200 50, 400 450, 720 280 C 1040 110, 1200 400, 1540 200"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeDasharray="8 8"
            fill="none"
          />
          <path
            d="M-50 400 C 300 550, 500 150, 900 350 C 1200 500, 1350 100, 1500 300"
            stroke="#fb7185"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      {/* 2. Floating Food Elements (Zomato Realistic Cutouts) */}
      {/* Left: Juicy Gourmet Burger */}
      <div className="hidden md:block absolute top-1/4 start-6 lg:start-16 w-36 lg:w-48 z-10 animate-pulse duration-[4000ms] pointer-events-none select-none">
        <img
          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop&q=80"
          alt="Gourmet Burger"
          className="size-full object-cover rounded-full drop-shadow-2xl shadow-rose-950/20 border-4 border-white transform -rotate-12 hover:rotate-0 transition-transform duration-500"
        />
      </div>

      {/* Top Right: Steaming Dim Sum in Bamboo Basket */}
      <div className="hidden md:block absolute top-10 end-8 lg:end-20 w-32 lg:w-44 z-10 animate-bounce duration-[6000ms] pointer-events-none select-none">
        <img
          src="https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=400&h=400&fit=crop&q=80"
          alt="Dim Sum Dumplings"
          className="size-full object-cover rounded-full drop-shadow-2xl shadow-rose-950/20 border-4 border-white transform rotate-12 hover:rotate-0 transition-transform duration-500"
        />
      </div>

      {/* Bottom Right: Pizza Slice */}
      <div className="hidden md:block absolute bottom-12 end-12 lg:end-28 w-32 lg:w-44 z-10 animate-pulse duration-[5000ms] pointer-events-none select-none">
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop&q=80"
          alt="Pizza Slice"
          className="size-full object-cover rounded-full drop-shadow-2xl shadow-rose-950/20 border-4 border-white transform rotate-6 hover:rotate-0 transition-transform duration-500"
        />
      </div>

      {/* Floating Small Decor: Tomato & Basil */}
      <div className="hidden sm:block absolute top-1/2 start-1/4 w-8 h-8 rounded-full bg-rose-500/80 shadow-lg blur-[0.5px] animate-ping duration-[7000ms] pointer-events-none" />
      <div className="hidden sm:block absolute bottom-1/3 end-1/3 w-6 h-6 rounded-full bg-emerald-500/80 shadow-lg blur-[0.5px] animate-bounce duration-[8000ms] pointer-events-none" />

      {/* 3. Center Content */}
      <div className="relative z-20 max-w-3xl mx-auto px-4 text-center space-y-6">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-rose-500 leading-tight">
            {lang === "ar" ? "طعام أفضل.. لأكبر عدد من الناس" : "Better food for more people"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {lang === "ar"
              ? "على مدار سنوات، مكّنا عملاءنا في كافة أنحاء المملكة من اكتشاف ألذ المأكولات والمطابخ السحابية وتوصيلها فوراً إلى باب منزلهم بأعلى جودة وأقل تكلفة."
              : "For over a decade, we've enabled our customers to discover new tastes, delivered right to their doorstep."}
          </p>
        </div>

        {/* 4. Floating Rounded Stats Card (Zomato Exact Pill) */}
        <div className="pt-4">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100 rounded-3xl bg-white border border-slate-100/80 p-4 sm:p-6 shadow-2xl shadow-slate-200/80">
            {/* Stat 1: Partner Kitchens */}
            <div className="flex items-center gap-3 px-6 py-3 sm:py-0">
              <div className="text-start">
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {lang === "ar" ? "+5,000" : "5,000+"}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {lang === "ar" ? "مطعم ومطبخ سحابي" : "restaurants"}
                </div>
              </div>
              <div className="size-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <Store className="size-5" />
              </div>
            </div>

            {/* Stat 2: Covered Cities */}
            <div className="flex items-center gap-3 px-6 py-3 sm:py-0">
              <div className="text-start">
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {lang === "ar" ? "+50" : "50+"}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {lang === "ar" ? "مدينة ومحافظة" : "cities"}
                </div>
              </div>
              <div className="size-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <MapPin className="size-5" />
              </div>
            </div>

            {/* Stat 3: Successful Orders */}
            <div className="flex items-center gap-3 px-6 py-3 sm:py-0">
              <div className="text-start">
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {lang === "ar" ? "+10 مليون" : "10M+"}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {lang === "ar" ? "طلب تم توصيله" : "orders delivered"}
                </div>
              </div>
              <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <PackageCheck className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

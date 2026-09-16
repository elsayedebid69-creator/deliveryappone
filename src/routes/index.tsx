import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Leaf,
  Salad,
  Beef,
  Carrot,
  Apple,
  Egg,
  Cookie,
  Plus,
  Flame,
  Zap,
  Clock,
  Star,
  Sparkles,
  Bot,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { AppFooter, AppHeader } from "@/components/app-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiFoodAssistant } from "@/components/customer/ai-food-assistant";
import { sounds } from "@/lib/sound-effects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoodHub 3.0 | الجيل القادم لتوصيل الطعام الصحي والذكي" },
      {
        name: "description",
        content: "منظومة توصيل وجبات فائقة الحداثة مدعومة بالذكاء الاصطناعي — أسرع، أطزج، وأذكى.",
      },
      { property: "og:title", content: "FoodHub 3.0 | الجيل القادم لتوصيل الطعام" },
      {
        property: "og:description",
        content: "وجبات طازجة محسوبة السعرات بتوصيل راداري حي ومساعد ذكي AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const CATEGORIES = [
  { id: "all", ar: "الكل (الكل في واحد)", en: "All Meals", icon: Leaf },
  { id: "protein", ar: "بروتين وأبطال 🥩", en: "High Protein", icon: Beef },
  { id: "salads", ar: "سلطات طازجة 🥗", en: "Super Salads", icon: Salad },
  { id: "keto", ar: "كيتو دايت 🥑", en: "Keto Gourmet", icon: Egg },
  { id: "vegan", ar: "نباتي وصحي 🌱", en: "Plant-Based", icon: Carrot },
  { id: "smoothies", ar: "عصائر وسموذي 🥤", en: "Power Elixirs", icon: Apple },
  { id: "breakfast", ar: "إفطار الطاقة 🥞", en: "Morning Fuel", icon: Cookie },
];

const FEATURED_MEALS = [
  {
    id: 1,
    nameAr: "سلطة الكينوا بالأفوكادو والخضار المشوية",
    nameEn: "Grilled Veggie Quinoa Salad",
    descAr: "كينوا عضوية مطبوخة مع خضار مشوية، أفوكادو طازج، وصلصة الليمون والأعشاب",
    descEn: "Organic cooked quinoa with charred veggies, fresh avocado and lemon dressing",
    price: 38,
    calories: 340,
    protein: 16,
    prepTime: "8-10 د",
    rating: 4.9,
    reviews: 280,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=350&fit=crop",
    category: "salads",
    tagAr: "🌱 نباتي خفيف",
  },
  {
    id: 2,
    nameAr: "صدر دجاج تندرلوين مشوي مع الكينوا الذهبية",
    nameEn: "Herb Grilled Chicken Breast",
    descAr: "صدر دجاج متبل بالأعشاب الطبيعية، يقدم مع أرز بني محمص وخضار طازجة على البخار",
    descEn: "Herb-seasoned tender chicken breast with toasted brown rice and steamed greens",
    price: 45,
    calories: 420,
    protein: 42,
    prepTime: "12-14 د",
    rating: 5.0,
    reviews: 540,
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&h=350&fit=crop",
    category: "protein",
    tagAr: "🔥 أعلى مبيعاً",
  },
  {
    id: 3,
    nameAr: "وعاء الأفوكادو والسلمون النرويجي البري",
    nameEn: "Avocado & Wild Salmon Power Bowl",
    descAr: "فيليه سلمون مشوي غني بالأوميغا 3 مع شرائح أفوكادو، كينوا وصلصة الترياكي الصحية",
    descEn: "Omega-3 rich grilled salmon with creamy avocado, wild grains and house glaze",
    price: 52,
    calories: 490,
    protein: 45,
    prepTime: "14-16 د",
    rating: 4.95,
    reviews: 620,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop",
    category: "protein",
    tagAr: "✨ طبق الشيف",
  },
  {
    id: 4,
    nameAr: "سموذي التوت البري المعزز ببذور الشيا",
    nameEn: "Wild Berry Chia Power Smoothie",
    descAr: "مزيج منعش من التوت البري الطازج، حليب اللوز، بذور الشيا الغنية، وعسل المانوكا",
    descEn: "Fresh antioxidant berry blend with almond milk, soaked chia and manuka honey",
    price: 22,
    calories: 195,
    protein: 9,
    prepTime: "4-6 د",
    rating: 4.85,
    reviews: 190,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&h=350&fit=crop",
    category: "smoothies",
    tagAr: "⚡ طاقة واستشفاء",
  },
  {
    id: 5,
    nameAr: "وعاء العدس العضوي بالخضار والبهارات",
    nameEn: "Organic Lentil & Garden Greens",
    descAr: "عدس مسلوق مع باقة خضار موسمية وبهارات دافئة تعزز المناعة وتمنح شبعاً طويلاً",
    descEn: "Slow-simmered organic lentils with garden veggies and aromatic wellness spices",
    price: 32,
    calories: 360,
    protein: 22,
    prepTime: "10 د",
    rating: 4.8,
    reviews: 130,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&h=350&fit=crop",
    category: "vegan",
    tagAr: "🌿 غني بالألياف",
  },
  {
    id: 6,
    nameAr: "شوفان الليلة السابقة بالفواكه والمكسرات",
    nameEn: "Overnight Oats with Forest Berries",
    descAr: "شوفان كامل منقوع في حليب اللوز مع طبقات التوت، اللوز المقرمش وبذور الكتان",
    descEn: "Whole rolled oats soaked overnight in artisan nut milk with fresh berries",
    price: 18,
    calories: 280,
    protein: 14,
    prepTime: "3 د",
    rating: 4.9,
    reviews: 310,
    image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&h=350&fit=crop",
    category: "breakfast",
    tagAr: "🥞 إفطار الصباح",
  },
];

function Home() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const cart = useCart();

  const filtered = FEATURED_MEALS.filter((meal) => {
    const matchesCategory = selectedCategory === "all" || meal.category === selectedCategory;
    const term = q.trim().toLowerCase();
    if (!term) return matchesCategory;
    return (
      matchesCategory &&
      (meal.nameAr.toLowerCase().includes(term) ||
        meal.nameEn.toLowerCase().includes(term) ||
        meal.descAr.toLowerCase().includes(term) ||
        meal.descEn.toLowerCase().includes(term))
    );
  });

  const handleQuickAdd = (meal: (typeof FEATURED_MEALS)[0]) => {
    cart.add({
      id: String(meal.id),
      restaurant_id: "food-hub",
      name_ar: meal.nameAr,
      name_en: meal.nameEn,
      price: meal.price,
    });
    sounds.playClick();
    toast.success(
      lang === "ar"
        ? `✨ تمت إضافة "${meal.nameAr}" إلى سلتك!`
        : `✨ Added "${meal.nameEn}" to your cart!`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      {/* Futuristic Cyber-Culinary Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-10 pb-16">
        {/* Glow Spheres */}
        <div className="absolute -top-32 -start-32 size-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -end-32 size-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:text-start">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-3 py-1 font-bold">
                  <Sparkles className="size-3.5 me-1 text-amber-400" />
                  {lang === "ar"
                    ? "الجيل الثالث 3.0 • توصيل ذكي فائق"
                    : "Gen 3.0 • FoodHub Intelligent Delivery"}
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs px-3 py-1 font-bold">
                  <Zap className="size-3.5 me-1 text-cyan-400" />
                  {lang === "ar"
                    ? "توصيل فائق السرعة < 20 دقيقة"
                    : "Ultra Fast Delivery < 20 min"}
                </Badge>
              </div>

              <h1 className="text-4xl font-black leading-tight sm:text-6xl tracking-tight text-white">
                {lang === "ar" ? (
                  <>
                    طعام صحي وطازج، <br />
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                      بأعلى معايير الجودة والمذاق.
                    </span>
                  </>
                ) : (
                  <>
                    Fresh & Healthy Food, <br />
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                      Crafted with Excellence.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base text-slate-300 sm:text-lg max-w-xl leading-relaxed">
                {lang === "ar"
                  ? "اطلب أشهى الوجبات الصحية المحضرة بعناية من أفضل المطابخ، مع توصيل سريع وتتبع مباشر ولحظي حتى باب منزلك."
                  : "Order delicious, nutritious meals crafted by top chefs, delivered fast with live real-time GPS tracking straight to your door."}
              </p>

            </div>

            {/* AI Assistant Quick Pitch Card */}
            <div className="w-full sm:w-80 rounded-3xl border border-amber-500/30 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl space-y-3.5 glow-gold">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Bot className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {lang === "ar" ? "مساعد الذكاء الاصطناعي" : "AI Meal Assistant"}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === "ar"
                      ? "يقترح وجبتك حسب سعراتك وميزانيتك"
                      : "Suggests meals by calories & budget"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                {lang === "ar"
                  ? '"أريد وجبة غداء فيها أكثر من 40g بروتين وسعرها أقل من 50 ريال 🥩"'
                  : '"I want a high-protein lunch with 40g+ protein under 50 SAR 🥩"'}
              </p>

              <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                <span>{lang === "ar" ? "توصية فورية بنقرة واحدة" : "Instant 1-click advice"}</span>
                <Sparkles className="size-4 animate-spin" />
              </div>
            </div>

          </div>

          {/* Futuristic Search Bar */}
          <div className="mt-10 max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl flex items-center gap-2">
            <Search className="ms-3 size-5 shrink-0 text-amber-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "ابحث عن وجبة، سعرات، بروتين، كيتو، أو مكونات..."
                  : "Search meals, calories, protein, keto, or ingredients..."
              }
              maxLength={80}
              className="border-0 bg-transparent text-slate-100 placeholder:text-slate-500 shadow-none focus-visible:ring-0 text-sm"
            />
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 px-5 shadow-lg shadow-amber-500/20"
            >
              {lang === "ar" ? "بحث ذكي" : "Smart Search"}
            </Button>
          </div>

          {/* Futuristic Categories Pills */}
          <div className="mt-8 flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
                }`}
              >
                <cat.icon className="size-4" />
                {cat[lang]}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Featured 3D Meals Grid */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {lang === "ar" ? "قائمة الأطباق المميزة" : "Featured Gourmet Meals"}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === "ar"
                  ? "محضرة طازجة من خامات عضوية ومحسوبة الماكروز"
                  : "Freshly crafted organic meals with measured macros"}
              </p>
            </div>
          </div>

          <Badge className="hidden sm:flex bg-slate-900 border-slate-800 text-slate-300 text-xs">
            {filtered.length} {lang === "ar" ? "وجبة متاحة" : "meals available"}
          </Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((meal) => (
            <div
              key={meal.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/80 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
            >
              {/* Image & Overlay */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.nameEn}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Badge Tag */}
                <span className="absolute top-3 start-3 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-300 border border-slate-800">
                  {meal.tagAr}
                </span>

                {/* Price Pill */}
                <span className="absolute bottom-3 end-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-1 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/30">
                  {meal.price} {t("sar")}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="size-3.5 fill-amber-400" /> {meal.rating} ({meal.reviews})
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="size-3.5 text-slate-500" /> {meal.prepTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {lang === "ar" ? meal.nameAr : meal.nameEn}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {lang === "ar" ? meal.descAr : meal.descEn}
                  </p>
                </div>

                {/* Macro Telemetry HUD */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">
                      {lang === "ar" ? "السعرات الحرارية" : "Calories"}
                    </span>
                    <span className="font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Flame className="size-3" /> {meal.calories} kcal
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">
                      {lang === "ar" ? "البروتين الصافي" : "Net Protein"}
                    </span>
                    <span className="font-bold text-cyan-400 flex items-center justify-center gap-1">
                      <Zap className="size-3" /> {meal.protein}g
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 shadow-lg shadow-amber-500/20 py-5 rounded-2xl"
                  onClick={() => handleQuickAdd(meal)}
                >
                  <Plus className="me-1.5 size-4" />
                  {t("addToCart")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/40 py-20 text-center">
            <Search className="mb-4 size-14 text-slate-600 animate-pulse" />
            <p className="text-lg font-bold text-white">
              {lang === "ar" ? "لم يتم العثور على أطباق متطابقة" : "No meals found"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {lang === "ar" ? "جرب البحث بكلمات أخرى أو تصفح الأقسام المقترحة" : "Try searching with different terms"}
            </p>
          </div>
        )}
      </section>

      {/* Floating AI Food Assistant */}
      <AiFoodAssistant />

      <AppFooter />
    </div>
  );
}

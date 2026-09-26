import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Search,
  Bell,
  Sparkles,
  Flame,
  Clock,
  Star,
  Plus,
  ShoppingBag,
  Bike,
  Heart,
  ChevronDown,
  Filter,
  Check,
  Percent,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Riyadh Localities Quick List
const DISTRICTS = [
  "حي النرجس، شمال الرياض",
  "حي الملقا، طريق أنس بن مالك",
  "حي حطين، البوليفارد",
  "حي الياسمين، مخرج 5",
  "حي الصحافة، شارع العليا",
  "حي العليا، وسط الرياض",
  "حي الروضة، شرق الرياض",
];

// Stories
const STORIES = [
  { id: "s1", titleAr: "خصم 50%", titleEn: "50% OFF", emoji: "🔥", tag: "كود: FOOD50" },
  { id: "s2", titleAr: "توصيل 0 ر.س", titleEn: "Free Delivery", emoji: "🛵", tag: "أول 3 طلبات" },
  { id: "s3", titleAr: "كيتو وهيلثي", titleEn: "Keto & Health", emoji: "🥑", tag: "ماكروز دقيقة" },
  { id: "s4", titleAr: "أقوى برجر", titleEn: "Top Burgers", emoji: "🍔", tag: "لحم أنجوس" },
  { id: "s5", titleAr: "شاورما صاج", titleEn: "Shawarma", emoji: "🌯", tag: "ثومية مضاعفة" },
  { id: "s6", titleAr: "سويت وكافيه", titleEn: "Sweets & Cafe", emoji: "🍰", tag: "قهوة مختصة" },
];

// Categories
const CATEGORIES = [
  { id: "all", nameAr: "الكل", nameEn: "All", emoji: "🍽️" },
  { id: "burger", nameAr: "برجر وسلايدرز", nameEn: "Burgers", emoji: "🍔" },
  { id: "shawarma", nameAr: "شاورما ومشاوي", nameEn: "Shawarma", emoji: "🌯" },
  { id: "healthy", nameAr: "صحي وكيتو", nameEn: "Healthy & Keto", emoji: "🥗" },
  { id: "pizza", nameAr: "بيتزا وباستا", nameEn: "Pizza", emoji: "🍕" },
  { id: "sweets", nameAr: "حلى وكيك", nameEn: "Desserts", emoji: "🍰" },
  { id: "drinks", nameAr: "قهوة وعصائر", nameEn: "Beverages", emoji: "☕" },
  { id: "cloud", nameAr: "مطابخ سحابية", nameEn: "Cloud Kitchens", emoji: "☁️" },
];

// Cloud Kitchens & Restaurants
const RESTAURANTS = [
  {
    id: "fh-prime",
    nameAr: "مطبخ فود هب المركزي (FoodHub Prime)",
    nameEn: "FoodHub Prime Cloud Kitchen",
    tagAr: "مطبخ سحابي موثق ⚡",
    rating: 4.95,
    reviews: 1420,
    eta: "15-20 دقيقة",
    deliveryFee: "مجاني",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    badge: "الأكثر طلباً بالرياض",
  },
  {
    id: "fh-burger",
    nameAr: "سماش أنجوس كلود برجر",
    nameEn: "Smash Angus Cloud Burger",
    tagAr: "برجر فاخر 🍔",
    rating: 4.91,
    reviews: 980,
    eta: "15-22 دقيقة",
    deliveryFee: "مجاني فوق 40 ر.س",
    category: "burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    badge: "أنجوس 100%",
  },
  {
    id: "fh-shawarma",
    nameAr: "شاورما الحطب الأصلية",
    nameEn: "Original Woodfire Shawarma",
    tagAr: "مشاوي وشاورما 🌯",
    rating: 4.88,
    reviews: 1250,
    eta: "12-18 دقيقة",
    deliveryFee: "9 ر.س",
    category: "shawarma",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80",
    badge: "خبز صاج طازج",
  },
  {
    id: "fh-keto",
    nameAr: "كيتو باور هاوس (Keto Power)",
    nameEn: "Keto Power House",
    tagAr: "دايت ومحسوب الماكروز 🥑",
    rating: 4.93,
    reviews: 820,
    eta: "15-20 دقيقة",
    deliveryFee: "مجاني",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    badge: "صفر سكر",
  },
];

// Top Meals for 1-Tap Add to Cart
const POPULAR_MEALS = [
  {
    id: "meal-1",
    nameAr: "سماش برجر كلاسيك دبل تشيز",
    nameEn: "Classic Double Cheese Smash Burger",
    descAr: "شريحتين لحم أنجوس مشوية مع صوص فود هب السري في خبز بطاطس",
    price: 34,
    calories: "520 كالوري",
    category: "burger",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "meal-2",
    nameAr: "صحن شاورما عربي دجاج مع ثومية وبطاطس",
    nameEn: "Arabic Chicken Shawarma Plate",
    descAr: "شاورما دجاج متبلة 24 ساعة مع بطاطس مقرمشة وثومية طازجة",
    price: 28,
    calories: "480 كالوري",
    category: "shawarma",
    image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "meal-3",
    nameAr: "وعاء السلمون المشوي مع الكينوا والأفوكادو (كيتو)",
    nameEn: "Grilled Salmon Quinoa Keto Bowl",
    descAr: "فيليه سلمون طازج مع أفوكادو وخضار مشكلة وصلصة الليمون",
    price: 49,
    calories: "410 كالوري • 38g بروتين",
    category: "healthy",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "meal-4",
    nameAr: "بيتزا تروفل بالمشروم والجبن الإيطالي",
    nameEn: "Truffle Mushroom Artisan Pizza",
    descAr: "عجينة مخمرة 48 ساعة مع زيت التروفل الأسود وموزاريلا طازجة",
    price: 42,
    calories: "620 كالوري",
    category: "pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "meal-5",
    nameAr: "تشيز كيك سان سيباستيان مع صوص شوكولاتة بلجيكية",
    nameEn: "San Sebastian Cheesecake with Belgian Chocolate",
    descAr: "كيكة الجبن المحروقة الإسبانية بقوام كريمي غني",
    price: 26,
    calories: "340 كالوري",
    category: "sweets",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "meal-6",
    nameAr: "سبانش لاتيه بارد بحليب الشوفان",
    nameEn: "Iced Spanish Latte (Oat Milk)",
    descAr: "إسبريسو برازيلي مركز مع حليب الشوفان ونكهة الكراميل",
    price: 19,
    calories: "160 كالوري",
    category: "drinks",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80",
  },
];

export function CustomerMobileApp() {
  const { lang, tn } = useI18n();
  const ar = lang === "ar";
  const cart = useCart();

  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]!);
  const [districtModalOpen, setDistrictModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStory, setActiveStory] = useState<typeof STORIES[0] | null>(null);

  // 1-Tap Add To Cart Handler
  const handleQuickAdd = (meal: typeof POPULAR_MEALS[0]) => {
    sounds.playAdd();
    cart.addItem({
      menu_item_id: meal.id,
      restaurant_id: "fh-prime",
      name_ar: meal.nameAr,
      name_en: meal.nameEn,
      price: meal.price,
      quantity: 1,
      image_url: meal.image,
    });
    toast.success(
      ar ? `✓ أُضيف للسلة: ${meal.nameAr}` : `✓ Added to Cart: ${meal.nameEn}`,
      {
        description: `${meal.price} ${ar ? "ر.س" : "SAR"}`,
        duration: 1500,
      }
    );
  };

  const totalItemCount = cart.lines.reduce((sum, item) => sum + item.quantity, 0);

  // Filter meals
  const filteredMeals = POPULAR_MEALS.filter((meal) => {
    const matchesCategory = selectedCategory === "all" || meal.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      meal.nameAr.includes(searchQuery) ||
      meal.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 selection:bg-amber-500 selection:text-slate-950">
      {/* 1. NATIVE MOBILE APP HEADER */}
      <header className="sticky top-11 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto space-y-3">
          {/* Top Row: Location Selector & Notification Bell */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setDistrictModalOpen(true);
              }}
              className="flex items-center gap-2 text-start p-1.5 rounded-xl hover:bg-slate-900 transition-colors group"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                <MapPin className="size-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <span>{ar ? "التوصيل السريع إلى" : "Deliver to"}</span>
                  <ChevronDown className="size-3 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <div className="text-xs font-black text-white group-hover:text-amber-400 transition-colors truncate max-w-[200px]">
                  {selectedDistrict}
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1.5">
              <Link
                to="/orders"
                onClick={() => sounds.playClick()}
                className="relative size-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
                title={ar ? "تتبع الطلبات الحية" : "Live Radar"}
              >
                <Zap className="size-4 text-amber-400" />
                <span className="absolute -top-1 -end-1 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-3 bg-amber-500" />
                </span>
              </Link>
            </div>
          </div>

          {/* Search Bar with Autocomplete Pill */}
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ar ? "ابحث عن برجر، شاورما، كيتو، أو مطبخ..." : "Search burger, shawarma, keto, kitchen..."}
              className="w-full h-11 ps-10 pe-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded-md bg-slate-800"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC INSTAGRAM-LIKE STORIES */}
      <section className="pt-3 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => {
                sounds.playClick();
                setActiveStory(story);
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 group-hover:scale-105 transition-transform duration-200">
                <div className="size-14 rounded-full bg-slate-950 p-1 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-lg">
                  <span>{story.emoji}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-300 group-hover:text-amber-400 transition-colors whitespace-nowrap">
                {ar ? story.titleAr : story.titleEn}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. HERO PROMO BANNER CAROUSEL */}
      <section className="px-4 pt-3">
        <div className="max-w-md mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-4 text-slate-950 overflow-hidden shadow-xl shadow-amber-500/10">
            <div className="absolute -end-6 -bottom-6 size-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black shadow-md">
                <Sparkles className="size-3" />
                <span>{ar ? "عرض ترويجي حصري" : "Exclusive Offer"}</span>
              </div>
              <h2 className="text-lg font-black leading-tight">
                {ar ? "خصم 50% على طلبك الأول!" : "50% OFF Your First Order!"}
              </h2>
              <p className="text-xs font-bold text-slate-900/90">
                {ar ? "استخدم كود الخصم" : "Use code"}{" "}
                <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md font-mono font-black">
                  FOODHUB
                </span>{" "}
                {ar ? "مع توصيل بـ 0 ريال" : "with 0 SAR delivery"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORIES QUICK PILLS */}
      <section className="px-4 pt-4 overflow-x-auto no-scrollbar">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <span className="text-sm">{cat.emoji}</span>
                <span>{ar ? cat.nameAr : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. HOT CLOUD KITCHENS */}
      <section className="px-4 pt-5 space-y-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-amber-400" />
            <h3 className="text-sm font-black text-white">
              {ar ? "المطابخ السحابية الأكثر طلباً" : "Top Cloud Kitchens"}
            </h3>
          </div>
          <span className="text-[11px] text-amber-400 font-bold">
            {ar ? "الرياض 📍" : "Riyadh 📍"}
          </span>
        </div>

        <div className="max-w-md mx-auto overflow-x-auto no-scrollbar">
          <div className="flex gap-3 pb-1">
            {RESTAURANTS.map((resto) => (
              <div
                key={resto.id}
                className="w-64 shrink-0 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={resto.image}
                    alt={resto.nameAr}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute top-2 start-2 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-500/30">
                    {resto.badge}
                  </span>
                  <div className="absolute bottom-2 start-2 flex items-center gap-1 bg-slate-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span>{resto.rating}</span>
                  </div>
                </div>

                <div className="p-3 space-y-1.5">
                  <h4 className="font-bold text-xs text-white truncate">
                    {ar ? resto.nameAr : resto.nameEn}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="size-3 text-amber-400" />
                      {resto.eta}
                    </span>
                    <span className="text-emerald-400 font-bold">{resto.deliveryFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. POPULAR DISHES GRID (1-TAP ADD TO CART) */}
      <section className="px-4 pt-5 space-y-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-400" />
            <h3 className="text-sm font-black text-white">
              {ar ? "أطباق لا تقاوم (أضف بلمسة واحدة)" : "Trending Meals (1-Tap Add)"}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {filteredMeals.length} {ar ? "وجبة متوفرة" : "meals available"}
          </span>
        </div>

        <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-md group"
            >
              <div className="relative size-20 rounded-xl overflow-hidden shrink-0">
                <img
                  src={meal.image}
                  alt={meal.nameAr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                  {ar ? meal.nameAr : meal.nameEn}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">{ar ? meal.descAr : meal.descEn}</p>
                <div className="text-[10px] text-amber-400/90 font-mono font-bold">{meal.calories}</div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs font-black text-white">
                    {meal.price} <span className="text-[10px] text-amber-400">{ar ? "ر.س" : "SAR"}</span>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(meal)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20"
                  >
                    <Plus className="size-3.5 stroke-[3]" />
                    <span>{ar ? "أضف" : "Add"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. DISTRICT PICKER MODAL */}
      {districtModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-amber-400" />
                <h3 className="font-black text-sm text-white">
                  {ar ? "اختر حي التوصيل في الرياض" : "Select Riyadh District"}
                </h3>
              </div>
              <button
                onClick={() => setDistrictModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {DISTRICTS.map((dist) => (
                <button
                  key={dist}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedDistrict(dist);
                    setDistrictModalOpen(false);
                    toast.success(ar ? `تم ضبط موقع التوصيل: ${dist}` : `Location set to: ${dist}`);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all text-start ${
                    selectedDistrict === dist
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span>{dist}</span>
                  {selectedDistrict === dist && <Check className="size-4 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. STORY PREVIEW POPUP */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="size-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-lg">
              {activeStory.emoji}
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-black px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                {activeStory.tag}
              </span>
              <h3 className="text-lg font-black text-white mt-2">
                {ar ? activeStory.titleAr : activeStory.titleEn}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {ar
                  ? "عرض متاح لجميع الطلبات اليوم عبر مطابخ FoodHub المركزية في الرياض."
                  : "Offer available across FoodHub cloud kitchens today in Riyadh."}
              </p>
            </div>
            <Button
              onClick={() => {
                sounds.playSuccess();
                setActiveStory(null);
                toast.success(ar ? "تم تفعيل العرض بنجاح!" : "Offer activated successfully!");
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl text-xs"
            >
              {ar ? "تطبيق العرض الآن ⚡" : "Apply Offer Now ⚡"}
            </Button>
            <button
              onClick={() => setActiveStory(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              {ar ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

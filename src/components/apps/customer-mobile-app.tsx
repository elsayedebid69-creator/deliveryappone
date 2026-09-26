import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Search,
  Flame,
  Clock,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  ChevronDown,
  Filter,
  Check,
  Zap,
  Home,
  UtensilsCrossed,
  Radar,
  User,
  ArrowRight,
  Sparkles,
  Share2,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Riyadh Localities
const DISTRICTS = [
  "حي النرجس، شمال الرياض",
  "حي الملقا، طريق أنس بن مالك",
  "حي حطين، البوليفارد",
  "حي الياسمين، مخرج 5",
  "حي الصحافة، شارع العليا",
  "حي العليا، وسط الرياض",
  "حي الروضة، شرق الرياض",
];

// Instagram / Snapchat Style Daily Stories
const STORIES = [
  { id: "s1", titleAr: "خصم 50%", titleEn: "50% OFF", emoji: "🔥", tag: "كود: FOOD50", code: "FOOD50" },
  { id: "s2", titleAr: "توصيل 0 ر.س", titleEn: "Free Delivery", emoji: "🛵", tag: "أول 3 طلبات", code: "FREE3" },
  { id: "s3", titleAr: "كيتو وهيلثي", titleEn: "Keto & Health", emoji: "🥑", tag: "ماكروز دقيقة", code: "KETO10" },
  { id: "s4", titleAr: "أقوى برجر", titleEn: "Top Burgers", emoji: "🍔", tag: "لحم أنجوس", code: "BURGER" },
  { id: "s5", titleAr: "شاورما صاج", titleEn: "Shawarma", emoji: "🌯", tag: "ثومية مضاعفة", code: "SHAWARMA" },
  { id: "s6", titleAr: "سويت وكافيه", titleEn: "Sweets & Cafe", emoji: "🍰", tag: "قهوة مختصة", code: "SWEET" },
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

// Cloud Kitchens
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

// Popular Meals
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
    calories: "410 كالوري",
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

  // Quick Add To Cart
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

  const handleUpdateQuantity = (mealId: string, delta: number) => {
    sounds.playClick();
    const existing = cart.lines.find((item) => item.menu_item_id === mealId);
    if (!existing) return;
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      cart.removeItem(mealId);
    } else {
      cart.updateQuantity(mealId, newQty);
    }
  };

  const getItemQuantity = (mealId: string) => {
    const item = cart.lines.find((line) => line.menu_item_id === mealId);
    return item ? item.quantity : 0;
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
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center selection:bg-amber-500 selection:text-slate-950 md:py-6 md:px-4">
      {/* 
        SMARTPHONE DEVICE WRAPPER:
        - Mobile View: 100% full screen native app experience (no borders, edge to edge)
        - Desktop / Lovable Preview: Clean smartphone viewport frame with notch and status bar
      */}
      <div className="w-full md:max-w-[420px] min-h-screen md:min-h-[860px] md:h-[92vh] md:max-h-[920px] bg-slate-950 flex flex-col md:rounded-[48px] md:border-[7px] md:border-slate-800 md:shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)] relative overflow-hidden">
        {/* TOP STATUS BAR (Visible on desktop smartphone frame) */}
        <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 select-none text-[11px] font-semibold text-slate-400 bg-slate-950 z-30 shrink-0">
          <span>9:41</span>
          {/* Dynamic Island Notch */}
          <div className="h-5 w-24 bg-black rounded-full flex items-center justify-center border border-slate-800/80 shadow-inner">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="font-bold text-slate-300">5G</span>
            <div className="w-4 h-2.5 rounded-sm border border-slate-400 p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-300 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* 1. APP HEADER */}
        <header className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 shrink-0">
          <div className="space-y-2.5">
            {/* Location Selector & Quick Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setDistrictModalOpen(true);
                }}
                className="flex items-center gap-2 text-start p-1 rounded-xl hover:bg-slate-900 transition-colors group max-w-[70%]"
              >
                <div className="flex size-8.5 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <MapPin className="size-4" />
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <span>{ar ? "التوصيل إلى" : "Deliver to"}</span>
                    <ChevronDown className="size-3 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <div className="text-xs font-black text-white group-hover:text-amber-400 transition-colors truncate">
                    {selectedDistrict}
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  to="/orders"
                  onClick={() => sounds.playClick()}
                  className="relative size-8.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
                  title={ar ? "تتبع الطلبات الحية" : "Live Radar"}
                >
                  <Zap className="size-4 text-amber-400" />
                  <span className="absolute -top-1 -end-1 flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-amber-500" />
                  </span>
                </Link>

                <Link
                  to="/cart"
                  onClick={() => sounds.playClick()}
                  className="relative size-8.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
                  title={ar ? "السلة" : "Cart"}
                >
                  <ShoppingBag className="size-4" />
                  {totalItemCount > 0 && (
                    <span className="absolute -top-1 -end-1 size-4 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center shadow-md animate-pulse">
                      {totalItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={ar ? "ابحث عن برجر، شاورما، كيتو، أو مطبخ..." : "Search burger, shawarma, keto, kitchen..."}
                  className="w-full h-10 ps-9 pe-8 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1 rounded bg-slate-800"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  toast.info(ar ? "فلترة متقدمة حسب السرعة والسعر والتقييم" : "Filter by speed, price & rating");
                }}
                className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-slate-700 transition-colors shrink-0"
              >
                <Filter className="size-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 2. SCROLLABLE APP CONTENT */}
        <div className="flex-1 overflow-y-auto no-scrollbar scrollbar-none pb-28 space-y-4">
          {/* STORIES SECTION */}
          <div className="pt-3 px-4">
            <div className="overflow-x-auto no-scrollbar scrollbar-none">
              <div className="flex items-center gap-3 pb-1">
                {STORIES.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => {
                      sounds.playClick();
                      setActiveStory(story);
                    }}
                    className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                  >
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 group-hover:scale-105 transition-transform duration-200">
                      <div className="size-13 rounded-full bg-slate-950 p-1 border-2 border-slate-950 flex items-center justify-center text-2xl shadow-md">
                        <span>{story.emoji}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-400 transition-colors whitespace-nowrap">
                      {ar ? story.titleAr : story.titleEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HERO PROMO CARD */}
          <div className="px-4">
            <div className="relative rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-4 text-slate-950 overflow-hidden shadow-lg shadow-amber-500/10">
              <div className="absolute -end-4 -bottom-4 size-28 rounded-full bg-white/15 blur-xl pointer-events-none" />
              <div className="relative z-10 space-y-1.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[9px] font-black shadow-md">
                  <Sparkles className="size-3" />
                  <span>{ar ? "عرض ترويجي حصري" : "Exclusive Offer"}</span>
                </div>
                <h2 className="text-base font-black leading-tight text-slate-950">
                  {ar ? "خصم 50% على طلبك الأول!" : "50% OFF Your First Order!"}
                </h2>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] font-bold text-slate-900 leading-none">
                    {ar ? "استخدم كود" : "Use code"}{" "}
                    <span className="bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded font-mono font-black text-xs">
                      FOODHUB
                    </span>
                  </p>
                  <span className="text-[10px] font-black bg-white/30 text-slate-950 px-2 py-0.5 rounded-full">
                    {ar ? "توصيل بـ 0 ر.س" : "0 SAR Delivery"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORIES CHIPS */}
          <div className="px-4">
            <div className="overflow-x-auto no-scrollbar scrollbar-none">
              <div className="flex items-center gap-2 pb-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedCategory(cat.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]"
                          : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{ar ? cat.nameAr : cat.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* HOT CLOUD KITCHENS */}
          <div className="px-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="size-4 text-amber-400" />
                <h3 className="text-xs font-black text-white">
                  {ar ? "المطابخ السحابية الأكثر طلباً" : "Top Cloud Kitchens"}
                </h3>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">
                {ar ? "الرياض 📍" : "Riyadh 📍"}
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar scrollbar-none">
              <div className="flex gap-3 pb-1">
                {RESTAURANTS.map((resto) => (
                  <div
                    key={resto.id}
                    className="w-56 shrink-0 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-24 overflow-hidden">
                      <img
                        src={resto.image}
                        alt={resto.nameAr}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <span className="absolute top-2 start-2 bg-slate-950/80 backdrop-blur-md text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                        {resto.badge}
                      </span>
                      <div className="absolute bottom-1.5 start-2 flex items-center gap-1 bg-slate-950/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        <Star className="size-2.5 fill-amber-400 text-amber-400" />
                        <span>{resto.rating}</span>
                      </div>
                    </div>

                    <div className="p-2.5 space-y-1">
                      <h4 className="font-bold text-xs text-white truncate">
                        {ar ? resto.nameAr : resto.nameEn}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
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
          </div>

          {/* POPULAR MEALS FOR 1-TAP QUICK ORDER */}
          <div className="px-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-400" />
                <h3 className="text-xs font-black text-white">
                  {ar ? "أشهى الوجبات للطلب السريع" : "Popular Dishes"}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">
                {filteredMeals.length} {ar ? "وجبة" : "meals"}
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredMeals.map((meal) => {
                const qty = getItemQuantity(meal.id);
                return (
                  <div
                    key={meal.id}
                    className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="relative size-18 rounded-xl overflow-hidden shrink-0 bg-slate-950">
                      <img
                        src={meal.image}
                        alt={meal.nameAr}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-xs text-white truncate">
                        {ar ? meal.nameAr : meal.nameEn}
                      </h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {ar ? meal.descAr : meal.nameEn}
                      </p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-xs font-black text-amber-400">
                          {meal.price} {ar ? "ر.س" : "SAR"}
                        </span>

                        {qty === 0 ? (
                          <button
                            onClick={() => handleQuickAdd(meal)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] hover:bg-amber-400 active:scale-95 transition-all shadow-sm"
                          >
                            <Plus className="size-3 stroke-[3]" />
                            <span>{ar ? "أضف" : "Add"}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateQuantity(meal.id, -1)}
                              className="size-6 rounded bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="text-xs font-black text-amber-400 px-1">{qty}</span>
                            <button
                              onClick={() => handleUpdateQuantity(meal.id, 1)}
                              className="size-6 rounded bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 active:scale-95"
                            >
                              <Plus className="size-3 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. FLOATING QUICK CHECKOUT BAR (When cart has items) */}
        {totalItemCount > 0 && (
          <div className="absolute bottom-16 inset-x-3 z-30 pointer-events-auto animate-in slide-in-from-bottom-2 duration-200">
            <Link
              to="/cart"
              onClick={() => sounds.playClick()}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/30 border border-yellow-300 hover:brightness-105 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-slate-950 text-amber-400 font-black text-xs">
                  {totalItemCount}
                </div>
                <div className="text-start leading-none">
                  <div className="text-[10px] opacity-80 font-bold">
                    {ar ? "سلتك النشطة" : "Active Cart"}
                  </div>
                  <div className="text-xs font-black pt-0.5">
                    {tn(cart.subtotal)} {ar ? "ر.س" : "SAR"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-black bg-slate-950 text-amber-400 px-2.5 py-1.5 rounded-lg shadow-inner">
                <span>{ar ? "إتمام الطلب ⚡" : "Checkout ⚡"}</span>
                <ArrowRight className="size-3 rtl:rotate-180" />
              </div>
            </Link>
          </div>
        )}

        {/* 4. DOCKED INTEGRATED BOTTOM NAVIGATION */}
        <nav className="absolute inset-x-0 bottom-0 z-30 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl px-2 pt-2 pb-2">
          <div className="flex items-center justify-around">
            <Link
              to="/"
              onClick={() => sounds.playClick()}
              className="flex flex-col items-center gap-0.5 py-0.5 px-3 text-amber-400 font-black select-none"
            >
              <Home className="size-5 stroke-[2.5]" />
              <span className="text-[9px]">{ar ? "الرئيسية" : "Home"}</span>
            </Link>

            <Link
              to="/restaurant/food-hub-prime"
              onClick={() => sounds.playClick()}
              className="flex flex-col items-center gap-0.5 py-0.5 px-3 text-slate-400 hover:text-slate-200 select-none"
            >
              <UtensilsCrossed className="size-5 stroke-2" />
              <span className="text-[9px]">{ar ? "المطابخ" : "Kitchens"}</span>
            </Link>

            <Link
              to="/cart"
              onClick={() => sounds.playClick()}
              className="relative flex flex-col items-center gap-0.5 py-0.5 px-3 text-slate-400 hover:text-slate-200 select-none"
            >
              <ShoppingBag className="size-5 stroke-2" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 end-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-white font-black text-[8px]">
                  {totalItemCount}
                </span>
              )}
              <span className="text-[9px]">{ar ? "السلة" : "Cart"}</span>
            </Link>

            <Link
              to="/orders"
              onClick={() => sounds.playClick()}
              className="relative flex flex-col items-center gap-0.5 py-0.5 px-3 text-slate-400 hover:text-slate-200 select-none"
            >
              <Radar className="size-5 stroke-2" />
              <span className="absolute 0 end-1.5 flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="text-[9px]">{ar ? "الرادار" : "Radar"}</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => sounds.playClick()}
              className="flex flex-col items-center gap-0.5 py-0.5 px-3 text-slate-400 hover:text-slate-200 select-none"
            >
              <User className="size-5 stroke-2" />
              <span className="text-[9px]">{ar ? "حسابي" : "Profile"}</span>
            </Link>
          </div>

          {/* iOS Home Indicator */}
          <div className="w-28 h-1 bg-slate-700/60 rounded-full mx-auto mt-2" />
        </nav>

        {/* 5. DISTRICT PICKER MODAL */}
        {districtModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-4">
            <div className="w-full rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-amber-400" />
                  <h3 className="font-black text-xs text-white">
                    {ar ? "اختر حي التوصيل في الرياض" : "Select Riyadh District"}
                  </h3>
                </div>
                <button
                  onClick={() => setDistrictModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar scrollbar-none">
                {DISTRICTS.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedDistrict(dist);
                      setDistrictModalOpen(false);
                      toast.success(ar ? `تم ضبط موقع التوصيل: ${dist}` : `Location set to: ${dist}`);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-start ${
                      selectedDistrict === dist
                        ? "bg-amber-500 text-slate-950 shadow-md"
                        : "bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{dist}</span>
                    {selectedDistrict === dist && <Check className="size-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. STORY PREVIEW POPUP */}
        {activeStory && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xs rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 p-5 text-center space-y-3 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="size-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg">
                {activeStory.emoji}
              </div>
              <div>
                <span className="text-[9px] text-amber-400 font-black px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                  {activeStory.tag}
                </span>
                <h3 className="text-base font-black text-white mt-1.5">
                  {ar ? activeStory.titleAr : activeStory.titleEn}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
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
    </div>
  );
}

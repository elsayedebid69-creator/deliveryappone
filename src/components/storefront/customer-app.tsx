import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  MapPin,
  Clock,
  Star,
  Plus,
  Flame,
  Zap,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  Filter,
  Percent,
  Bike,
  Store,
  Compass,
  ArrowRight,
  BadgeCheck,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { sounds } from "@/lib/sound-effects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FoodHubLogo } from "@/components/food-hub-logo";
import { AiFoodAssistant } from "@/components/customer/ai-food-assistant";

// PedidosYa / Foodpanda / Snoonu Categories
const SNOONU_CATEGORIES = [
  { id: "all", nameAr: "المطاعم والأكلات", nameEn: "Food Delivery", icon: "🍔", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  { id: "grocery", nameAr: "ماركت وسوبرماركت", nameEn: "Quick Mart", icon: "🛒", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { id: "healthy", nameAr: "صحي ودايت", nameEn: "Healthy & Diet", icon: "🥑", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "bakery", nameAr: "مخابز وحلويات", nameEn: "Bakery & Sweets", icon: "🥐", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "coffee", nameAr: "كافيهات ومشروبات", nameEn: "Coffee & Drinks", icon: "☕", color: "bg-amber-700/10 text-amber-600 border-amber-700/20" },
  { id: "pharmacy", nameAr: "صيدلية وعناية", nameEn: "Pharmacy & Care", icon: "💊", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { id: "protein", nameAr: "وجبات البروتين", nameEn: "High Protein", icon: "🥩", color: "bg-red-500/10 text-red-500 border-red-500/20" },
];

// Featured Kitchens & Brands
const POPULAR_RESTAURANTS = [
  {
    id: "rest-1",
    nameAr: "مطبخ هيلثي جورميه السحابي",
    nameEn: "Healthy Gourmet Cloud Kitchen",
    cuisineAr: "وجبات صحية • كيتو • بروتين عالي",
    cuisineEn: "Healthy • Keto • High Protein",
    rating: 4.9,
    reviews: "1.2k+",
    deliveryTime: "15-20 دقيقة",
    deliveryFee: "مجاني",
    minOrder: 30,
    discount: "خصم 25% بكود: FOOD25",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=350&fit=crop",
    isFeatured: true,
    tag: "🔥 الأكثر طلباً",
  },
  {
    id: "rest-2",
    nameAr: "جريل ماستر بروتين هاوس",
    nameEn: "Grill Master Protein House",
    cuisineAr: "مشويات صحية • ستيك • دجاج تندرلوين",
    cuisineEn: "Healthy Grills • Steak • Tenderloin",
    rating: 4.85,
    reviews: "850+",
    deliveryTime: "20-25 دقيقة",
    deliveryFee: "5 ر.س",
    minOrder: 40,
    discount: "توصيل مجاني للطلبات فوق 50 ر.س",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=350&fit=crop",
    isFeatured: true,
    tag: "⚡ توصيل فائق",
  },
  {
    id: "rest-3",
    nameAr: "أورجانيك بول & سموذي بار",
    nameEn: "Organic Bowl & Smoothie Bar",
    cuisineAr: "أكاي • سموذي • سلطات كينوا عضوية",
    cuisineEn: "Acai • Smoothies • Organic Salads",
    rating: 4.95,
    reviews: "2.1k+",
    deliveryTime: "12-18 دقيقة",
    deliveryFee: "مجاني",
    minOrder: 25,
    discount: "خصم 20% للطلب الأول",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=350&fit=crop",
    isFeatured: true,
    tag: "✨ اختيار الشيف",
  },
];

// Top Trending Meals
const TRENDING_MEALS = [
  {
    id: "dish-1",
    restaurantId: "rest-1",
    nameAr: "سلطة الكينوا بالأفوكادو والخضار المشوية",
    nameEn: "Grilled Veggie Quinoa Salad",
    descAr: "كينوا عضوية مطبوخة مع خضار مشوية، أفوكادو طازج، وصلصة الليمون والأعشاب",
    descEn: "Organic cooked quinoa with charred veggies, fresh avocado and lemon dressing",
    price: 38,
    oldPrice: 48,
    calories: 340,
    protein: 16,
    prepTime: "8-10 د",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=350&fit=crop",
    category: "healthy",
  },
  {
    id: "dish-2",
    restaurantId: "rest-2",
    nameAr: "صدر دجاج تندرلوين مشوي مع الكينوا الذهبية",
    nameEn: "Herb Grilled Chicken Breast",
    descAr: "صدر دجاج متبل بالأعشاب الطبيعية، يقدم مع أرز بني محمص وخضار طازجة",
    descEn: "Herb-seasoned tender chicken breast with toasted brown rice and steamed greens",
    price: 45,
    oldPrice: 55,
    calories: 420,
    protein: 42,
    prepTime: "12-14 د",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&h=350&fit=crop",
    category: "protein",
  },
  {
    id: "dish-3",
    restaurantId: "rest-1",
    nameAr: "وعاء السلمون البري والأفوكادو الملكي",
    nameEn: "Avocado & Wild Salmon Power Bowl",
    descAr: "فيليه سلمون مشوي غني بالأوميغا 3 مع شرائح أفوكادو، كينوا وصلصة الترياكي",
    descEn: "Omega-3 rich grilled salmon with creamy avocado, wild grains and house glaze",
    price: 52,
    oldPrice: 65,
    calories: 490,
    protein: 45,
    prepTime: "14-16 د",
    rating: 4.95,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop",
    category: "healthy",
  },
  {
    id: "dish-4",
    restaurantId: "rest-3",
    nameAr: "سموذي التوت البري المعزز ببذور الشيا",
    nameEn: "Wild Berry Chia Power Smoothie",
    descAr: "مزيج منعش من التوت البري الطازج، حليب اللوز، وبذور الشيا الغنية",
    descEn: "Fresh antioxidant berry blend with almond milk, soaked chia and manuka honey",
    price: 22,
    oldPrice: 28,
    calories: 195,
    protein: 9,
    prepTime: "5 د",
    rating: 4.85,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&h=350&fit=crop",
    category: "coffee",
  },
];

interface CustomerAppProps {
  isEmbedded?: boolean;
}

export function CustomerApp({ isEmbedded = false }: CustomerAppProps) {
  const { lang, t, setLang } = useI18n();
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState("الرياض • حي السليمانية / العليا");
  const [likedDishes, setLikedDishes] = useState<Record<string, boolean>>({});
  const cart = useCart();

  const toggleLike = (id: string) => {
    sounds.playClick();
    setLikedDishes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (dish: (typeof TRENDING_MEALS)[0]) => {
    cart.add({
      id: dish.id,
      restaurant_id: dish.restaurantId,
      name_ar: dish.nameAr,
      name_en: dish.nameEn,
      price: dish.price,
    });
    sounds.playSuccess();
    toast.success(
      lang === "ar"
        ? `✨ تمت إضافة "${dish.nameAr}" إلى السلة!`
        : `✨ Added "${dish.nameEn}" to cart!`
    );
  };

  const filteredDishes = TRENDING_MEALS.filter((d) => {
    const matchCat = selectedCat === "all" || d.category === selectedCat;
    const term = searchQuery.trim().toLowerCase();
    if (!term) return matchCat;
    return (
      matchCat &&
      (d.nameAr.toLowerCase().includes(term) ||
        d.nameEn.toLowerCase().includes(term) ||
        d.descAr.toLowerCase().includes(term) ||
        d.descEn.toLowerCase().includes(term))
    );
  });

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* 
        1. TOP LOCATION & EXPRESS BAR (PedidosYa / Foodpanda / Snoonu Style)
      */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          {/* Brand + Location Selector */}
          <div className="flex items-center gap-3">
            <FoodHubLogo size={36} showText={!isEmbedded} />

            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-300 shadow-sm">
              <MapPin className="size-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-white truncate max-w-[200px]">
                {lang === "ar" ? activeLocation : "Riyadh • Al Olaya District"}
              </span>
              <Badge className="ms-1 bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] px-1.5 py-0 font-mono">
                15-20m
              </Badge>
            </div>
          </div>

          {/* Actions: Lang Switcher, Radar Orders, Cart */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sounds.playClick();
                setLang(lang === "ar" ? "en" : "ar");
              }}
              className="h-8 px-2.5 text-xs text-slate-300 hover:bg-slate-900"
            >
              {lang === "ar" ? "EN" : "عربي"}
            </Button>

            <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-slate-300 hover:bg-slate-900">
              <Link to="/orders" onClick={() => sounds.playClick()}>
                <Sparkles className="size-3.5 text-amber-400" />
                <span className="hidden md:inline">{lang === "ar" ? "تتبع طلباتي" : "Track"}</span>
              </Link>
            </Button>

            <Button asChild size="sm" className="relative h-8 gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold px-3">
              <Link to="/cart" onClick={() => sounds.playClick()}>
                <ShoppingBag className="size-4" />
                <span className="hidden sm:inline">{t("cart")}</span>
                {cart.count > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-amber-400 shadow-sm">
                    {cart.count}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile Location Sub-bar */}
        <div className="mt-2 flex items-center justify-between sm:hidden text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3 text-amber-400 shrink-0" />
            <span className="truncate">{lang === "ar" ? activeLocation : "Riyadh • Al Olaya District"}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0">⚡ 15-20 min</span>
        </div>
      </header>

      {/* 
        2. HERO SEARCH & PROMO BANNER CAROUSEL
      */}
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
        
        {/* Search Bar with Filter */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === "ar"
                  ? "ابحث عن وجبة، مطبخ سحابي، سعرات، بروتين أو كيتو..."
                  : "Search food, cloud kitchens, calories, protein or keto..."
              }
              className="h-11 ps-10 pe-4 bg-slate-900 border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-amber-500"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-2xl border-slate-800 bg-slate-900 text-slate-300 hover:border-amber-500/40 hover:text-amber-400"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>

        {/* Category Stories (Foodpanda / Snoonu Style Circles) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-300">
              {lang === "ar" ? "التصنيفات والخدمات السريعة" : "Quick Categories"}
            </h3>
            <span className="text-[11px] text-amber-400 font-medium cursor-pointer hover:underline">
              {lang === "ar" ? "عرض الكل" : "View all"}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {SNOONU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCat(cat.id);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all duration-200 shrink-0 min-w-[76px] ${
                  selectedCat === cat.id
                    ? "border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/20 scale-105"
                    : "border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-slate-400"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] font-bold text-center leading-tight">
                  {lang === "ar" ? cat.nameAr : cat.nameEn}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Hero Promo Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-slate-900 p-5 sm:p-6 shadow-2xl">
          <div className="relative z-10 max-w-md space-y-2">
            <Badge className="bg-amber-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5">
              <Percent className="size-3 me-1" />
              {lang === "ar" ? "عروض حصرية اليوم" : "Today's Deals"}
            </Badge>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {lang === "ar"
                ? "خصم 25% + توصيل مجاني على أول طلب!"
                : "25% OFF + Free Delivery on 1st Order!"}
            </h2>
            <p className="text-xs text-slate-300">
              {lang === "ar"
                ? "استخدم كود FOOD25 عند الدفع واستمتع بأشهى الأطباق المحسوبة السعرات."
                : "Use voucher code FOOD25 at checkout for instant discount & fast dispatch."}
            </p>
          </div>
          <div className="absolute -bottom-6 -end-6 size-40 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />
        </div>

        {/* 
          3. FEATURED CLOUD KITCHENS (PedidosYa / Snoonu Layout)
        */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="size-4 text-amber-400" />
              <h3 className="text-base sm:text-lg font-black text-white">
                {lang === "ar" ? "مطابخ ومطاعم معتمدة للتوصيل السريع" : "Featured Fast Delivery Kitchens"}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {POPULAR_RESTAURANTS.length} {lang === "ar" ? "متاح الآن" : "open now"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_RESTAURANTS.map((rest) => (
              <div
                key={rest.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-lg transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={rest.image}
                    alt={rest.nameEn}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  
                  {/* Top Badge */}
                  <span className="absolute top-2.5 start-2.5 rounded-full bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-slate-800">
                    {rest.tag}
                  </span>

                  {/* Delivery time pill */}
                  <span className="absolute bottom-2.5 end-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md px-2.5 py-1 text-xs font-mono font-bold text-white border border-slate-800 flex items-center gap-1">
                    <Clock className="size-3 text-amber-400" />
                    {rest.deliveryTime}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-white text-sm sm:text-base group-hover:text-amber-400 transition-colors truncate">
                      {lang === "ar" ? rest.nameAr : rest.nameEn}
                    </h4>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0">
                      <Star className="size-3.5 fill-amber-400" />
                      {rest.rating}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate">
                    {lang === "ar" ? rest.cuisineAr : rest.cuisineEn}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="text-emerald-400 font-bold">
                      🛵 {lang === "ar" ? `توصيل ${rest.deliveryFee}` : `Delivery: ${rest.deliveryFee}`}
                    </span>
                    <span>
                      {lang === "ar" ? `أقل طلب ${rest.minOrder} ر.س` : `Min: ${rest.minOrder} SAR`}
                    </span>
                  </div>

                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] text-amber-300 font-medium truncate">
                    🏷️ {rest.discount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 
          4. TRENDING DISHES & INSTANT QUICK-ADD
        */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-orange-400" />
              <h3 className="text-base sm:text-lg font-black text-white">
                {lang === "ar" ? "أشهى الأطباق الأكثر طلباً" : "Trending Meals Near You"}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {filteredDishes.length} {lang === "ar" ? "طبق متطابق" : "items"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-md transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl"
              >
                {/* Dish Photo */}
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.nameEn}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Favorite Like button */}
                  <button
                    onClick={() => toggleLike(dish.id)}
                    className="absolute top-2.5 end-2.5 size-7 rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-rose-400 transition-colors"
                  >
                    <Heart className={`size-3.5 ${likedDishes[dish.id] ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>

                  {/* Price */}
                  <div className="absolute bottom-2 start-2 flex items-center gap-1.5">
                    <span className="rounded-xl bg-amber-500 px-2.5 py-0.5 text-xs font-black text-slate-950 shadow-md">
                      {dish.price} {t("sar")}
                    </span>
                    {dish.oldPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {dish.oldPrice} {t("sar")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dish Body */}
                <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {lang === "ar" ? dish.nameAr : dish.nameEn}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {lang === "ar" ? dish.descAr : dish.descEn}
                    </p>
                  </div>

                  {/* Macros Pill */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                      <Flame className="size-2.5" /> {dish.calories} kcal
                    </span>
                    <span className="flex items-center gap-0.5 text-cyan-400 font-bold">
                      <Zap className="size-2.5" /> {dish.protein}g P
                    </span>
                  </div>

                  {/* Add to Cart button */}
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(dish)}
                    className="w-full h-8 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 rounded-xl text-xs gap-1 shadow-sm"
                  >
                    <Plus className="size-3.5" />
                    {t("addToCart")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Floating AI Assistant */}
      <AiFoodAssistant />
    </div>
  );
}

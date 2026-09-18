import React, { useState, useRef } from "react";
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
  ChevronDown,
  Filter,
  Percent,
  Bike,
  Store,
  Compass,
  ArrowRight,
  Heart,
  Smartphone,
  Check,
  Send,
  QrCode,
  Utensils,
  Award,
  ChevronUp,
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

// Zomato Sub-components matching user's screenshots
import { ZomatoHero } from "@/components/zomato/zomato-hero";
import { ZomatoBetterFood } from "@/components/zomato/zomato-better-food";
import { ZomatoAppFeatures } from "@/components/zomato/zomato-app-features";
import { ZomatoGoldBanner } from "@/components/zomato/zomato-gold-banner";
import { ZomatoEcosystem } from "@/components/zomato/zomato-ecosystem";

// Zomato Popular Localities in Riyadh / Saudi Arabia
export const RIYADH_LOCALITIES = [
  { id: "loc-1", nameAr: "العليا والسليمانية", nameEn: "Al Olaya & As Sulimaniyah", places: 184 },
  { id: "loc-2", nameAr: "حطين والملقا", nameEn: "Hittin & Al Malqa", places: 210 },
  { id: "loc-3", nameAr: "النرجس والياسمين", nameEn: "An Narjis & Al Yasmin", places: 145 },
  { id: "loc-4", nameAr: "التحلية والزهراء", nameEn: "Tahlia & Az Zahra", places: 168 },
  { id: "loc-5", nameAr: "الروضة والربوة", nameEn: "Ar Rawdah & Ar Rabwah", places: 98 },
  { id: "loc-6", nameAr: "الصحافة والملز", nameEn: "As Sahafah & Al Malaz", places: 124 },
  { id: "loc-7", nameAr: "الدرعية والخزامى", nameEn: "Diriyah & Al Khuzama", places: 92 },
  { id: "loc-8", nameAr: "السويدي والبديعة", nameEn: "As Suwaidi & Al Badi'ah", places: 86 },
  { id: "loc-9", nameAr: "قرطبة واليرموك", nameEn: "Qurtubah & Al Yarmuk", places: 115 },
];

// Zomato Curated Collections
const ZOMATO_COLLECTIONS = [
  {
    id: "col-1",
    titleAr: "أعلى الوجبات طلباً وتقييماً 🏆",
    titleEn: "Top Trending Meals 🏆",
    descAr: "أكثر 25 وجبة حصدت تقييمات 5 نجوم هذا الأسبوع",
    descEn: "25 trending dishes with top 5-star customer ratings",
    placesAr: "25 صنف",
    placesEn: "25 items",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
    tagAr: "🔥 رائج الآن",
    tagEn: "🔥 Trending",
  },
  {
    id: "col-2",
    titleAr: "مملكة الكيتو والبروتين الصافي 🥑",
    titleEn: "Keto & Pure Protein Power 🥑",
    descAr: "وجبات محسوبة الماكروز للرياضيين ومتبعي الكيتو",
    descEn: "Macro-calculated meals for athletes & keto lifestyle",
    placesAr: "18 صنف",
    placesEn: "18 items",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=400&fit=crop",
    tagAr: "🥩 بروتين عالي",
    tagEn: "🥩 High Protein",
  },
  {
    id: "col-3",
    titleAr: "توصيل البرق فائق السرعة ⚡",
    titleEn: "Lightning 15-Min Delivery ⚡",
    descAr: "مطابخ سحابية جاهزة للتوصيل في أقل من 20 دقيقة",
    descEn: "Cloud kitchens delivering hot & fresh in under 20 mins",
    placesAr: "12 مطبخ",
    placesEn: "12 kitchens",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    tagAr: "⚡ فائق السرعة",
    tagEn: "⚡ Lightning Fast",
  },
  {
    id: "col-4",
    titleAr: "سلطات وسموذي الديتوكس العضوي 🌱",
    titleEn: "Organic Detox Bowls & Smoothies 🌱",
    descAr: "أطباق كينوا وأكاي طازجة غنية بمضادات الأكسدة",
    descEn: "Fresh antioxidant organic quinoa & acai bowls",
    placesAr: "15 صنف",
    placesEn: "15 items",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&h=400&fit=crop",
    tagAr: "✨ صحي 100%",
    tagEn: "✨ 100% Organic",
  },
];

// Zomato 3 Core Pillars (Order Online, Cloud Dining, Pro Healthy)
const ZOMATO_PILLARS = [
  {
    id: "online",
    titleAr: "الطلب أونلاين والتوصيل السريع",
    titleEn: "Order Online & Fast Delivery",
    descAr: "وجبات طازجة ومحسوبة السعرات تصل إلى باب منزلك في 15-20 دقيقة.",
    descEn: "Fresh macro-calculated meals delivered right to your doorstep in 15-20 mins.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=350&fit=crop",
    linkTextAr: "اطلب الآن",
    linkTextEn: "Order Now",
    badgeAr: "🛵 توصيل راداري حي",
    badgeEn: "🛵 Live GPS Delivery",
  },
  {
    id: "dining",
    titleAr: "استكشاف المطابخ السحابية",
    titleEn: "Explore Cloud Kitchens",
    descAr: "تصفح قوائم أشهر المطابخ والماركات السحابية المعتمدة في منطقتك.",
    descEn: "Discover top-rated cloud kitchens, gourmet brands and verified chefs.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=350&fit=crop",
    linkTextAr: "استكشف المطابخ",
    linkTextEn: "View Kitchens",
    badgeAr: "👨‍🍳 علامات معتمدة",
    badgeEn: "👨‍🍳 Verified Brands",
  },
  {
    id: "healthy",
    titleAr: "وجبات الشيف والدايت الصحي",
    titleEn: "Chef Gourmet & Diet Plans",
    descAr: "وجبات بروتين عالية ونظام كيتو متوازن مع استشارة ذكاء اصطناعي مخصصة.",
    descEn: "High-protein, keto & personalized nutrition guided by FoodHub AI.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=350&fit=crop",
    linkTextAr: "خطط التغذية",
    linkTextEn: "Nutrition Plans",
    badgeAr: "✨ ذكاء اصطناعي AI",
    badgeEn: "✨ Smart AI Core",
  },
];

// Featured Kitchens & Brands
const FEATURED_KITCHENS = [
  {
    id: "rest-1",
    nameAr: "مطبخ هيلثي جورميه السحابي",
    nameEn: "Healthy Gourmet Cloud Kitchen",
    cuisineAr: "وجبات صحية • كيتو دايت • بروتين عالي",
    cuisineEn: "Healthy • Keto Diet • High Protein",
    rating: 4.9,
    reviews: "1.2k+",
    deliveryTimeAr: "15-20 دقيقة",
    deliveryTimeEn: "15-20 mins",
    deliveryFeeAr: "توصيل مجاني",
    deliveryFeeEn: "Free delivery",
    minOrder: 30,
    discountAr: "خصم 25% بكود: FOOD25",
    discountEn: "25% OFF with code: FOOD25",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=350&fit=crop",
    tagAr: "🔥 الأكثر طلباً",
    tagEn: "🔥 Most Popular",
  },
  {
    id: "rest-2",
    nameAr: "جريل ماستر بروتين هاوس",
    nameEn: "Grill Master Protein House",
    cuisineAr: "مشويات صحية • ستيك تندرلوين • دجاج مشوي",
    cuisineEn: "Healthy Grills • Tenderloin Steak • Chicken",
    rating: 4.85,
    reviews: "850+",
    deliveryTimeAr: "20-25 دقيقة",
    deliveryTimeEn: "20-25 mins",
    deliveryFeeAr: "5 ر.س",
    deliveryFeeEn: "5 SAR",
    minOrder: 40,
    discountAr: "توصيل مجاني للطلبات فوق 50 ر.س",
    discountEn: "Free delivery over 50 SAR",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=350&fit=crop",
    tagAr: "⚡ سرعة قياسية",
    tagEn: "⚡ Ultra Fast",
  },
  {
    id: "rest-3",
    nameAr: "أورجانيك بول & سموذي بار",
    nameEn: "Organic Bowl & Smoothie Bar",
    cuisineAr: "أكاي عضوي • سموذي بروتين • سلطات كينوا",
    cuisineEn: "Organic Acai • Protein Smoothies • Quinoa",
    rating: 4.95,
    reviews: "2.1k+",
    deliveryTimeAr: "12-18 دقيقة",
    deliveryTimeEn: "12-18 mins",
    deliveryFeeAr: "توصيل مجاني",
    deliveryFeeEn: "Free delivery",
    minOrder: 25,
    discountAr: "خصم 20% للطلب الأول",
    discountEn: "20% OFF first order",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=350&fit=crop",
    tagAr: "✨ اختيار الشيف",
    tagEn: "✨ Chef's Pick",
  },
];

// Trending Dishes with Macros
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
    category: "smoothie",
  },
];

interface CustomerAppProps {
  isEmbedded?: boolean;
}

export function CustomerApp({ isEmbedded = false }: CustomerAppProps) {
  const { lang, t } = useI18n();
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocId, setSelectedLocId] = useState("loc-1");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [likedDishes, setLikedDishes] = useState<Record<string, boolean>>({});
  const [showAllLocalities, setShowAllLocalities] = useState(false);
  const [phoneOrEmailInput, setPhoneOrEmailInput] = useState("");
  const [sendType, setSendType] = useState<"phone" | "email">("phone");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const cart = useCart();
  const exploreSectionRef = useRef<HTMLDivElement>(null);

  const currentLoc = RIYADH_LOCALITIES.find((l) => l.id === selectedLocId) ?? RIYADH_LOCALITIES[0];
  const activeLocation = lang === "ar" ? `الرياض • ${currentLoc?.nameAr ?? ""}` : `Riyadh • ${currentLoc?.nameEn ?? ""}`;

  const scrollToExplore = () => {
    exploreSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const handleSendAppLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmailInput.trim()) {
      toast.error(lang === "ar" ? "يرجى إدخال رقم الهاتف أو البريد الإلكتروني" : "Please enter phone number or email");
      return;
    }
    sounds.playSuccess();
    toast.success(
      lang === "ar"
        ? `🚀 تم إرسال رابط تطبيق FoodHub بنجاح إلى: ${phoneOrEmailInput}`
        : `🚀 App download link sent successfully to: ${phoneOrEmailInput}`
    );
    setPhoneOrEmailInput("");
  };

  const filteredDishes = TRENDING_MEALS.filter((d) => {
    const matchCat = selectedCat === "all" || d.category === selectedCat;
    const term = searchQuery.trim().toLowerCase();
    const matchSearch =
      !term ||
      d.nameAr.toLowerCase().includes(term) ||
      d.nameEn.toLowerCase().includes(term) ||
      d.descAr.toLowerCase().includes(term) ||
      d.descEn.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });

  const visibleLocalities = showAllLocalities ? RIYADH_LOCALITIES : RIYADH_LOCALITIES.slice(0, 6);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 ${isEmbedded ? "text-sm" : ""}`}>
      
      {/* ============================================================ */}
      {/* 1. ZOMATO HERO SECTION (Screenshot 1: Cinematic & Stores)    */}
      {/* ============================================================ */}
      <ZomatoHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocId={selectedLocId}
        setSelectedLocId={setSelectedLocId}
        activeLocation={activeLocation}
        isLocationDropdownOpen={isLocationDropdownOpen}
        setIsLocationDropdownOpen={setIsLocationDropdownOpen}
        localities={RIYADH_LOCALITIES}
        onSelectCategory={(cat) => {
          setSelectedCat(cat);
          scrollToExplore();
        }}
        onScrollToExplore={scrollToExplore}
      />

      {/* ============================================================ */}
      {/* 2. ZOMATO BETTER FOOD FOR MORE PEOPLE (Screenshot 2: Stats)  */}
      {/* ============================================================ */}
      <ZomatoBetterFood />

      {/* ============================================================ */}
      {/* 3. ZOMATO WHAT'S WAITING ON THE APP (Screenshot 3: Features) */}
      {/* ============================================================ */}
      <ZomatoAppFeatures />

      {/* ============================================================ */}
      {/* 4. ZOMATO FOODHUB GOLD VIP BANNER (Screenshot 4: Benefits)   */}
      {/* ============================================================ */}
      <ZomatoGoldBanner />

      {/* ============================================================ */}
      {/* 5. ZOMATO ETERNAL / ECOSYSTEM GRID (Screenshot 5: 4 Cards)  */}
      {/* ============================================================ */}
      <ZomatoEcosystem onSelectStore={scrollToExplore} />

      {/* ============================================================ */}
      {/* 6. LIVE ORDERING & CATALOG SECTION (Direct Food Exploration) */}
      {/* ============================================================ */}
      <div ref={exploreSectionRef} className="w-full bg-slate-950 pt-12">
        
        {/* Zomato 3 Core Pillars */}
        <section className="mx-auto max-w-6xl px-4 py-8 w-full">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-bold">
              ⚡ {lang === "ar" ? "خدمات فودهَب السريعة" : "Fast FoodHub Services"}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {lang === "ar" ? "اختر الطريقة التي تفضلها للطلب" : "Choose your favorite ordering way"}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ZOMATO_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                onClick={() => {
                  sounds.playClick();
                  if (pillar.id === "healthy") setSelectedCat("healthy");
                  if (pillar.id === "online") setSelectedCat("all");
                }}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                {/* Photo Background */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={pillar.image}
                    alt={pillar.titleEn}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <Badge className="absolute top-3 end-3 bg-slate-950/80 backdrop-blur-md border-amber-500/40 text-amber-400 text-[10px]">
                    {lang === "ar" ? pillar.badgeAr : pillar.badgeEn}
                  </Badge>
                </div>

                {/* Pillar Body */}
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    <span>{lang === "ar" ? pillar.titleAr : pillar.titleEn}</span>
                    <ChevronRight className={`size-4 text-amber-400 transition-transform ${lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {lang === "ar" ? pillar.descAr : pillar.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Curated Collections Carousel */}
        <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Award className="size-6 text-amber-400" />
                <span>{lang === "ar" ? "المجموعات المختارة (Collections)" : "Curated Collections"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === "ar"
                  ? "استكشف قوائم منسقة لأفضل المطابخ والوجبات الرائجة هذا الأسبوع في منطقتك"
                  : "Explore curated lists of top-rated cloud kitchens, gourmet diets and trending meals"}
              </p>
            </div>

            <span className="text-xs text-amber-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
              {lang === "ar" ? "عرض جميع المجموعات (4)" : "All Collections (4)"}
              <ChevronRight className={`size-3 ${lang === "ar" ? "rotate-180" : ""}`} />
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ZOMATO_COLLECTIONS.map((col) => (
              <div
                key={col.id}
                onClick={() => sounds.playClick()}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.titleEn}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  
                  <span className="absolute top-2.5 start-2.5 rounded-lg bg-slate-950/80 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md">
                    {lang === "ar" ? col.tagAr : col.tagEn}
                  </span>

                  <div className="absolute bottom-3 start-3 end-3 space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {lang === "ar" ? col.titleAr : col.titleEn}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>{lang === "ar" ? col.placesAr : col.placesEn}</span>
                      <ChevronRight className={`size-3 text-amber-400 ${lang === "ar" ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Localities in Riyadh */}
        <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-6">
          <div className="space-y-1 border-b border-slate-800/80 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {lang === "ar" ? "الأحياء والمناطق الشائعة في الرياض وحولها" : "Popular localities in and around Riyadh"}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === "ar"
                ? "اختر حيك لاستعراض المطابخ والمطاعم المتاحة للتوصيل الفوري"
                : "Explore top-rated kitchens delivering to your specific neighborhood"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleLocalities.map((loc) => (
              <div
                key={loc.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedLocId(loc.id);
                  toast.info(lang === "ar" ? `📍 تم تحديد: ${loc.nameAr}` : `📍 Location set: ${loc.nameEn}`);
                }}
                className={`group flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-md ${
                  selectedLocId === loc.id
                    ? "border-amber-500/80 bg-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="space-y-0.5 truncate pe-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                    {lang === "ar" ? loc.nameAr : loc.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {loc.places} {lang === "ar" ? "مكان متاح" : "places"}
                  </p>
                </div>
                <ChevronRight className={`size-4 text-slate-400 group-hover:text-amber-400 shrink-0 transition-transform ${lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playClick();
                setShowAllLocalities(!showAllLocalities);
              }}
              className="border-slate-800 bg-slate-900 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl gap-1.5"
            >
              {showAllLocalities ? (
                <>
                  <ChevronUp className="size-4 text-amber-400" />
                  {lang === "ar" ? "عرض أحياء أقل" : "Show less"}
                </>
              ) : (
                <>
                  <ChevronDown className="size-4 text-amber-400" />
                  {lang === "ar" ? `عرض المزيد من الأحياء (${RIYADH_LOCALITIES.length - 6}+)` : `See more (${RIYADH_LOCALITIES.length - 6}+)`}
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Featured Cloud Kitchens */}
        <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Store className="size-6 text-amber-400" />
                <span>{lang === "ar" ? "المطابخ والماركات السحابية المميزة" : "Featured Partner Cloud Kitchens"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === "ar"
                  ? "أعلى المطابخ تقييماً وسرعة في تحضير وتوصيل الوجبات الصحية"
                  : "Top-rated kitchens with lightning prep & radar delivery"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_KITCHENS.map((k) => (
              <div
                key={k.id}
                className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={k.image}
                    alt={k.nameEn}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <Badge className="absolute top-3 start-3 bg-amber-500 text-slate-950 font-bold text-[10px]">
                    {lang === "ar" ? k.tagAr : k.tagEn}
                  </Badge>

                  <div className="absolute bottom-3 end-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 px-2.5 py-1 flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{k.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({k.reviews})</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-amber-400 transition-colors">
                      {lang === "ar" ? k.nameAr : k.nameEn}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {lang === "ar" ? k.cuisineAr : k.cuisineEn}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="size-3.5 text-amber-400" />
                      {lang === "ar" ? k.deliveryTimeAr : k.deliveryTimeEn}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {lang === "ar" ? k.deliveryFeeAr : k.deliveryFeeEn}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-2 text-[11px] text-amber-300 font-medium flex items-center justify-between">
                    <span>{lang === "ar" ? k.discountAr : k.discountEn}</span>
                    <Button asChild size="sm" variant="ghost" className="h-6 text-[10px] text-amber-400 p-0 hover:bg-transparent">
                      <Link to="/restaurant/$id" params={{ id: k.id }} onClick={() => sounds.playClick()}>
                        {lang === "ar" ? "عرض المنيو" : "Menu"} ➔
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Healthy Dishes Live Menu Grid with Add to Cart */}
        <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Flame className="size-6 text-amber-500 animate-pulse" />
                <span>{lang === "ar" ? "قائمة الوجبات والأطباق الأكثر طلباً" : "Trending Dishes & Healthy Meals"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === "ar"
                  ? "وجبات محسوبة السعرات والماكروز جاهزة للإضافة الفورية إلى سلتك"
                  : "Fresh calculated meals ready for instant one-click ordering"}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: "all", labelAr: "الكل", labelEn: "All" },
                { id: "healthy", labelAr: "🥗 صحي وكيتو", labelEn: "🥗 Healthy" },
                { id: "protein", labelAr: "🥩 بروتين عالي", labelEn: "🥩 Protein" },
                { id: "smoothie", labelAr: "🥤 سموذي", labelEn: "🥤 Smoothie" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCat(c.id);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCat === c.id
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {lang === "ar" ? c.labelAr : c.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl"
              >
                {/* Dish Image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.nameEn}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Heart / Favorite */}
                  <button
                    type="button"
                    aria-label={
                      likedDishes[dish.id]
                        ? lang === "ar"
                          ? "إزالة من المفضلة"
                          : "Remove from favorites"
                        : lang === "ar"
                        ? "إضافة إلى المفضلة"
                        : "Add to favorites"
                    }
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
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {lang === "ar" ? dish.nameAr : dish.nameEn}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {lang === "ar" ? dish.descAr : dish.descEn}
                    </p>
                  </div>

                  {/* Macros Pill */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Flame className="size-3" /> {dish.calories} kcal
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Zap className="size-3" /> {dish.protein}g P
                    </span>
                  </div>

                  {/* Add to Cart button */}
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(dish)}
                    className="w-full h-9 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 rounded-xl text-xs gap-1.5 shadow-md active:scale-95"
                  >
                    <Plus className="size-4" />
                    {t("addToCart")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile App Download Showcase SMS / Email Form */}
        <section id="download-app" className="mx-auto max-w-6xl px-4 py-12 w-full">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              
              {/* Left: Smartphone Showcase */}
              <div className="flex justify-center order-2 md:order-1">
                <div className="relative w-60 sm:w-72 rounded-[40px] border-[8px] border-slate-800 bg-slate-950 p-2 shadow-2xl ring-1 ring-slate-700/50">
                  <div className="h-4 w-20 rounded-full bg-black mx-auto mb-2" />
                  <div className="rounded-[28px] overflow-hidden bg-slate-900 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <FoodHubLogo size={24} showText={false} />
                      <span className="text-[10px] text-amber-400 font-bold">FoodHub App</span>
                    </div>
                    <div className="h-28 rounded-2xl overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop"
                        alt="App preview"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-bold text-center">
                      {lang === "ar" ? "⚡ كابتن في الطريق إليك (12 دقيقة)" : "⚡ Courier on the way (12 mins)"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Copy & Send Link Form */}
              <div className="space-y-5 order-1 md:order-2">
                <div className="space-y-2">
                  <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-400 text-xs">
                    📱 {lang === "ar" ? "تطبيق الهاتف الذكي" : "Mobile Experience"}
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {lang === "ar" ? "احصل على تطبيق FoodHub" : "Get the FoodHub App"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {lang === "ar"
                      ? "سنرسل لك رابط التحميل الفوري عبر رسالة نصية أو بريد إلكتروني. متوفر لأجهزة iOS وأندرويد."
                      : "We will send you a direct download link via SMS or Email. Available for iOS & Android."}
                  </p>
                </div>

                {/* Radio Selector */}
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="sendType"
                      checked={sendType === "phone"}
                      onChange={() => setSendType("phone")}
                      className="accent-amber-500"
                    />
                    <span>{lang === "ar" ? "رقم الهاتف (SMS)" : "Phone Number (SMS)"}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="sendType"
                      checked={sendType === "email"}
                      onChange={() => setSendType("email")}
                      className="accent-amber-500"
                    />
                    <span>{lang === "ar" ? "البريد الإلكتروني" : "Email Address"}</span>
                  </label>
                </div>

                {/* Form Input */}
                <form onSubmit={handleSendAppLink} className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <Input
                    type={sendType === "email" ? "email" : "tel"}
                    value={phoneOrEmailInput}
                    onChange={(e) => setPhoneOrEmailInput(e.target.value)}
                    placeholder={
                      sendType === "email"
                        ? "name@example.com"
                        : lang === "ar"
                        ? "05xxxxxxxx"
                        : "+966 5x xxx xxxx"
                    }
                    className="bg-slate-950 border-slate-700 text-xs sm:text-sm text-white"
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 text-xs shrink-0 gap-1.5 shadow-md"
                  >
                    <Send className="size-3.5" />
                    {lang === "ar" ? "إرسال الرابط" : "Share App Link"}
                  </Button>
                </form>

                {/* Store Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
                    <Smartphone className="size-4 text-amber-400" />
                    <span>App Store & Google Play</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-400">
                    <QrCode className="size-4 text-cyan-400" />
                    <span>{lang === "ar" ? "امسح QR للتحميل" : "Scan QR"}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Explore Options Near You (Zomato Accordion Guide) */}
        <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {lang === "ar" ? "استكشف الخيارات القريبة منك" : "Explore options near you"}
          </h2>

          <div className="space-y-2">
            {[
              {
                qAr: "المأكولات والأنظمة الغذائية الشائعة بالقرب منك",
                qEn: "Popular cuisines & diets near you",
                aAr: "مشويات صحية • وجبات كيتو دايت • سلطات كينوا عضوية • وجبات بحرية غنية بالأوميغا • سموذي بروتين • إفطار صحي متوازن.",
                aEn: "Healthy Grills • Keto Diet Bowls • Organic Quinoa Salads • Omega-Rich Salmon • Protein Smoothies • Morning Energy Fuel.",
              },
              {
                qAr: "أنواع المطاعم والمطابخ السحابية المعتمدة",
                qEn: "Popular restaurant types near you",
                aAr: "مطابخ سحابية متخصصة • بارات العصير والأكاي • مطاعم المشويات الصحية • مخابز الشوفان والحلويات الصحية.",
                aEn: "Gourmet Cloud Kitchens • Acai & Juice Bars • Healthy Steak & Grill Houses • Oat & Guilt-Free Bakeries.",
              },
              {
                qAr: "المدن والأحياء المغطاة بالتوصيل السريع",
                qEn: "Cities & localities delivered by FoodHub",
                aAr: "الرياض (العليا، السليمانية، حطين، الملقا، النرجس، الياسمين، التحلية، الروضة، الصحافة، الدرعية) وجدة قريباً.",
                aEn: "Riyadh (Al Olaya, Sulimaniyah, Hittin, Malqa, Narjis, Yasmin, Tahlia, Rawdah, Sahafah, Diriyah) and Jeddah soon.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-start text-xs sm:text-sm font-bold text-white hover:text-amber-400"
                >
                  <span>{lang === "ar" ? item.qAr : item.qEn}</span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform ${openFaq === index ? "rotate-180 text-amber-400" : ""}`}
                  />
                </button>

                {openFaq === index && (
                  <p className="pt-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 mt-3 animate-in fade-in">
                    {lang === "ar" ? item.aAr : item.aEn}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Floating AI Assistant */}
      <AiFoodAssistant />
    </div>
  );
}

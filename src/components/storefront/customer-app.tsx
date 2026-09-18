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
  X,
  Handshake,
  ShieldCheck,
  Layers,
  UtensilsCrossed,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { sounds } from "@/lib/sound-effects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FoodHubLogo } from "@/components/food-hub-logo";

// Region filter options for Riyadh localities
const REGION_FILTERS = [
  { id: "all", labelAr: "جميع الأحياء", labelEn: "All Districts", icon: "📍" },
  { id: "north", labelAr: "شمال الرياض", labelEn: "North Riyadh", icon: "🧭" },
  { id: "central", labelAr: "وسط الرياض", labelEn: "Central Riyadh", icon: "🏙️" },
  { id: "east", labelAr: "شرق الرياض", labelEn: "East Riyadh", icon: "🌅" },
  { id: "west", labelAr: "غرب الرياض", labelEn: "West Riyadh", icon: "🌴" },
  { id: "south", labelAr: "جنوب الرياض", labelEn: "South Riyadh", icon: "🚚" },
];

// Zomato Popular Localities in Riyadh / Saudi Arabia
const RIYADH_LOCALITIES = [
  { id: "loc-1", nameAr: "العليا والسليمانية", nameEn: "Al Olaya & As Sulimaniyah", places: 184, region: "central", eta: "15-20 د", tagAr: "الأكثر حيوية 🔥", tagEn: "Most Vibrant 🔥", rating: 4.9, icon: "🏙️" },
  { id: "loc-2", nameAr: "حطين والملقا", nameEn: "Hittin & Al Malqa", places: 210, region: "north", eta: "15-20 د", tagAr: "مطابخ فاخرة ⭐", tagEn: "Fine Dining ⭐", rating: 4.9, icon: "✨" },
  { id: "loc-3", nameAr: "النرجس والياسمين", nameEn: "An Narjis & Al Yasmin", places: 145, region: "north", eta: "18-22 د", tagAr: "نمو سريع 🚀", tagEn: "Fast Growing 🚀", rating: 4.8, icon: "🌱" },
  { id: "loc-4", nameAr: "التحلية والزهراء", nameEn: "Tahlia & Az Zahra", places: 168, region: "central", eta: "15-20 د", tagAr: "كافيهات ودايت 🥑", tagEn: "Cafes & Diet 🥑", rating: 4.9, icon: "☕" },
  { id: "loc-5", nameAr: "الروضة والربوة", nameEn: "Ar Rawdah & Ar Rabwah", places: 118, region: "east", eta: "20-25 د", tagAr: "توصيل عائلي 🏡", tagEn: "Family Dining 🏡", rating: 4.7, icon: "🍕" },
  { id: "loc-6", nameAr: "الصحافة والعقيق", nameEn: "As Sahafah & Al Aqiq", places: 156, region: "north", eta: "15-20 د", tagAr: "مفضل للرياضيين 🥩", tagEn: "Fitness Hub 🥩", rating: 4.8, icon: "⚡" },
  { id: "loc-7", nameAr: "الدرعية والخزامى", nameEn: "Diriyah & Al Khuzama", places: 94, region: "west", eta: "20-25 د", tagAr: "تراثي وصحي 🏛️", tagEn: "Heritage & Health 🏛️", rating: 4.8, icon: "🌴" },
  { id: "loc-8", nameAr: "السويدي والبديعة", nameEn: "As Suwaidi & Al Badi'ah", places: 102, region: "south", eta: "20-25 د", tagAr: "أسرع توصيل 🛵", tagEn: "Fast Delivery 🛵", rating: 4.7, icon: "🍱" },
  { id: "loc-9", nameAr: "قرطبة واليرموك", nameEn: "Qurtubah & Al Yarmuk", places: 125, region: "east", eta: "18-22 د", tagAr: "مطابخ سحابية 🍳", tagEn: "Cloud Kitchens 🍳", rating: 4.8, icon: "🍳" },
  { id: "loc-10", nameAr: "الملز والمربع", nameEn: "Al Malaz & Al Murabba", places: 132, region: "central", eta: "15-20 د", tagAr: "قلب العاصمة 🎯", tagEn: "City Center 🎯", rating: 4.8, icon: "📍" },
  { id: "loc-11", nameAr: "غرناطة والحمراء", nameEn: "Ghirnatah & Al Hamra", places: 114, region: "east", eta: "18-22 د", tagAr: "سموذي وأطباق 🥤", tagEn: "Smoothies & Bowls 🥤", rating: 4.8, icon: "🥤" },
  { id: "loc-12", nameAr: "شبرا والشفاء", nameEn: "Shubra & Al Shifa", places: 88, region: "south", eta: "22-28 د", tagAr: "توصيل اقتصادي 💰", tagEn: "Budget Friendly 💰", rating: 4.6, icon: "🚚" },
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
    descAr: "وجبات طازجة ومحسوبة السعرات تصل إلى باب منزلك في 15-20 دقيقة بتتبع راداري حي مباشر.",
    descEn: "Fresh macro-calculated meals delivered right to your doorstep in 15-20 mins with live GPS tracking.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop",
    linkTextAr: "اطلب الآن",
    linkTextEn: "Order Now",
    badgeAr: "🛵 توصيل راداري حي",
    badgeEn: "🛵 Live GPS Delivery",
    tagAr: "⚡ 15-20 دقيقة",
    tagEn: "⚡ 15-20 Mins",
    featureAr: "توصيل فائق السرعة وأقل تكلفة",
    featureEn: "Fastest delivery & lowest rates",
    icon: "🛵",
  },
  {
    id: "dining",
    titleAr: "استكشاف كافة المطاعم والمطابخ",
    titleEn: "Explore Restaurants & Kitchens",
    descAr: "تصفح قوائم أشهر المطاعم والماركات والمطابخ السحابية المعتمدة بأعلى معايير النظافة والجودة الغذائية.",
    descEn: "Discover top-rated restaurants, cloud kitchens and gourmet brands with hygiene guarantee.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
    linkTextAr: "استكشف المطاعم والمطابخ",
    linkTextEn: "View Restaurants & Kitchens",
    badgeAr: "👨‍🍳 علامات ومطاعم معتمدة",
    badgeEn: "👨‍🍳 Verified Restaurants",
    tagAr: "⭐ تقييم 4.9+",
    tagEn: "⭐ 4.9+ Rated",
    featureAr: "مطاعم ومطابخ مرخصة 100%",
    featureEn: "100% Certified restaurants & kitchens",
    icon: "🏪",
  },
  {
    id: "healthy",
    titleAr: "وجبات الشيف والدايت الصحي",
    titleEn: "Chef Gourmet & Diet Plans",
    descAr: "وجبات بروتين عالية ونظام كيتو متوازن محسوبة السعرات والماكروز بدقة بأيدي أمهر الطهاة المحترفين.",
    descEn: "High-protein, keto & tailored nutrition meals with exact macro calculations by master chefs.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop",
    linkTextAr: "تصفح خطط الدايت",
    linkTextEn: "Browse Diet Plans",
    badgeAr: "🥗 دايت وبروتين صافي",
    badgeEn: "🥗 Pure Protein & Diet",
    tagAr: "🥑 محسوب الماكروز",
    tagEn: "🥑 Macro Calculated",
    featureAr: "تغذية صحية وحساب دقيق للسعرات",
    featureEn: "Healthy nutrition & exact calories",
    icon: "🥗",
  },
];

// Partnership Filter Categories
const PARTNERSHIP_CATEGORIES = [
  { id: "all", labelAr: "جميع الشراكات", labelEn: "All Partnerships", icon: "🤝" },
  { id: "protein", labelAr: "البروتين والشواء الصحي", labelEn: "Protein & Healthy Grills", icon: "🥩" },
  { id: "keto", labelAr: "الكيتو والبرجر الصحي", labelEn: "Keto & Fit Burgers", icon: "🥑" },
  { id: "coffee", labelAr: "القهوة والمخبوزات", labelEn: "Specialty Coffee & Bakery", icon: "☕" },
  { id: "seafood", labelAr: "المأكولات البحرية والآسيوية", labelEn: "Seafood & Asian Poke", icon: "🐟" },
];

// Strategic Restaurant & Kitchen Partnerships (Multi-Brand Collaborations)
const RESTAURANT_PARTNERSHIPS = [
  {
    id: "part-1",
    titleAr: "تحالف الشواء الماسي & السلطات العضوية",
    titleEn: "Diamond Grills ✕ Organic Bowls Collaboration",
    partner1Ar: "جريل ماستر ستيك هاوس",
    partner1En: "Grill Master Steakhouse",
    partner2Ar: "أورجانيك بول & سموذي بار",
    partner2En: "Organic Bowls & Smoothie Bar",
    category: "protein",
    descAr: "شراكة طهي تجمع بين أرقى شرائح الستيك المشوي والسموذي العضوي الطازج في طلب وسلة واحدة.",
    descEn: "Culinary synergy combining tenderloin steaks with fresh antioxidant smoothies in a single unified order.",
    comboDishAr: "وجبة شواء تندرلوين + طبق كينوا وسموذي توت",
    comboDishEn: "Tenderloin Steak + Organic Quinoa & Berry Smoothie",
    comboPrice: 68,
    oldPrice: 85,
    discountBadgeAr: "وفر 20% على الطلب المشترك",
    discountBadgeEn: "Save 20% on Combined Order",
    rating: 4.95,
    ordersCount: "1.8k+ طلب مشترك",
    ordersCountEn: "1.8k+ joint orders",
    eta: "15-20 دقيقة",
    deliveryFeeAr: "توصيل موحد مجاني",
    deliveryFeeEn: "Free unified delivery",
    tagAr: "🥩 تحالف بروتين وصحي",
    tagEn: "🥩 Protein & Health Alliance",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=500&fit=crop",
    partner1Logo: "🥩",
    partner2Logo: "🥗",
  },
  {
    id: "part-2",
    titleAr: "تحالف البرجر الذواقة & المطبخ الكيتوني",
    titleEn: "Gourmet Smash ✕ Keto Diet Hub",
    partner1Ar: "ذا سماش برجر جورميه",
    partner1En: "The Smash Gourmet Lab",
    partner2Ar: "مملكة الكيتو للرياضيين",
    partner2En: "Athletes Keto Kingdom",
    category: "keto",
    descAr: "برجر أنجوس فاخر بخبز الكيتو الحصري خالي من الجلوتين مع بطاطا الشوفان المحمصة الصحية.",
    descEn: "Premium Angus smash burger on gluten-free keto buns paired with baked guilt-free sweet potato wedges.",
    comboDishAr: "دبل برجر أنجوس كيتو + بطاطا حلوة مشوية ومشروب دايت",
    comboDishEn: "Double Angus Keto Burger + Baked Fries & Diet Drink",
    comboPrice: 48,
    oldPrice: 62,
    discountBadgeAr: "عرض الشراكة الحصري",
    discountBadgeEn: "Exclusive Partnership Deal",
    rating: 4.9,
    ordersCount: "950+ طلب مشترك",
    ordersCountEn: "950+ joint orders",
    eta: "15-20 دقيقة",
    deliveryFeeAr: "توصيل موحد 5 ر.س",
    deliveryFeeEn: "5 SAR Unified Delivery",
    tagAr: "🥑 كيتو برجر معتمد",
    tagEn: "🥑 Certified Keto Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=500&fit=crop",
    partner1Logo: "🍔",
    partner2Logo: "🥑",
  },
  {
    id: "part-3",
    titleAr: "تحالف القهوة المختصة & المخبوزات الصحية",
    titleEn: "Artisan Roastery ✕ Fit Oat Bakery",
    partner1Ar: "محمصة أروما المختصة",
    partner1En: "Aroma Specialty Roasters",
    partner2Ar: "مخبز الفيت بيكري الصحي",
    partner2En: "Fit Protein Oat Bakery",
    category: "coffee",
    descAr: "بداية صباحية استثنائية تجمع بين محاصيل القهوة المختصة وتشيزكيك الشوفان المحسوب السعرات.",
    descEn: "Signature morning fuel pairing specialty V60 Ethiopian brew with macro-calculated protein oat cheesecake.",
    comboDishAr: "قهوة V60 إثيوبية فاخرة + تشيزكيك الشوفان والبروتين",
    comboDishEn: "V60 Ethiopian Brew + Protein Oat Guilt-Free Cheesecake",
    comboPrice: 34,
    oldPrice: 45,
    discountBadgeAr: "باقة الصباح المتكاملة",
    discountBadgeEn: "Signature Morning Bundle",
    rating: 4.98,
    ordersCount: "2.4k+ طلب مشترك",
    ordersCountEn: "2.4k+ joint orders",
    eta: "10-15 دقيقة",
    deliveryFeeAr: "توصيل موحد مجاني",
    deliveryFeeEn: "Free unified delivery",
    tagAr: "☕ قهوة ومخبوزات صحية",
    tagEn: "☕ Coffee & Fit Bakery",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop",
    partner1Logo: "☕",
    partner2Logo: "🥐",
  },
  {
    id: "part-4",
    titleAr: "تحالف المأكولات البحرية & البوكي الآسيوي",
    titleEn: "Tokyo Poke ✕ Pacific Salmon Hub",
    partner1Ar: "طوكيو بوكي بول آسيان",
    partner1En: "Tokyo Asian Poke Bowls",
    partner2Ar: "سالمون أوميغا سي فود",
    partner2En: "Salmon Omega Seafood",
    category: "seafood",
    descAr: "أطباق السلمون النرويجي الطازج مع خضار الإدامامي وصلصات البوكي الغنية بأوميغا 3 والألياف.",
    descEn: "Fresh Norwegian salmon fillets with Japanese steamed edamame, avocado slices, and omega-rich poke glaze.",
    comboDishAr: "سالمون بوكي بول فاخر + إدامامي وصوص الميزو",
    comboDishEn: "Gourmet Salmon Poke Bowl + Steamed Edamame & Miso",
    comboPrice: 59,
    oldPrice: 75,
    discountBadgeAr: "وفر 22% مع كود: OMEGA",
    discountBadgeEn: "Save 22% with code: OMEGA",
    rating: 4.88,
    ordersCount: "1.1k+ طلب مشترك",
    ordersCountEn: "1.1k+ joint orders",
    eta: "18-22 دقيقة",
    deliveryFeeAr: "توصيل موحد مجاني",
    deliveryFeeEn: "Free unified delivery",
    tagAr: "🐟 أوميغا 3 طازج",
    tagEn: "🐟 Fresh Omega-3",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop",
    partner1Logo: "🥢",
    partner2Logo: "🐟",
  },
];

// Trending Dishes with Macros from All Restaurant Cuisines
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
    category: "seafood",
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
  {
    id: "dish-5",
    restaurantId: "rest-4",
    nameAr: "دبل أنجوس سماش برجر ذواقة فاخر",
    nameEn: "Double Angus Gourmet Smash Burger",
    descAr: "لحم أنجوس فاخر مكرمل مع جبن الشيدر الذائب، صوص خاص، وخبز البريوش الطازج",
    descEn: "Prime Angus beef smash patties with aged melted cheddar, house secret sauce on brioche",
    price: 39,
    oldPrice: 49,
    calories: 580,
    protein: 38,
    prepTime: "10-12 د",
    rating: 4.96,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop",
    category: "burger",
  },
  {
    id: "dish-6",
    restaurantId: "rest-5",
    nameAr: "بيتزا نابوليتانا بالترفل والموزاريلا الطازجة",
    nameEn: "Artisan Truffle & Buffalo Mozzarella Pizza",
    descAr: "عجينة مخمرة 48 ساعة على الحطب، مع زيت الترفل الإيطالي، جبن موزاريلا، وفطر طازج",
    descEn: "48h fermented wood-fired dough with Italian truffle glaze, fresh mozzarella and wild mushrooms",
    price: 48,
    oldPrice: 60,
    calories: 520,
    protein: 26,
    prepTime: "12-15 د",
    rating: 4.92,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=350&fit=crop",
    category: "pizza",
  },
  {
    id: "dish-7",
    restaurantId: "rest-6",
    nameAr: "مشكل كباب وتندرلوين مشوي على الفحم",
    nameEn: "Charcoal Mixed Grill & Tenderloin Platter",
    descAr: "أسياخ كباب لحم غنم نعيمي مع أوصال تندرلوين مشوية على الفحم مع خبز التنور والحمص",
    descEn: "Charcoal-grilled premium lamb kebab skewers, tenderloin cuts with freshly baked bread and hummus",
    price: 64,
    oldPrice: 78,
    calories: 590,
    protein: 56,
    prepTime: "15-18 د",
    rating: 4.98,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=350&fit=crop",
    category: "protein",
  },
  {
    id: "dish-8",
    restaurantId: "rest-7",
    nameAr: "قهوة كولد برو إثيوبية وتشيزكيك الشوفان",
    nameEn: "Ethiopian Cold Brew & Oat Protein Cheesecake",
    descAr: "محصول إثيوبي مقطر بارد 18 ساعة مع قطعة تشيزكيك الشوفان المحلاة طبيعياً",
    descEn: "18h slow-steeped Ethiopian cold brew with high-protein guilt-free oat cheesecake",
    price: 32,
    oldPrice: 42,
    calories: 220,
    protein: 14,
    prepTime: "5-7 د",
    rating: 4.89,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=350&fit=crop",
    category: "smoothie",
  },
];

interface CustomerAppProps {
  isEmbedded?: boolean;
}

export function CustomerApp({ isEmbedded = false }: CustomerAppProps) {
  const { lang, t, setLang } = useI18n();
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocId, setSelectedLocId] = useState("loc-1");
  const [localityRegion, setLocalityRegion] = useState<string>("all");
  const [localityQuery, setLocalityQuery] = useState("");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [partnerCategory, setPartnerCategory] = useState("all");
  const [likedDishes, setLikedDishes] = useState<Record<string, boolean>>({});
  const [showAllLocalities, setShowAllLocalities] = useState(false);
  const [phoneOrEmailInput, setPhoneOrEmailInput] = useState("");
  const [sendType, setSendType] = useState<"phone" | "email">("phone");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const cart = useCart();

  const currentLoc = RIYADH_LOCALITIES.find((l) => l.id === selectedLocId) ?? RIYADH_LOCALITIES[0];
  const activeLocation = lang === "ar" ? `الرياض • ${currentLoc?.nameAr ?? ""}` : `Riyadh • ${currentLoc?.nameEn ?? ""}`;

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

  const handleAddComboToCart = (p: (typeof RESTAURANT_PARTNERSHIPS)[0]) => {
    cart.add({
      id: `combo-${p.id}`,
      restaurant_id: p.id,
      name_ar: `[عرض شراكة] ${p.comboDishAr}`,
      name_en: `[Partnership] ${p.comboDishEn}`,
      price: p.comboPrice,
    });
    sounds.playSuccess();
    toast.success(
      lang === "ar"
        ? `🤝 تمت إضافة وجبة الشراكة الموحدة "${p.comboDishAr}" إلى السلة!`
        : `🤝 Added partnership combo "${p.comboDishEn}" to cart!`
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

  const filteredLocalities = RIYADH_LOCALITIES.filter((loc) => {
    const matchReg = localityRegion === "all" || loc.region === localityRegion;
    const q = localityQuery.trim().toLowerCase();
    const matchQ =
      !q ||
      loc.nameAr.toLowerCase().includes(q) ||
      loc.nameEn.toLowerCase().includes(q) ||
      loc.tagAr.toLowerCase().includes(q) ||
      loc.tagEn.toLowerCase().includes(q);
    return matchReg && matchQ;
  });

  const visibleLocalities = showAllLocalities ? filteredLocalities : filteredLocalities.slice(0, 6);

  const filteredPartnerships = RESTAURANT_PARTNERSHIPS.filter(
    (p) => partnerCategory === "all" || p.category === partnerCategory
  );

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 ${isEmbedded ? "text-sm" : ""}`}>
      {/* ============================================================ */}
      {/* 1. ZOMATO ICONIC HERO SECTION WITH DUAL SEARCH & LOCATION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Cinematic Foodie Background Image with High-Contrast Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=800&fit=crop"
            alt="FoodHub Background"
            className="size-full object-cover object-center opacity-10 dark:opacity-30 scale-105 transition-transform duration-10000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-50/95 to-slate-50 dark:from-slate-950/80 dark:via-slate-950/90 dark:to-slate-950" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:py-20 flex flex-col items-center text-center space-y-6">
          {/* Brand Logo & Pill */}
          <div className="flex flex-col items-center gap-3">
            <FoodHubLogo size={56} showText />
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-4 py-1.5 text-xs font-black text-amber-900 dark:text-amber-300 backdrop-blur-md shadow-sm">
              ⚡ {lang === "ar" ? "أسرع توصيل في 15 دقيقة بأقل سعر" : "Fastest 15-min delivery at the lowest rates"}
            </span>
          </div>

          {/* Zomato Headline */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white leading-tight">
              {lang === "ar" ? (
                <>
                  اكتشف أفضل المطاعم والمطابخ السحابية والمأكولات في{" "}
                  <span className="text-amber-600 dark:text-amber-400">
                    الرياض
                  </span>
                </>
              ) : (
                <>
                  Discover the best restaurants, cloud kitchens & dining in{" "}
                  <span className="text-amber-600 dark:text-amber-400">
                    Riyadh
                  </span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-semibold">
              {lang === "ar"
                ? "أشهى الأطباق وقوائم الطعام من كافة المطاعم والمطابخ السحابية، خيارات متنوعة وصحية لكافة الأذواق، وتوصيل راداري فائق السرعة يصلك أينما كنت."
                : "Delicious dishes and menus from all restaurants & cloud kitchens, diverse dining for every taste, with ultrafast live radar delivery right to you."}
            </p>
          </div>

          {/* ============================================================ */}
          {/* ZOMATO DUAL SEARCH BAR (Location Pill + Dish Search) */}
          {/* ============================================================ */}
          <div className="w-full max-w-3xl mt-4">
            <div className="relative flex flex-col sm:flex-row items-center rounded-2xl sm:rounded-full bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-slate-700/80 p-1.5 sm:p-2 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-slate-950 backdrop-blur-xl transition-all focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
              
              {/* Location Picker (Left on LTR / Right on RTL) */}
              <div className="relative w-full sm:w-5/12">
                <button
                  type="button"
                  aria-label={lang === "ar" ? "اختر حي ومنطقة التوصيل" : "Select delivery neighborhood"}
                  onClick={() => {
                    sounds.playClick();
                    setIsLocationDropdownOpen(!isLocationDropdownOpen);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl sm:rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="size-4 text-rose-500 shrink-0 animate-bounce" />
                    <span className="truncate">{activeLocation}</span>
                  </div>
                  <ChevronDown className="size-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                </button>

                {/* Location Dropdown */}
                {isLocationDropdownOpen && (
                  <div className="absolute top-full start-0 z-50 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl animate-in fade-in zoom-in-95 text-start">
                    <p className="px-3 py-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {lang === "ar" ? "اختر الحي / منطقة التوصيل:" : "Select Delivery Neighborhood:"}
                    </p>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {RIYADH_LOCALITIES.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedLocId(loc.id);
                            setIsLocationDropdownOpen(false);
                            toast.info(lang === "ar" ? `📍 تم تحديد: ${loc.nameAr}` : `📍 Location set: ${loc.nameEn}`);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                          <span className="font-medium">{lang === "ar" ? loc.nameAr : loc.nameEn}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{loc.places} {lang === "ar" ? "مكان" : "places"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

              {/* Dish / Kitchen Search Input */}
              <div className="relative flex-1 w-full flex items-center">
                <Search className="absolute start-3.5 size-4 text-slate-500 dark:text-slate-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "ابحث عن أي مطعم، مطبخ، برجر، مشويات، بيتزا، كافيه، أو وجبة دايت..."
                      : "Search any restaurant, kitchen, burger, grills, pizza, cafe, or diet..."
                  }
                  className="w-full h-11 ps-10 pe-4 bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label={lang === "ar" ? "مسح البحث" : "Clear search"}
                    onClick={() => setSearchQuery("")}
                    className="absolute end-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Trending Search Tags Covering All Restaurant Cuisines */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] font-bold me-1">
                {lang === "ar" ? "الأكثر بحثاً في المطاعم:" : "Trending in Restaurants:"}
              </span>
              {[
                { ar: "🍔 برجر وساندوتشات", en: "🍔 Burgers", query: "برجر", cat: "all" },
                { ar: "🥩 مشويات وشاورما", en: "🥩 Grills & Shawarma", query: "مشويات", cat: "all" },
                { ar: "🍕 بيتزا وإيطالي", en: "🍕 Pizza & Pasta", query: "بيتزا", cat: "all" },
                { ar: "🥗 دايت وكيتو صحي", en: "🥗 Healthy & Keto", query: "صحي", cat: "healthy" },
                { ar: "☕ كافيهات ومخبوزات", en: "☕ Cafes & Bakery", query: "قهوة", cat: "all" },
                { ar: "🍣 مأكولات بحرية وآسيوية", en: "🍣 Seafood & Asian", query: "سالمون", cat: "all" },
                { ar: "🍛 أطباق شرقية وشعبية", en: "🍛 Traditional Rice", query: "شواء", cat: "all" },
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sounds.playClick();
                    setSearchQuery(pill.query);
                    if (pill.cat) setSelectedCat(pill.cat);
                    toast.info(lang === "ar" ? `🔎 تصفح: ${pill.ar}` : `🔎 Browsing: ${pill.en}`);
                  }}
                  className="rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 px-3 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all active:scale-95 shadow-sm"
                >
                  {lang === "ar" ? pill.ar : pill.en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. ZOMATO 3 CORE PILLARS (Order Online, Dining, Pro Healthy) */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-8 w-full">
        <h2 className="sr-only">
          {lang === "ar" ? "خدمات وركائز FOODHUB الأساسية" : "Core FOODHUB Platform Pillars"}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ZOMATO_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              onClick={() => {
                sounds.playClick();
                if (pillar.id === "healthy") {
                  setSelectedCat("healthy");
                  toast.info(lang === "ar" ? "🥗 تم تفعيل تصنيف الوجبات الصحية والدايت" : "🥗 Filtered to Healthy & Diet Meals");
                } else if (pillar.id === "online") {
                  setSelectedCat("all");
                  toast.info(lang === "ar" ? "🛵 تصفح جميع الوجبات الجاهزة للتوصيل الفوري" : "🛵 Browsing all instant delivery meals");
                } else if (pillar.id === "dining") {
                  toast.info(lang === "ar" ? "🏪 تصفح أفضل المطاعم والمطابخ المعتمدة" : "🏪 Exploring certified restaurants & cloud kitchens");
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              {/* Photo Header Container */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                <img
                  src={pillar.image}
                  alt={pillar.titleEn}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Floating Top Badges */}
                <div className="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none">
                  <span className="rounded-full bg-slate-950/85 border border-slate-700/80 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                    {lang === "ar" ? pillar.badgeAr : pillar.badgeEn}
                  </span>
                  <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-black text-slate-950 shadow-md">
                    {lang === "ar" ? pillar.tagAr : pillar.tagEn}
                  </span>
                </div>
              </div>

              {/* Pillar Body Content */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-3 bg-white dark:bg-slate-900">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pillar.icon}</span>
                    <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                      {lang === "ar" ? pillar.titleAr : pillar.titleEn}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {lang === "ar" ? pillar.descAr : pillar.descEn}
                  </p>
                </div>

                {/* Feature Bullet */}
                <div className="rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="text-amber-500">✓</span>
                  <span>{lang === "ar" ? pillar.featureAr : pillar.featureEn}</span>
                </div>

                {/* Action CTA Button */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs font-bold text-slate-900 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  <span>{lang === "ar" ? pillar.linkTextAr : pillar.linkTextEn}</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <ChevronRight
                      className={`size-4 transition-transform group-hover:translate-x-0.5 ${
                        lang === "ar" ? "rotate-180 group-hover:-translate-x-0.5" : ""
                      }`}
                    />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. ZOMATO CURATED COLLECTIONS CAROUSEL */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Award className="size-6 text-amber-400" />
              <span>{lang === "ar" ? "المجموعات المختارة (Collections)" : "Curated Collections"}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === "ar"
                ? "استكشف قوائم منسقة لأفضل المطاعم والمطابخ والوجبات الرائجة هذا الأسبوع في منطقتك"
                : "Explore curated lists of top-rated restaurants, cloud kitchens and trending meals"}
            </p>
          </div>

          <span className="text-xs text-amber-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
            {lang === "ar" ? "عرض جميع المجموعات (4)" : "All Collections (4)"}
            <ChevronRight className={`size-3 ${lang === "ar" ? "rotate-180" : ""}`} />
          </span>
        </div>

        {/* Collections Cards Grid */}
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
                
                {/* Badge */}
                <span className="absolute top-2.5 start-2.5 rounded-lg bg-slate-950/80 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md">
                  {lang === "ar" ? col.tagAr : col.tagEn}
                </span>

                {/* Bottom Card Content */}
                <div className="absolute bottom-3 start-3 end-3 space-y-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {lang === "ar" ? col.titleAr : col.titleEn}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="text-slate-400">{lang === "ar" ? col.descAr : col.descEn}</span>
                    <span className="font-bold text-amber-400 shrink-0 ms-2">{lang === "ar" ? col.placesAr : col.placesEn}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. POPULAR LOCALITIES IN RIYADH (Zomato Localities Grid) */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-6">
        {/* Section Header with live delivery coverage badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              {lang === "ar" ? "تغطية فورية 100% لكافة أحياء الرياض" : "100% Instant Delivery Coverage across Riyadh"}
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
              {lang === "ar" ? (
                <>
                  الأحياء الأكثر طلباً في{" "}
                  <span className="text-amber-400">الرياض</span>
                </>
              ) : (
                <>
                  Popular localities in and around <span className="text-amber-400">Riyadh</span>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {lang === "ar"
                ? "اختر حيك لتصفح المطاعم والمطابخ السحابية القريبة، أوقات التوصيل الفورية، ومعدلات التقييم"
                : "Select your neighborhood to explore nearby restaurants, cloud kitchens, instant ETAs, and top ratings"}
            </p>
          </div>

          {/* Mini Search Input for localities */}
          <div className="relative w-full md:w-72">
            <Search className={`absolute top-1/2 -translate-y-1/2 size-4 text-slate-400 ${lang === "ar" ? "right-3" : "left-3"}`} />
            <input
              type="text"
              value={localityQuery}
              onChange={(e) => setLocalityQuery(e.target.value)}
              placeholder={lang === "ar" ? "ابحث باسم الحي أو الميزة..." : "Search neighborhood or tag..."}
              className={`w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                lang === "ar" ? "pr-9 pl-8" : "pl-9 pr-8"
              }`}
            />
            {localityQuery && (
              <button
                type="button"
                aria-label="مسح البحث"
                onClick={() => setLocalityQuery("")}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${lang === "ar" ? "left-2.5" : "right-2.5"}`}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {REGION_FILTERS.map((rf) => {
            const isSelected = localityRegion === rf.id;
            return (
              <button
                key={rf.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setLocalityRegion(rf.id);
                }}
                className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white"
                }`}
              >
                <span>{rf.icon}</span>
                <span>{lang === "ar" ? rf.labelAr : rf.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Localities Cards Grid */}
        {filteredLocalities.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-2">
            <p className="text-sm font-bold text-slate-300">
              {lang === "ar" ? "لم يتم العثور على أحياء مطابقة" : "No matching neighborhoods found"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalityQuery("");
                setLocalityRegion("all");
              }}
              className="text-xs border-slate-700 text-amber-400 hover:bg-slate-800"
            >
              {lang === "ar" ? "إعادة تعيين الفلتر" : "Reset filter"}
            </Button>
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleLocalities.map((loc) => {
              const isSelected = selectedLocId === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedLocId(loc.id);
                    toast.info(lang === "ar" ? `📍 تم تحديد حي ${loc.nameAr} كوجهة طلب نشطة!` : `📍 ${loc.nameEn} selected as active destination!`);
                  }}
                  className={`group cursor-pointer relative overflow-hidden flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? "border-amber-500 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30"
                      : "border-slate-800 bg-slate-900/80 hover:border-amber-500/50 hover:bg-slate-900 hover:shadow-lg hover:shadow-slate-950/40"
                  }`}
                >
                  {/* Top Row: Icon + Tag & Active Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/60 text-base shadow-sm group-hover:scale-110 transition-transform">
                        {loc.icon}
                      </span>
                      <span className="rounded-lg bg-slate-800/70 border border-slate-700/50 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        {lang === "ar" ? loc.tagAr : loc.tagEn}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 shadow-sm">
                        <Check className="size-3" />
                        {lang === "ar" ? "الحي النشط" : "Active"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400/90">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {loc.rating}
                      </span>
                    )}
                  </div>

                  {/* Locality Name */}
                  <div className="space-y-1 mb-3">
                    <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors">
                      {lang === "ar" ? loc.nameAr : loc.nameEn}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Store className="size-3.5 text-amber-400" />
                        {loc.places} {lang === "ar" ? "مطبخ ومتجر" : "places"}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Zap className="size-3.5" />
                        {loc.eta}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Hint */}
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5 text-[11px] text-slate-400 group-hover:text-amber-400 transition-colors">
                    <span className="font-semibold">
                      {lang === "ar" ? "تصفح مطابخ الحي" : "Explore local kitchens"}
                    </span>
                    <ChevronRight
                      className={`size-4 transition-transform group-hover:translate-x-1 ${
                        lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toggle Show More Localities */}
        {filteredLocalities.length > 6 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playClick();
                setShowAllLocalities(!showAllLocalities);
              }}
              className="border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-amber-400 hover:border-amber-500/40 rounded-xl gap-1.5 h-9 px-4"
            >
              {showAllLocalities ? (
                <>
                  <ChevronUp className="size-3.5" />
                  {lang === "ar" ? "إخفاء الأحياء الإضافية" : "Show less"}
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5" />
                  {lang === "ar"
                    ? `عرض كافة أحياء الرياض المتاحة (${filteredLocalities.length})`
                    : `Show all available localities (${filteredLocalities.length})`}
                </>
              )}
            </Button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 5. RESTAURANT PARTNERSHIPS & MULTI-BRAND COLLABORATIVE HUBS */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-6">
        {/* Header with Title and Partner Join Link */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400">
              <Handshake className="size-3.5" />
              <span>{lang === "ar" ? "تحالفات استراتيجية • طلب موحد من عدة مطابخ في سلة واحدة" : "Strategic Alliances • Multi-Brand Single Cart Delivery"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2.5">
              <span>{lang === "ar" ? "شراكات المطاعم والمطابخ السحابية" : "Restaurant Partnerships & Shared Kitchens"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {lang === "ar"
                ? "اطلب من عدة علامات تجارية شريكة في سلة واحدة، بكيس حراري موحد، وتوصيل فوري بأقل تكلفة"
                : "Combine dishes from multiple partner brands in a single order, delivered together with unified fees"}
            </p>
          </div>

          <Link
            to="/register"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-md shrink-0 self-start md:self-auto"
          >
            <Store className="size-3.5" />
            <span>{lang === "ar" ? "انضمام مطعم جديد للشراكة" : "Join as Restaurant Partner"}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* Partnership Perks Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              icon: "🛍️",
              titleAr: "سلة موحدة",
              titleEn: "Single Cart",
              descAr: "اطلب من مطعمين في فاتورة واحدة",
              descEn: "Order 2+ brands in 1 bill",
            },
            {
              icon: "💰",
              titleAr: "توفير 50% بالرسوم",
              titleEn: "Save on Delivery",
              descAr: "كابتن واحد يوصل كل الأصناف",
              descEn: "One courier delivers all items",
            },
            {
              icon: "🛡️",
              titleAr: "جودة وتوريد معتمد",
              titleEn: "Certified Quality",
              descAr: "فحص ورقابة بلدية وصحية مشتركة",
              descEn: "Unified hygiene inspections",
            },
            {
              icon: "⚡",
              titleAr: "تجهيز متزامن فوري",
              titleEn: "Sync Kitchen Prep",
              descAr: "تصل الأطباق ساخنة وطازجة معاً",
              descEn: "Meals arrive piping hot together",
            },
          ].map((perk, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 flex items-center gap-2.5 hover:border-slate-700 transition-colors"
            >
              <span className="text-xl shrink-0">{perk.icon}</span>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">
                  {lang === "ar" ? perk.titleAr : perk.titleEn}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {lang === "ar" ? perk.descAr : perk.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {PARTNERSHIP_CATEGORIES.map((cat) => {
            const isSelected = partnerCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setPartnerCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{lang === "ar" ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Partnerships Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {filteredPartnerships.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              {/* Photo & Brand Logos Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                <img
                  src={p.image}
                  alt={p.titleEn}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Floating Discount Badge */}
                <span className="absolute top-3 end-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-slate-950 shadow-lg">
                  {lang === "ar" ? p.discountBadgeAr : p.discountBadgeEn}
                </span>

                {/* Partner Brands Badge in Header */}
                <div className="absolute bottom-3 start-3 end-3 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/90 border border-slate-700/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-md">
                    <span>{p.partner1Logo}</span>
                    <span>{lang === "ar" ? p.partner1Ar : p.partner1En}</span>
                  </span>
                  <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-sm">
                    ✕
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/90 border border-slate-700/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-md">
                    <span>{p.partner2Logo}</span>
                    <span>{lang === "ar" ? p.partner2Ar : p.partner2En}</span>
                  </span>
                </div>
              </div>

              {/* Partnership Body Content */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                    {lang === "ar" ? p.titleAr : p.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === "ar" ? p.descAr : p.descEn}
                  </p>
                </div>

                {/* Highlighted Combined Combo Meal Card */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        {lang === "ar" ? "🍽️ الوجبة المشتركة الحصرية" : "🍽️ Exclusive Combined Combo"}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-white">
                        {lang === "ar" ? p.comboDishAr : p.comboDishEn}
                      </h4>
                    </div>
                    <div className="text-end shrink-0">
                      <div className="text-sm sm:text-base font-black text-amber-400">
                        {p.comboPrice} {t("sar")}
                      </div>
                      <div className="text-[10px] text-slate-500 line-through">
                        {p.oldPrice} {t("sar")}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddComboToCart(p)}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 rounded-xl text-xs gap-1.5 shadow-md h-9"
                  >
                    <Plus className="size-3.5" />
                    <span>{lang === "ar" ? "أضف وجبة الشراكة إلى السلة (طلب موحد)" : "Add Combo to Cart (Unified Order)"}</span>
                  </Button>
                </div>

                {/* Footer Meta Row */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Clock className="size-3.5 text-amber-400" />
                    <span>{p.eta}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Bike className="size-3.5" />
                    <span>{lang === "ar" ? p.deliveryFeeAr : p.deliveryFeeEn}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.rating}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({lang === "ar" ? p.ordersCount : p.ordersCountEn})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partner With FoodHub Callout Card */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-2xl shrink-0">
              🤝
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-black text-white">
                {lang === "ar" ? "هل تملك مطعماً أو مطبخاً سحابياً؟" : "Own a Restaurant or Cloud Kitchen?"}
              </h4>
              <p className="text-xs text-slate-400 max-w-xl">
                {lang === "ar"
                  ? "انضم إلى شبكة تحالفات FoodHub، شارك مساحات التجهيز، وضاعف مبيعاتك عبر توفير خيارات الطلب الموحد للعملاء."
                  : "Join FoodHub's partner network, share kitchen operations, and multiply your orders with unified single-cart delivery."}
              </p>
            </div>
          </div>

          <Link
            to="/register"
            onClick={() => sounds.playClick()}
            className="shrink-0 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md gap-2 flex items-center"
          >
            <span>{lang === "ar" ? "تقديم طلب شراكة مطعم" : "Apply for Partnership"}</span>
            <ArrowRight className={`size-3.5 ${lang === "ar" ? "rotate-180" : ""}`} />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. TRENDING DISHES WITH LIVE MACROS & FAST CART */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Flame className="size-6 text-amber-400" />
              <span>{lang === "ar" ? "قائمة الأطباق الأكثر طلباً اليوم" : "Today's Trending Gourmet Dishes"}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === "ar" ? "محسوبة السعرات والبروتين جاهزة للإضافة الفورية" : "Macro-calculated meals ready for instant order"}
            </p>
          </div>

          {/* Categories Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "all", ar: "الكل", en: "All" },
              { id: "burger", ar: "🍔 برجر وساندوتشات", en: "Burgers" },
              { id: "pizza", ar: "🍕 بيتزا وإيطالي", en: "Pizza" },
              { id: "protein", ar: "🥩 مشويات وبروتين", en: "Grills" },
              { id: "healthy", ar: "🥑 صحي وكيتو", en: "Healthy" },
              { id: "seafood", ar: "🍣 بحري وآسيوي", en: "Seafood" },
              { id: "smoothie", ar: "☕ كافيهات وحلى", en: "Cafes" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCat(cat.id);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCat === cat.id
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {lang === "ar" ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-md transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl"
            >
              {/* Dish Image */}
              <div className="relative h-36 w-full overflow-hidden">
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
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {lang === "ar" ? dish.nameAr : dish.nameEn}
                  </h3>
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
      </section>

      {/* ============================================================ */}
      {/* 7. ZOMATO MOBILE APP DOWNLOAD SHOWCASE BANNER */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-12 w-full">
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
                  <div className="space-y-1">
                    <div className="h-3 w-3/4 rounded-full bg-slate-800" />
                    <div className="h-2 w-1/2 rounded-full bg-slate-800" />
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

      {/* ============================================================ */}
      {/* 8. EXPLORE OPTIONS NEAR YOU (Zomato Accordion Guide) */}
      {/* ============================================================ */}
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
  );
}

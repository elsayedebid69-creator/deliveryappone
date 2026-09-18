import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import deliveryHeroVideo from "@/assets/foodhub-delivery-hero-logo.webm.asset.json";
import deliveryHeroVideoMp4 from "@/assets/foodhub-delivery-hero-logo.mp4.asset.json";
import riderFrameImage from "@/assets/foodhub-rider-logo-frame.jpg";
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
  ChevronLeft,
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
  Play,
  Pause,
  Bell,
  AlertCircle,
  CheckCircle2,
  Radio,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FoodHubLogo } from "@/components/food-hub-logo";

// Availability status filter options
const AVAILABILITY_FILTERS = [
  { id: "all", labelAr: "جميع الأحياء", labelEn: "All Districts", icon: "📍" },
  { id: "available", labelAr: "المتاحة للطلب 🟢", labelEn: "Available 🟢", icon: "🟢" },
  { id: "unavailable", labelAr: "غير المتاحة / قريباً 🔴", labelEn: "Coming Soon 🔴", icon: "🔴" },
];

// Region filter options for Riyadh localities
const REGION_FILTERS = [
  { id: "all", labelAr: "جميع المناطق", labelEn: "All Regions", icon: "📍" },
  { id: "north", labelAr: "شمال الرياض", labelEn: "North Riyadh", icon: "🧭" },
  { id: "central", labelAr: "وسط الرياض", labelEn: "Central Riyadh", icon: "🏙️" },
  { id: "east", labelAr: "شرق الرياض", labelEn: "East Riyadh", icon: "🌅" },
  { id: "west", labelAr: "غرب الرياض", labelEn: "West Riyadh", icon: "🌴" },
  { id: "south", labelAr: "جنوب الرياض", labelEn: "South Riyadh", icon: "🚚" },
];

// Comprehensive Riyadh Localities with Real-Time Availability (Green 🟢 / Red 🔴)
export interface RiyadhLocality {
  id: string;
  nameAr: string;
  nameEn: string;
  region: "north" | "central" | "east" | "west" | "south";
  isAvailable: boolean;
  places: number;
  eta: string;
  tagAr: string;
  tagEn: string;
  rating: number;
  icon: string;
  statusNoteAr?: string;
  statusNoteEn?: string;
}

const RIYADH_LOCALITIES: RiyadhLocality[] = [
  // ================= NORTH RIYADH =================
  { id: "loc-n1", nameAr: "حطين", nameEn: "Hittin", region: "north", isAvailable: true, places: 215, eta: "15-20 د", tagAr: "مطاعم فاخرة ⭐", tagEn: "Fine Dining ⭐", rating: 4.95, icon: "✨" },
  { id: "loc-n2", nameAr: "الملقا", nameEn: "Al Malqa", region: "north", isAvailable: true, places: 198, eta: "15-20 د", tagAr: "برجر وكافيهات 🍔", tagEn: "Burgers & Cafes 🍔", rating: 4.92, icon: "🍔" },
  { id: "loc-n3", nameAr: "الياسمين", nameEn: "Al Yasmin", region: "north", isAvailable: true, places: 165, eta: "15-20 د", tagAr: "توصيل فائق ⚡", tagEn: "Fast Delivery ⚡", rating: 4.88, icon: "⚡" },
  { id: "loc-n4", nameAr: "النرجس", nameEn: "An Narjis", region: "north", isAvailable: true, places: 142, eta: "18-22 د", tagAr: "نمو سريع 🚀", tagEn: "Fast Growing 🚀", rating: 4.85, icon: "🌱" },
  { id: "loc-n5", nameAr: "الصحافة", nameEn: "As Sahafah", region: "north", isAvailable: true, places: 156, eta: "15-20 د", tagAr: "وجبات دايت 🥗", tagEn: "Diet & Fitness 🥗", rating: 4.89, icon: "🥑" },
  { id: "loc-n6", nameAr: "العقيق", nameEn: "Al Aqiq", region: "north", isAvailable: true, places: 138, eta: "15-20 د", tagAr: "قريب من البوليفارد 🏙️", tagEn: "Near Boulevard 🏙️", rating: 4.91, icon: "🏙️" },
  { id: "loc-n7", nameAr: "الربيع", nameEn: "Ar Rabi", region: "north", isAvailable: true, places: 124, eta: "15-20 د", tagAr: "أطباق عالمية 🍣", tagEn: "International 🍣", rating: 4.86, icon: "🍣" },
  { id: "loc-n8", nameAr: "الغدير", nameEn: "Al Ghadir", region: "north", isAvailable: true, places: 112, eta: "15-20 د", tagAr: "قهوة مختصة ☕", tagEn: "Specialty Coffee ☕", rating: 4.87, icon: "☕" },
  { id: "loc-n9", nameAr: "النفل والوادي", nameEn: "An Nafil & Al Wadi", region: "north", isAvailable: true, places: 98, eta: "18-22 د", tagAr: "مشاوي وشاورما 🥩", tagEn: "Grills & Shawarma 🥩", rating: 4.82, icon: "🥩" },
  { id: "loc-n10", nameAr: "القيروان", nameEn: "Al Qayrawan", region: "north", isAvailable: true, places: 92, eta: "20-25 د", tagAr: "مطابخ سحابية 🍳", tagEn: "Cloud Kitchens 🍳", rating: 4.80, icon: "🍳" },
  { id: "loc-n11", nameAr: "العارض", nameEn: "Al Arid", region: "north", isAvailable: true, places: 84, eta: "20-25 د", tagAr: "توسع نشط 🛵", tagEn: "Expanding Hub 🛵", rating: 4.78, icon: "🛵" },
  { id: "loc-n12", nameAr: "بنبان", nameEn: "Banban", region: "north", isAvailable: false, places: 0, eta: "غير متاح", tagAr: "قريباً ⏳", tagEn: "Coming Soon ⏳", rating: 0, icon: "⏳", statusNoteAr: "جاري تجهيز نقاط التوزيع والمطابخ", statusNoteEn: "Kitchens & hubs under setup" },
  { id: "loc-n13", nameAr: "مطار الملك خالد والمناطق الشمالية", nameEn: "KKIA & North Outskirts", region: "north", isAvailable: false, places: 0, eta: "غير متاح", tagAr: "قيد التوسع ✈️", tagEn: "Expanding ✈️", rating: 0, icon: "✈️", statusNoteAr: "التغطية قادمة في المرحلة التالية", statusNoteEn: "Coverage coming in next phase" },

  // ================= CENTRAL RIYADH =================
  { id: "loc-c1", nameAr: "العليا", nameEn: "Al Olaya", region: "central", isAvailable: true, places: 195, eta: "15-20 د", tagAr: "قلب الأعمال 💼", tagEn: "Business Hub 💼", rating: 4.96, icon: "🏙️" },
  { id: "loc-c2", nameAr: "السليمانية", nameEn: "As Sulimaniyah", region: "central", isAvailable: true, places: 184, eta: "15-20 د", tagAr: "مطاعم شهيرة 🔥", tagEn: "Trendy Dining 🔥", rating: 4.94, icon: "🔥" },
  { id: "loc-c3", nameAr: "التحلية والزهراء", nameEn: "Tahlia & Az Zahra", region: "central", isAvailable: true, places: 168, eta: "15-20 د", tagAr: "كافيهات ودايت 🥑", tagEn: "Cafes & Diet 🥑", rating: 4.93, icon: "🥑" },
  { id: "loc-c4", nameAr: "الملز", nameEn: "Al Malaz", region: "central", isAvailable: true, places: 146, eta: "15-20 د", tagAr: "عائلي وتراثي 🍲", tagEn: "Family & Local 🍲", rating: 4.85, icon: "🍲" },
  { id: "loc-c5", nameAr: "المربع والوزارات", nameEn: "Al Murabba & Ministries", region: "central", isAvailable: true, places: 132, eta: "15-20 د", tagAr: "مركز المدينة 🎯", tagEn: "City Center 🎯", rating: 4.84, icon: "🎯" },
  { id: "loc-c6", nameAr: "الورود والملك فهد", nameEn: "Al Worood & King Fahd", region: "central", isAvailable: true, places: 154, eta: "15-20 د", tagAr: "أطباق سريعة 🍕", tagEn: "Fast Casual 🍕", rating: 4.88, icon: "🍕" },
  { id: "loc-c7", nameAr: "المروج", nameEn: "Al Murooj", region: "central", isAvailable: true, places: 128, eta: "15-20 د", tagAr: "مشويات وشعبي 🥩", tagEn: "Grills & Local 🥩", rating: 4.83, icon: "🥩" },
  { id: "loc-c8", nameAr: "صلاح الدين والواحة", nameEn: "Salah Ad Din & Al Waha", region: "central", isAvailable: true, places: 119, eta: "15-20 د", tagAr: "طعام صحي 🥗", tagEn: "Healthy Dining 🥗", rating: 4.87, icon: "🥗" },
  { id: "loc-c9", nameAr: "الديرة والبطحاء", nameEn: "Ad Dirah & Al Batha", region: "central", isAvailable: true, places: 96, eta: "20-25 د", tagAr: "مأكولات شعبية 🍛", tagEn: "Traditional Eats 🍛", rating: 4.79, icon: "🍛" },
  { id: "loc-c10", nameAr: "الضباط والمؤتمرات", nameEn: "Ad Dubbat & Conferences", region: "central", isAvailable: true, places: 104, eta: "15-20 د", tagAr: "غداء أعمال 🍱", tagEn: "Business Lunch 🍱", rating: 4.86, icon: "🍱" },

  // ================= EAST RIYADH =================
  { id: "loc-e1", nameAr: "الروضة", nameEn: "Ar Rawdah", region: "east", isAvailable: true, places: 148, eta: "18-22 د", tagAr: "عائلي ومتنوع 🏡", tagEn: "Family Dining 🏡", rating: 4.87, icon: "🏡" },
  { id: "loc-e2", nameAr: "قرطبة", nameEn: "Qurtubah", region: "east", isAvailable: true, places: 152, eta: "15-20 د", tagAr: "مطابخ حديثة ⚡", tagEn: "Modern Kitchens ⚡", rating: 4.89, icon: "⚡" },
  { id: "loc-e3", nameAr: "اليرموك", nameEn: "Al Yarmuk", region: "east", isAvailable: true, places: 136, eta: "18-22 د", tagAr: "برجر وبيتزا 🍔", tagEn: "Burgers & Pizza 🍔", rating: 4.83, icon: "🍔" },
  { id: "loc-e4", nameAr: "غرناطة والحمراء", nameEn: "Ghirnatah & Al Hamra", region: "east", isAvailable: true, places: 142, eta: "15-20 د", tagAr: "مولات وكافيهات ☕", tagEn: "Malls & Cafes ☕", rating: 4.90, icon: "☕" },
  { id: "loc-e5", nameAr: "الربوة", nameEn: "Ar Rabwah", region: "east", isAvailable: true, places: 118, eta: "18-22 د", tagAr: "شاورما ومشاوي 🌯", tagEn: "Shawarma & Grills 🌯", rating: 4.81, icon: "🌯" },
  { id: "loc-e6", nameAr: "إشبيلية", nameEn: "Ishbiliyah", region: "east", isAvailable: true, places: 125, eta: "18-22 د", tagAr: "أطباق شرقية 🍛", tagEn: "Eastern Dishes 🍛", rating: 4.84, icon: "🍛" },
  { id: "loc-e7", nameAr: "المونسية والرمال", nameEn: "Al Munsiyah & Ar Rimal", region: "east", isAvailable: true, places: 110, eta: "20-25 د", tagAr: "توصيل سريع 🛵", tagEn: "Fast Couriers 🛵", rating: 4.79, icon: "🛵" },
  { id: "loc-e8", nameAr: "الخليج والنهضة", nameEn: "Al Khaleej & An Nahdah", region: "east", isAvailable: true, places: 108, eta: "20-25 د", tagAr: "أكلات سريعة 🍕", tagEn: "Quick Bites 🍕", rating: 4.78, icon: "🍕" },
  { id: "loc-e9", nameAr: "النسيم الشرقي والغربي", nameEn: "An Naseem East & West", region: "east", isAvailable: true, places: 122, eta: "20-25 د", tagAr: "توصيل اقتصادي 💰", tagEn: "Budget Friendly 💰", rating: 4.75, icon: "💰" },
  { id: "loc-e10", nameAr: "الفيحاء والسعادة", nameEn: "Al Fayha & As Saadah", region: "east", isAvailable: true, places: 95, eta: "20-25 د", tagAr: "وجبات منزلية 🍲", tagEn: "Home Meals 🍲", rating: 4.77, icon: "🍲" },
  { id: "loc-e11", nameAr: "الجزيرة والصفا", nameEn: "Al Jazirah & As Safa", region: "east", isAvailable: true, places: 89, eta: "20-25 د", tagAr: "مطابخ عائلية 👨‍🍳", tagEn: "Family Kitchens 👨‍🍳", rating: 4.80, icon: "👨‍🍳" },
  { id: "loc-e12", nameAr: "الجنادرية وأطراف الشرق", nameEn: "Al Janadriyah Outskirts", region: "east", isAvailable: false, places: 0, eta: "غير متاح", tagAr: "قريباً ⏳", tagEn: "Coming Soon ⏳", rating: 0, icon: "⏳", statusNoteAr: "جاري ربط مطابخ الشرق بالشبكة", statusNoteEn: "Connecting east hubs soon" },
  { id: "loc-e13", nameAr: "رماح والمناطق الشرقية البعيدة", nameEn: "Rimah & Far East", region: "east", isAvailable: false, places: 0, eta: "غير متاح", tagAr: "خارج التغطية 🔴", tagEn: "Out of Range 🔴", rating: 0, icon: "🚧", statusNoteAr: "خارج نطاق التوصيل السريع حالياً", statusNoteEn: "Currently outside express range" },

  // ================= WEST RIYADH =================
  { id: "loc-w1", nameAr: "الدرعية التاريخية", nameEn: "Diriyah Heritage", region: "west", isAvailable: true, places: 115, eta: "18-22 د", tagAr: "تراثي وسياحي 🏛️", tagEn: "Heritage & Tourism 🏛️", rating: 4.95, icon: "🏛️" },
  { id: "loc-w2", nameAr: "الخزامى والنخيل", nameEn: "Al Khuzama & An Nakheel", region: "west", isAvailable: true, places: 140, eta: "15-20 د", tagAr: "مطابخ فاخرة ✨", tagEn: "Luxury Dining ✨", rating: 4.93, icon: "✨" },
  { id: "loc-w3", nameAr: "حي السفارات (DQ)", nameEn: "Diplomatic Quarter (DQ)", region: "west", isAvailable: true, places: 88, eta: "15-20 د", tagAr: "نخبة المطاعم 🌐", tagEn: "Diplomatic Hub 🌐", rating: 4.97, icon: "🌐" },
  { id: "loc-w4", nameAr: "جامعة الملك سعود والرائد", nameEn: "KSU & Ar Raid", region: "west", isAvailable: true, places: 126, eta: "15-20 د", tagAr: "وجبات طلابية وكافيهات ☕", tagEn: "Campus & Cafes ☕", rating: 4.88, icon: "🎓" },
  { id: "loc-w5", nameAr: "عرقة", nameEn: "Irqah", region: "west", isAvailable: true, places: 98, eta: "18-22 د", tagAr: "هدوء ومطاعم حديثة 🌿", tagEn: "Modern Dining 🌿", rating: 4.89, icon: "🌿" },
  { id: "loc-w6", nameAr: "البديعة والعريجاء", nameEn: "Al Badi'ah & Al Uraija", region: "west", isAvailable: true, places: 106, eta: "20-25 د", tagAr: "أكلات شعبية ومشويات 🥩", tagEn: "Traditional & Grills 🥩", rating: 4.80, icon: "🥩" },
  { id: "loc-w7", nameAr: "ظهرة لبن وطويق", nameEn: "Dhahrat Laban & Tuwaiq", region: "west", isAvailable: true, places: 112, eta: "20-25 د", tagAr: "توصيل سريع 🛵", tagEn: "Express Delivery 🛵", rating: 4.79, icon: "🛵" },
  { id: "loc-w8", nameAr: "المهدية", nameEn: "Al Mahdiyah", region: "west", isAvailable: true, places: 78, eta: "22-28 د", tagAr: "حي واعد 🌄", tagEn: "Emerging Hub 🌄", rating: 4.77, icon: "🌄" },
  { id: "loc-w9", nameAr: "القدية والمزاحمية", nameEn: "Qiddiya & Al Muzahimiyah", region: "west", isAvailable: false, places: 0, eta: "غير متاح", tagAr: "قيد التطوير 🎢", tagEn: "Under Development 🎢", rating: 0, icon: "🎢", statusNoteAr: "التغطية قادمة مع تدشين مشروعات القدية", statusNoteEn: "Launching with Qiddiya projects" },
  { id: "loc-w10", nameAr: "ضرما والمناطق الغربية البعيدة", nameEn: "Dhurma & Far West", region: "west", isAvailable: false, places: 0, eta: "غير متاح", tagAr: "خارج التغطية 🔴", tagEn: "Out of Range 🔴", rating: 0, icon: "🚧", statusNoteAr: "خارج نطاق التوصيل السريع حالياً", statusNoteEn: "Currently outside express range" },

  // ================= SOUTH RIYADH =================
  { id: "loc-s1", nameAr: "السويدي", nameEn: "As Suwaidi", region: "south", isAvailable: true, places: 135, eta: "18-22 د", tagAr: "أسرع توصيل 🛵", tagEn: "Fast Delivery 🛵", rating: 4.82, icon: "🛵" },
  { id: "loc-s2", nameAr: "شبرا والدريهمية", nameEn: "Shubra & Ad Duraihimiyah", region: "south", isAvailable: true, places: 104, eta: "20-25 د", tagAr: "توصيل اقتصادي 💰", tagEn: "Budget Friendly 💰", rating: 4.78, icon: "💰" },
  { id: "loc-s3", nameAr: "الشفا والمروة", nameEn: "Al Shifa & Al Marwah", region: "south", isAvailable: true, places: 120, eta: "20-25 د", tagAr: "مطاعم متنوعة 🍱", tagEn: "Diverse Dining 🍱", rating: 4.80, icon: "🍱" },
  { id: "loc-s4", nameAr: "العزيزية والدار البيضاء", nameEn: "Al Aziziyah & Ad Dar Al Baida", region: "south", isAvailable: true, places: 114, eta: "20-25 د", tagAr: "مشاوي وشعبي 🥩", tagEn: "Grills & Popular 🥩", rating: 4.76, icon: "🥩" },
  { id: "loc-s5", nameAr: "المنصورة والخالدية", nameEn: "Al Mansourah & Al Khalidiyah", region: "south", isAvailable: true, places: 94, eta: "20-25 د", tagAr: "وجبات عائلية 👨‍👩‍👧", tagEn: "Family Meals 👨‍👩‍👧", rating: 4.77, icon: "🍲" },
  { id: "loc-s6", nameAr: "غبيراء ومنفوحة", nameEn: "Ghubaira & Manfouha", region: "south", isAvailable: true, places: 86, eta: "20-25 د", tagAr: "أكلات تقليدية 🍛", tagEn: "Traditional Eats 🍛", rating: 4.73, icon: "🍛" },
  { id: "loc-s7", nameAr: "الحاير والمصانع", nameEn: "Al Ha'ir & Al Masani", region: "south", isAvailable: false, places: 0, eta: "غير متاح", tagAr: "قريباً ⏳", tagEn: "Coming Soon ⏳", rating: 0, icon: "⏳", statusNoteAr: "جاري اعتماد مسارات التوصيل الآمنة", statusNoteEn: "Delivery routes being finalized" },
  { id: "loc-s8", nameAr: "هيت والمناطق الجنوبية البعيدة", nameEn: "Heet & Far South", region: "south", isAvailable: false, places: 0, eta: "غير متاح", tagAr: "خارج التغطية 🔴", tagEn: "Out of Range 🔴", rating: 0, icon: "🚧", statusNoteAr: "خارج نطاق التوصيل السريع حالياً", statusNoteEn: "Currently outside express range" },
];

// Popular Rotating Meals from All Restaurants (Carousel Data)
const POPULAR_ROTATING_MEALS = [
  {
    id: "pop-1",
    restaurantId: "rest-4",
    restaurantAr: "ذا سماش برجر جورميه",
    restaurantEn: "The Smash Gourmet Lab",
    cuisineAr: "🍔 برجر وسماش",
    cuisineEn: "🍔 Smash Burgers",
    nameAr: "دبل أنجوس سماش برجر ذواقة",
    nameEn: "Double Angus Gourmet Smash",
    descAr: "شريحتين أنجوس مكرمل مع جبن شيدر ذائب وصوص سري بخبز بريوش طازج",
    descEn: "Double Prime Angus patties, melted aged cheddar & secret sauce in brioche",
    price: 39,
    oldPrice: 49,
    rating: 4.98,
    ordersCount: "3.2k+ طلب",
    ordersCountEn: "3.2k+ orders",
    eta: "15 دقيقة",
    badgeAr: "🔥 الأكثر مبيعاً",
    badgeEn: "🔥 Best Seller",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop",
  },
  {
    id: "pop-2",
    restaurantId: "rest-6",
    restaurantAr: "مشاوي الملوك والتنور",
    restaurantEn: "Royal Charcoal Grill House",
    cuisineAr: "🥩 مشويات وكباب",
    cuisineEn: "🥩 Grills & Kebabs",
    nameAr: "مشكل كباب وتندرلوين على الفحم",
    nameEn: "Charcoal Mixed Grill & Tenderloin",
    descAr: "أسياخ كباب نعيمي فاخر مع أوصال تندرلوين متبلة على الفحم وخبز تنور ساخن",
    descEn: "Charcoal-grilled premium lamb kebab, tenderloin cuts with fresh tandoor bread",
    price: 64,
    oldPrice: 78,
    rating: 4.96,
    ordersCount: "2.8k+ طلب",
    ordersCountEn: "2.8k+ orders",
    eta: "18 دقيقة",
    badgeAr: "👑 اختيار الذواقة",
    badgeEn: "👑 Gourmet Choice",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=450&fit=crop",
  },
  {
    id: "pop-3",
    restaurantId: "rest-5",
    restaurantAr: "لا كازا بيتزا نابوليتانا",
    restaurantEn: "La Casa Artisan Pizza",
    cuisineAr: "🍕 بيتزا وإيطالي",
    cuisineEn: "🍕 Pizza & Italian",
    nameAr: "بيتزا الترفل والموزاريلا الطازجة",
    nameEn: "Artisan Truffle & Mozzarella Pizza",
    descAr: "عجينة مخمرة 48 ساعة على الحطب مع زيت الترفل الإيطالي والموزاريلا الطازجة",
    descEn: "48h fermented wood-fired dough with Italian truffle glaze & buffalo mozzarella",
    price: 48,
    oldPrice: 60,
    rating: 4.93,
    ordersCount: "2.1k+ طلب",
    ordersCountEn: "2.1k+ orders",
    eta: "15 دقيقة",
    badgeAr: "🍕 إيطالي أصيل",
    badgeEn: "🍕 Authentic Italian",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop",
  },
  {
    id: "pop-4",
    restaurantId: "rest-1",
    restaurantAr: "سالمون أند دايت كلوب",
    restaurantEn: "Salmon & Clean Diet Club",
    cuisineAr: "🐟 مأكولات بحرية ودايت",
    cuisineEn: "🐟 Seafood & Diet",
    nameAr: "وعاء السلمون البري والأفوكادو",
    nameEn: "Avocado & Wild Salmon Power Bowl",
    descAr: "فيليه سلمون نرويجي مشوي غني بالأوميغا 3 مع شرائح أفوكادو وكينوا عضوية",
    descEn: "Omega-3 rich grilled salmon with creamy avocado, organic quinoa & glaze",
    price: 54,
    oldPrice: 68,
    rating: 4.97,
    ordersCount: "1.9k+ طلب",
    ordersCountEn: "1.9k+ orders",
    eta: "16 دقيقة",
    badgeAr: "🥑 محسوب الماكروز",
    badgeEn: "🥑 Exact Macros",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
  },
  {
    id: "pop-5",
    restaurantId: "rest-8",
    restaurantAr: "شاورما الأصالة والفرن",
    restaurantEn: "Authentic Charcoal Shawarma",
    cuisineAr: "🌯 شاورما وساندوتشات",
    cuisineEn: "🌯 Shawarma Hub",
    nameAr: "شاورما لحم عجل مدخن بالرمان",
    nameEn: "Smoked Veal Shawarma Platter",
    descAr: "شاورما لحم عجل بلدي مدخن مع دبس الرمان، طحينة خاصة، ومخللات منزلية",
    descEn: "Smoked local veal shawarma with pomegranate molasses, tahini and pickles",
    price: 34,
    oldPrice: 44,
    rating: 4.95,
    ordersCount: "4.3k+ طلب",
    ordersCountEn: "4.3k+ orders",
    eta: "12 دقيقة",
    badgeAr: "⚡ طلب سريع",
    badgeEn: "⚡ Fast Order",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=450&fit=crop",
  },
  {
    id: "pop-6",
    restaurantId: "rest-9",
    restaurantAr: "قصر الضيافة والمأكولات الشرقية",
    restaurantEn: "Oriental Heritage Feast",
    cuisineAr: "🍛 أطباق شرقية وكبسة",
    cuisineEn: "🍛 Traditional Rice",
    nameAr: "كبسة لحم نعيمي بالزعفران والمكسرات",
    nameEn: "Saffron Lamb Kabsa with Toasted Nuts",
    descAr: "أرز بسمتي فاخر مطهو بمرق اللحم والزعفران مع لحم نعيمي طري ومكسرات محمصة",
    descEn: "Fragrant saffron basmati rice with tender slow-cooked lamb and golden nuts",
    price: 58,
    oldPrice: 72,
    rating: 4.94,
    ordersCount: "1.8k+ طلب",
    ordersCountEn: "1.8k+ orders",
    eta: "20 دقيقة",
    badgeAr: "🇸🇦 تراثي فاخر",
    badgeEn: "🇸🇦 Heritage Feast",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=450&fit=crop",
  },
  {
    id: "pop-7",
    restaurantId: "rest-2",
    restaurantAr: "جرين بار وأطباق البروتين",
    restaurantEn: "Green Bar & Protein Kitchen",
    cuisineAr: "🥗 دايت وسلطات",
    cuisineEn: "🥗 Salads & Diet",
    nameAr: "سلطة الكينوا بالفيتا والخضار المشوية",
    nameEn: "Grilled Veggie Quinoa & Feta Bowl",
    descAr: "كينوا عضوية مع خضار حقلية مشوية، جبن فيتا، وبذور اليقطين وصلصة الليمون",
    descEn: "Organic quinoa with charred greens, Greek feta, pumpkin seeds & lemon dressing",
    price: 36,
    oldPrice: 46,
    rating: 4.91,
    ordersCount: "1.6k+ طلب",
    ordersCountEn: "1.6k+ orders",
    eta: "12 دقيقة",
    badgeAr: "🌱 عضوي 100%",
    badgeEn: "🌱 100% Organic",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop",
  },
  {
    id: "pop-8",
    restaurantId: "rest-7",
    restaurantAr: "محمصة أروما ومخبز الفيت",
    restaurantEn: "Aroma Artisan Roastery",
    cuisineAr: "☕ كافيهات وحلى",
    cuisineEn: "☕ Cafes & Desserts",
    nameAr: "كولد برو مقطر وتشيزكيك الشوفان",
    nameEn: "Cold Brew & Guilt-Free Cheesecake",
    descAr: "قهوة مقطرة باردة 18 ساعة مع تشيزكيك الشوفان بالبروتين خالي من السكر المكرر",
    descEn: "18h slow-dripped Ethiopian cold brew paired with sugar-free protein cheesecake",
    price: 30,
    oldPrice: 40,
    rating: 4.99,
    ordersCount: "3.6k+ طلب",
    ordersCountEn: "3.6k+ orders",
    eta: "10 دقيقة",
    badgeAr: "⭐ الأكثر تقييماً",
    badgeEn: "⭐ Top Rated",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=450&fit=crop",
  },
];

// FOODHUB Platform Features (Smart Delivery, Multi-Brand Cart, Precision Diet)
const FOODHUB_PLATFORM_FEATURES = [
  {
    id: "online",
    titleAr: "الطلب الذكي والتوصيل فائق السرعة",
    titleEn: "Smart Ordering & Ultrafast Delivery",
    descAr: "منظومة إسناد وتوزيع ذكية تضمن وصول طلبك في 15-20 دقيقة بأقل سعر توصيل في المملكة مع تتبع راداري حي لحظي.",
    descEn: "Smart dispatching ensuring 15-20 min arrival with the lowest delivery fees in KSA and live GPS tracking.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop",
    linkTextAr: "اطلب الآن بأسرع توصيل",
    linkTextEn: "Order Fast Delivery",
    badgeAr: "⚡ أسرع توصيل في المملكة",
    badgeEn: "⚡ Fastest Delivery in KSA",
    tagAr: "⏱️ 15-20 دقيقة",
    tagEn: "⏱️ 15-20 Mins",
    bulletsAr: [
      "تتبع راداري حي مباشر لمسار المندوب حتى بابك",
      "أقل رسوم توصيل تبدأ من 0 ر.س مع عروض يومية",
      "حقائب حرارية معزولة تحفظ حرارة وجودة الطعام",
    ],
    bulletsEn: [
      "Live GPS radar driver tracking to your door",
      "Lowest delivery fees starting at 0 SAR",
      "Thermal insulated bags keeping meals fresh and hot",
    ],
    statAr: "⚡ متوسط التوصيل: 18 دقيقة",
    statEn: "⚡ Avg. ETA: 18 mins",
    icon: "🛵",
    accentColor: "amber",
  },
  {
    id: "dining",
    titleAr: "تنوع شامل وسلة موحدة لعدة مطاعم",
    titleEn: "All-in-One Multi-Brand Unified Cart",
    descAr: "اطلب من كافة المطاعم والماركات والمطابخ السحابية المعتمدة في سلة واحدة ومندوب واحد لتوفير 50% من الرسوم.",
    descEn: "Order from top restaurants & certified cloud kitchens in a single cart with one driver to save 50% on fees.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop",
    linkTextAr: "استكشف المطاعم والتحالفات",
    linkTextEn: "Explore Restaurants",
    badgeAr: "🤝 سلة موحدة لعدة علامات",
    badgeEn: "🤝 Multi-Brand Single Cart",
    tagAr: "🏪 مطاعم مرخصة 100%",
    tagEn: "🏪 100% Certified",
    bulletsAr: [
      "طلب أطباق من مطعمين مختلفين في فاتورة واحدة",
      "توفير 50% في تكاليف الشحن والمشاوير المتعددة",
      "رقابة بلدية ومعايير نظافة وجودة غذائية صارمة",
    ],
    bulletsEn: [
      "Combine dishes from 2 brands in 1 checkout",
      "Save 50% on delivery trips and driver fees",
      "Strict municipality hygiene & safety guarantee",
    ],
    statAr: "🏪 +120 مطعم ومطبخ معتمد",
    statEn: "🏪 +120 Certified Brands",
    icon: "🏪",
    accentColor: "blue",
  },
  {
    id: "healthy",
    titleAr: "وجبات الشيف والدايت وحساب الماكروز",
    titleEn: "Chef Gourmet & Precision Macro Nutrition",
    descAr: "وجبات دايت، كيتو وبروتين صافي محسوبة السعرات والماكروز بدقة بأيدي أمهر الطهاة لمساعدتك في تحقيق أهدافك البدنية.",
    descEn: "Clean diet, keto & high-protein gourmet meals with exact macro and calorie counts to hit your fitness goals.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop",
    linkTextAr: "تصفح وجبات الدايت والشيف",
    linkTextEn: "Browse Healthy Meals",
    badgeAr: "🥗 تغذية صحية ودقيقة",
    badgeEn: "🥗 Precision Diet Nutrition",
    tagAr: "🥑 محسوب الماكروز",
    tagEn: "🥑 Exact Macros",
    bulletsAr: [
      "حساب دقيق لجرامات البروتين والكاربوهيدرات والدهون",
      "مكونات طازجة خالية من الزيوت المهدرجة والمواد الحافظة",
      "خيارات مرنة للرياضيين وأصحاب الحميات المتنوعة",
    ],
    bulletsEn: [
      "Exact protein, carb & fat grams per meal",
      "Fresh ingredients, zero trans-fats or preservatives",
      "Tailored options for athletes & active lifestyles",
    ],
    statAr: "🥑 +80 وجبة محسوبة السعرات",
    statEn: "🥑 +80 Keto & Protein Meals",
    icon: "🥗",
    accentColor: "emerald",
  },
];

// Famous KSA Restaurant Brand Categories
const FAMOUS_BRAND_CATEGORIES = [
  { id: "all", labelAr: "جميع أشهر المطاعم", labelEn: "All Famous Brands", icon: "👑" },
  { id: "fastfood", labelAr: "كنتاكي والبيك وسريع", labelEn: "Fast Food & Crispy Chicken", icon: "🍗" },
  { id: "burger", labelAr: "برجر وهارديز وسماش", labelEn: "Burgers & Smashed", icon: "🍔" },
  { id: "shawarma", labelAr: "شاورمر وماما نورة", labelEn: "Shawarma & Wraps", icon: "🌯" },
  { id: "traditional", labelAr: "كبسة ورومانسية وتكساس", labelEn: "Saudi & Prime Dining", icon: "🍛" },
  { id: "pizza", labelAr: "دومينوز ومايسترو وبيتزا", labelEn: "Pizza & Italian", icon: "🍕" },
  { id: "cafe", labelAr: "كافيهات وسينابون وحلى", labelEn: "Cafes & Desserts", icon: "🧁" },
];

// Iconic Famous Restaurant Brands in Saudi Arabia
export interface FamousKsaRestaurant {
  id: string;
  nameAr: string;
  nameEn: string;
  category: "burger" | "shawarma" | "traditional" | "pizza" | "cafe" | "fastfood";
  logoIcon: string;
  logoImage: string;
  logoColor: string;
  avatarBg: string;
  signatureDishAr: string;
  signatureDishEn: string;
  branchesAr: string;
  branchesEn: string;
  rating: number;
  ordersCountAr: string;
  ordersCountEn: string;
  eta: string;
  discountBadgeAr: string;
  discountBadgeEn: string;
  verifiedBadgeAr: string;
  verifiedBadgeEn: string;
  image: string;
}

const FAMOUS_KSA_RESTAURANTS: FamousKsaRestaurant[] = [
  {
    id: "brand-kfc",
    nameAr: "دجاج كنتاكي (KFC)",
    nameEn: "KFC",
    category: "fastfood",
    logoIcon: "🍗",
    logoImage: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=200&h=200&fit=crop&q=80",
    logoColor: "#E4002B",
    avatarBg: "bg-red-600",
    signatureDishAr: "بوكس الزنجر سوبريم الحار + بطاطس وقطع دجاج مقرمش وكول سلو",
    signatureDishEn: "Spicy Zinger Supreme Box + Crispy Strips & Coleslaw",
    branchesAr: "+240 فرع بالمملكة",
    branchesEn: "240+ KSA Branches",
    rating: 4.93,
    ordersCountAr: "+46k طلب",
    ordersCountEn: "+46k orders",
    eta: "15 د",
    discountBadgeAr: "الدجاج المقرمش الأصلي 🍗",
    discountBadgeEn: "Original Crispy 🍗",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=500&h=350&fit=crop",
  },
  {
    id: "brand-albaik",
    nameAr: "البيك",
    nameEn: "ALBAIK",
    category: "fastfood",
    logoIcon: "🍗",
    logoImage: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200&h=200&fit=crop&q=80",
    logoColor: "#E11D48",
    avatarBg: "bg-red-600",
    signatureDishAr: "مسحب دجاج حراق 7 قطع + بطاطس مقرمشة وثوم أصلي",
    signatureDishEn: "7-pc Spicy Chicken Nuggets + Fries & Original Garlic",
    branchesAr: "+160 فرع بالمملكة",
    branchesEn: "160+ KSA Branches",
    rating: 4.98,
    ordersCountAr: "+45k طلب",
    ordersCountEn: "+45k orders",
    eta: "15 د",
    discountBadgeAr: "الأكثر شهرة 🔥",
    discountBadgeEn: "Most Iconic 🔥",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&h=350&fit=crop",
  },
  {
    id: "brand-hardees",
    nameAr: "هارديز",
    nameEn: "Hardee's",
    category: "burger",
    logoIcon: "⭐",
    logoImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop&q=80",
    logoColor: "#EAB308",
    avatarBg: "bg-amber-600",
    signatureDishAr: "برجر سوبر ستار أنجوس مشوي على اللهب + بطاطس كيرلي المقرمشة",
    signatureDishEn: "Super Star Flame-Grilled Angus Burger & Curly Fries",
    branchesAr: "+95 فرع بالمملكة",
    branchesEn: "95+ KSA Branches",
    rating: 4.88,
    ordersCountAr: "+28k طلب",
    ordersCountEn: "+28k orders",
    eta: "15 د",
    discountBadgeAr: "مشوي على اللهب 🔥",
    discountBadgeEn: "Flame-Grilled 🔥",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=350&fit=crop",
  },
  {
    id: "brand-subway",
    nameAr: "صب واي",
    nameEn: "Subway",
    category: "fastfood",
    logoIcon: "🥖",
    logoImage: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200&h=200&fit=crop&q=80",
    logoColor: "#16A34A",
    avatarBg: "bg-emerald-600",
    signatureDishAr: "فوت لونج دجاج ترياكي بالخبز المحمص الطازج مع الخضار الحقلية",
    signatureDishEn: "Footlong Chicken Teriyaki Sub with Fresh Crisp Veggies",
    branchesAr: "+145 فرع بالمملكة",
    branchesEn: "145+ KSA Branches",
    rating: 4.90,
    ordersCountAr: "+25k طلب",
    ordersCountEn: "+25k orders",
    eta: "15 د",
    discountBadgeAr: "طازج وصحي 🥪",
    discountBadgeEn: "Eat Fresh 🥪",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&h=350&fit=crop",
  },
  {
    id: "brand-dominos",
    nameAr: "دومينوز بيتزا",
    nameEn: "Domino's Pizza",
    category: "pizza",
    logoIcon: "🍕",
    logoImage: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&h=200&fit=crop&q=80",
    logoColor: "#0284C7",
    avatarBg: "bg-sky-700",
    signatureDishAr: "بيتزا دجاج أسطورة بالرانش + أصابع الخبز بالجبن وكيكة الشوكولاتة",
    signatureDishEn: "Legend Chicken Ranch Pizza + Cheesy Bread & Choco Lava",
    branchesAr: "+310 فرع بالمملكة",
    branchesEn: "310+ KSA Branches",
    rating: 4.91,
    ordersCountAr: "+39k طلب",
    ordersCountEn: "+39k orders",
    eta: "15 د",
    discountBadgeAr: "توصيل دومينوز السريع 🍕",
    discountBadgeEn: "Fast Delivery 🍕",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&h=350&fit=crop",
  },
  {
    id: "brand-texas",
    nameAr: "تكساس رودهاوس",
    nameEn: "Texas Roadhouse",
    category: "traditional",
    logoIcon: "🥩",
    logoImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop&q=80",
    logoColor: "#B45309",
    avatarBg: "bg-amber-800",
    signatureDishAr: "ستيك ريب آي مشوي طازج مع خبز الزبدة بالعسل والفول السوداني",
    signatureDishEn: "Hand-Cut Ribeye Steak with Warm Fresh Rolls & Honey Butter",
    branchesAr: "+18 فرع بالمملكة",
    branchesEn: "18+ KSA Branches",
    rating: 4.97,
    ordersCountAr: "+19k طلب",
    ordersCountEn: "+19k orders",
    eta: "22 د",
    discountBadgeAr: "ستيك فاخر 🥩",
    discountBadgeEn: "Prime Steakhouse 🥩",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=350&fit=crop",
  },
  {
    id: "brand-shakeshack",
    nameAr: "شيك شاك",
    nameEn: "Shake Shack",
    category: "burger",
    logoIcon: "🍔",
    logoImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=80",
    logoColor: "#15803D",
    avatarBg: "bg-green-700",
    signatureDishAr: "شاك برجر لحم أنجوس 100% مع بطاطس كرينكل وشيك فانيلا كاسترد",
    signatureDishEn: "100% Angus ShackBurger + Crinkle Cut Fries & Custard Shake",
    branchesAr: "+22 فرع بالمملكة",
    branchesEn: "22+ KSA Branches",
    rating: 4.96,
    ordersCountAr: "+21k طلب",
    ordersCountEn: "+21k orders",
    eta: "16 د",
    discountBadgeAr: "برجر الذواقة 🍔",
    discountBadgeEn: "Gourmet Burgers 🍔",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop",
  },
  {
    id: "brand-popeyes",
    nameAr: "بوبايز",
    nameEn: "Popeyes",
    category: "fastfood",
    logoIcon: "🍗",
    logoImage: "https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop&q=80",
    logoColor: "#EA580C",
    avatarBg: "bg-orange-600",
    signatureDishAr: "ساندوتش الدجاج المقرمش الكلاسيكي مع بطاطس كاجون وبسكويت الزبدة",
    signatureDishEn: "Famous Chicken Sandwich + Cajun Fries & Buttermilk Biscuit",
    branchesAr: "+45 فرع بالمملكة",
    branchesEn: "45+ KSA Branches",
    rating: 4.91,
    ordersCountAr: "+20k طلب",
    ordersCountEn: "+20k orders",
    eta: "15 د",
    discountBadgeAr: "توابل لويزيانا 🍗",
    discountBadgeEn: "Louisiana Crunch 🍗",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=350&fit=crop",
  },
  {
    id: "brand-cinnabon",
    nameAr: "سينابون",
    nameEn: "Cinnabon",
    category: "cafe",
    logoIcon: "🧁",
    logoImage: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&q=80",
    logoColor: "#0284C7",
    avatarBg: "bg-cyan-700",
    signatureDishAr: "رول القرفة الكلاسيكية المغمورة بصوص الفروستينج وجوز البيكان",
    signatureDishEn: "Classic Makara Cinnamon Roll with Cream Cheese Frosting",
    branchesAr: "+115 فرع بالمملكة",
    branchesEn: "115+ KSA Branches",
    rating: 4.95,
    ordersCountAr: "+27k طلب",
    ordersCountEn: "+27k orders",
    eta: "12 د",
    discountBadgeAr: "رولات القرفة الساحرة 🧁",
    discountBadgeEn: "World Famous Rolls 🧁",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=350&fit=crop",
  },
  {
    id: "brand-shawarmer",
    nameAr: "شاورمر",
    nameEn: "Shawarmer",
    category: "shawarma",
    logoIcon: "🌯",
    logoImage: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=200&h=200&fit=crop&q=80",
    logoColor: "#F97316",
    avatarBg: "bg-orange-500",
    signatureDishAr: "وجبة عربي دبل دجاج مع صوص ثوم ودبس الرمان وبطاطا",
    signatureDishEn: "Double Arabi Chicken Shawarma & Pomegranate Dip",
    branchesAr: "+130 فرع بالمملكة",
    branchesEn: "130+ KSA Branches",
    rating: 4.92,
    ordersCountAr: "+38k طلب",
    ordersCountEn: "+38k orders",
    eta: "15 د",
    discountBadgeAr: "شاورما سعودية مبتكرة 🌯",
    discountBadgeEn: "Signature Shawarma 🌯",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&h=350&fit=crop",
  },
  {
    id: "brand-romansiah",
    nameAr: "الرومانسية",
    nameEn: "Al Romansiah",
    category: "traditional",
    logoIcon: "🍛",
    logoImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop&q=80",
    logoColor: "#B91C1C",
    avatarBg: "bg-red-800",
    signatureDishAr: "كبسة لحم نعيمي بالزعفران والمكسرات مع جريش وقرصان",
    signatureDishEn: "Signature Naimi Meat Kabsa, Jareesh & Qursan",
    branchesAr: "+48 فرع بالمملكة",
    branchesEn: "48+ KSA Branches",
    rating: 4.96,
    ordersCountAr: "+32k طلب",
    ordersCountEn: "+32k orders",
    eta: "20 د",
    discountBadgeAr: "أصالة المائدة السعودية 🇸🇦",
    discountBadgeEn: "Saudi Heritage 🇸🇦",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&h=350&fit=crop",
  },
  {
    id: "brand-mcdonalds",
    nameAr: "ماكدونالدز",
    nameEn: "McDonald's",
    category: "burger",
    logoIcon: "🍔",
    logoImage: "https://images.unsplash.com/photo-1552895638-f7fe08d2f7d5?w=200&h=200&fit=crop&q=80",
    logoColor: "#EAB308",
    avatarBg: "bg-yellow-500",
    signatureDishAr: "وجبة بيج ماك دبل لحم مع بطاطس ذهبية وماك فلوري أوريو",
    signatureDishEn: "Double Big Mac Meal + Golden Fries & Oreo McFlurry",
    branchesAr: "+350 فرع بالمملكة",
    branchesEn: "350+ KSA Branches",
    rating: 4.90,
    ordersCountAr: "+50k طلب",
    ordersCountEn: "+50k orders",
    eta: "15 د",
    discountBadgeAr: "العلامة العالمية 🍟",
    discountBadgeEn: "Global Icon 🍟",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=350&fit=crop",
  },
  {
    id: "brand-kudu",
    nameAr: "كودو",
    nameEn: "Kudu",
    category: "fastfood",
    logoIcon: "🥪",
    logoImage: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop&q=80",
    logoColor: "#10B981",
    avatarBg: "bg-emerald-600",
    signatureDishAr: "وجبة كودو دجاج على الصاج مع توست مكرمل وبطاطس",
    signatureDishEn: "Signature Kudu Chicken on Toast & Fries",
    branchesAr: "+320 فرع بالمملكة",
    branchesEn: "320+ KSA Branches",
    rating: 4.88,
    ordersCountAr: "+29k طلب",
    ordersCountEn: "+29k orders",
    eta: "15 د",
    discountBadgeAr: "على طريقتك 🥪",
    discountBadgeEn: "Your Way 🥪",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&h=350&fit=crop",
  },
  {
    id: "brand-maestro",
    nameAr: "مايسترو بيتزا",
    nameEn: "Maestro Pizza",
    category: "pizza",
    logoIcon: "🍕",
    logoImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&q=80",
    logoColor: "#EF4444",
    avatarBg: "bg-red-600",
    signatureDishAr: "بيتزا رانش دجاج كبيرة + أصابع جبن موزاريلا وصوصات",
    signatureDishEn: "Large Chicken Ranch Pizza + Cheese Sticks",
    branchesAr: "+180 فرع بالمملكة",
    branchesEn: "180+ KSA Branches",
    rating: 4.89,
    ordersCountAr: "+24k طلب",
    ordersCountEn: "+24k orders",
    eta: "18 د",
    discountBadgeAr: "بيتزا سعودية 100% 🍕",
    discountBadgeEn: "100% Saudi Pizza 🍕",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=350&fit=crop",
  },
  {
    id: "brand-herfy",
    nameAr: "هرفي",
    nameEn: "Herfy",
    category: "burger",
    logoIcon: "🍔",
    logoImage: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=200&fit=crop&q=80",
    logoColor: "#2563EB",
    avatarBg: "bg-blue-600",
    signatureDishAr: "وجبة سوبر هرفي دبل مع حلقات بصل ذهبية ومشروب",
    signatureDishEn: "Super Herfy Double Burger & Crispy Onion Rings",
    branchesAr: "+380 فرع بالمملكة",
    branchesEn: "380+ KSA Branches",
    rating: 4.86,
    ordersCountAr: "+27k طلب",
    ordersCountEn: "+27k orders",
    eta: "15 د",
    discountBadgeAr: "رواد البرجر السعودي 👑",
    discountBadgeEn: "Saudi Burger Pioneer 👑",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&h=350&fit=crop",
  },
  {
    id: "brand-burgerizzr",
    nameAr: "برغرايززر",
    nameEn: "Burgerizzr",
    category: "burger",
    logoIcon: "🍔",
    logoImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=80",
    logoColor: "#059669",
    avatarBg: "bg-emerald-700",
    signatureDishAr: "برجر لحم بلدي طازج يومياً مع صوص رمان وبطاطا مقرمشة",
    signatureDishEn: "Fresh Daily Beef Burger & Pomegranate Glaze",
    branchesAr: "+100 فرع بالمملكة",
    branchesEn: "100+ KSA Branches",
    rating: 4.91,
    ordersCountAr: "+22k طلب",
    ordersCountEn: "+22k orders",
    eta: "15 د",
    discountBadgeAr: "لحم طازج يومياً 🥩",
    discountBadgeEn: "Fresh Daily Meat 🥩",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=350&fit=crop",
  },
  {
    id: "brand-mamanoura",
    nameAr: "ماما نورة",
    nameEn: "Mama Noura",
    category: "shawarma",
    logoIcon: "🌯",
    logoImage: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=200&fit=crop&q=80",
    logoColor: "#D97706",
    avatarBg: "bg-amber-600",
    signatureDishAr: "صحن شاورما عربي دجاج مميز مع عصير طبقات طازج وفطائر",
    signatureDishEn: "Mama Noura Arabi Plate + Fresh Layered Cocktail",
    branchesAr: "+35 فرع بالرياض",
    branchesEn: "35+ Riyadh Branches",
    rating: 4.97,
    ordersCountAr: "+35k طلب",
    ordersCountEn: "+35k orders",
    eta: "15 د",
    discountBadgeAr: "أسطورة الشاورما 👑",
    discountBadgeEn: "Shawarma Legend 👑",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=350&fit=crop",
  },
  {
    id: "brand-dunkin",
    nameAr: "دانكن",
    nameEn: "Dunkin'",
    category: "cafe",
    logoIcon: "🍩",
    logoImage: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&h=200&fit=crop&q=80",
    logoColor: "#EC4899",
    avatarBg: "bg-pink-600",
    signatureDishAr: "بوكس 6 حبات دونات متنوعة + قهوة دانكن أوريجينال مثلجة",
    signatureDishEn: "6-Pack Assorted Donuts + Original Iced Coffee",
    branchesAr: "+600 فرع بالمملكة",
    branchesEn: "600+ KSA Branches",
    rating: 4.93,
    ordersCountAr: "+48k طلب",
    ordersCountEn: "+48k orders",
    eta: "10 د",
    discountBadgeAr: "القهوة والدونات ☕",
    discountBadgeEn: "Coffee & Donuts ☕",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&h=350&fit=crop",
  },
  {
    id: "brand-shawaya",
    nameAr: "شواية الخليج",
    nameEn: "Shawaya Al Khaleej",
    category: "traditional",
    logoIcon: "🍗",
    logoImage: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=200&h=200&fit=crop&q=80",
    logoColor: "#EA580C",
    avatarBg: "bg-orange-600",
    signatureDishAr: "نصف حبة دجاج شواية ذهبي مع أرز شعبي أحمر ومكسرات",
    signatureDishEn: "Half Rotisserie Chicken with Red Rice & Nuts",
    branchesAr: "+90 فرع بالمملكة",
    branchesEn: "90+ KSA Branches",
    rating: 4.88,
    ordersCountAr: "+26k طلب",
    ordersCountEn: "+26k orders",
    eta: "18 د",
    discountBadgeAr: "طعم الشواية الأصلي 🍗",
    discountBadgeEn: "Original Rotisserie 🍗",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&h=350&fit=crop",
  },
  {
    id: "brand-pizzahut",
    nameAr: "بيتزا هت",
    nameEn: "Pizza Hut",
    category: "pizza",
    logoIcon: "🍕",
    logoImage: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop&q=80",
    logoColor: "#DC2626",
    avatarBg: "bg-red-700",
    signatureDishAr: "بيتزا سوبريم ستافد كراست محشوة الأطراف بالجبن المذاب",
    signatureDishEn: "Stuffed Crust Supreme Pizza & Seasoned Wedges",
    branchesAr: "+220 فرع بالمملكة",
    branchesEn: "220+ KSA Branches",
    rating: 4.87,
    ordersCountAr: "+21k طلب",
    ordersCountEn: "+21k orders",
    eta: "20 د",
    discountBadgeAr: "ستافد كراست الشهيرة 🧀",
    discountBadgeEn: "Famous Stuffed Crust 🧀",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=350&fit=crop",
  },
  {
    id: "brand-starbucks",
    nameAr: "ستاربكس",
    nameEn: "Starbucks",
    category: "cafe",
    logoIcon: "☕",
    logoImage: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&h=200&fit=crop&q=80",
    logoColor: "#047857",
    avatarBg: "bg-emerald-800",
    signatureDishAr: "آيسد وايت موكا مع كراميل دريزل وكرواسون لوز فرنسي",
    signatureDishEn: "Iced White Chocolate Mocha & French Almond Croissant",
    branchesAr: "+400 فرع بالمملكة",
    branchesEn: "400+ KSA Branches",
    rating: 4.92,
    ordersCountAr: "+41k طلب",
    ordersCountEn: "+41k orders",
    eta: "12 د",
    discountBadgeAr: "القهوة العالمية ☕",
    discountBadgeEn: "Global Coffee ☕",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&h=350&fit=crop",
  },
  {
    id: "brand-fiveguys",
    nameAr: "فايف جايز",
    nameEn: "Five Guys",
    category: "burger",
    logoIcon: "🍔",
    logoImage: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=200&fit=crop&q=80",
    logoColor: "#991B1B",
    avatarBg: "bg-red-800",
    signatureDishAr: "دبل تشيز برجر مع إضافات غير محدودة وبطاطس كاجون",
    signatureDishEn: "Double Bacon Cheeseburger & Cajun Peanut Oil Fries",
    branchesAr: "+25 فرع بالمملكة",
    branchesEn: "25+ KSA Branches",
    rating: 4.95,
    ordersCountAr: "+18k طلب",
    ordersCountEn: "+18k orders",
    eta: "15 د",
    discountBadgeAr: "البرجر الأمريكي الطازج 🇺🇸",
    discountBadgeEn: "Fresh Artisan Burger 🇺🇸",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&h=350&fit=crop",
  },
  {
    id: "brand-timhortons",
    nameAr: "تيم هورتونز",
    nameEn: "Tim Hortons",
    category: "cafe",
    logoIcon: "☕",
    logoImage: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200&h=200&fit=crop&q=80",
    logoColor: "#B91C1C",
    avatarBg: "bg-red-700",
    signatureDishAr: "آيسد فرنش فانيلا الشهيرة مع علبة 10 حبات تمبتس",
    signatureDishEn: "Signature Iced French Vanilla & 10-Pack Timbits",
    branchesAr: "+120 فرع بالمملكة",
    branchesEn: "120+ KSA Branches",
    rating: 4.91,
    ordersCountAr: "+23k طلب",
    ordersCountEn: "+23k orders",
    eta: "10 د",
    discountBadgeAr: "كندا الأصلية 🍁",
    discountBadgeEn: "Canadian Original 🍁",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&h=350&fit=crop",
  },
  {
    id: "brand-krispykreme",
    nameAr: "كرسبي كريم",
    nameEn: "Krispy Kreme",
    category: "cafe",
    logoIcon: "🍩",
    logoImage: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=200&h=200&fit=crop&q=80",
    logoColor: "#059669",
    avatarBg: "bg-emerald-600",
    signatureDishAr: "دزينة أوريجينال جليزد الساخنة مع كابتشينو غني بالرغوة",
    signatureDishEn: "Dozen Hot Original Glazed Donuts + Frothy Cappuccino",
    branchesAr: "+190 فرع بالمملكة",
    branchesEn: "190+ KSA Branches",
    rating: 4.94,
    ordersCountAr: "+31k طلب",
    ordersCountEn: "+31k orders",
    eta: "10 د",
    discountBadgeAr: "تذوب بالفم 🍩",
    discountBadgeEn: "Melt in Mouth 🍩",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500&h=350&fit=crop",
  },
  {
    id: "brand-baytshawarma",
    nameAr: "بيت الشاورما",
    nameEn: "Bayt El Shawarma",
    category: "shawarma",
    logoIcon: "🌯",
    logoImage: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=200&fit=crop&q=80",
    logoColor: "#B45309",
    avatarBg: "bg-amber-700",
    signatureDishAr: "صحن عربي شاورما دجاج مميز مع حمص وبطاطا مقلية وصوصات خاصة",
    signatureDishEn: "Arabi Shawarma Platter with Hummus, Fries & Secret Dip",
    branchesAr: "+40 فرع بالمملكة",
    branchesEn: "40+ KSA Branches",
    rating: 4.93,
    ordersCountAr: "+33k طلب",
    ordersCountEn: "+33k orders",
    eta: "15 د",
    discountBadgeAr: "شاورما الملوك 🌯",
    discountBadgeEn: "Kings Shawarma 🌯",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=350&fit=crop",
  },
  {
    id: "brand-alnadeg",
    nameAr: "مطاعم الناضج",
    nameEn: "Al Nadeg",
    category: "traditional",
    logoIcon: "🍛",
    logoImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop&q=80",
    logoColor: "#991B1B",
    avatarBg: "bg-red-800",
    signatureDishAr: "مندي لحم حري طازج مع أرز شعبي مدخن وسلطات حارة",
    signatureDishEn: "Fresh Mandi Meat with Smoked Rice & Spicy Dips",
    branchesAr: "+55 فرع بالمملكة",
    branchesEn: "55+ KSA Branches",
    rating: 4.94,
    ordersCountAr: "+30k طلب",
    ordersCountEn: "+30k orders",
    eta: "20 د",
    discountBadgeAr: "مندي سعودي أصيل 🇸🇦",
    discountBadgeEn: "Authentic Mandi 🇸🇦",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&h=350&fit=crop",
  },
  {
    id: "brand-hashibasha",
    nameAr: "حاشي باشا",
    nameEn: "Hashi Basha",
    category: "traditional",
    logoIcon: "🍖",
    logoImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop&q=80",
    logoColor: "#78350F",
    avatarBg: "bg-amber-900",
    signatureDishAr: "مضغوط لحم حاشي بلدي طازج متبل بالبهارات السعودية الفاخرة",
    signatureDishEn: "Fresh Local Hashi Meat Madghout with Saudi Spices",
    branchesAr: "+110 فرع بالمملكة",
    branchesEn: "110+ KSA Branches",
    rating: 4.95,
    ordersCountAr: "+36k طلب",
    ordersCountEn: "+36k orders",
    eta: "20 د",
    discountBadgeAr: "مضغوط حاشي أصلي 🍖",
    discountBadgeEn: "Original Hashi 🍖",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=350&fit=crop",
  },
  {
    id: "brand-makihouse",
    nameAr: "ماكي هاوس",
    nameEn: "Maki House",
    category: "fastfood",
    logoIcon: "🍣",
    logoImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop&q=80",
    logoColor: "#0F766E",
    avatarBg: "bg-teal-700",
    signatureDishAr: "بوكس ماكي رول مشكل 16 قطعة + ديناميت شريمب بالصوص الحار",
    signatureDishEn: "16-pc Mixed Maki Platter + Hot Dynamite Shrimp",
    branchesAr: "+35 فرع بالمملكة",
    branchesEn: "35+ KSA Branches",
    rating: 4.92,
    ordersCountAr: "+22k طلب",
    ordersCountEn: "+22k orders",
    eta: "18 د",
    discountBadgeAr: "سوشي ياباني فاخر 🍣",
    discountBadgeEn: "Premium Sushi 🍣",
    verifiedBadgeAr: "علامة موثقة 100%",
    verifiedBadgeEn: "100% Verified",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&h=350&fit=crop",
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

export interface PreviewDish {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  oldPrice?: number;
  rating: number;
  image: string;
  restaurantId?: string;
  restaurantAr?: string;
  restaurantEn?: string;
  cuisineAr?: string;
  cuisineEn?: string;
  badgeAr?: string;
  badgeEn?: string;
  ordersCount?: string;
  ordersCountEn?: string;
  eta?: string;
  calories?: number;
  protein?: number;
  prepTime?: string;
  category?: string;
}

export function CustomerApp({ isEmbedded = false }: CustomerAppProps) {
  const { lang, t, setLang } = useI18n();
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedLocId, setSelectedLocId] = useState("loc-c1");
  const [localityRegion, setLocalityRegion] = useState<string>("all");
  const [localityStatusFilter, setLocalityStatusFilter] = useState<"all" | "available" | "unavailable">("all");
  const [localityQuery, setLocalityQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [brandCategory, setBrandCategory] = useState("all");
  const [brandReelIndex, setBrandReelIndex] = useState(0);
  const [isBrandReelPaused, setIsBrandReelPaused] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("brand-albaik");
  const [likedDishes, setLikedDishes] = useState<Record<string, boolean>>({});
  const [showAllLocalities, setShowAllLocalities] = useState(false);
  const [phoneOrEmailInput, setPhoneOrEmailInput] = useState("");
  const [sendType, setSendType] = useState<"phone" | "email">("phone");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isSimulatingDelivery, setIsSimulatingDelivery] = useState(false);
  const [previewDish, setPreviewDish] = useState<PreviewDish | null>(null);

  // Auto-rotating timer for famous KSA restaurants circular carousel
  useEffect(() => {
    if (isBrandReelPaused) return;
    const timer = setInterval(() => {
      setBrandReelIndex((prev) => (prev + 1) % FAMOUS_KSA_RESTAURANTS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isBrandReelPaused]);

  const nextBrandSlide = () => {
    sounds.playClick();
    setBrandReelIndex((prev) => (prev + 1) % FAMOUS_KSA_RESTAURANTS.length);
  };

  const prevBrandSlide = () => {
    sounds.playClick();
    setBrandReelIndex((prev) => (prev - 1 + FAMOUS_KSA_RESTAURANTS.length) % FAMOUS_KSA_RESTAURANTS.length);
  };

  // Auto-rotating timer for popular meals carousel
  useEffect(() => {
    if (isCarouselPaused) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % POPULAR_ROTATING_MEALS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isCarouselPaused]);

  const nextCarouselSlide = () => {
    sounds.playClick();
    setCarouselIndex((prev) => (prev + 1) % POPULAR_ROTATING_MEALS.length);
  };

  const prevCarouselSlide = () => {
    sounds.playClick();
    setCarouselIndex((prev) => (prev - 1 + POPULAR_ROTATING_MEALS.length) % POPULAR_ROTATING_MEALS.length);
  };

  const currentLoc = RIYADH_LOCALITIES.find((l) => l.id === selectedLocId) ?? RIYADH_LOCALITIES[0];
  const activeLocation = lang === "ar" ? `الرياض • ${currentLoc?.nameAr ?? ""}` : `Riyadh • ${currentLoc?.nameEn ?? ""}`;

  const toggleLike = (id: string) => {
    sounds.playClick();
    setLikedDishes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleViewDish = (dish: PreviewDish) => {
    sounds.playClick();
    setPreviewDish(dish);
  };

  const handleExploreBrand = (brand: FamousKsaRestaurant) => {
    sounds.playClick();
    setSelectedBrandId(brand.id);
    toast.info(
      lang === "ar"
        ? `✨ استعراض أطباق وفروع ${brand.nameAr} (${brand.branchesAr})`
        : `✨ Browsing dishes and branches for ${brand.nameEn} (${brand.branchesEn})`
    );
  };

  const handleSimulateDelivery = () => {
    sounds.playClick();
    setIsSimulatingDelivery(true);
    sounds.playNewOrder();
    setTimeout(() => {
      sounds.playSuccess();
      toast.success(
        lang === "ar"
          ? "🛵 كابتن FoodHub سلّم الوجبة بنجاح من الشنطة الحرارية إلى العميل! بالهناء والعافية ✨"
          : "🛵 FoodHub Courier successfully delivered the meal fresh from the thermal bag! Enjoy your meal ✨"
      );
      setIsSimulatingDelivery(false);
    }, 1800);
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

  const availableLocalitiesCount = RIYADH_LOCALITIES.filter((l) => l.isAvailable).length;
  const unavailableLocalitiesCount = RIYADH_LOCALITIES.filter((l) => !l.isAvailable).length;

  const filteredLocalities = RIYADH_LOCALITIES.filter((loc) => {
    const matchReg = localityRegion === "all" || loc.region === localityRegion;
    const matchStatus =
      localityStatusFilter === "all" ||
      (localityStatusFilter === "available" && loc.isAvailable) ||
      (localityStatusFilter === "unavailable" && !loc.isAvailable);
    const q = localityQuery.trim().toLowerCase();
    const matchQ =
      !q ||
      loc.nameAr.toLowerCase().includes(q) ||
      loc.nameEn.toLowerCase().includes(q) ||
      loc.tagAr.toLowerCase().includes(q) ||
      loc.tagEn.toLowerCase().includes(q);
    return matchReg && matchStatus && matchQ;
  });

  const isFilteringActive = localityQuery.trim() !== "" || localityRegion !== "all" || localityStatusFilter !== "all";
  const visibleLocalities = showAllLocalities || isFilteringActive ? filteredLocalities : filteredLocalities.slice(0, 12);

  const filteredFamousBrands = FAMOUS_KSA_RESTAURANTS.filter(
    (b) => brandCategory === "all" || b.category === brandCategory
  );

  const renderBrandCard = (brand: FamousKsaRestaurant) => (
    <div
      key={brand.id}
      className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
    >
      {/* Photo & Floating Circular Logo Avatar Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={brand.image}
          alt={brand.nameEn}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Feature / Discount Badge */}
        <span className="absolute top-3 end-3 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-lg">
          {lang === "ar" ? brand.discountBadgeAr : brand.discountBadgeEn}
        </span>

        {/* Circular Floating Brand Logo Avatar */}
        <div className="absolute -bottom-3 start-4 flex items-center gap-2.5">
          <div
            className={`flex size-14 items-center justify-center rounded-full text-2xl shadow-xl border-2 border-amber-400 ring-4 ring-slate-950 overflow-hidden ${brand.avatarBg}`}
          >
            {brand.logoImage ? (
              <img
                src={brand.logoImage}
                alt={brand.nameEn}
                className="size-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span>{brand.logoIcon}</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/90 border border-slate-700/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-md shadow-md">
            <span>✓</span>
            <span>{lang === "ar" ? brand.verifiedBadgeAr : brand.verifiedBadgeEn}</span>
          </span>
        </div>
      </div>

      {/* Brand Card Content */}
      <div className="p-4 pt-5 flex flex-col justify-between flex-1 gap-3.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors truncate">
              {lang === "ar" ? brand.nameAr : brand.nameEn}
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
              {lang === "ar" ? brand.branchesAr : brand.branchesEn}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            <span className="text-amber-400 font-bold">🍽️ {lang === "ar" ? "الطبق الأشهر:" : "Signature:"}</span>{" "}
            {lang === "ar" ? brand.signatureDishAr : brand.signatureDishEn}
          </p>
        </div>

        {/* Key Metrics Row */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-slate-300 font-medium">
            <Clock className="size-3.5 text-amber-400" />
            <span>{brand.eta}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span>{brand.rating}</span>
            <span className="text-[10px] text-slate-500 font-normal">
              ({lang === "ar" ? brand.ordersCountAr : brand.ordersCountEn})
            </span>
          </div>
        </div>

        {/* Explore Button */}
        <Button
          size="sm"
          onClick={() => handleExploreBrand(brand)}
          className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-100 font-bold rounded-xl text-xs gap-1.5 shadow-md h-9 transition-all"
        >
          <Store className="size-3.5" />
          <span>{lang === "ar" ? "تصفح منيو المطعم" : "Browse Menu"}</span>
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 ${isEmbedded ? "text-sm" : ""}`}>
      {/* ============================================================ */}
      {/* 1. ZOMATO ICONIC HERO SECTION WITH DUAL SEARCH & LOCATION */}
      {/* ============================================================ */}
      <section className="relative isolate overflow-hidden bg-slate-950 border-b border-slate-800 min-h-[340px] sm:min-h-[460px] lg:min-h-[560px] flex items-center">
        {/* Cinematic FOODHUB delivery rider background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={riderFrameImage}
            alt="FoodHub Delivery Courier"
            className="size-full object-cover object-center opacity-65 filter brightness-95 contrast-105"
          />
          {deliveryHeroVideo?.url && (
            <video
              className="absolute inset-0 size-full object-cover object-center"
              poster={riderFrameImage}
              autoPlay
              muted
              loop
              playsInline
              controls={false}

              disablePictureInPicture
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              ref={(el) => {
                if (!el) return;
                el.muted = true;
                el.defaultMuted = true;
                const tryPlay = () => {
                  const p = el.play();
                  if (p && typeof p.catch === "function") p.catch(() => undefined);
                };
                tryPlay();
                el.addEventListener("loadeddata", tryPlay, { once: true });
                el.addEventListener("canplay", tryPlay, { once: true });
              }}
            >
              <source src={deliveryHeroVideo.url} type="video/webm" />
              <source src={deliveryHeroVideoMp4.url} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/45 to-slate-950/90" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full mx-auto max-w-5xl px-4 py-16 sm:py-24 flex flex-col items-center text-center space-y-4">
          {/* Brand Logo */}
          <div className="flex flex-col items-center">
            <FoodHubLogo size={64} showText />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FOODHUB EXCLUSIVE PLATFORM FEATURES (مميزات المنصة) */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-10 w-full space-y-6">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-500 dark:text-amber-400 shadow-sm">
            <Sparkles className="size-3.5" />
            <span>{lang === "ar" ? "مميزات منصة FOODHUB الحصرية" : "Exclusive FOODHUB Platform Features"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 dark:text-white">
            {lang === "ar" ? (
              <>
                مميزات فريدة تجعل تجربة طعامك{" "}
                <span className="text-amber-500">أسرع، ألذ، وأوفر</span>
              </>
            ) : (
              <>
                Unique Features for a{" "}
                <span className="text-amber-500">Faster, Tastier, Smarter</span> Dining Experience
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {lang === "ar"
              ? "منظومة توصيل ذكية تجمع بين المطاعم العالمية والمطابخ السحابية بأعلى معايير الجودة والسرعة."
              : "Smart delivery infrastructure unifying world-class restaurants, cloud kitchens and healthy gourmet."}
          </p>
        </div>

        {/* 3 Upgraded Feature Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FOODHUB_PLATFORM_FEATURES.map((feature) => (
            <div
              key={feature.id}
              onClick={() => {
                sounds.playClick();
                if (feature.id === "healthy") {
                  setSelectedCat("healthy");
                  toast.info(lang === "ar" ? "🥗 تم تفعيل تصنيف الوجبات الصحية والدايت" : "🥗 Filtered to Healthy & Diet Meals");
                } else if (feature.id === "online") {
                  setSelectedCat("all");
                  toast.info(lang === "ar" ? "🛵 تصفح جميع الوجبات الجاهزة للتوصيل الفوري" : "🛵 Browsing all instant delivery meals");
                } else if (feature.id === "dining") {
                  toast.info(lang === "ar" ? "🏪 تصفح أفضل المطاعم والمطابخ المعتمدة" : "🏪 Exploring certified restaurants & cloud kitchens");
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
            >
              {/* Photo Header Container with Badges */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950">
                <img
                  src={feature.image}
                  alt={feature.titleEn}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                
                {/* Floating Top Badges */}
                <div className="absolute top-3 start-3 end-3 flex items-center justify-between pointer-events-none">
                  <span className="rounded-full bg-slate-950/90 border border-slate-700/80 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                    {lang === "ar" ? feature.badgeAr : feature.badgeEn}
                  </span>
                  <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-black text-slate-950 shadow-md">
                    {lang === "ar" ? feature.tagAr : feature.tagEn}
                  </span>
                </div>
              </div>

              {/* Feature Body Content */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4 bg-white dark:bg-slate-900">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{feature.icon}</span>
                    <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                      {lang === "ar" ? feature.titleAr : feature.titleEn}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {lang === "ar" ? feature.descAr : feature.descEn}
                  </p>
                </div>

                {/* Sub-features Checklist */}
                <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-3 text-xs">
                  {(lang === "ar" ? feature.bulletsAr : feature.bulletsEn).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">✓</span>
                      <span className="text-[11px] leading-snug">{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Stat Highlight Pill */}
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <span>{lang === "ar" ? feature.statAr : feature.statEn}</span>
                </div>

                {/* Action CTA Button */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs font-bold text-slate-900 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  <span>{lang === "ar" ? feature.linkTextAr : feature.linkTextEn}</span>
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
      {/* 3. LIVE ROTATING POPULAR MEALS FROM ALL RESTAURANTS (تدوير وجبات المطاعم الأكثر إقبالاً) */}
      {/* ============================================================ */}
      <section 
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        className="mx-auto max-w-6xl px-4 py-10 w-full space-y-6"
      >
        {/* Section Header with Carousel Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-500 dark:text-amber-400">
              <Flame className="size-3.5 text-amber-500 animate-pulse" />
              <span>{lang === "ar" ? "الأكثر إقبالاً وطلباً • تدوير حي مستمر" : "Most Popular & Trending • Live Rotating"}</span>
              <span className="flex size-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2">
              <span>{lang === "ar" ? "أكثر الوجبات إقبالاً من كافة المطابخ والمطاعم" : "Most Popular Meals Across All Restaurants"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {lang === "ar"
                ? "أشهى الأطباق الأكثر طلباً وتقييماً في الرياض (برجر، مشويات، بيتزا، كبسة، شاورما، أكلات بحرية، ودايت صحي) مع إمكانية الإضافة الفورية للسلة."
                : "Top-rated and most-ordered dishes across Riyadh (Burgers, Grills, Pizza, Kabsa, Shawarma, Seafood & Diet) ready to order."}
            </p>
          </div>

          {/* Carousel Navigation Arrows & Auto-play indicator */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-end">
            <button
              type="button"
              aria-label={isCarouselPaused ? "تشغيل التدوير التلقائي" : "إيقاف التدوير مؤقتاً"}
              onClick={() => setIsCarouselPaused(!isCarouselPaused)}
              className="flex size-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-slate-700 transition-colors"
              title={isCarouselPaused ? "تشغيل التدوير التلقائي" : "إيقاف التدوير"}
            >
              {isCarouselPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
            <button
              type="button"
              aria-label="السابق"
              onClick={prevCarouselSlide}
              className="flex size-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all shadow-md active:scale-90"
            >
              <ChevronRight className={`size-4 ${lang === "ar" ? "" : "rotate-180"}`} />
            </button>
            <button
              type="button"
              aria-label="التالي"
              onClick={nextCarouselSlide}
              className="flex size-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-white hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all shadow-md active:scale-90"
            >
              <ChevronLeft className={`size-4 ${lang === "ar" ? "" : "rotate-180"}`} />
            </button>
          </div>
        </div>

        {/* Live Rotating Cards Slider */}
        <div className="overflow-hidden rounded-3xl p-1">
          <div 
            className="flex transition-transform duration-700 ease-out gap-4"
            style={{
              transform: `translateX(${lang === "ar" ? "" : "-"}${carouselIndex * 100}%)`,
            }}
          >
            {/* We map chunks or single slides */}
          </div>

          {/* Desktop & Mobile Responsive Multi-Card Carousel Window */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((offset) => {
              const itemIdx = (carouselIndex + offset) % POPULAR_ROTATING_MEALS.length;
              const meal = POPULAR_ROTATING_MEALS[itemIdx];
              if (!meal) return null;
              return (
                <div
                  key={`${meal.id}-${itemIdx}`}
                  onClick={() => handleViewDish(meal)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10 animate-in fade-in zoom-in-95 cursor-pointer"
                >
                  {/* Photo Header Container */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                    <img
                      src={meal.image}
                      alt={meal.nameEn}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Deep contrast gradient overlay for crisp white text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
                    
                    {/* Floating Top Badges */}
                    <div className="absolute top-3 start-3 end-3 flex items-center justify-between">
                      <span className="rounded-full bg-slate-950/90 border border-slate-700/90 px-2.5 py-1 text-[11px] font-bold text-amber-300 shadow-md backdrop-blur-md">
                        {lang === "ar" ? meal.cuisineAr : meal.cuisineEn}
                      </span>
                      <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-slate-950 shadow-md">
                        {lang === "ar" ? meal.badgeAr : meal.badgeEn}
                      </span>
                    </div>

                    {/* Bottom overlay text on image */}
                    <div className="absolute bottom-2.5 start-3 end-3 space-y-0.5 pointer-events-none">
                      <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Store className="size-3 text-amber-400" />
                        <span>{lang === "ar" ? meal.restaurantAr : meal.restaurantEn}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-1 drop-shadow-md">
                        {lang === "ar" ? meal.nameAr : meal.nameEn}
                      </h3>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3 bg-white dark:bg-slate-900">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-2">
                      {lang === "ar" ? meal.descAr : meal.descEn}
                    </p>

                    {/* Quick Stats: Rating, Orders, ETA */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>{meal.rating}</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{lang === "ar" ? meal.ordersCount : meal.ordersCountEn}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-500 font-bold">⚡ {meal.eta}</span>
                    </div>

                    {/* Price & View Dish Footer */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="text-sm sm:text-base font-black text-slate-950 dark:text-amber-400">
                          {meal.price} <span className="text-xs">{t("sar")}</span>
                        </div>
                        {meal.oldPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {meal.oldPrice} {t("sar")}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDish(meal);
                        }}
                        className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold text-xs h-9 px-3.5 rounded-xl gap-1.5 border border-amber-500/30 shadow-md transition-all active:scale-95"
                      >
                        <Eye className="size-3.5" />
                        <span>{lang === "ar" ? "استعراض الطبق" : "View Dish"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {POPULAR_ROTATING_MEALS.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              aria-label={`انتقل للوجبة ${dotIdx + 1}`}
              onClick={() => {
                sounds.playClick();
                setCarouselIndex(dotIdx);
              }}
              className={`h-2 rounded-full transition-all duration-500 ${
                carouselIndex === dotIdx
                  ? "w-8 bg-amber-500 shadow-md shadow-amber-500/50"
                  : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ALL RIYADH DISTRICTS & REAL-TIME AVAILABILITY STATUS (🟢 / 🔴) */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-6">
        {/* Section Header with live delivery coverage badges & counter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === "ar" ? "تغطية حية لكافة أحياء الرياض" : "Live Coverage Across All Riyadh Districts"}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                <span>
                  {lang === "ar"
                    ? `🟢 ${availableLocalitiesCount} حي متاح للتوصيل • 🔴 ${unavailableLocalitiesCount} أحياء قيد التوسع`
                    : `🟢 ${availableLocalitiesCount} Available • 🔴 ${unavailableLocalitiesCount} Expanding Soon`}
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
              {lang === "ar" ? (
                <>
                  حالة تغطية وتوفر التطبيق في كافة أحياء{" "}
                  <span className="text-amber-400">الرياض</span>
                </>
              ) : (
                <>
                  Delivery Coverage & Availability Across{" "}
                  <span className="text-amber-400">Riyadh</span>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
              {lang === "ar"
                ? "تصفح حالة التغطية لجميع أحياء ومناطق الرياض — النقطة الخضراء (🟢) تعني أن التطبيق متاح للطلب والتوصيل الفوري، والنقطة الحمراء (🔴) تعني منطقة خارج التغطية حالياً وجاري التوسع بها قريباً."
                : "Explore live delivery availability across all Riyadh neighborhoods — Green dot (🟢) indicates the app is active for instant delivery, Red dot (🔴) indicates upcoming rollout areas."}
            </p>
          </div>
        </div>

        {/* Status Guide / Legend Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/90 text-xs">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            </span>
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>{lang === "ar" ? "نقطة خضراء (🟢) متاح للتوصيل" : "Green Dot (🟢) Available"}</span>
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-300">
                  {availableLocalitiesCount} {lang === "ar" ? "حي" : "districts"}
                </span>
              </div>
              <div className="text-[11px] text-emerald-400/80 font-medium">
                {lang === "ar" ? "الطلب والتوصيل الفوري نشط وشغال 100%" : "Instant ordering & radar couriers active"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 shadow-sm shadow-rose-500/50"></span>
            </span>
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <span>{lang === "ar" ? "نقطة حمراء (🔴) غير متاح حالياً" : "Red Dot (🔴) Unavailable"}</span>
                <span className="rounded-md bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-extrabold text-rose-300">
                  {unavailableLocalitiesCount} {lang === "ar" ? "أحياء" : "districts"}
                </span>
              </div>
              <div className="text-[11px] text-rose-400/80 font-medium">
                {lang === "ar" ? "خارج النطاق حالياً - جاري التوسع وتجهيز المطابخ" : "Out of range currently - expansion in progress"}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-300">
            <div className="space-y-0.5">
              <div className="font-bold text-amber-400">
                {lang === "ar" ? "⚡ سرعة التوصيل بالأحياء المتاحة" : "⚡ ETA in Available Districts"}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === "ar" ? "15-20 دقيقة عبر أسطول الكباتن الراداري" : "15-20 mins via radar delivery fleet"}
              </div>
            </div>
            <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-1 text-xs font-black text-amber-400">
              15-20 د
            </span>
          </div>
        </div>

        {/* Search Input for localities */}
        <div className="relative w-full">
          <Search className={`absolute top-1/2 -translate-y-1/2 size-4 text-slate-400 ${lang === "ar" ? "right-3.5" : "left-3.5"}`} />
          <input
            type="text"
            value={localityQuery}
            onChange={(e) => setLocalityQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "🔍 ابحث باسم أي حي في الرياض للتحقق من حالة التوفر (مثال: حطين، العليا، الروضة، الدرعية، السويدي، بنبان)..."
                : "🔍 Search any Riyadh neighborhood to check availability (e.g. Hittin, Olaya, Rawdah, Diriyah, Suwaidi, Banban)..."
            }
            className={`w-full rounded-2xl border border-slate-800 bg-slate-900/90 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner transition-all ${
              lang === "ar" ? "pr-10 pl-9" : "pl-10 pr-9"
            }`}
          />
          {localityQuery && (
            <button
              type="button"
              aria-label="مسح البحث"
              onClick={() => setLocalityQuery("")}
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white ${lang === "ar" ? "left-3" : "right-3"}`}
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Dual Filter Bars: Status & Region Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Availability Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 shrink-0">
            {AVAILABILITY_FILTERS.map((af) => {
              const isSelected = localityStatusFilter === af.id;
              const count =
                af.id === "all"
                  ? RIYADH_LOCALITIES.length
                  : af.id === "available"
                  ? availableLocalitiesCount
                  : unavailableLocalitiesCount;
              return (
                <button
                  key={af.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setLocalityStatusFilter(af.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span>{af.icon}</span>
                  <span>{lang === "ar" ? af.labelAr : af.labelEn}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Region Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                  className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-slate-800 border border-amber-500/80 text-amber-400 shadow-sm"
                      : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <span>{rf.icon}</span>
                  <span>{lang === "ar" ? rf.labelAr : rf.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Localities Cards Grid */}
        {filteredLocalities.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-slate-800 bg-slate-900/50 space-y-3">
            <p className="text-sm sm:text-base font-bold text-slate-300">
              {lang === "ar" ? `لم يتم العثور على أحياء مطابقة لـ "${localityQuery}"` : `No matching neighborhoods found for "${localityQuery}"`}
            </p>
            <p className="text-xs text-slate-500">
              {lang === "ar" ? "جرب البحث باسم حي آخر أو أعد تعيين الفلاتر" : "Try searching another district name or reset filters"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sounds.playClick();
                setLocalityQuery("");
                setLocalityRegion("all");
                setLocalityStatusFilter("all");
              }}
              className="text-xs border-slate-700 text-amber-400 hover:bg-slate-800 rounded-xl"
            >
              {lang === "ar" ? "إعادة تعيين كافة الفلاتر" : "Reset all filters"}
            </Button>
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleLocalities.map((loc) => {
              const isSelected = selectedLocId === loc.id;
              const isAvail = loc.isAvailable;

              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    sounds.playClick();
                    if (isAvail) {
                      setSelectedLocId(loc.id);
                      toast.success(
                        lang === "ar"
                          ? `📍 تم تحديد حي "${loc.nameAr}" كوجهة طلب نشطة (التوصيل متاح 🟢)!`
                          : `📍 "${loc.nameEn}" selected as active delivery destination (Available 🟢)!`
                      );
                    } else {
                      toast.info(
                        lang === "ar"
                          ? `🔔 حي "${loc.nameAr}" غير متاح حالياً 🔴 - تم تسجيل اهتمامك وسنخبرك فور تدشين التغطية!`
                          : `🔔 "${loc.nameEn}" is currently unavailable 🔴 - Demand registered for rollout!`
                      );
                    }
                  }}
                  className={`group cursor-pointer relative overflow-hidden flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? "border-amber-500 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30"
                      : isAvail
                      ? "border-slate-800/90 bg-slate-900/80 hover:border-emerald-500/60 hover:bg-slate-900 hover:shadow-lg hover:shadow-emerald-500/10"
                      : "border-slate-800/60 bg-slate-900/40 opacity-90 hover:opacity-100 hover:border-rose-500/50 hover:bg-slate-900/70"
                  }`}
                >
                  {/* Top Row: Icon + Tag & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/60 text-base shadow-sm group-hover:scale-110 transition-transform">
                        {loc.icon}
                      </span>
                      <span className="rounded-lg bg-slate-800/70 border border-slate-700/50 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        {lang === "ar" ? loc.tagAr : loc.tagEn}
                      </span>
                    </div>

                    {/* Status Pill on Card */}
                    {isSelected ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 shadow-sm">
                        <Check className="size-3" />
                        {lang === "ar" ? "الحي النشط" : "Active"}
                      </span>
                    ) : isAvail ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-[10px] px-2.5 py-0.5">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {lang === "ar" ? "متاح للطلب" : "Available"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 font-bold text-[10px] px-2.5 py-0.5">
                        <span className="size-1.5 rounded-full bg-rose-500" />
                        {lang === "ar" ? "غير متاح - قريباً" : "Unavailable"}
                      </span>
                    )}
                  </div>

                  {/* Locality Name with Green/Red Indicator Dot */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2">
                      {/* Live Status Indicator Dot beside Neighborhood Name */}
                      {isAvail ? (
                        <span
                          className="relative flex h-3 w-3 shrink-0"
                          title={lang === "ar" ? "متاح للتوصيل في هذا الحي 🟢" : "Available for delivery 🟢"}
                        >
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                        </span>
                      ) : (
                        <span
                          className="relative flex h-3 w-3 shrink-0"
                          title={lang === "ar" ? "غير متاح حالياً في هذا الحي 🔴" : "Unavailable currently 🔴"}
                        >
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                        </span>
                      )}

                      <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors">
                        {lang === "ar" ? loc.nameAr : loc.nameEn}
                      </h3>
                    </div>

                    {/* Meta info depending on availability */}
                    {isAvail ? (
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-slate-300 font-medium">
                          <Store className="size-3.5 text-amber-400" />
                          {loc.places} {lang === "ar" ? "مطبخ ومتجر" : "places"}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Zap className="size-3.5" />
                          {loc.eta}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {loc.rating}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 pt-1 flex items-center justify-between">
                        <span className="text-rose-400/90 font-medium text-[11px] line-clamp-1">
                          ⏳ {lang === "ar" ? (loc.statusNoteAr || "جاري التوسع وتجهيز المطابخ") : (loc.statusNoteEn || "Expansion in progress")}
                        </span>
                        <span className="text-rose-400 font-bold text-[11px] shrink-0">
                          {lang === "ar" ? "خارج النطاق" : "Out of range"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Button / Hint */}
                  <div className="flex items-center justify-between border-t border-slate-800/70 pt-2.5 text-[11px] transition-colors">
                    {isAvail ? (
                      <>
                        <span className="font-semibold text-slate-400 group-hover:text-emerald-400 flex items-center gap-1">
                          <MapPin className="size-3 text-emerald-400" />
                          {lang === "ar" ? "تصفح مطابخ الحي المتاحة" : "Explore available kitchens"}
                        </span>
                        <ChevronRight
                          className={`size-4 text-slate-400 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1 ${
                            lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""
                          }`}
                        />
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-rose-400/90 group-hover:text-rose-300 flex items-center gap-1">
                          <Bell className="size-3 text-rose-400" />
                          {lang === "ar" ? "أعلمني فور توفر التطبيق بالحي" : "Notify me upon launch"}
                        </span>
                        <ChevronRight
                          className={`size-4 text-rose-400/70 group-hover:text-rose-300 transition-transform group-hover:translate-x-1 ${
                            lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""
                          }`}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toggle Show More Localities */}
        {!isFilteringActive && filteredLocalities.length > 12 && (
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
                    ? `عرض كافة أحياء الرياض (${filteredLocalities.length} حي)`
                    : `Show all Riyadh districts (${filteredLocalities.length} districts)`}
                </>
              )}
            </Button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 5. FAMOUS KSA RESTAURANTS ROTATING CIRCULAR LOGOS CAROUSEL */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-6">
        {/* Header with Title and Rotation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400">
              <Sparkles className="size-3.5 animate-spin" />
              <span>
                {lang === "ar"
                  ? "لوجو المطاعم المشهورة في المملكة جنباً إلى جنب • دوران دائري حي"
                  : "Famous KSA Restaurant Brands Side-by-Side • Live Circular Reel"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center gap-2.5">
              <span>
                {lang === "ar"
                  ? "أشهر مطاعم المملكة جنباً إلى جنب"
                  : "Famous KSA Restaurant Brands"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {lang === "ar"
                ? "لوجو أشهر سلاسل المطابخ والمطاعم المعتمدة في المملكة تدور في شكل دائري حي مع تصفح فوري لأفضل أطباقها وفروعها"
                : "Iconic restaurant brand logos rotating in a continuous circular reel with instant menu & branch exploration"}
            </p>
          </div>

          {/* Reel Navigation & Play/Pause Controls */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                sounds.playClick();
                setIsBrandReelPaused((prev) => !prev);
              }}
              className="border-slate-700 bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl text-xs gap-1.5 h-9"
            >
              {isBrandReelPaused ? (
                <>
                  <Play className="size-3.5 text-emerald-400 fill-emerald-400" />
                  <span>{lang === "ar" ? "تشغيل الدوران" : "Play Reel"}</span>
                </>
              ) : (
                <>
                  <Pause className="size-3.5 text-amber-400 fill-amber-400" />
                  <span>{lang === "ar" ? "إيقاف مؤقت" : "Pause"}</span>
                </>
              )}
            </Button>

            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={prevBrandSlide}
                className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title={lang === "ar" ? "السابق" : "Previous"}
              >
                {lang === "ar" ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
              </button>
              <button
                type="button"
                onClick={nextBrandSlide}
                className="size-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title={lang === "ar" ? "التالي" : "Next"}
              >
                {lang === "ar" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 1. THE CIRCULAR ROTATING LOGO STRIP (Logos Side-by-Side in Circular Format) */}
        <div
          className="relative rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 p-4 sm:p-5 shadow-2xl overflow-hidden"
          onMouseEnter={() => setIsBrandReelPaused(true)}
          onMouseLeave={() => setIsBrandReelPaused(false)}
        >
          {/* Subtle ambient decorative lighting */}
          <div className="absolute -top-12 -left-12 size-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 size-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-slate-300">
                {lang === "ar"
                  ? `شريط اللوجوهات الدائري المباشر (${FAMOUS_KSA_RESTAURANTS.length} علامة تجارية):`
                  : `Live Circular Brand Logos (${FAMOUS_KSA_RESTAURANTS.length} Brands):`}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              {brandReelIndex + 1} / {FAMOUS_KSA_RESTAURANTS.length}
            </span>
          </div>

          {/* Scrolling Circular Badges Row */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-2 px-1 scrollbar-none snap-x">
            {FAMOUS_KSA_RESTAURANTS.map((brand, idx) => {
              const isActive = idx === brandReelIndex;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setBrandReelIndex(idx);
                    setSelectedBrandId(brand.id);
                  }}
                  className={`group/logo flex flex-col items-center gap-2 shrink-0 transition-all duration-300 snap-center focus:outline-none ${
                    isActive ? "scale-110" : "opacity-75 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  {/* Circular Logo Container */}
                  <div className="relative">
                    <div
                      className={`flex size-14 sm:size-18 md:size-20 items-center justify-center rounded-full text-2xl sm:text-3xl shadow-xl transition-all duration-300 border-2 overflow-hidden ${
                        isActive
                          ? "border-amber-400 ring-4 ring-amber-400/40 shadow-amber-500/30"
                          : "border-slate-700 bg-slate-800/90 hover:border-amber-500/50"
                      } ${brand.avatarBg}`}
                    >
                      {brand.logoImage ? (
                        <img
                          src={brand.logoImage}
                          alt={brand.nameEn}
                          className="size-full object-cover rounded-full transition-transform duration-300 group-hover/logo:scale-110"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span>{brand.logoIcon}</span>
                      )}
                    </div>

                    {/* Verified Gold Checkmark Badge */}
                    <span className="absolute -bottom-1 -end-1 flex size-5 sm:size-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-[10px] sm:text-xs shadow-md border-2 border-slate-950">
                      ✓
                    </span>
                  </div>

                  {/* Brand Name Text */}
                  <span
                    className={`text-[11px] sm:text-xs font-black truncate max-w-[80px] sm:max-w-[90px] text-center transition-colors ${
                      isActive ? "text-amber-400 font-black" : "text-slate-300 group-hover/logo:text-white"
                    }`}
                  >
                    {lang === "ar" ? brand.nameAr : brand.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Category Filter Pills for Brand Showcase */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FAMOUS_BRAND_CATEGORIES.map((cat) => {
            const isSelected = brandCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setBrandCategory(cat.id);
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

        {/* 3. Featured Rotating Brand Cards Grid (Circular Window of 4 Brands or Filtered Selection) */}
        <div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          onMouseEnter={() => setIsBrandReelPaused(true)}
          onMouseLeave={() => setIsBrandReelPaused(false)}
        >
          {(() => {
            // When filtering by specific category, show all matched brands
            if (brandCategory !== "all") {
              return filteredFamousBrands.map((b) => renderBrandCard(b));
            }
            // When showing "all", show a circular rotating window of 4 cards starting at brandReelIndex
            const displayCount = Math.min(4, FAMOUS_KSA_RESTAURANTS.length);
            const cards = [];
            for (let i = 0; i < displayCount; i++) {
              const brandIndex = (brandReelIndex + i) % FAMOUS_KSA_RESTAURANTS.length;
              const brand = FAMOUS_KSA_RESTAURANTS[brandIndex];
              if (brand) cards.push(brand);
            }
            return cards.map((b) => renderBrandCard(b));
          })()}
        </div>

        {/* 4. 16-Brand Circular Indicator Dots */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {FAMOUS_KSA_RESTAURANTS.map((brand, idx) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => {
                sounds.playClick();
                setBrandReelIndex(idx);
                setSelectedBrandId(brand.id);
              }}
              className={`transition-all rounded-full flex items-center justify-center ${
                brandReelIndex === idx
                  ? "w-8 h-3 bg-amber-500 shadow-md shadow-amber-500/30"
                  : "size-3 bg-slate-800 hover:bg-slate-700"
              }`}
              title={lang === "ar" ? brand.nameAr : brand.nameEn}
            />
          ))}
        </div>

        {/* ============================================================ */}
        {/* 5. SMART DOOR-TO-DOOR COURIER DELIVERY HANDOVER SHOWCASE */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Subtle Ambient Lighting Effects */}
          <div className="absolute -top-16 -right-16 size-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-56 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Fleet Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 text-xl font-bold shadow-lg shadow-amber-500/20">
                🛵
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>
                    {lang === "ar"
                      ? "أسطول كباتن FoodHub المعتمد • توصيل راداري ذكي"
                      : "Certified FoodHub Fleet • Smart Radar Delivery"}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {lang === "ar"
                    ? "تسليم فوري لباب منزلك مع شنطة FoodHub الحرارية الذكية"
                    : "Door-to-Door Delivery with FoodHub Smart Thermal Bag"}
                </h3>
              </div>
            </div>

            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/90 border border-slate-700 px-3.5 py-1 text-xs font-bold text-emerald-400 self-start sm:self-auto">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>{lang === "ar" ? "الكابتن جاهز للتوصيل الفوري" : "Couriers Active Nearby"}</span>
            </div>
          </div>

          {/* THE HERO DELIVERY HANDOVER VISUAL STAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Courier & Delivery Thermal Bag Card (Left on LTR / Right on RTL - 5 Cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-amber-500/30 bg-slate-950/60 p-5 space-y-4 shadow-xl relative overflow-hidden group">
              {/* Courier Profile Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex size-12 items-center justify-center rounded-full bg-slate-800 border-2 border-amber-400 text-2xl shadow-md">
                      🛵
                    </div>
                    <span className="absolute -bottom-1 -end-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[9px] font-black border border-slate-950">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{lang === "ar" ? "كابتن التوصيل المعتمد" : "Certified Courier"}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                        ★ 4.99
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {lang === "ar" ? "فهد السبيعي • مجهز بالشنطة الحرارية" : "Fahad • Equipped with Thermal Bag"}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {lang === "ar" ? "بالطريق لبابك" : "On the way"}
                </span>
              </div>

              {/* The Stylized FoodHub Smart Thermal Bag */}
              <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 space-y-3 relative shadow-2xl">
                {/* Backpack top carry handle and reflective strips */}
                <div className="flex items-center justify-between">
                  <div className="h-1.5 w-12 bg-amber-400/80 rounded-full shadow-sm" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <span>🎒</span>
                    <span>{lang === "ar" ? "شنطة التوصيل الذكية" : "Smart Thermal Bag"}</span>
                  </span>
                  <div className="h-1.5 w-12 bg-amber-400/80 rounded-full shadow-sm" />
                </div>

                {/* THE OFFICIAL FOODHUB LOGO PRINTED ON BAG */}
                <div className="flex flex-col items-center justify-center py-3 px-4 rounded-xl bg-slate-950 border border-amber-500/30 shadow-inner group-hover:border-amber-400/60 transition-colors">
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider mb-1">
                    {lang === "ar" ? "شعار الموقع المعتمد على الشنطة" : "Official Site Logo on Bag"}
                  </span>
                  <FoodHubLogo size={36} showText={true} />
                </div>

                {/* Thermal Bag Status Indicators */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                    <span className="text-[10px] text-slate-400 block">{lang === "ar" ? "درجة الحرارة" : "Temperature"}</span>
                    <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-1">
                      <span>🔥</span>
                      <span>65°C ساخن</span>
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                    <span className="text-[10px] text-slate-400 block">{lang === "ar" ? "العزل والأمان" : "Sanitized Seal"}</span>
                    <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
                      <span>🛡️</span>
                      <span>100% محكم</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Handover Motion & Real-Time Radar Journey (Middle - 3 Cols) */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center text-center space-y-3 py-2">
              <div className="relative flex items-center justify-center">
                <div className="size-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
                  <div className="size-14 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">
                    📦
                  </div>
                </div>
                <span className="absolute -top-1 -end-1 flex size-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-md">
                  ⚡
                </span>
              </div>

              <div className="space-y-1 max-w-xs">
                <h5 className="text-xs font-black text-white">
                  {lang === "ar" ? "تسليم الطلب من يد الكابتن للعميل" : "Direct Handover to Customer"}
                </h5>
                <p className="text-[11px] text-slate-400">
                  {lang === "ar"
                    ? "تغليف حراري محكم يضمن وصول طعامك مقرمشاً وطازجاً في أقل من 20 دقيقة"
                    : "Piping hot, crispy meals delivered in less than 20 minutes"}
                </p>
              </div>

              {/* Simulation Interactive Button */}
              <Button
                size="sm"
                variant="outline"
                disabled={isSimulatingDelivery}
                onClick={handleSimulateDelivery}
                className="border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 rounded-xl text-xs gap-1.5 h-8 shadow-sm"
              >
                {isSimulatingDelivery ? (
                  <>
                    <Sparkles className="size-3 animate-spin" />
                    <span>{lang === "ar" ? "جاري التسليم للعميل..." : "Delivering..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3" />
                    <span>{lang === "ar" ? "تجربة محاكاة التسليم اللحظي" : "Simulate Handover"}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Customer Receiving Order Card (Right on LTR / Left on RTL - 4 Cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-5 space-y-4 shadow-xl">
              {/* Customer Profile & Doorstep */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-slate-800 border-2 border-emerald-400 text-2xl shadow-md">
                    😊
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {lang === "ar" ? "العميل المستلم" : "Happy Customer"}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {lang === "ar" ? "حي حطين • باب المنزل" : "Hittin • Doorstep"}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {lang === "ar" ? "تم الاستلام ✓" : "Delivered ✓"}
                </span>
              </div>

              {/* Customer Feedback Quote Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                <div className="flex items-center justify-between text-amber-400 text-xs">
                  <div className="flex items-center gap-0.5">
                    {"★★★★★".split("").map((s, i) => (
                      <span key={i}>{s}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {lang === "ar" ? "منذ دقيقتين" : "2 mins ago"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed italic">
                  {lang === "ar"
                    ? '💬 "وصل الكابتن بالموعد ومعه شنطة FoodHub الحرارية.. الطعام ساخن كأنه خرج للتو من فرن المطعم!"'
                    : '💬 "The courier arrived fast with the FoodHub thermal bag.. The meal was piping hot like fresh out of the oven!"'}
                </p>
              </div>

              {/* Verified Order Receipt Tag */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{lang === "ar" ? "طلب موثق ومختوم" : "Verified & Sealed Order"}</span>
                </span>
                <span className="font-mono text-amber-400">#FH-9842</span>
              </div>
            </div>
          </div>

          {/* Bottom Action & Fleet Joining Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="text-amber-400 font-bold">✨ {lang === "ar" ? "ضمان FoodHub الذهبي:" : "FoodHub Guarantee:"}</span>
              <span>{lang === "ar" ? "حرارة الوجبة مضمونة 100% أو استرجاع فوري لحسابك" : "100% Temperature Guaranteed or Instant Refund"}</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                to="/join/courier"
                onClick={() => sounds.playClick()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-md"
              >
                <Bike className="size-3.5 text-amber-400" />
                <span>{lang === "ar" ? "انضمام ككابتن توصيل (استلم الشنطة)" : "Join as Courier"}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  const target = document.getElementById("trending-dishes-section");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  } else {
                    toast.info(lang === "ar" ? "🚀 تصفح أشهى الأطباق للطلب الفوري بالأسفل" : "🚀 Explore trending meals below");
                  }
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10"
              >
                <span>{lang === "ar" ? "اطلب وجبتك وتتبع الكابتن" : "Order Now & Track Courier"}</span>
                <ArrowRight className={`size-3.5 ${lang === "ar" ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. TRENDING DISHES WITH LIVE MACROS & FAST CART */}
      {/* ============================================================ */}
      <section id="trending-dishes-section" className="mx-auto max-w-6xl px-4 py-8 w-full space-y-4">
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
              onClick={() => handleViewDish(dish)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-md transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl cursor-pointer"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(dish.id);
                  }}
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

                {/* View Dish Specs button */}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDish(dish);
                  }}
                  className="w-full h-8 bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-xs gap-1.5 shadow-sm transition-all"
                >
                  <Eye className="size-3.5" />
                  <span>{lang === "ar" ? "استعراض الوجبة والمكونات" : "View Dish Specs"}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. OFFICIAL MOBILE APP DOWNLOAD SHOWCASE (APP STORE & GOOGLE PLAY) */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-12 w-full">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-20 -right-20 size-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 size-60 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid gap-8 md:grid-cols-2 items-center">
            
            {/* Left: Smartphone Showcase */}
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative w-64 sm:w-72 rounded-[40px] border-[8px] border-slate-800 bg-slate-950 p-2.5 shadow-2xl ring-2 ring-amber-500/20">
                <div className="h-4 w-24 rounded-full bg-black mx-auto mb-2 flex items-center justify-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-slate-700" />
                  <div className="size-2 rounded-full bg-slate-800" />
                </div>
                <div className="rounded-[28px] overflow-hidden bg-slate-900 p-3.5 space-y-3 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <FoodHubLogo size={24} showText={true} />
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      iOS & Android
                    </span>
                  </div>
                  <div className="relative h-32 rounded-2xl overflow-hidden shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop"
                      alt="App preview"
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute bottom-2 start-2 end-2 flex items-center justify-between text-white">
                      <span className="text-xs font-black">{lang === "ar" ? "وعاء السلمون البري" : "Salmon Bowl"}</span>
                      <span className="text-xs font-black text-amber-400">52 {t("sar")}</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-yellow-500/15 border border-amber-500/30 text-xs text-amber-300 font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{lang === "ar" ? "كابتن في الطريق لبابك" : "Courier on the way"}</span>
                    </span>
                    <span className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-[10px]">
                      12 دقيقة
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Copy & Send Link Form + Official Store Badges */}
            <div className="space-y-5 order-1 md:order-2">
              <div className="space-y-2">
                <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-400 text-xs">
                  📱 {lang === "ar" ? "تطبيق الهاتف الذكي الرسمي" : "Official Mobile App"}
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {lang === "ar" ? "حمّل تطبيق FoodHub الآن" : "Download FoodHub App Now"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {lang === "ar"
                    ? "استمتع بتجربة طلب فائقة السرعة، خصومات حصرية، وتتبع مباشر لمندوب التوصيل عبر تطبيق iOS وأندرويد."
                    : "Enjoy lightning-fast ordering, exclusive discounts, and live GPS courier tracking on iOS & Android."}
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
                  <span className="font-bold">{lang === "ar" ? "رقم الهاتف (SMS)" : "Phone Number (SMS)"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="sendType"
                    checked={sendType === "email"}
                    onChange={() => setSendType("email")}
                    className="accent-amber-500"
                  />
                  <span className="font-bold">{lang === "ar" ? "البريد الإلكتروني" : "Email Address"}</span>
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
                  className="bg-slate-950 border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-amber-400"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 text-xs shrink-0 gap-1.5 shadow-md"
                >
                  <Send className="size-3.5" />
                  {lang === "ar" ? "إرسال الرابط" : "Share App Link"}
                </Button>
              </form>

              {/* Official Apple App Store and Google Play Store Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {/* Apple App Store Download Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    toast.success(
                      lang === "ar"
                        ? "🍏 جارٍ توجيهك إلى متجر Apple App Store لتحميل تطبيق FoodHub..."
                        : "🍏 Redirecting to Apple App Store to download FoodHub..."
                    );
                  }}
                  className="group flex items-center gap-3 rounded-2xl bg-black border-2 border-slate-700/80 hover:border-amber-400 hover:bg-slate-950 px-4 py-2.5 text-white transition-all duration-300 shadow-xl hover:shadow-amber-500/10 hover:scale-105 active:scale-95"
                >
                  <div className="flex size-7 items-center justify-center text-white group-hover:text-amber-400 transition-colors">
                    <svg className="size-6 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.66-1.06 1.73-.93 2.76 1.01.08 2.03-.51 2.64-1.26z" />
                    </svg>
                  </div>
                  <div className="text-start leading-tight">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      {lang === "ar" ? "حَمّله من" : "Download on the"}
                    </span>
                    <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors font-sans">
                      App Store
                    </span>
                  </div>
                </button>

                {/* Google Play Store Download Button */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    toast.success(
                      lang === "ar"
                        ? "▶ جارٍ توجيهك إلى متجر Google Play لتحميل تطبيق FoodHub..."
                        : "▶ Redirecting to Google Play Store to download FoodHub..."
                    );
                  }}
                  className="group flex items-center gap-3 rounded-2xl bg-black border-2 border-slate-700/80 hover:border-amber-400 hover:bg-slate-950 px-4 py-2.5 text-white transition-all duration-300 shadow-xl hover:shadow-amber-500/10 hover:scale-105 active:scale-95"
                >
                  <div className="flex size-7 items-center justify-center shrink-0">
                    <svg className="size-6" viewBox="0 0 24 24" fill="none">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186A2.21 2.21 0 0 1 3 20.627V3.373c0-.6.225-1.164.609-1.559z" fill="#00D2FF" />
                      <path d="M17.183 8.61L13.792 12l3.391 3.39 3.83-2.188c1.087-.622 1.087-1.782 0-2.404L17.183 8.61z" fill="#FFD200" />
                      <path d="M3.609 1.814l10.183 10.186 3.391-3.39-11.75-6.714c-.672-.384-1.352-.352-1.824-.082z" fill="#00F076" />
                      <path d="M3.609 22.186l1.824-.082 11.75-6.714-3.391-3.39L3.609 22.186z" fill="#FF3A44" />
                    </svg>
                  </div>
                  <div className="text-start leading-tight">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      {lang === "ar" ? "احصل عليه من" : "GET IT ON"}
                    </span>
                    <span className="text-sm font-black text-white group-hover:text-amber-400 transition-colors font-sans">
                      Google Play
                    </span>
                  </div>
                </button>

                {/* QR Code Quick Scan Badge */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    toast.info(
                      lang === "ar"
                        ? "📷 وجّه كاميرا هاتفك لمسح باركود تطبيق FoodHub والتحميل الفوري!"
                        : "📷 Point your phone camera to scan FoodHub QR code for instant download!"
                    );
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/50 px-3.5 py-2.5 text-xs text-slate-300 hover:text-white transition-all shadow-md"
                >
                  <QrCode className="size-4 text-amber-400" />
                  <span>{lang === "ar" ? "امسح QR للتحميل" : "Scan QR"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. EXPLORE ALL RESTAURANTS, CUISINES & CITIES NEAR YOU */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-4 py-8 w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>🧭</span>
              <span>{lang === "ar" ? "دليل استكشاف كافة مطابخ ومطاعم المملكة" : "Explore All Restaurants & Cuisines in KSA"}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === "ar"
                ? "دليلك الشامل لكافة العلامات التجارية، المطابخ السحابية، الأصناف الشهيرة، وتغطية المدن عبر FoodHub"
                : "Your comprehensive guide to all restaurant brands, cloud kitchens, cuisines, and cities covered by FoodHub"}
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
            {lang === "ar" ? "+500 مطعم وعلامة معتمدة" : "500+ Verified Restaurant Brands"}
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              id: "chains",
              icon: "🏪",
              qAr: "أشهر سلاسل ومطاعم المملكة المعتمدة للطلب الفوري",
              qEn: "Top Certified Restaurant Chains Available for Instant Delivery",
              badgeAr: "30+ علامة كبرى",
              badgeEn: "30+ Major Brands",
              tagsAr: [
                "🍗 البيك (ALBAIK)",
                "🌯 شاورمر (Shawarmer)",
                "🍛 الرومانسية (Al Romansiah)",
                "🍔 ماكدونالدز (McDonald's)",
                "🥪 كودو (Kudu)",
                "🍕 مايسترو بيتزا (Maestro Pizza)",
                "🍔 هرفي (Herfy)",
                "🥩 برغرايززر (Burgerizzr)",
                "🌯 ماما نورة (Mama Noura)",
                "🍩 دانكن (Dunkin')",
                "🍗 شواية الخليج (Shawaya Al Khaleej)",
                "🍕 بيتزا هت (Pizza Hut)",
                "☕ ستاربكس (Starbucks)",
                "🍔 فايف جايز (Five Guys)",
                "☕ تيم هورتونز (Tim Hortons)",
                "🍩 كرسبي كريم (Krispy Kreme)",
                "🍗 كنتاكي (KFC)",
                "🍔 هارديز (Hardee's)",
                "🥖 صب واي (Subway)",
                "🍕 دومينوز بيتزا (Domino's)",
                "🌯 بيت الشاورما",
                "🌯 شاورما جليلة",
                "🍛 مطاعم السدة",
                "🍛 مطاعم الناضج",
                "🍖 حاشي باشا",
                "🥩 تكساس رودهاوس",
                "🍔 شيك شاك (Shake Shack)",
                "🍗 بوبايز (Popeyes)",
                "🧁 سينابون (Cinnabon)",
                "🍣 ماكي هاوس (Maki House)",
              ],
              tagsEn: [
                "ALBAIK",
                "Shawarmer",
                "Al Romansiah",
                "McDonald's",
                "Kudu",
                "Maestro Pizza",
                "Herfy",
                "Burgerizzr",
                "Mama Noura",
                "Dunkin'",
                "Shawaya Al Khaleej",
                "Pizza Hut",
                "Starbucks",
                "Five Guys",
                "Tim Hortons",
                "Krispy Kreme",
                "KFC",
                "Hardee's",
                "Subway",
                "Domino's Pizza",
                "Bayt El Shawarma",
                "Shawarma Jalilah",
                "Al Seddah",
                "Al Nadeg",
                "Hashi Basha",
                "Texas Roadhouse",
                "Shake Shack",
                "Popeyes",
                "Cinnabon",
                "Maki House",
              ],
              descAr:
                "نوفر لك قائمة كاملة ومحدثة لأشهر سلاسل المطاعم المحلية والعالمية في المملكة العربية السعودية، مع إمكانية الطلب الموحد والسريع بشنطة FoodHub الحرارية الذكية.",
              descEn:
                "Order from top national and international restaurant chains across Saudi Arabia with single-cart unified delivery in FoodHub's smart thermal bags.",
            },
            {
              id: "cuisines",
              icon: "🍽️",
              qAr: "تصنيفات المطابخ والأنظمة الغذائية الشائعة بالقرب منك",
              qEn: "Popular Cuisines, Diets & Food Specialties Near You",
              badgeAr: "كافة الأذواق",
              badgeEn: "All Diets & Cuisines",
              tagsAr: [
                "🇸🇦 شعبي وسعودي (كبسة، مندي، حنيذ، جريش، قرصان، سليق)",
                "🍔 برجر وسماش برجر وكرسبي تشيكن ولحم بلدي",
                "🌯 شاورما عربي وصاج وفطائر ومناقيش شامية",
                "🍕 بيتزا إيطالية وباستا ولازانيا وستافد كراست",
                "🥑 صحي وكيتو دايت وبروتين عالي وسلطات كينوا وأساي",
                "🍣 مأكولات بحرية وسوشي وروبيان ديناميت وديناميت شريمب",
                "🥩 مشاوي مشكلة وكباب وأوصال وستيك تندرلوين",
                "☕ قهوة مختصة V60 ودونات وكوكيز ووافل وكريب وكيك",
                "🌮 تاكو ومطبخ مكسيكي وفاهيتا وبوريتو",
                "🍛 برياني هندي وتندوري وماسالا وبتر تشيكن",
              ],
              tagsEn: [
                "Saudi Traditional (Kabsa, Mandi, Haneeth, Jareesh)",
                "Artisan Burgers, Smashed Beef & Crispy Chicken",
                "Arabi Shawarma, Saj Wraps & Levantine Pies",
                "Italian Pizza, Stuffed Crust & Pasta Bowls",
                "Healthy, Keto Diet, High-Protein & Acai Bowls",
                "Seafood, Sushi Platters & Dynamite Shrimp",
                "Mixed Grills, Shish Tawook & Tenderloin Steaks",
                "Specialty Coffee V60, Gourmet Donuts & Pastries",
                "Mexican Tacos, Burritos & Quesadillas",
                "Indian Biryani, Butter Chicken & Tandoori",
              ],
              descAr:
                "سواء كنت تبحث عن وجبة سعودية تراثية أصيلة، أو برجر طازج، أو وجبة صحية محسوبة السعرات والبروتين، يجمع لك تطبيق FoodHub أشهى الخيارات من كافة المطاعم في منصة واحدة.",
              descEn:
                "Whether craving authentic Saudi heritage dishes, gourmet burgers, macro-counted fitness meals, or specialty desserts, FoodHub connects you to all culinary varieties.",
            },
            {
              id: "models",
              icon: "🏭",
              qAr: "أنواع المطاعم ونماذج المطابخ السحابية المعتمدة بالتطبيق",
              qEn: "Types of Certified Restaurants & Cloud Kitchen Models",
              badgeAr: "نماذج تشغيلية متطورة",
              badgeEn: "Smart Operations",
              tagsAr: [
                "☁️ مطابخ سحابية ذكية (Cloud & Ghost Kitchens)",
                "⚡ مطاعم الوجبات السريعة والتحضير الفوري (QSR)",
                "🌟 مطاعم فاخرة وذواقة مع تغليف فندقي (Fine Dining)",
                "🥗 مطابخ الدايت واشتراكات الوجبات الصحية اليومية",
                "☕ كافيهات ومحامص القهوة المختصة والمخابز",
                "🚚 عربات الطعام وفود تراك فعاليات ومواسم الترفيه",
                "🤝 مطابخ التحالفات المشتركة للطلب الموحد (Multi-Brand Hubs)",
              ],
              tagsEn: [
                "Smart Cloud & Ghost Kitchens",
                "Quick Service & Express Prep Restaurants",
                "Fine Dining & Gourmet Eateries",
                "Diet Kitchens & Fitness Meal Prep Hubs",
                "Specialty Roasteries, Cafes & Bakeries",
                "Event Food Trucks & Seasonal Popups",
                "Multi-Brand Collaborative Cooking Hubs",
              ],
              descAr:
                "ندعم شراكات تشغيلية متكاملة مع مختلف نماذج المطاعم، بدءاً من المطابخ السحابية فائقة السرعة وحتى المطاعم الفاخرة، مع ربط رقمي فوري ومتابعة درجات الحرارة لحظياً.",
              descEn:
                "We partner with diverse restaurant formats from rapid cloud kitchens to gourmet dining, with direct POS integration and live temperature control.",
            },
            {
              id: "coverage",
              icon: "📍",
              qAr: "تغطية كافة أحياء الرياض ومدن المملكة العربية السعودية",
              qEn: "Full Coverage of Riyadh Districts & Major Saudi Cities",
              badgeAr: "تغطية شاملة 100%",
              badgeEn: "Nationwide Coverage",
              tagsAr: [
                "🟢 شمال الرياض: حطين، الملقا، الياسمين، النرجس، الصحافة، العقيق، الربيع، الغدير، القيروان، العارض",
                "🟢 وسط الرياض: العليا، السليمانية، التحلية، الملز، المربع، الورود، الملك فهد، المروج، صلاح الدين",
                "🟢 شرق الرياض: الروضة، قرطبة، اليرموك، غرناطة، الحمراء، الرمال، المونسية، إشبيلية، النسيم",
                "🟢 غرب الرياض: الدرعية، النخيل، السفارات DQ، عرقة، ظهرة لبن، طويق، المهدية، البديعة",
                "🟢 جنوب الرياض: السويدي، شبرا، الشفا، العزيزية، المنصورة، الخالدية، غبيراء",
                "🚀 مدن قيد التوسع قريباً: جدة، مكة المكرمة، المدينة المنورة، الدمام، الخبر، الظهران، الأحساء، أبها، الطائف، تبوك، القصيم (بريدة وعنيزة)، حائل، الجبيل",
              ],
              tagsEn: [
                "North Riyadh: Hittin, Malqa, Yasmin, Narjis, Sahafah, Aqiq, Rabi, Ghadir, Qairawan, Arid",
                "Central Riyadh: Olaya, Sulimaniyah, Tahlia, Malaz, Murabba, Wurud, King Fahd, Muruj",
                "East Riyadh: Rawdah, Qurtubah, Yarmouk, Granada, Hamra, Rimal, Munsiyah, Ishbiliyah, Naseem",
                "West Riyadh: Diriyah, Nakheel, Diplomatic Quarter, Irqah, Laban, Tuwaiq, Mahdiyah",
                "South Riyadh: Suwaidi, Shubra, Shifa, Aziziyah, Mansourah, Khalidiyah",
                "Expanding Soon: Jeddah, Makkah, Madinah, Dammam, Khobar, Dhahran, Ahsa, Abha, Taif, Tabuk, Qassim, Hail, Jubail",
              ],
              descAr:
                "يغطي أسطول FoodHub حالياً 54 حياً في كافة قطاعات الرياض مع شبكة مؤشرات توفر حية (🟢 متاح / 🔴 قيد التجهيز)، مع خطة توسع متسارعة لتغطية كافة مدن ومناطق المملكة.",
              descEn:
                "FoodHub currently covers 54 districts across Riyadh with live availability indicators (🟢 Available / 🔴 Coming Soon), expanding rapidly across all major Saudi regions.",
            },
            {
              id: "services",
              icon: "🛡️",
              qAr: "مزايا وخدمات الطلب الموحد والضمان الذهبي لجميع المطاعم",
              qEn: "Unified Multi-Restaurant Services & FoodHub Golden Guarantee",
              badgeAr: "مزايا حصرية",
              badgeEn: "Exclusive Perks",
              tagsAr: [
                "🛍️ السلة الموحدة: اطلب من عدة مطاعم مختلفة في فاتورة واحدة وكابتن واحد",
                "🎒 شنطة FoodHub الحرارية الذكية: حفظ حراري 65°C لوجبات طازجة ومقرمشة",
                "⏱️ توصيل راداري فائق السرعة: متوسط زمن التوصيل 18 دقيقة لباب المنزل",
                "💳 دفع إلكتروني متعدد وآمن: مدى، Apple Pay، فيزا، ماستركارد، تمارا، تابي، والدفع عند الاستلام",
                "🛡️ ختم أمان معقم 100%: شريط أمان لا يفتحه سوى العميل لضمان النظافة",
                "🌟 ضمان استرجاع فوري: حرارة وطعم الوجبة مضمونة 100% أو تعويض مباشر",
              ],
              tagsEn: [
                "Unified Single Cart: Order from multiple restaurants in one delivery",
                "Smart FoodHub Thermal Bag: 65°C insulation for fresh, crispy meals",
                "Rapid Radar Delivery: Average 18-minute arrival at your doorstep",
                "Secure Multi-Payment: Mada, Apple Pay, Cards, Tamara, Tabby & Cash",
                "100% Sanitized Security Seal: Tamper-evident packaging for safety",
                "Golden Guarantee: 100% meal temperature satisfaction or instant refund",
              ],
              descAr:
                "نقدم تجربة توصيل استثنائية لجميع المطاعم تضمن الجمع بين راحة الطلب الموحد، الحفاظ على جودة وحرارة الطعام، وتوفير خيارات دفع وتقسيط متنوعة.",
              descEn:
                "We provide an unparalleled dining delivery experience combining multi-restaurant cart flexibility, optimal meal temperature preservation, and seamless payments.",
            },
          ].map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-amber-500/50 bg-slate-900/90 shadow-xl shadow-amber-500/5"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setOpenFaq(isOpen ? null : index);
                  }}
                  className="w-full flex items-center justify-between p-4 text-start text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition-colors gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <span className="truncate">{lang === "ar" ? item.qAr : item.qEn}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-[10px] font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      {lang === "ar" ? item.badgeAr : item.badgeEn}
                    </span>
                    <ChevronDown
                      className={`size-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-400" : ""
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4 pt-2 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200 bg-slate-950/40">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {lang === "ar" ? item.descAr : item.descEn}
                    </p>

                    {/* Interactive Tags / Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(lang === "ar" ? item.tagsAr : item.tagsEn).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          onClick={() => {
                            sounds.playClick();
                            toast.info(
                              lang === "ar"
                                ? `✨ تم تحديد "${tag}" - تصفح الأطباق والمطاعم المتاحة للطلب!`
                                : `✨ Selected "${tag}" - Explore available dishes and restaurants!`
                            );
                          }}
                          className="cursor-pointer inline-flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 hover:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:text-amber-400 transition-all shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* MEAL SPECIFICATION & MACROS INSPECTION PREVIEW MODAL */}
      {/* ============================================================ */}
      {previewDish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewDish(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-slate-950 text-start animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header with Badges */}
            <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-slate-950">
              <img
                src={previewDish.image}
                alt={previewDish.nameEn}
                className="size-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-slate-950/40" />

              {/* Close Button Top-End */}
              <button
                type="button"
                aria-label={lang === "ar" ? "إغلاق" : "Close"}
                onClick={() => setPreviewDish(null)}
                className="absolute top-4 end-4 z-10 flex size-9 items-center justify-center rounded-full bg-slate-950/80 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors backdrop-blur-md shadow-lg"
              >
                <X className="size-5" />
              </button>

              {/* Badges Top-Start */}
              <div className="absolute top-4 start-4 flex flex-wrap gap-2">
                {previewDish.cuisineAr && (
                  <span className="rounded-full bg-slate-950/90 border border-slate-700 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md shadow-md">
                    {lang === "ar" ? previewDish.cuisineAr : previewDish.cuisineEn}
                  </span>
                )}
                {previewDish.badgeAr && (
                  <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-black text-slate-950 shadow-md">
                    {lang === "ar" ? previewDish.badgeAr : previewDish.badgeEn}
                  </span>
                )}
              </div>

              {/* Title & Restaurant Overlay on Image Bottom */}
              <div className="absolute bottom-3 start-4 end-4 space-y-0.5">
                {previewDish.restaurantAr && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 drop-shadow-md">
                    <Store className="size-3.5" />
                    <span>{lang === "ar" ? previewDish.restaurantAr : previewDish.restaurantEn}</span>
                  </div>
                )}
                <h2 className="text-base sm:text-lg font-black text-white leading-snug drop-shadow-md">
                  {lang === "ar" ? previewDish.nameAr : previewDish.nameEn}
                </h2>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {lang === "ar" ? previewDish.descAr : previewDish.descEn}
              </p>

              {/* Price & Rating Highlights */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {lang === "ar" ? "السعر التقديري في المنيو:" : "Menu Estimated Price:"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-amber-400">
                      {previewDish.price} <span className="text-xs font-bold">{t("sar")}</span>
                    </span>
                    {previewDish.oldPrice && (
                      <span className="text-xs text-slate-500 line-through">
                        {previewDish.oldPrice} {t("sar")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {lang === "ar" ? "تقييم الوجبة:" : "Dish Rating:"}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-base">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span>{previewDish.rating}</span>
                    {previewDish.ordersCount && (
                      <span className="text-xs text-slate-400 font-normal">
                        ({lang === "ar" ? previewDish.ordersCount : previewDish.ordersCountEn})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Nutrition & Preparation Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-center">
                {previewDish.calories && (
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center">
                    <Flame className="size-4 text-amber-400 mb-1" />
                    <span className="text-[10px] text-slate-400">{lang === "ar" ? "السعرات الحرارية" : "Calories"}</span>
                    <span className="text-xs font-black text-white">{previewDish.calories} kcal</span>
                  </div>
                )}
                {previewDish.protein && (
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center">
                    <Zap className="size-4 text-cyan-400 mb-1" />
                    <span className="text-[10px] text-slate-400">{lang === "ar" ? "البروتين الصافي" : "Net Protein"}</span>
                    <span className="text-xs font-black text-white">{previewDish.protein}g</span>
                  </div>
                )}
                {previewDish.prepTime && (
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center col-span-2 sm:col-span-1">
                    <Clock className="size-4 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-slate-400">{lang === "ar" ? "وقت التحضير" : "Prep Time"}</span>
                    <span className="text-xs font-black text-white">{previewDish.prepTime}</span>
                  </div>
                )}
                {previewDish.eta && (
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center">
                    <Clock className="size-4 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-slate-400">{lang === "ar" ? "وقت التوصيل" : "Delivery ETA"}</span>
                    <span className="text-xs font-black text-white">{previewDish.eta}</span>
                  </div>
                )}
              </div>

              {/* Informative Visual Only Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs">
                <span className="text-base shrink-0">✨</span>
                <p className="leading-relaxed">
                  {lang === "ar"
                    ? "هذه الواجهة مخصصة للاستعراض والتصفح البصري للوجبات ومكوناتها وقيمتها الغذائية. للطلب المباشر يرجى تحميل تطبيق الجوال أو التواصل مع المطعم."
                    : "This visual showcase is for viewing dish specifications, ingredients, and nutrition macros. For ordering, please download the mobile app."}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center gap-3">
                <Button
                  onClick={() => setPreviewDish(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs h-10 border border-slate-700"
                >
                  {lang === "ar" ? "إغلاق الاستعراض" : "Close Preview"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

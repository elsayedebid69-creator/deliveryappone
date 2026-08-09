import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Leaf, Salad, Beef, Carrot, Apple, Egg, Cookie, ShoppingCart, Plus } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { AppFooter, AppHeader } from "@/components/app-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Food Hub | FAST. FRESH. DELIVERED." },
      {
        name: "description",
        content: "Fresh healthy meals delivered to your door — order now from Food Hub.",
      },
      { property: "og:title", content: "Food Hub | FAST. FRESH. DELIVERED." },
      {
        property: "og:description",
        content: "Fresh healthy meals delivered to your door.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const CATEGORIES = [
  { id: "all", ar: "الكل", en: "All", icon: Leaf },
  { id: "salads", ar: "سلطات", en: "Salads", icon: Salad },
  { id: "protein", ar: "بروتين مشوي", en: "Grilled Protein", icon: Beef },
  { id: "vegan", ar: "أطباق نباتية", en: "Vegan", icon: Carrot },
  { id: "smoothies", ar: "عصائر وسموذي", en: "Juices & Smoothies", icon: Apple },
  { id: "keto", ar: "وجبات كيتو", en: "Keto Meals", icon: Egg },
  { id: "breakfast", ar: "إفطار صحي", en: "Healthy Breakfast", icon: Cookie },
];

const FEATURED_MEALS = [
  {
    id: 1,
    nameAr: "سلطة الكينوا بالخضار المشوية",
    nameEn: "Grilled Veggie Quinoa Salad",
    descAr: "كينوا مطبوخة مع خضار مشوية وصلصة الليمون",
    descEn: "Cooked quinoa with grilled veggies and lemon dressing",
    price: 38,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    category: "salads",
  },
  {
    id: 2,
    nameAr: "صدر دجاج مشوي بالأعشاب",
    nameEn: "Herb Grilled Chicken Breast",
    descAr: "صدر دجاج متبل بالأعشاب مع أرز بني وخضار",
    descEn: "Herb-seasoned chicken breast with brown rice and veggies",
    price: 45,
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop",
    category: "protein",
  },
  {
    id: 3,
    nameAr: "وعاء الأفوكادو والسلمون",
    nameEn: "Avocado Salmon Bowl",
    descAr: "سلمون مشوي مع أفوكادو وأرز وخضار طازجة",
    descEn: "Grilled salmon with avocado, rice and fresh veggies",
    price: 52,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    category: "protein",
  },
  {
    id: 4,
    nameAr: "سموذي التوت والشيا",
    nameEn: "Berry Chia Smoothie",
    descAr: "مزيج من التوت الطازج مع بذور الشيا والعسل",
    descEn: "Fresh berry blend with chia seeds and honey",
    price: 22,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
    category: "smoothies",
  },
  {
    id: 5,
    nameAr: "عدس بالخضار",
    nameEn: "Vegetable Lentil Bowl",
    descAr: "عدس مطبوخ مع خضار موسمية وبهارات طبيعية",
    descEn: "Cooked lentils with seasonal veggies and natural spices",
    price: 32,
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
    category: "vegan",
  },
  {
    id: 6,
    nameAr: "شوفان الليلة السابقة بالفواكه",
    nameEn: "Overnight Oats with Fruit",
    descAr: "شوفان منقوع مع حليب اللوز والفواكه الطازجة",
    descEn: "Oats soaked in almond milk with fresh fruits",
    price: 18,
    image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop",
    category: "breakfast",
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
    return matchesCategory && (
      meal.nameAr.toLowerCase().includes(term) ||
      meal.nameEn.toLowerCase().includes(term) ||
      meal.descAr.toLowerCase().includes(term) ||
      meal.descEn.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFC72C] via-[#FFB800] to-[#E6A800]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyQjFCMTIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg4VjI4aDI4em0wLTRWMjBIMnYySDM2ek0zNiAxMHYySDI0VjEwaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-[#2B1B12]">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-[#2B1B12]/10 text-[#2B1B12] hover:bg-[#2B1B12]/20">
              {t("fastDelivery")}
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              {t("tagline")}
            </h1>
            <p className="mt-4 max-w-xl text-base opacity-80">{t("heroSub")}</p>
          </div>

          {/* Search Bar */}
          <div className="surface mt-8 flex max-w-xl items-center gap-2 p-2">
            <Search className="ms-2 size-5 shrink-0 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              maxLength={80}
              className="border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0"
            />
            <Button size="sm" className="bg-[#2B1B12] text-white hover:bg-[#3D2E1F]">
              <Search className="size-4" />
            </Button>
          </div>

          {/* Categories */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#2B1B12] text-[#FFC72C]"
                    : "bg-[#2B1B12]/10 text-[#2B1B12] hover:bg-[#2B1B12]/20"
                }`}
              >
                <cat.icon className="size-4" />
                {cat[lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Healthy Meals */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center gap-2">
          <Leaf className="size-6 text-[#FFC72C]" />
          <h2 className="text-2xl font-bold text-[#2B1B12]">{t("featuredMeals")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((meal) => (
            <div
              key={meal.id}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={meal.image}
                  alt={meal.nameEn}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-3 end-3 rounded-full bg-[#FFC72C] px-3 py-1 text-sm font-bold text-[#2B1B12]">
                  {meal.price} {t("sar")}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900">{lang === "ar" ? meal.nameAr : meal.nameEn}</h3>
                <p className="mt-1 text-sm text-gray-500">{lang === "ar" ? meal.descAr : meal.descEn}</p>
                <Button
                  size="sm"
                  className="mt-3 w-full bg-[#FFC72C] text-[#2B1B12] hover:bg-[#E6B800]"
                  onClick={() => {
                    cart.add({
                      id: meal.id,
                      restaurant_id: "food-hub",
                      name_ar: meal.nameAr,
                      name_en: meal.nameEn,
                      price: meal.price,
                    });
                    toast.success(t("addToCart"));
                  }}
                >
                  <Plus className="mr-1 size-4" />
                  {t("addToCart")}
                </Button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-gray-50 py-16 text-center">
            <Search className="mb-4 size-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              {lang === "ar" ? "لم يتم العثور على أطباق" : "No meals found"}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {lang === "ar" ? "جرب البحث بكلمات مختلفة" : "Try searching with different keywords"}
            </p>
          </div>
        )}
      </section>

      <AppFooter />
    </div>
  );
}

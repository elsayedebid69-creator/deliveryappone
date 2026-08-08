import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const dict = {
  brand: { ar: "سُفرة", en: "Sufra" },
  tagline: { ar: "أشهى الأطباق تصلك في دقائق", en: "Great food, delivered in minutes" },
  heroSub: {
    ar: "اطلب من أفضل المطاعم حولك وتابع طلبك لحظة بلحظة حتى باب بيتك.",
    en: "Order from the best restaurants near you and track every step to your door.",
  },
  searchPlaceholder: { ar: "ابحث عن مطعم أو طبق...", en: "Search restaurants or dishes..." },
  restaurants: { ar: "المطاعم", en: "Restaurants" },
  allRestaurants: { ar: "كل المطاعم", en: "All restaurants" },
  orders: { ar: "طلباتي", en: "My orders" },
  cart: { ar: "السلة", en: "Cart" },
  login: { ar: "تسجيل الدخول", en: "Sign in" },
  logout: { ar: "تسجيل الخروج", en: "Sign out" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  password: { ar: "كلمة المرور", en: "Password" },
  fullName: { ar: "الاسم الكامل", en: "Full name" },
  phone: { ar: "رقم الجوال", en: "Phone number" },
  address: { ar: "عنوان التوصيل", en: "Delivery address" },
  notes: { ar: "ملاحظات", en: "Notes" },
  sar: { ar: "ر.س", en: "SAR" },
  min: { ar: "د", en: "min" },
  deliveryFee: { ar: "رسوم التوصيل", en: "Delivery fee" },
  minOrder: { ar: "أقل طلب", en: "Min. order" },
  subtotal: { ar: "المجموع", en: "Subtotal" },
  total: { ar: "الإجمالي", en: "Total" },
  addToCart: { ar: "أضف للسلة", en: "Add to cart" },
  emptyCart: { ar: "سلتك فارغة", en: "Your cart is empty" },
  browseRestaurants: { ar: "تصفح المطاعم", en: "Browse restaurants" },
  placeOrder: { ar: "تأكيد الطلب", en: "Place order" },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  menu: { ar: "قائمة الطعام", en: "Menu" },
  unavailable: { ar: "غير متوفر", en: "Unavailable" },
  admin: { ar: "لوحة الأدمن", en: "Admin" },
  vendor: { ar: "لوحة المطعم", en: "Restaurant" },
  courier: { ar: "لوحة المندوب", en: "Courier" },
  createAccount: { ar: "إنشاء حساب", en: "Create account" },
  accountType: { ar: "نوع الحساب", en: "Account type" },
  restaurantAccount: { ar: "حساب مطعم", en: "Restaurant" },
  courierAccount: { ar: "حساب مندوب", en: "Courier" },
  customerAccount: { ar: "حساب عميل", en: "Customer" },
  adminAccount: { ar: "حساب أدمن", en: "Admin" },
  accounts: { ar: "الحسابات", en: "Accounts" },
  addRestaurant: { ar: "إضافة مطعم", en: "Add restaurant" },
  restaurantNameAr: { ar: "اسم المطعم (عربي)", en: "Restaurant name (Arabic)" },
  restaurantNameEn: { ar: "اسم المطعم (إنجليزي)", en: "Restaurant name (English)" },
  cuisineAr: { ar: "نوع المطبخ (عربي)", en: "Cuisine (Arabic)" },
  cuisineEn: { ar: "نوع المطبخ (إنجليزي)", en: "Cuisine (English)" },
  owner: { ar: "المالك", en: "Owner" },
  none: { ar: "بدون", en: "None" },
  save: { ar: "حفظ", en: "Save" },
  add: { ar: "إضافة", en: "Add" },
  delete: { ar: "حذف", en: "Delete" },
  price: { ar: "السعر", en: "Price" },
  itemNameAr: { ar: "اسم الصنف (عربي)", en: "Item name (Arabic)" },
  itemNameEn: { ar: "اسم الصنف (إنجليزي)", en: "Item name (English)" },
  category: { ar: "التصنيف", en: "Category" },
  addItem: { ar: "إضافة صنف", en: "Add item" },
  incomingOrders: { ar: "الطلبات الواردة", en: "Incoming orders" },
  availableOrders: { ar: "طلبات متاحة", en: "Available orders" },
  myDeliveries: { ar: "توصيلاتي", en: "My deliveries" },
  accept: { ar: "قبول", en: "Accept" },
  status: { ar: "الحالة", en: "Status" },
  noOrders: { ar: "لا توجد طلبات بعد", en: "No orders yet" },
  order: { ar: "طلب", en: "Order" },
  pickup: { ar: "استلام الطلب", en: "Pick up" },
  markDelivered: { ar: "تم التسليم", en: "Mark delivered" },
  loginRequired: { ar: "سجّل الدخول لإتمام الطلب", en: "Sign in to complete your order" },
  signInSubtitle: {
    ar: "الحسابات تُنشأ عن طريق إدارة المنصة فقط.",
    en: "Accounts are created by the platform administration only.",
  },
  stats: { ar: "نظرة عامة", en: "Overview" },
  totalOrders: { ar: "إجمالي الطلبات", en: "Total orders" },
  revenue: { ar: "الإيرادات", en: "Revenue" },
  users: { ar: "المستخدمون", en: "Users" },
  active: { ar: "نشط", en: "Active" },
  inactive: { ar: "متوقف", en: "Inactive" },
  setupAdmin: { ar: "تهيئة حساب الأدمن الأول", en: "Set up the first admin" },
  setupAdminHint: {
    ar: "لا يوجد أدمن بعد. أنشئ الحساب الأول للبدء.",
    en: "No admin exists yet. Create the first account to start.",
  },
  created: { ar: "تم الإنشاء بنجاح", en: "Created successfully" },
  qty: { ar: "الكمية", en: "Qty" },
  dashboard: { ar: "لوحة التحكم", en: "Dashboard" },
  free: { ar: "مجاني", en: "Free" },
  popular: { ar: "الأكثر طلباً", en: "Most popular" },
  fastDelivery: { ar: "توصيل سريع", en: "Fast delivery" },
  minOrderNotMet: { ar: "لم يتم بلوغ الحد الأدنى للطلب", en: "Minimum order not reached" },
} as const;

export type TKey = keyof typeof dict;

const statusDict: Record<string, { ar: string; en: string }> = {
  pending: { ar: "بانتظار القبول", en: "Pending" },
  accepted: { ar: "تم القبول", en: "Accepted" },
  preparing: { ar: "قيد التحضير", en: "Preparing" },
  ready: { ar: "جاهز للاستلام", en: "Ready" },
  on_the_way: { ar: "في الطريق", en: "On the way" },
  delivered: { ar: "تم التسليم", en: "Delivered" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
};

type I18nValue = {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  tn: (row: { name_ar: string; name_en: string }) => string;
  tf: (row: Record<string, unknown>, field: string) => string;
  tStatus: (s: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem("lang");
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang: (l) => {
        window.localStorage.setItem("lang", l);
        setLangState(l);
      },
      t: (key) => dict[key][lang],
      tn: (row) => (lang === "ar" ? row.name_ar : row.name_en),
      tf: (row, field) => String(row[`${field}_${lang}`] ?? ""),
      tStatus: (s) => statusDict[s]?.[lang] ?? s,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "on_the_way",
  "delivered",
  "cancelled",
] as const;

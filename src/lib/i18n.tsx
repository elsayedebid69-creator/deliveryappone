import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const dict = {
  brand: { ar: "FOODHUB", en: "FOODHUB" },
  tagline: { ar: "سريع. طازج. يوصلك.", en: "FAST. FRESH. DELIVERED." },
  heroSub: {
    ar: "أشهى الأطباق الصحية توصلك لحظة بلحظة — اطلب الآن واستمتع بتجربة طعام صحية فريدة",
    en: "Fresh healthy meals delivered to your door — order now and enjoy a unique healthy dining experience.",
  },
  searchPlaceholder: { ar: "ابحث عن وجبة صحيّة...", en: "Search healthy meals..." },
  orders: { ar: "طلباتي", en: "My orders" },
  cart: { ar: "السلة", en: "Cart" },
  login: { ar: "تسجيل الدخول", en: "Sign in" },
  logout: { ar: "تسجيل الخروج", en: "Sign out" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  password: { ar: "كلمة المرور", en: "Password" },
  confirmPassword: { ar: "تأكيد كلمة المرور", en: "Confirm password" },
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
  browseMenu: { ar: "تصفح القائمة", en: "Browse menu" },
  restaurants: { ar: "المطاعم", en: "Restaurants" },
  placeOrder: { ar: "تأكيد الطلب", en: "Place order" },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  menu: { ar: "قائمة الطعام", en: "Menu" },
  unavailable: { ar: "غير متوفر", en: "Unavailable" },
  admin: { ar: "لوحة الإدارة", en: "Admin" },
  vendor: { ar: "لوحة المطعم", en: "Restaurant" },
  courier: { ar: "لوحة المندوب", en: "Courier" },
  createAccount: { ar: "إنشاء حساب", en: "Create account" },
  accountType: { ar: "نوع الحساب", en: "Account type" },
  restaurantAccount: { ar: "حساب مطعم", en: "Restaurant" },
  courierAccount: { ar: "حساب مندوب", en: "Courier" },
  customerAccount: { ar: "حساب عميل", en: "Customer" },
  adminAccount: { ar: "حساب أدمن", en: "Admin" },
  accounts: { ar: "الحسابات", en: "Accounts" },
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
    ar: "سجّل الدخول للوصول إلى أشهى الأطباق الصحية",
    en: "Sign in to access healthy meals",
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
  signUp: { ar: "إنشاء حساب جديد", en: "Create account" },
  signUpSubtitle: { ar: "سجّل الآن وابدأ طلب أشهى الأطباق الصحية", en: "Sign up to start ordering healthy food" },
  alreadyHaveAccount: { ar: "لديك حساب؟", en: "Already have an account?" },
  dontHaveAccount: { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  joinAsRestaurant: { ar: "انضم كمطعم", en: "Join as Restaurant" },
  joinAsCourier: { ar: "انضم كمندوب توصيل", en: "Join as Delivery Agent" },
  joinRequest: { ar: "طلب انضمام", en: "Join Request" },
  joinRequestSubtitle: { ar: "أكمل النموذج أدناه وسنراجع طلبك خلال 24 ساعة", en: "Fill out the form below and we'll review your request within 24 hours" },
  restaurantInfo: { ar: "بيانات النشاط", en: "Business Information" },
  businessName: { ar: "اسم النشاط التجاري", en: "Business name" },
  businessNameAr: { ar: "اسم النشاط (عربي)", en: "Business name (Arabic)" },
  businessNameEn: { ar: "اسم النشاط (إنجليزي)", en: "Business name (English)" },
  contactName: { ar: "اسم جهة الاتصال", en: "Contact name" },
  contactPhone: { ar: "رقم جوال جهة الاتصال", en: "Contact phone" },
  commercialRegister: { ar: "رقم السجل التجاري", en: "Commercial register number" },
  restaurantAddress: { ar: "عنوان المطعم", en: "Restaurant address" },
  description: { ar: "وصف المطعم", en: "Restaurant description" },
  agentInfo: { ar: "بيانات المندوب", en: "Agent Information" },
  fullNameLabel: { ar: "الاسم الكامل", en: "Full name" },
  idNumber: { ar: "رقم الهوية", en: "ID number" },
  vehicleType: { ar: "نوع المركبة", en: "Vehicle type" },
  motorcycle: { ar: "دراجة نارية", en: "Motorcycle" },
  car: { ar: "سيارة", en: "Car" },
  bicycle: { ar: "دراجة هوائية", en: "Bicycle" },
  vehiclePlate: { ar: "رقم اللوحة", en: "Plate number" },
  uploadPhoto: { ar: "رفع صورة", en: "Upload photo" },
  uploadHint: { ar: "انقر لاختيار صورة أو اسحبها هنا", en: "Click to select or drag a photo" },
  submitRequest: { ar: "إرسال الطلب", en: "Submit request" },
  requestSubmitted: { ar: "تم إرسال طلبك بنجاح", en: "Your request has been submitted" },
  requestPending: { ar: "طلبك قيد المراجعة من الإدارة", en: "Your request is under review by the admin" },
  pendingReview: { ar: "قيد المراجعة", en: "Pending review" },
  approved: { ar: "تمت الموافقة", en: "Approved" },
  rejected: { ar: "مرفوض", en: "Rejected" },
  approve: { ar: "موافقة", en: "Approve" },
  reject: { ar: "رفض", en: "Reject" },
  joinRequests: { ar: "طلبات الانضمام", en: "Join Requests" },
  pendingRequests: { ar: "طلبات معلقة", en: "Pending requests" },
  approvedRequests: { ar: "طلبات مقبولة", en: "Approved requests" },
  rejectedRequests: { ar: "طلبات مرفوضة", en: "Rejected requests" },
  noRequests: { ar: "لا توجد طلبات", en: "No requests" },
  requestDetails: { ar: "تفاصيل الطلب", en: "Request details" },
  credentialsSent: { ar: "تم إرسال بيانات الدخول", en: "Login credentials sent" },
  earnings: { ar: "الأرباح", en: "Earnings" },
  totalEarnings: { ar: "إجمالي الأرباح", en: "Total earnings" },
  todayEarnings: { ar: "أرباح اليوم", en: "Today's earnings" },
  completedDeliveries: { ar: "التوصيلات المكتملة", en: "Completed deliveries" },
  online: { ar: "متصل", en: "Online" },
  offline: { ar: "غير متصل", en: "Offline" },
  goOnline: { ar: "تشغيل الاتصال", en: "Go online" },
  goOffline: { ar: "إيقاف الاتصال", en: "Go offline" },
  welcomeBack: { ar: "مرحباً بعودتك", en: "Welcome back" },
  orderHistory: { ar: "سجل الطلبات", en: "Order history" },
  currentOrder: { ar: "الطلب الحالي", en: "Current order" },
  trackOrder: { ar: "تتبع الطلب", en: "Track order" },
  orderConfirmed: { ar: "تم تأكيد الطلب", en: "Order confirmed" },
  preparing: { ar: "قيد التحضير", en: "Preparing" },
  outForDelivery: { ar: "خرج للتوصيل", en: "Out for delivery" },
  delivered: { ar: "تم التوصيل", en: "Delivered" },
  rateOrder: { ar: "تقييم الطلب", en: "Rate order" },
  yourRating: { ar: "تقييمك", en: "Your rating" },
  thankYou: { ar: "شكراً لتقييمك", en: "Thanks for your rating" },
  openNow: { ar: "مفتوح الآن", en: "Open now" },
  closed: { ar: "مغلق", en: "Closed" },
  filters: { ar: "الفلاتر", en: "Filters" },
  allCategories: { ar: "كل التصنيفات", en: "All categories" },
  sortBy: { ar: "ترتيب حسب", en: "Sort by" },
  rating: { ar: "التقييم", en: "Rating" },
  deliveryTime: { ar: "وقت التوصيل", en: "Delivery time" },
  distance: { ar: "المسافة", en: "Distance" },
  featuredMeals: { ar: "أطباق مميزة", en: "Featured meals" },
  healthyChoices: { ar: "خيارات صحية", en: "Healthy choices" },
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
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("lang");
      if (saved === "en" || saved === "ar") return saved;
    }
    return "en";
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("lang");
    if (saved === "en" || saved === "ar") {
      setLangState(saved);
    } else {
      setLangState("en");
      try {
        window.localStorage.setItem("lang", "en");
      } catch {
        // ignore in private / restricted environments
      }
    }
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
        try {
          window.localStorage.setItem("lang", l);
        } catch {
          // ignore
        }
        setLangState(l);
      },
      t: (key) => dict[key]?.[lang] ?? key,
      tn: (row) => (lang === "ar" ? (row.name_ar || row.name_en) : (row.name_en || row.name_ar)),
      tf: (row, field) => String(row[`${field}_${lang}`] ?? row[`${field}_en`] ?? row[`${field}_ar`] ?? ""),
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

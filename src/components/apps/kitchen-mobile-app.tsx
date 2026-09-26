import { useState, useEffect } from "react";
import {
  ChefHat,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Volume2,
  VolumeX,
  PackageCheck,
  TrendingUp,
  DollarSign,
  UtensilsCrossed,
  Layers,
  Search,
  Plus,
  Power,
  Sparkles,
  Printer,
  ChevronRight,
} from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KitchenTicket {
  id: string;
  orderNumber: string;
  customerName: string;
  items: { name: string; qty: number; notes?: string }[];
  status: "new" | "preparing" | "ready" | "picked_up";
  remainingSeconds: number;
  total: number;
  orderTime: string;
  shelfNumber?: string;
  otp?: string;
}

interface MenuItemStock {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  inStock: boolean;
  category: string;
}

export function KitchenMobileApp() {
  const { lang, tn } = useI18n();
  const ar = lang === "ar";

  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"kds" | "menu">("kds");
  const [kdsFilter, setKdsFilter] = useState<"all" | "new" | "preparing" | "ready">("all");

  // Sample Live Kitchen Orders
  const [tickets, setTickets] = useState<KitchenTicket[]>([
    {
      id: "kt-1",
      orderNumber: "ORD-9421",
      customerName: "سارة عبد العزيز",
      items: [
        { name: "سلطة الكينوا بالأفوكادو (كيتو)", qty: 1, notes: "الصلصة جانباً" },
        { name: "سموذي التوت البري الطبيعي", qty: 1 },
      ],
      status: "new",
      remainingSeconds: 600, // 10 mins
      total: 60,
      orderTime: "منذ دقيقتين",
    },
    {
      id: "kt-2",
      orderNumber: "ORD-9420",
      customerName: "محمد الشمري",
      items: [
        { name: "سماش أنجوس برجر دبل تشيز", qty: 2, notes: "بدون مخلل - زيادة صوص" },
        { name: "بطاطس كرسبي مبهرة", qty: 1 },
      ],
      status: "preparing",
      remainingSeconds: 430, // ~7 mins
      total: 98,
      orderTime: "منذ 6 دقائق",
    },
    {
      id: "kt-3",
      orderNumber: "ORD-9418",
      customerName: "فهد القحطاني",
      items: [{ name: "وعاء السلمون المشوي مع الكينوا", qty: 1 }],
      status: "ready",
      remainingSeconds: 0,
      total: 49,
      orderTime: "منذ 14 دقيقة",
      shelfNumber: "رف A-3",
      otp: "8492",
    },
  ]);

  // Menu Stock Items
  const [menuItems, setMenuItems] = useState<MenuItemStock[]>([
    { id: "m1", nameAr: "سماش أنجوس برجر كلاسيك", nameEn: "Classic Angus Smash", price: 34, inStock: true, category: "برجر" },
    { id: "m2", nameAr: "شاورما عربي دجاج بالحطب", nameEn: "Woodfire Shawarma Plate", price: 28, inStock: true, category: "شاورما" },
    { id: "m3", nameAr: "وعاء السلمون المشوي كيتو", nameEn: "Grilled Salmon Keto Bowl", price: 49, inStock: true, category: "صحي" },
    { id: "m4", nameAr: "بيتزا تروفل بالمشروم", nameEn: "Truffle Artisan Pizza", price: 42, inStock: false, category: "بيتزا" },
    { id: "m5", nameAr: "تشيز كيك سان سيباستيان", nameEn: "San Sebastian Cheesecake", price: 26, inStock: true, category: "حلويات" },
  ]);

  // Kitchen countdown clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.status === "preparing" && t.remainingSeconds > 0) {
            return { ...t, remainingSeconds: t.remainingSeconds - 1 };
          }
          return t;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const simulateIncomingKitchenOrder = () => {
    sounds.playNewOrder();
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: KitchenTicket = {
      id: `kt-${Date.now()}`,
      orderNumber: newId,
      customerName: ar ? "عميل جديد عبر التطبيق" : "App Customer",
      items: [
        { name: "2x شاورما دجاج صاج بالثومية", qty: 2 },
        { name: "1x بطاطس مقلية كرسبي", qty: 1 },
      ],
      status: "new",
      remainingSeconds: 720,
      total: 54,
      orderTime: ar ? "الآن" : "Just now",
    };
    setTickets((prev) => [newTicket, ...prev]);
    toast.success(
      ar
        ? `🔔 وصل طلب جديد للمطبخ (${newId})! أصوات التنبيه مفعلة`
        : `🔔 New Kitchen Ticket (${newId}) received!`,
      { duration: 2500 }
    );
  };

  const advanceTicketStatus = (ticketId: string) => {
    sounds.playSuccess();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          if (t.status === "new") {
            toast.success(ar ? `👨‍🍳 جاري طهي الطلب ${t.orderNumber}` : `Cooking ${t.orderNumber}`);
            return { ...t, status: "preparing", remainingSeconds: 600 };
          }
          if (t.status === "preparing") {
            toast.success(ar ? `📦 الطلب ${t.orderNumber} جاهز! تم إشعار الكابتن` : `Ready for Courier`);
            return {
              ...t,
              status: "ready",
              shelfNumber: `رف B-${Math.floor(1 + Math.random() * 9)}`,
              otp: String(Math.floor(1000 + Math.random() * 9000)),
            };
          }
          if (t.status === "ready") {
            toast.success(ar ? `✓ تم تسليم الطلب ${t.orderNumber} للكابتن` : `Handed to courier`);
            return { ...t, status: "picked_up" };
          }
        }
        return t;
      })
    );
  };

  const toggleStock = (itemId: string) => {
    sounds.playClick();
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const next = !item.inStock;
          toast.info(
            next
              ? ar ? `🟢 أصبح متاحاً للطلب: ${item.nameAr}` : `🟢 In stock: ${item.nameEn}`
              : ar ? `🔴 تم إيقاف الصنف مؤقتاً: ${item.nameAr}` : `🔴 Out of stock: ${item.nameEn}`
          );
          return { ...item, inStock: next };
        }
        return item;
      })
    );
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const filteredTickets = tickets.filter((t) => {
    if (kdsFilter === "all") return t.status !== "picked_up";
    return t.status === kdsFilter;
  });

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 selection:bg-emerald-500 selection:text-slate-950">
      {/* 1. TOP KITCHEN KDS HEADER */}
      <header className="sticky top-11 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-emerald-900/40 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Kitchen Info */}
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
              <ChefHat className="size-5" />
            </div>
            <div>
              <h2 className="text-xs font-black text-white">
                {ar ? "مطبخ FoodHub المركزي (النرجس)" : "FoodHub Kitchen #01"}
              </h2>
              <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                {ar ? "شاشة KDS المطبخ الحية" : "Live Kitchen KDS Display"}
              </p>
            </div>
          </div>

          {/* Open/Closed Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsOpen(!isOpen);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isOpen
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}
          >
            <Power className="size-3.5" />
            <span>{isOpen ? (ar ? "مفتوح 🟢" : "OPEN 🟢") : (ar ? "مغلق 🔴" : "CLOSED 🔴")}</span>
          </button>
        </div>
      </header>

      {/* 2. TODAY'S KITCHEN METRICS */}
      <section className="px-4 pt-3">
        <div className="max-w-md mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-800/40 p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <TrendingUp className="size-3.5 text-emerald-400" />
              {ar ? "إحصائيات المطبخ اليوم" : "Today's Kitchen Telemetry"}
            </span>
            <Button
              size="sm"
              onClick={simulateIncomingKitchenOrder}
              className="h-7 px-2.5 text-[11px] font-bold rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
            >
              {ar ? "+ طلب تجريبي 🔔" : "+ Test Ticket 🔔"}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">{ar ? "طلبات اليوم" : "Total Orders"}</div>
              <div className="font-black text-white text-base">42</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">{ar ? "المبيعات" : "Sales"}</div>
              <div className="font-black text-emerald-400 text-base">3,480 {ar ? "ر.س" : "SAR"}</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <div className="text-slate-400 text-[10px]">{ar ? "متوسط الطهي" : "Avg Cook"}</div>
              <div className="font-black text-amber-400 text-base">11.2 د</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TABS: KDS VS MENU STOCK */}
      <section className="px-4 pt-3">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("kds");
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === "kds"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {ar ? "شاشة التذاكر KDS 👨‍🍳" : "KDS Tickets 👨‍🍳"}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("menu");
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === "menu"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {ar ? "توفر الأصناف والمخزون 📦" : "Menu Stock 📦"}
          </button>
        </div>
      </section>

      {/* 4. KDS ORDERS VIEW */}
      {activeTab === "kds" && (
        <section className="px-4 pt-3 space-y-3">
          {/* Sub-filters for KDS */}
          <div className="max-w-md mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: ar ? "الكل" : "All" },
              { id: "new", label: ar ? "طلبات جديدة 🔔" : "New 🔔" },
              { id: "preparing", label: ar ? "قيد الطهي 🍳" : "Cooking 🍳" },
              { id: "ready", label: ar ? "جاهز للاستلام 📦" : "Ready 📦" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sounds.playClick();
                  setKdsFilter(f.id as any);
                }}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  kdsFilter === f.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900 border border-slate-800 text-slate-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Tickets Cards */}
          <div className="max-w-md mx-auto space-y-3">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-lg hover:border-emerald-500/40 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">{ticket.orderNumber}</span>
                    <Badge
                      className={`text-[10px] ${
                        ticket.status === "new"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : ticket.status === "preparing"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {ticket.status === "new" && (ar ? "طلب جديد" : "New")}
                      {ticket.status === "preparing" && (ar ? "في الفرن / الطهي" : "Cooking")}
                      {ticket.status === "ready" && (ar ? "بانتظار الكابتن" : "Ready")}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                    <Clock className="size-3.5" />
                    <span>
                      {ticket.status === "preparing" ? formatTimer(ticket.remainingSeconds) : ticket.orderTime}
                    </span>
                  </div>
                </div>

                {/* Customer name */}
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{ticket.customerName}</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {ticket.total} {ar ? "ر.س" : "SAR"}
                  </span>
                </div>

                {/* Items checklist */}
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-xs">
                  {ticket.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-white font-medium">
                        <span>• {it.name}</span>
                        <span className="font-mono text-emerald-400 font-bold">x{it.qty}</span>
                      </div>
                      {it.notes && (
                        <div className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                          ⚠️ {it.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Handoff details for Ready status */}
                {ticket.status === "ready" && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <span className="text-emerald-400 font-bold">
                      📍 مكان الوجبة: <span className="text-white">{ticket.shelfNumber}</span>
                    </span>
                    <span className="text-amber-400 font-mono font-bold">
                      OTP: {ticket.otp}
                    </span>
                  </div>
                )}

                {/* Next Stage Button */}
                <Button
                  onClick={() => advanceTicketStatus(ticket.id)}
                  className={`w-full h-10 font-black rounded-xl text-xs transition-all ${
                    ticket.status === "new"
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                      : ticket.status === "preparing"
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                  }`}
                >
                  {ticket.status === "new" && (ar ? "قبول وبدء الطهي 👨‍🍳" : "Accept & Cook 👨‍🍳")}
                  {ticket.status === "preparing" && (ar ? "جاهز للاستلام ➔ إشعار الكابتن 📦" : "Ready for Pickup 📦")}
                  {ticket.status === "ready" && (ar ? "تم التسليم للكابتن ✓" : "Handed Over ✓")}
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. MENU STOCK MANAGEMENT VIEW */}
      {activeTab === "menu" && (
        <section className="px-4 pt-3 space-y-3">
          <div className="max-w-md mx-auto space-y-2">
            <div className="text-xs text-slate-400 px-1">
              {ar
                ? "تحكم بتوفر الأصناف بنقرة واحدة لمنع الطلبات غير المتوفرة:"
                : "Toggle item stock live to prevent unavailable orders:"}
            </div>

            {menuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md"
              >
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {ar ? item.nameAr : item.nameEn}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.price} {ar ? "ر.س" : "SAR"} • {item.category}
                  </div>
                </div>

                <button
                  onClick={() => toggleStock(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    item.inStock
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {item.inStock ? (ar ? "متوفر 🟢" : "IN STOCK 🟢") : (ar ? "نفد 🔴" : "OUT OF STOCK 🔴")}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

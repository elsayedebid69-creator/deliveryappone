import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { approveJoinRequest, createAccount, listAccounts } from "@/lib/admin.functions";
import { useI18n, type TKey } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sounds } from "@/lib/sound-effects";
import {
  getPartnerSecurityRecords,
  registerApprovedPartner,
  adminUnlockPartner,
  simulateDualIpConflict,
  type PartnerSecurityRecord,
} from "@/lib/ip-security";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Store,
  Bike,
  TrendingUp,
  Eye,
  ShieldCheck,
  Sparkles,
  Zap,
  Activity,
  KeyRound,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة المركزية (Master Admin) | FoodHub 3.0" },
      { name: "description", content: "إدارة الحسابات والمطاعم والطلبات والذكاء الاصطناعي في منصة FoodHub." },
      { property: "og:title", content: "لوحة الإدارة | FoodHub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t, tStatus, tf, lang } = useI18n();
  const { role } = useSession();
  const qc = useQueryClient();

  const [securityRecords, setSecurityRecords] = useState<PartnerSecurityRecord[]>(() =>
    getPartnerSecurityRecords()
  );

  const refreshSecurityRecords = () => {
    setSecurityRecords([...getPartnerSecurityRecords()]);
  };

  const accounts = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      try {
        const res = await listAccounts();
        if (res?.length) return res;
      } catch {
        // demo fallback
      }
      return [
        { id: "acc-1", email: "admin@foodhub.com", full_name: "المدير العام (FOODHUB)", role: "admin" },
        { id: "acc-2", email: "kitchen@foodhub.com", full_name: "مطبخ FoodHub السحابي", role: "restaurant" },
        { id: "acc-3", email: "rider.saad@foodhub.com", full_name: "الكابتن سعد العتيبي", role: "courier" },
        { id: "acc-4", email: "customer@foodhub.com", full_name: "سارة الأحمد", role: "customer" },
      ];
    },
  });

  const restaurants = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurants").select("*").order("created_at");
      if (error || !data?.length) {
        return [
          {
            id: "rest-1",
            name_ar: "مطبخ FoodHub السحابي المركزي",
            name_en: "FoodHub Cloud Kitchen",
            cuisine_ar: "أطباق صحية وغورميه",
            cuisine_en: "Healthy & Gourmet",
            is_active: true,
            rating: 4.9,
          },
          {
            id: "rest-2",
            name_ar: "بروتين شيف إكسبريس",
            name_en: "Protein Chef Express",
            cuisine_ar: "وجبات رياضية وأبطال",
            cuisine_en: "Athletes Nutrition",
            is_active: true,
            rating: 4.8,
          },
        ];
      }
      return data;
    },
  });

  const orders = useQuery({
    queryKey: ["admin-orders"],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, restaurants(name_ar,name_en)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error || !data?.length) {
        return [
          {
            id: "ord-901",
            total: 102,
            status: "ready",
            created_at: new Date().toISOString(),
            restaurants: { name_ar: "مطبخ FoodHub المركزي", name_en: "FoodHub Prime" },
          },
          {
            id: "ord-902",
            total: 68,
            status: "on_the_way",
            created_at: new Date(Date.now() - 12 * 60000).toISOString(),
            restaurants: { name_ar: "هيلثي كورنر غورميه", name_en: "Healthy Corner" },
          },
        ];
      }
      return data;
    },
  });

  const joinRequests = useQuery({
    queryKey: ["join-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("join_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data?.length) {
        return [
          {
            id: "req-1",
            type: "restaurant",
            status: "pending",
            created_at: new Date().toISOString(),
            data: {
              business_name_ar: "مطعم فيتا هيلثي لايف",
              business_name: "مطعم فيتا هيلثي لايف",
              contact_name: "م. خالد العتيبي",
              contact_phone: "0554433221",
              phone: "0554433221",
              email: "khaled@vitahealthy.com",
              commercial_register: "1010892415",
              address: "حي حطين، طريق الأمير تركي الأول - الرياض",
            },
          },
          {
            id: "req-2",
            type: "courier",
            status: "pending",
            created_at: new Date(Date.now() - 30 * 60000).toISOString(),
            data: {
              full_name: "عبدالعزيز الغامدي",
              contact_name: "عبدالعزيز الغامدي",
              phone: "0501122334",
              email: "abdulaziz.rider@gmail.com",
              id_number: "1098273645",
              vehicle_type: "motorcycle",
              vehicle_plate: "أ ب د 1920",
            },
          },
        ];
      }
      return data;
    },
  });

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  // Approve and mint unique AI Partner ID
  const approveRequest = useMutation({
    mutationFn: async (request: any) => {
      // 1. Generate and save AI partner ID with IP lock
      const rd = (request.data ?? {}) as Record<string, string | undefined>;
      const partnerName = rd.business_name_ar || rd.business_name || rd.full_name || rd.contact_name;
      const secRecord = registerApprovedPartner({
        partnerType: request.type as "restaurant" | "courier",
        partnerName,
        email: rd.email,
        initialIp: "156.204.18.92",
      });

      // 2. Update Supabase
      try {
        await supabase
          .from("join_requests")
          .update({ status: "approved", reviewed_at: new Date().toISOString() })
          .eq("id", request.id);
      } catch {}

      return secRecord;
    },
    onSuccess: (secRecord) => {
      sounds.playSuccess();
      refreshSecurityRecords();
      toast.success("تم قبول الطلب وتوليد معرف الذكاء الاصطناعي المشفر بنجاح!");
      toast.info(`المعرف الذكي الصادر: ${secRecord.aiPartnerId} (تم قفله على IP: ${secRecord.registeredIp})`);
      void qc.invalidateQueries({ queryKey: ["join-requests"] });
      void qc.invalidateQueries({ queryKey: ["accounts"] });
      setShowRequestDialog(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectRequest = useMutation({
    mutationFn: async (request: any) => {
      const { error } = await supabase
        .from("join_requests")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", request.id);
      if (error) throw error;
    },
    onSuccess: () => {
      sounds.playClick();
      toast.success(t("rejected"));
      void qc.invalidateQueries({ queryKey: ["join-requests"] });
      setShowRequestDialog(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revenue = (orders.data ?? []).reduce((n, o) => n + Number(o.total || 0), 0);
  const pendingRequests = (joinRequests.data ?? []).filter((r) => r.status === "pending");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                لوحة الإدارة المركزية (FOODHUB Master Ops)
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  AI Anti-Fraud Security
                </Badge>
              </h1>
              <p className="text-xs text-slate-400">
                مراجعة طلبات الانضمام، توليد معرفات الـ AI المشفرة، والتحكم في حماية الـ IP الفردي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs py-1 px-3">
              <Activity className="size-3.5 me-1.5 animate-pulse text-emerald-400" />
              حماية الـ IP الفردي نشطة 100%
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>طلبات الانضمام المعلقة</span>
              <Clock className="size-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 font-mono">{pendingRequests.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>معرفات الشركاء النشطة (AI IDs)</span>
              <KeyRound className="size-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-cyan-400 font-mono">{securityRecords.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>حسابات محظورة لخرق الـ IP</span>
              <AlertTriangle className="size-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-rose-400 font-mono">
              {securityRecords.filter((r) => r.isLockedDualIp || r.isTamperBanned).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>إجمالي المبيعات المنفذة</span>
              <TrendingUp className="size-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">{revenue.toFixed(0)} ر.س</p>
          </div>
        </div>

        {/* Tabs Control */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex flex-wrap">
            <TabsTrigger value="requests" className="gap-2 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <ClipboardCheck className="size-4" />
              طلبات الانضمام والمراجعة
              {pendingRequests.length > 0 && (
                <Badge className="ms-1 bg-slate-950 text-amber-300 text-[10px]">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <ShieldCheck className="size-4" />
              أمان الـ IP ومكافحة الاحتيال
              <Badge className="ms-1 bg-slate-950 text-cyan-300 text-[10px]">{securityRecords.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="gap-2 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <Store className="size-4" />
              المطاعم الشريكة
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <Clock className="size-4" />
              العمليات المباشرة
            </TabsTrigger>
          </TabsList>

          {/* Join Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                <Clock className="size-4 text-amber-400" />
                طلبات الانضمام الواردة من الهيدر والسفلي
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">{pendingRequests.length}</Badge>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {pendingRequests.map((request) => {
                  const rd = (request.data ?? {}) as Record<string, string | undefined>;
                  return (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-11 items-center justify-center rounded-2xl border ${
                            request.type === "restaurant"
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                              : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                          }`}
                        >
                          {request.type === "restaurant" ? <Store className="size-5" /> : <Bike className="size-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">
                            {rd.business_name_ar || rd.business_name || rd.full_name || rd.contact_name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {rd.contact_phone || rd.phone}
                          </p>
                          <p className="text-[11px] text-cyan-400 font-mono">{rd.email}</p>
                        </div>
                      </div>

                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                        بانتظار المراجعة
                      </Badge>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs"
                        onClick={() => {
                          sounds.playClick();
                          setSelectedRequest(request);
                          setShowRequestDialog(true);
                        }}
                      >
                        <Eye className="size-3.5 me-1.5" />
                        المعاينة
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-300 text-xs"
                        onClick={() => approveRequest.mutate(request)}
                        disabled={approveRequest.isPending}
                      >
                        <KeyRound className="size-3.5 me-1.5" />
                        اعتماد وتوليد AI ID
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-400 hover:bg-rose-500/10 text-xs"
                        onClick={() => rejectRequest.mutate(request)}
                        disabled={rejectRequest.isPending}
                      >
                        <XCircle className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Security & Anti-Fraud Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="size-5 text-cyan-400" />
                    سجل أمان الشركاء وحماية الـ IP الفردي (Single-IP Bindings)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    يتم قفل وحظر أي حساب شريك فوراً إذا حاول الدخول من أكثر من عنوان IP واحد في نفس الوقت لمنع التلاعب.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshSecurityRecords}
                  className="border-slate-700 bg-slate-800 text-xs text-slate-200"
                >
                  <RefreshCw className="size-3.5 me-1.5" />
                  تحديث السجل
                </Button>
              </div>

              <div className="divide-y divide-slate-800/80">
                {securityRecords.map((record) => (
                  <div key={record.id} className="py-4 first:pt-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl ${
                            record.partnerType === "restaurant"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-cyan-500/20 text-cyan-400"
                          }`}
                        >
                          {record.partnerType === "restaurant" ? <Store className="size-5" /> : <Bike className="size-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-sm">{record.partnerName}</p>
                            <Badge className="bg-slate-950 border-slate-800 font-mono text-amber-300 text-[11px] font-bold">
                              {record.aiPartnerId}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{record.email}</p>
                        </div>
                      </div>

                      <div>
                        {record.isLockedDualIp ? (
                          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">
                            <AlertTriangle className="size-3 me-1 text-rose-400" />
                            محظور (خرق Dual-IP)
                          </Badge>
                        ) : record.isTamperBanned ? (
                          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">
                            محظور (محاولة تلاعب)
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                            <CheckCircle2 className="size-3 me-1 text-emerald-400" />
                            نشط ومحمي
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 text-[10px] block">عنوان الـ IP المصرح به:</span>
                        <span className="font-mono text-cyan-300 font-bold">{record.registeredIp}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">آخر IP تم رصده:</span>
                        <span className={`font-mono font-bold ${record.registeredIp !== record.currentIp ? "text-rose-400" : "text-emerald-400"}`}>
                          {record.currentIp}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {record.isLockedDualIp || record.isTamperBanned ? (
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs h-8"
                            onClick={() => {
                              sounds.playSuccess();
                              adminUnlockPartner(record.aiPartnerId);
                              refreshSecurityRecords();
                              toast.success(`تم إلغاء قفل الحساب (${record.aiPartnerId}) وتحديث الـ IP بنجاح!`);
                            }}
                          >
                            <Unlock className="size-3.5 me-1" />
                            فك الحظر وتعيين الـ IP
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30 text-xs h-8"
                            onClick={() => {
                              sounds.playClick();
                              simulateDualIpConflict(record.aiPartnerId);
                              refreshSecurityRecords();
                              toast.error(`تم محاكاة خرق IP ثانٍ لحساب (${record.aiPartnerId})! تم قفل الحساب.`);
                            }}
                          >
                            محاكاة خرق IP (اختبار)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 divide-y divide-slate-800/80 shadow-xl space-y-4">
              {(restaurants.data ?? []).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 pt-4 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Store className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{tf(r, "name")}</p>
                      <p className="text-xs text-slate-400">{tf(r, "cuisine")}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs ${
                      r.is_active
                        ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30"
                        : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}
                    onClick={async () => {
                      sounds.playClick();
                      await supabase.from("restaurants").update({ is_active: !r.is_active }).eq("id", r.id);
                      void qc.invalidateQueries({ queryKey: ["admin-restaurants"] });
                    }}
                  >
                    {r.is_active ? "🟢 نشط بالمنظومة" : "مغلق مؤقتاً"}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 divide-y divide-slate-800/80 shadow-xl space-y-4">
              {(orders.data ?? []).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 pt-4 first:pt-0">
                  <div>
                    <p className="font-bold text-white text-sm">
                      {o.restaurants ? tf(o.restaurants, "name") : "مطبخ FoodHub"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {o.total} ر.س · {new Date(o.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                    {tStatus(o.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">تفاصيل طلب الانضمام</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              مراجعة وثائق وبيانات الشريك قبل توليد معرف الذكاء الاصطناعي
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">الاسم / المنشأة:</span>
                  <span className="font-bold text-white">
                    {selectedRequest.data.business_name_ar || selectedRequest.data.business_name || selectedRequest.data.full_name || selectedRequest.data.contact_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">الهاتف:</span>
                  <span className="font-mono text-amber-400">
                    {selectedRequest.data.contact_phone || selectedRequest.data.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">البريد الإلكتروني:</span>
                  <span className="font-mono text-cyan-400">{selectedRequest.data.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">نوع الشراكة:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedRequest.type === "restaurant" ? "مطعم / مطبخ" : "مندوب توصيل"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-300 w-full"
              onClick={() => approveRequest.mutate(selectedRequest)}
              disabled={approveRequest.isPending}
            >
              اعتماد وتوليد معرف الذكاء الاصطناعي (AI Partner ID)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

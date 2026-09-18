import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  getAllAccessAccounts,
  saveAccessAccounts,
  issueAccountCode,
  regenerateAccountCode,
  getCodeRecoveryRequests,
  adminResolveRecoveryRequest,
  type AccessCodeAccount,
  type CodeRecoveryRequest,
  type AccountType,
} from "@/lib/access-codes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppSimulatorWorkspace } from "@/components/dev-workspace/app-simulator";
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
  Smartphone,
  Copy,
  Check,
  MessageSquare,
  PlusCircle,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة والمحاكاة المركزية (Master Admin) | FOODHUB" },
      { name: "description", content: "إدارة الحسابات، طلبات انضمام الشركاء، نظام حماية IP الفردي ومحاكي التطبيقات في منصة FOODHUB." },
      { property: "og:title", content: "لوحة الإدارة المركزية | FOODHUB" },
      { property: "og:description", content: "لوحة القيادة والمراقبة لمنظومة FOODHUB." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t, tStatus, tf, lang } = useI18n();
  const { role } = useSession();
  const qc = useQueryClient();

  // State for Access Codes & Recovery Inbox
  const [accessAccounts, setAccessAccounts] = useState<AccessCodeAccount[]>(() => getAllAccessAccounts());
  const [recoveryRequests, setRecoveryRequests] = useState<CodeRecoveryRequest[]>(() => getCodeRecoveryRequests());
  const [accountSearch, setAccountSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  // Issued Code Presentation Modal
  const [issuedCodeModal, setIssuedCodeModal] = useState<{
    open: boolean;
    code: string;
    accountName: string;
    role: AccountType;
    phone: string;
    email: string;
  }>({
    open: false,
    code: "",
    accountName: "",
    role: "customer",
    phone: "",
    email: "",
  });
  const [codeCopied, setCodeCopied] = useState(false);

  // Manual Account Creation Dialog
  const [showManualCreateDialog, setShowManualCreateDialog] = useState(false);
  const [manualForm, setManualForm] = useState({
    accountType: "customer" as AccountType,
    fullName: "",
    phone: "",
    email: "",
    businessName: "",
    city: "الرياض",
  });

  // Security IP Records
  const [securityRecords, setSecurityRecords] = useState<PartnerSecurityRecord[]>(() =>
    getPartnerSecurityRecords()
  );

  const refreshData = () => {
    setSecurityRecords([...getPartnerSecurityRecords()]);
    setAccessAccounts([...getAllAccessAccounts()]);
    setRecoveryRequests([...getCodeRecoveryRequests()]);
  };

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
          {
            id: "req-3",
            type: "customer",
            status: "pending",
            created_at: new Date(Date.now() - 10 * 60000).toISOString(),
            data: {
              full_name: "نورة القحطاني",
              phone: "0567788990",
              email: "noura.q@gmail.com",
              address: "حي النخيل - الرياض",
            },
          },
        ];
      }
      return data;
    },
  });

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  // Approve Request, Generate Code, and Setup Account
  const approveRequest = useMutation({
    mutationFn: async (request: any) => {
      const rd = (request.data ?? {}) as {
        business_name_ar?: string;
        business_name?: string;
        full_name?: string;
        contact_name?: string;
        contact_phone?: string;
        phone?: string;
        email?: string;
        address?: string;
      };
      const partnerName = rd.business_name_ar || rd.business_name || rd.full_name || rd.contact_name || "مستخدم جديد";
      const email = rd.email ?? `user_${Date.now()}@foodhub.com`;
      const phone = rd.contact_phone || rd.phone || "0500000000";
      const reqType: AccountType = request.type === "restaurant" ? "restaurant" : request.type === "courier" ? "courier" : "customer";

      // 1. Issue Access Code in Engine
      const newAcc = issueAccountCode({
        accountType: reqType,
        fullName: partnerName,
        email,
        phone,
        businessName: rd.business_name_ar || rd.business_name,
        city: rd.address || "الرياض",
      });

      // 2. Register Anti-Fraud IP Lock if partner
      if (reqType !== "customer") {
        registerApprovedPartner({
          partnerType: reqType as "restaurant" | "courier",
          partnerName,
          email,
          initialIp: "156.204.18.92",
        });
      }

      // 3. Update Supabase status
      try {
        await supabase
          .from("join_requests")
          .update({ status: "approved", reviewed_at: new Date().toISOString() })
          .eq("id", request.id);
      } catch {}

      return newAcc;
    },
    onSuccess: (newAcc) => {
      sounds.playSuccess();
      refreshData();
      toast.success("تم اعتماد الحساب وإصدار كود الوصول بنجاح!");
      setIssuedCodeModal({
        open: true,
        code: newAcc.code,
        accountName: newAcc.fullName,
        role: newAcc.accountType,
        phone: newAcc.phone,
        email: newAcc.email,
      });
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

  // Resolve Forgot Code Support Ticket
  const handleResolveRecovery = (reqId: string) => {
    sounds.playSuccess();
    const res = adminResolveRecoveryRequest(reqId);
    if (res) {
      refreshData();
      toast.success(`تم إصدار وتفعيل كود جديد: ${res.newCode}`);
      setIssuedCodeModal({
        open: true,
        code: res.newCode,
        accountName: res.account.fullName,
        role: res.account.accountType,
        phone: res.account.phone,
        email: res.account.email,
      });
    } else {
      toast.error("تعذر إصدار كود لهذا الطلب.");
    }
  };

  // Regenerate Code for Existing Account
  const handleRegenerateCode = (accId: string, accName: string) => {
    sounds.playClick();
    const newCode = regenerateAccountCode(accId);
    if (newCode) {
      refreshData();
      toast.success(`تم تجديد كود الدخول للحساب (${accName}) إلى: ${newCode}`);
    }
  };

  // Handle Manual Account Creation
  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.fullName.trim() || !manualForm.phone.trim()) {
      toast.error("يرجى ملء الاسم ورقم الهاتف.");
      return;
    }
    const newAcc = issueAccountCode({
      accountType: manualForm.accountType,
      fullName: manualForm.fullName,
      email: manualForm.email || `${manualForm.fullName.replace(/\s+/g, "").toLowerCase()}@foodhub.com`,
      phone: manualForm.phone,
      businessName: manualForm.businessName,
      city: manualForm.city,
    });

    if (manualForm.accountType !== "customer") {
      registerApprovedPartner({
        partnerType: manualForm.accountType as "restaurant" | "courier",
        partnerName: manualForm.businessName || manualForm.fullName,
        email: newAcc.email,
        initialIp: "156.204.18.92",
      });
    }

    refreshData();
    setShowManualCreateDialog(false);
    setManualForm({
      accountType: "customer",
      fullName: "",
      phone: "",
      email: "",
      businessName: "",
      city: "الرياض",
    });
    setIssuedCodeModal({
      open: true,
      code: newAcc.code,
      accountName: newAcc.fullName,
      role: newAcc.accountType,
      phone: newAcc.phone,
      email: newAcc.email,
    });
    toast.success("تم إنشاء الحساب وإصدار كود الوصول بنجاح!");
  };

  const copyIssuedCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(issuedCodeModal.code);
    setCodeCopied(true);
    toast.success("تم نسخ كود الدخول إلى الحافظة!");
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const revenue = (orders.data ?? []).reduce((n, o) => n + Number(o.total || 0), 0);
  const pendingRequests = (joinRequests.data ?? []).filter((r) => r.status === "pending");
  const pendingRecoveries = recoveryRequests.filter((r) => r.status === "pending");

  const filteredAccounts = accessAccounts.filter((acc) => {
    const matchesSearch =
      acc.fullName.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.code.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.phone.includes(accountSearch) ||
      acc.email.toLowerCase().includes(accountSearch.toLowerCase());
    const matchesRole = selectedRoleFilter === "all" || acc.accountType === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 font-black">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                {lang === "ar" ? "لوحة الإدارة المركزية والأكواد" : "Master Ops & Access Code Center"}
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  FOODHUB Core
                </Badge>
              </h1>
              <p className="text-xs text-slate-400">
                {lang === "ar"
                  ? "إدارة طلبات الانضمام، توليد أكواد الوصول للعملاء والمناديب والمطابخ، ورسائل دعم استرجاع الأكواد"
                  : "Manage join requests, issue user/partner access codes, handle recovery tickets, and oversee multi-app simulation"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 text-xs gap-1.5 shadow-md"
              onClick={() => setShowManualCreateDialog(true)}
            >
              <PlusCircle className="size-4" />
              {lang === "ar" ? "إصدار كود لحساب جديد" : "Create Account & Code"}
            </Button>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs py-1 px-3">
              <Activity className="size-3.5 me-1.5 animate-pulse text-emerald-400" />
              {lang === "ar" ? "المنظومة نشطة" : "System Active"}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{lang === "ar" ? "طلبات الحسابات المعلقة" : "Pending Join Requests"}</span>
              <Clock className="size-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 font-mono">{pendingRequests.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{lang === "ar" ? "رسائل الدعم واسترجاع الأكواد" : "Forgot Code Recovery"}</span>
              <MessageSquare className="size-4 text-orange-400" />
            </div>
            <p className="text-2xl font-black text-orange-400 font-mono">{pendingRecoveries.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{lang === "ar" ? "أكواد الوصول الصادرة" : "Active Access Codes"}</span>
              <KeyRound className="size-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-cyan-400 font-mono">{accessAccounts.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{lang === "ar" ? "إجمالي المبيعات" : "Platform Revenue"}</span>
              <TrendingUp className="size-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">{revenue.toFixed(0)} {t("sar")}</p>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex flex-wrap gap-1">
            <TabsTrigger value="simulator" className="gap-2 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-400 data-[state=active]:text-slate-950 font-black rounded-xl shadow-md">
              <Smartphone className="size-4" />
              {lang === "ar" ? "📱 محاكي التطبيقات (العميل، المطعم، المندوب)" : "📱 Multi-App Simulator"}
            </TabsTrigger>

            <TabsTrigger value="requests" className="gap-2 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <ClipboardCheck className="size-4" />
              {lang === "ar" ? "طلبات الانضمام وتوليد الأكواد" : "Join Requests & Codes"}
              {pendingRequests.length > 0 && (
                <Badge className="ms-1 bg-slate-950 text-amber-300 text-[10px]">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="recovery" className="gap-2 text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <MessageSquare className="size-4" />
              {lang === "ar" ? "صندوق رسائل الدعم واسترجاع الأكواد" : "Code Recovery Inbox"}
              {pendingRecoveries.length > 0 && (
                <Badge className="ms-1 bg-slate-950 text-orange-300 text-[10px]">{pendingRecoveries.length}</Badge>
              )}
            </TabsTrigger>

            <TabsTrigger value="accounts" className="gap-2 text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <KeyRound className="size-4" />
              {lang === "ar" ? "سجل الحسابات وأكواد الوصول" : "Access Codes Directory"}
              <Badge className="ms-1 bg-slate-950 text-cyan-300 text-[10px]">{accessAccounts.length}</Badge>
            </TabsTrigger>

            <TabsTrigger value="security" className="gap-2 text-xs data-[state=active]:bg-purple-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <ShieldCheck className="size-4" />
              {lang === "ar" ? "حماية IP الفردي" : "IP Security"}
            </TabsTrigger>

            <TabsTrigger value="restaurants" className="gap-2 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <Store className="size-4" />
              {lang === "ar" ? "المطابخ والمتاجر" : "Kitchens"}
            </TabsTrigger>

            <TabsTrigger value="orders" className="gap-2 text-xs data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl">
              <Clock className="size-4" />
              {lang === "ar" ? "العمليات المباشرة" : "Live Orders"}
            </TabsTrigger>
          </TabsList>

          {/* 1. App Simulator Tab */}
          <TabsContent value="simulator" className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
              <AppSimulatorWorkspace showHeader={true} />
            </div>
          </TabsContent>

          {/* 2. Join Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-white">
                    <Clock className="size-4 text-amber-400" />
                    {lang === "ar" ? "طلبات إنشاء الحسابات الواردة من الهيدر السفلي" : "Incoming Account Registration Requests"}
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">{pendingRequests.length}</Badge>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === "ar"
                      ? "عند الضغط على 'اعتماد وتوليد كود الوصول' يقوم النظام بإنشاء الحساب فوراً وتوليد كود مشفر يضعه المستخدم في واجهة الموقع ليفتح معه تطبيقه."
                      : "Approving a request generates a unique encrypted access code that the user enters on the site to immediately launch their role interface."}
                  </p>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 space-y-3">
                  <CheckCircle2 className="size-10 mx-auto text-emerald-400/60" />
                  <p className="text-sm font-bold text-slate-300">
                    {lang === "ar" ? "لا توجد طلبات انضمام معلقة حالياً" : "No pending registration requests"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {lang === "ar" ? "أي طلب جديد يتم إرساله من الهيدر السفلي سيظهر هنا فوراً" : "New requests submitted from the footer will appear here."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {pendingRequests.map((request) => {
                    const rd = (request.data ?? {}) as {
                      business_name_ar?: string;
                      business_name?: string;
                      full_name?: string;
                      contact_name?: string;
                      contact_phone?: string;
                      phone?: string;
                      email?: string;
                      address?: string;
                      vehicle_type?: string;
                    };
                    const title = rd.business_name_ar || rd.business_name || rd.full_name || rd.contact_name || "طلب حساب جديد";
                    const phone = rd.contact_phone || rd.phone || "";
                    const email = rd.email || "";

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
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : request.type === "courier"
                                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              }`}
                            >
                              {request.type === "restaurant" ? (
                                <Store className="size-5" />
                              ) : request.type === "courier" ? (
                                <Bike className="size-5" />
                              ) : (
                                <Users className="size-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white text-sm">{title}</p>
                                <Badge
                                  className={`text-[10px] ${
                                    request.type === "restaurant"
                                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                      : request.type === "courier"
                                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  }`}
                                >
                                  {request.type === "restaurant"
                                    ? "مطبخ / متجر"
                                    : request.type === "courier"
                                    ? "كابتن مندوب"
                                    : "حساب عميل"}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">{phone}</p>
                              {email && <p className="text-[11px] text-slate-500 font-mono">{email}</p>}
                            </div>
                          </div>

                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                            بانتظار الموافقة
                          </Badge>
                        </div>

                        {rd.address && (
                          <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                            📍 {rd.address}
                          </p>
                        )}

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
                            اعتماد وتوليد الكود
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
              )}
            </div>
          </TabsContent>

          {/* 3. Code Recovery & Support Inbox Tab */}
          <TabsContent value="recovery" className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="size-5 text-orange-400" />
                  {lang === "ar" ? "صندوق رسائل الدعم واسترجاع أكواد الدخول المنسية" : "Forgot Code Support & Recovery Inbox"}
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">{pendingRecoveries.length}</Badge>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === "ar"
                    ? "عندما ينسى العميل أو المندوب أو المطعم كوده، يرسل رسالة دعم من الموقع لتظهر هنا. اضغط 'إصدار كود صالح جديد' لإعادة التعيين ومنحه كود جديد فعال فوراً."
                    : "When a user loses their access code, their support tickets land here. Click 'Issue New Valid Code' to generate and activate a replacement code."}
                </p>
              </div>

              <div className="space-y-3">
                {recoveryRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`rounded-2xl border p-5 space-y-4 transition-all ${
                      req.status === "pending"
                        ? "bg-slate-900/90 border-orange-500/30 shadow-lg shadow-orange-950/10"
                        : "bg-slate-950/40 border-slate-800/80 opacity-70"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl ${
                            req.accountType === "restaurant"
                              ? "bg-amber-500/20 text-amber-400"
                              : req.accountType === "courier"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {req.accountType === "restaurant" ? (
                            <Store className="size-5" />
                          ) : req.accountType === "courier" ? (
                            <Bike className="size-5" />
                          ) : (
                            <Users className="size-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-sm">{req.fullName}</p>
                            <Badge className="text-[10px] bg-slate-950 border-slate-800 text-slate-300">
                              {req.accountType === "restaurant"
                                ? "مطعم / متجر"
                                : req.accountType === "courier"
                                ? "كابتن توصيل"
                                : "عميل"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="font-mono text-amber-400">📞 {req.phone}</span>
                            {req.email && <span className="font-mono text-cyan-400">✉️ {req.email}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === "pending" ? (
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                            <Clock className="size-3 me-1 text-orange-400" />
                            بانتظار التحقق وإصدار كود
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                            <CheckCircle2 className="size-3 me-1 text-emerald-400" />
                            تم الحل بكود: <span className="font-mono font-bold ms-1 text-amber-300">{req.issuedNewCode}</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-slate-500 block text-[11px] mb-1">سبب طلب الاسترجاع والملاحظات:</span>
                      <p className="font-medium text-amber-200/90">{req.reason}</p>
                    </div>

                    {req.status === "pending" && (
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-300 text-xs"
                          onClick={() => handleResolveRecovery(req.id)}
                        >
                          <KeyRound className="size-3.5 me-1.5" />
                          التحقق وإصدار كود صالح جديد فوراً
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 4. Issued Access Codes & Accounts Directory */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <KeyRound className="size-5 text-cyan-400" />
                    {lang === "ar" ? "سجل الحسابات وأكواد الوصول النشطة" : "Active Access Codes & User Accounts"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === "ar"
                      ? "جميع الحسابات الصادرة في النظام مع أكواد الوصول الفعالة الخاصة بكل حساب مع إمكانية تجديد وتغيير الكود في أي وقت."
                      : "Complete registry of issued accounts and their active access codes with 1-click code regeneration."}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 text-xs gap-1.5"
                  onClick={() => setShowManualCreateDialog(true)}
                >
                  <PlusCircle className="size-4" />
                  {lang === "ar" ? "إصدار كود جديد يدوي" : "Manual Code Generation"}
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    placeholder={lang === "ar" ? "البحث بالاسم، الكود، أو رقم الهاتف..." : "Search by name, code, phone..."}
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    className="ps-9 bg-slate-950 border-slate-800 text-xs h-9 rounded-xl text-white"
                  />
                </div>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {["all", "customer", "courier", "restaurant", "admin"].map((r) => (
                    <Button
                      key={r}
                      size="sm"
                      variant={selectedRoleFilter === r ? "default" : "ghost"}
                      className={`text-[11px] h-7 px-3 rounded-lg ${
                        selectedRoleFilter === r
                          ? "bg-amber-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                      onClick={() => setSelectedRoleFilter(r)}
                    >
                      {r === "all"
                        ? "الكل"
                        : r === "customer"
                        ? "العملاء"
                        : r === "courier"
                        ? "المناديب"
                        : r === "restaurant"
                        ? "المطابخ"
                        : "الإدارة"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accounts Table */}
              <div className="divide-y divide-slate-800/80">
                {filteredAccounts.map((acc) => (
                  <div key={acc.id} className="py-4 first:pt-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 items-center justify-center rounded-xl ${
                            acc.accountType === "restaurant"
                              ? "bg-amber-500/20 text-amber-400"
                              : acc.accountType === "courier"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : acc.accountType === "admin"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {acc.accountType === "restaurant" ? (
                            <Store className="size-5" />
                          ) : acc.accountType === "courier" ? (
                            <Bike className="size-5" />
                          ) : acc.accountType === "admin" ? (
                            <ShieldCheck className="size-5" />
                          ) : (
                            <Users className="size-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-sm">{acc.fullName}</p>
                            {acc.businessName && (
                              <span className="text-xs text-slate-400">({acc.businessName})</span>
                            )}
                            <Badge
                              className={`text-[10px] ${
                                acc.accountType === "restaurant"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : acc.accountType === "courier"
                                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                                  : acc.accountType === "admin"
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }`}
                            >
                              {acc.accountType === "restaurant"
                                ? "مطبخ / متجر"
                                : acc.accountType === "courier"
                                ? "كابتن مندوب"
                                : acc.accountType === "admin"
                                ? "إدارة عليا"
                                : "عميل"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="font-mono text-amber-400">📞 {acc.phone}</span>
                            <span className="font-mono text-slate-500">✉️ {acc.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Code Badge and Action Buttons */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                          <KeyRound className="size-3.5 text-amber-400" />
                          <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                            {acc.code}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6 text-slate-400 hover:text-white"
                            onClick={() => {
                              sounds.playClick();
                              navigator.clipboard.writeText(acc.code);
                              toast.success(`تم نسخ الكود: ${acc.code}`);
                            }}
                          >
                            <Copy className="size-3" />
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 h-8 gap-1"
                          onClick={() => handleRegenerateCode(acc.id, acc.fullName)}
                        >
                          <RefreshCw className="size-3 text-cyan-400" />
                          تجديد الكود
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 5. Security & Anti-Fraud Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="size-5 text-cyan-400" />
                    {lang === "ar" ? "سجل أمان الشركاء وحماية الـ IP الفردي (Single-IP Bindings)" : "Partner Single-IP Security Shield"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === "ar"
                      ? "يتم قفل وحظر أي حساب شريك فوراً إذا حاول الدخول من أكثر من عنوان IP واحد في نفس الوقت لمنع التلاعب."
                      : "Partner accounts are locked if dual-IP activity is detected to prevent fraud and account sharing."}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshData}
                  className="border-slate-700 bg-slate-800 text-xs text-slate-200"
                >
                  <RefreshCw className="size-3.5 me-1.5" />
                  {lang === "ar" ? "تحديث السجل" : "Refresh Records"}
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
                              refreshData();
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
                              refreshData();
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

          {/* 6. Restaurants Tab */}
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

          {/* 7. Orders Tab */}
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

      {/* 1. Request Details Review Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-white font-bold">تفاصيل طلب الانضمام</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              مراجعة وثائق وبيانات الحساب قبل إنشاء وتوليد كود الدخول
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">الاسم / المنشأة:</span>
                  <span className="font-bold text-white">
                    {selectedRequest.data.business_name_ar ||
                      selectedRequest.data.business_name ||
                      selectedRequest.data.full_name ||
                      selectedRequest.data.contact_name}
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
                  <span className="font-mono text-cyan-400">{selectedRequest.data.email || "غير محدد"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">نوع الحساب:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedRequest.type === "restaurant"
                      ? "مطعم / مطبخ"
                      : selectedRequest.type === "courier"
                      ? "كابتن مندوب"
                      : "عميل"}
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
              اعتماد وإنشاء الحساب وتوليد كود الدخول
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Success Modal Presenting Issued Code */}
      <Dialog open={issuedCodeModal.open} onOpenChange={(open) => setIssuedCodeModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6 text-center space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/20">
            <Sparkles className="size-8 animate-bounce" />
          </div>

          <div>
            <DialogTitle className="text-xl font-black text-white">
              {lang === "ar" ? "تم إصدار كود الوصول بنجاح! 🎉" : "Access Code Generated Successfully! 🎉"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              {lang === "ar"
                ? "تم تفعيل الحساب وتوليد الكود المشفر التالي. قم بإعطائه للمستخدم للدخول مباشرة:"
                : "The account is active. Give this access code to the user to enter in the access login field:"}
            </DialogDescription>
          </div>

          {/* Big Code Card */}
          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-slate-900/90 p-5 space-y-3 shadow-2xl">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
              <span className="font-bold text-white">{issuedCodeModal.accountName}</span>
              <span>•</span>
              <Badge className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/30">
                {issuedCodeModal.role === "restaurant"
                  ? "مطبخ / متجر"
                  : issuedCodeModal.role === "courier"
                  ? "كابتن توصيل"
                  : "عميل"}
              </Badge>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <span className="font-mono text-2xl font-black text-amber-400 tracking-widest">
                {issuedCodeModal.code}
              </span>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1.5 shadow-md"
                onClick={copyIssuedCode}
              >
                {codeCopied ? <Check className="size-4 text-slate-950" /> : <Copy className="size-4" />}
                {codeCopied ? "تم النسخ!" : "نسخ الكود"}
              </Button>
            </div>

            <p className="text-[11px] text-slate-400">
              📞 رقم الهاتف المسجل: <span className="font-mono text-cyan-300 font-bold">{issuedCodeModal.phone}</span>
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-start space-y-1">
            <p className="font-bold text-amber-300">💡 تعليمات الاستخدام:</p>
            <p>1. يفتح المستخدم الموقع ويضغط على زر <strong className="text-white">"دخول بكود الوصول"</strong> في الهيدر.</p>
            <p>2. يقوم بلصق هذا الكود ليفتح معه فوراً تطبيقه المخصص (المتجر، شاشة المطبخ KDS، أو شاشة المندوب).</p>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              onClick={() => setIssuedCodeModal((prev) => ({ ...prev, open: false }))}
            >
              تم وإغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Manual Create Account & Code Dialog */}
      <Dialog open={showManualCreateDialog} onOpenChange={setShowManualCreateDialog}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
              <PlusCircle className="size-5 text-amber-400" />
              {lang === "ar" ? "إنشاء حساب وإصدار كود وصول فوري" : "Direct Account & Code Creation"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {lang === "ar"
                ? "قم بإدخال بيانات المستفيد لتوليد كود دخول فوري ومباشر"
                : "Enter beneficiary details to generate an instant access code."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleManualCreate} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">نوع الحساب *</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "customer", label: "عميل", icon: Users },
                  { id: "courier", label: "مندوب", icon: Bike },
                  { id: "restaurant", label: "مطبخ/متجر", icon: Store },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = manualForm.accountType === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setManualForm((p) => ({ ...p, accountType: item.id as AccountType }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                        isSel
                          ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">
                {manualForm.accountType === "restaurant" ? "اسم المنشأة أو المطبخ *" : "الاسم الكامل *"}
              </Label>
              <Input
                placeholder="مثال: مطبخ الذواقة السحابي أو أحمد العتيبي"
                value={manualForm.fullName}
                onChange={(e) => setManualForm((p) => ({ ...p, fullName: e.target.value }))}
                className="bg-slate-900 border-slate-800 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">رقم الهاتف *</Label>
                <Input
                  placeholder="05XXXXXXXX"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm((p) => ({ ...p, phone: e.target.value }))}
                  className="bg-slate-900 border-slate-800 text-xs text-white font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">المدينة</Label>
                <Input
                  placeholder="الرياض"
                  value={manualForm.city}
                  onChange={(e) => setManualForm((p) => ({ ...p, city: e.target.value }))}
                  className="bg-slate-900 border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">البريد الإلكتروني (اختياري)</Label>
              <Input
                placeholder="user@foodhub.com"
                type="email"
                value={manualForm.email}
                onChange={(e) => setManualForm((p) => ({ ...p, email: e.target.value }))}
                className="bg-slate-900 border-slate-800 text-xs text-white font-mono"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-slate-800 bg-slate-900 text-slate-300 text-xs"
                onClick={() => setShowManualCreateDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 text-xs flex-1"
              >
                توليد وإصدار كود الدخول
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

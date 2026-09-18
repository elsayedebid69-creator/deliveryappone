import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getOrCreateApplicantSession,
  sendOnboardingMessage,
  updateApplicantData,
  attachApplicantDocument,
  autoActivateCustomerAccount,
  type OnboardingApplication,
  type OnboardingChatMessage,
} from "@/lib/onboarding-chat";
import { verifyAndLoginWithCode, type AccountType } from "@/lib/access-codes";
import {
  User,
  Bike,
  Store,
  ShieldCheck,
  Send,
  Upload,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  Sparkles,
  Clock,
  KeyRound,
  Copy,
  Check,
  Eye,
  Trash2,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Car,
  IdCard,
  Building,
  Utensils,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): { role?: AccountType } => {
    const role = (search.role as AccountType) || "customer";
    return { role: ["customer", "courier", "restaurant"].includes(role) ? role : "customer" };
  },
  head: () => ({
    meta: [
      { title: "إنشاء حساب وانضمام الشركاء والمحادثة المباشرة | FOODHUB" },
      { name: "description", content: "بوابة إنشاء الحسابات المستقلة للعملاء والمناديب والمطابخ السحابية مع محادثة مباشرة مع الإدارة والتفعيل الفوري." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { role: initialRole } = useSearch({ from: "/register" });
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const [activeRole, setActiveRole] = useState<AccountType>(initialRole || "customer");
  const [app, setApp] = useState<OnboardingApplication>(() => getOrCreateApplicantSession(activeRole));
  const [chatInput, setChatInput] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [activatedCode, setActivatedCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "الرياض",
    address: "",
    // Courier specific
    vehicleType: "motorcycle",
    vehiclePlate: "",
    idNumber: "",
    // Restaurant specific
    businessName: "",
    cuisine: "أطباق صحية وغورميه",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Switch role session
  useEffect(() => {
    const session = getOrCreateApplicantSession(activeRole);
    setApp(session);
    setFormData((prev) => ({
      ...prev,
      fullName: session.fullName || "",
      phone: session.phone || "",
      email: session.email || "",
      city: session.city || "الرياض",
      address: session.address || "",
      vehicleType: session.vehicleType || "motorcycle",
      vehiclePlate: session.vehiclePlate || "",
      businessName: session.businessName || "",
    }));
    if (session.status === "auto_activated" && session.issuedCode) {
      setActivatedCode(session.issuedCode);
    } else {
      setActivatedCode(null);
    }
  }, [activeRole]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [app.messages]);

  // Handle Text Message Send in Chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sounds.playClick();
    const senderName = formData.fullName || (activeRole === "customer" ? "عميل جديد" : activeRole === "courier" ? "كابتن متقدم" : "شريك متقدم");
    const newMsg = sendOnboardingMessage(app.id, "applicant", senderName, chatInput.trim());
    if (newMsg) {
      setApp((prev) => ({ ...prev, messages: [...prev.messages, newMsg] }));
      setChatInput("");
    }
  };

  // Handle File Upload & Attachment
  const handleFileUpload = (docKey: string, title: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playSuccess();
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = attachApplicantDocument(app.id, docKey, {
        id: `doc-${Date.now()}`,
        title,
        fileName: file.name,
        fileType: file.type,
        dataUrl,
        uploadedAt: new Date().toISOString(),
      });
      if (updated) {
        setApp({ ...updated });
        toast.success(`تم إرفاق: ${title} بنجاح!`);
      }
    };
    reader.readAsDataURL(file);
  };

  // 1. Customer Instant Auto-Activation Handler
  const handleCustomerActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error(lang === "ar" ? "يرجى إدخال الاسم الكامل ورقم الهاتف" : "Please enter your full name and phone number");
      return;
    }

    sounds.playSuccess();
    const result = autoActivateCustomerAccount({
      appId: app.id,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || `customer_${Date.now()}@foodhub.com`,
      city: formData.city,
    });

    setApp({ ...result.application });
    setActivatedCode(result.account.code);
    toast.success(lang === "ar" ? "تم تفعيل حسابك كعميل فورياً وبنجاح! 🎉" : "Account activated instantly! 🎉");
  };

  // 2. Courier & Restaurant Application Submission Handler
  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error("يرجى ملء كافة الحقول الأساسية المطلوبة.");
      return;
    }

    sounds.playSuccess();
    const updated = updateApplicantData(app.id, {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      city: formData.city,
      address: formData.address,
      vehicleType: formData.vehicleType,
      vehiclePlate: formData.vehiclePlate,
      businessName: formData.businessName,
      status: "pending",
    });

    if (updated) {
      // Send confirmation message in chat
      sendOnboardingMessage(
        app.id,
        "applicant",
        formData.fullName,
        activeRole === "courier"
          ? `السلام عليكم، قمت بإرسال بياناتي ووثائقي ككابتن توصيل (${formData.fullName} - ${formData.phone}) وبانتظار إصدار كود الدخول.`
          : `مرحباً، تم إرسال ملفات المنشأة (${formData.businessName || formData.fullName}) والسجل والمنيو وبانتظار اعتماد الكود.`
      );

      // System acknowledgment
      sendOnboardingMessage(
        app.id,
        "system",
        "مستشار الانضمام الذكي",
        "تم استلام طلبك ومرفقاتك بنجاح! تم تحويل الملف إلى لوحة تحكم الإدارة للمراجعة والاعتماد الفوري. يرجى البقاء في هذه الصفحة لاستلام الكود مباشرة في الشات."
      );

      const refreshed = getOrCreateApplicantSession(activeRole);
      setApp(refreshed);
      toast.success("تم إرسال طلب الانضمام والمستندات للإدارة بنجاح!");
    }
  };

  const copyCode = (code: string) => {
    sounds.playClick();
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    toast.success(`تم نسخ كود الوصول: ${code}`);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const loginWithIssuedCode = (code: string) => {
    sounds.playSuccess();
    const res = verifyAndLoginWithCode(code);
    if (res.success && res.targetRoute) {
      toast.success("تم تسجيل الدخول بنجاح! جاري فتح الواجهة المخصصة...");
      navigate({ to: res.targetRoute as any });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 flex flex-col">
      <AppHeader />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 space-y-6">
        
        {/* Top Header & Role Switcher */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="size-3.5 animate-pulse text-amber-400" />
            {lang === "ar" ? "بوابة الانضمام والتفعيل والمحادثة المباشرة مع الإدارة" : "Direct Onboarding & Live Admin Concierge"}
          </div>

          <h1 className="text-3xl font-black text-white">
            {lang === "ar" ? "إنشاء حسابك والانضمام لمنظومة FOODHUB" : "Create Your Account & Join FOODHUB"}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === "ar"
              ? "محادثة مباشرة مع مسؤولي الإدارة لمراجعة بياناتك وإصدار كود الدخول الخاص بك فوراً."
              : "Direct real-time concierge with administration to review your details and issue your access code."}
          </p>

          {/* 3-Role Toggle Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
            {[
              { id: "customer" as AccountType, label: lang === "ar" ? "حساب عميل (فوري)" : "Customer (Instant)", icon: User, color: "emerald" },
              { id: "courier" as AccountType, label: lang === "ar" ? "كابتن مندوب توصيل" : "Courier Captain", icon: Bike, color: "cyan" },
              { id: "restaurant" as AccountType, label: lang === "ar" ? "مطبخ سحابي / متجر" : "Cloud Kitchen / Store", icon: Store, color: "amber" },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = activeRole === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveRole(r.id);
                  }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ==================================================== */}
          {/* LEFT/RIGHT COLUMN 1: FORM & REQUIRED ATTACHMENTS (7 Cols) */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SUCCESS BANNER FOR CUSTOMER AUTO-ACTIVATION */}
            {activatedCode && activeRole === "customer" && (
              <div className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="size-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {lang === "ar" ? "تم تفعيل حسابك بنجاح! كودك جاهز 🎉" : "Account Activated! Your Code is Ready 🎉"}
                    </h3>
                    <p className="text-xs text-emerald-300">
                      {lang === "ar" ? "تم إنشاء وتفعيل حسابك تلقائياً ويمكنك استخدامه فوراً" : "Your customer access code was generated automatically."}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">كود الدخول المعتمد الخاص بك:</span>
                    <span className="font-mono text-2xl font-black text-amber-400 tracking-widest">{activatedCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs gap-1"
                      onClick={() => copyCode(activatedCode)}
                    >
                      {codeCopied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      {codeCopied ? "تم النسخ" : "نسخ الكود"}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-300 shadow-md"
                      onClick={() => loginWithIssuedCode(activatedCode)}
                    >
                      <KeyRound className="size-3.5 me-1" />
                      فتح المتجر والطلب الآن
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* FORM CONTAINER */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl">
              
              {/* Form Title & Instruction */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    {activeRole === "customer" ? <User className="size-5" /> : activeRole === "courier" ? <Bike className="size-5" /> : <Store className="size-5" />}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">
                      {activeRole === "customer"
                        ? "بيانات العميل والتفعيل التلقائي"
                        : activeRole === "courier"
                        ? "بيانات كابتن التوصيل والمستندات الرسمية"
                        : "بيانات المنشأة والمستندات والتراخيص"}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {activeRole === "customer"
                        ? "تفعيل تلقائي وفوري برقم الهاتف والإيميل"
                        : "يرجى إرفاق المستندات المطلوبة لمراجعتها واعتمادها من الإدارة في الشات"}
                    </p>
                  </div>
                </div>

                <Badge
                  className={`text-xs ${
                    activeRole === "customer"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : activeRole === "courier"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}
                >
                  {activeRole === "customer" ? "تفعيل تلقائي فوري" : "مراجعة واعتماد الإدارة"}
                </Badge>
              </div>

              {/* 1. CUSTOMER FORM */}
              {activeRole === "customer" && (
                <form onSubmit={handleCustomerActivation} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300">الاسم الكامل *</Label>
                    <Input
                      placeholder="مثال: سارة الأحمد أو محمد العتيبي"
                      value={formData.fullName}
                      onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">رقم الهاتف النشط *</Label>
                      <Input
                        placeholder="05XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">البريد الإلكتروني (اختياري)</Label>
                      <Input
                        placeholder="customer@foodhub.com"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300">المدينة / الحي</Label>
                    <Input
                      placeholder="الرياض - حي النخيل"
                      value={formData.city}
                      onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="size-4 text-emerald-400" />
                      تفعيل تلقائي فوري 100%:
                    </p>
                    <p className="text-slate-300">
                      بمجرد الضغط على الزر أدناه يتم إنشاء حسابك فوراً ومنحك كود وصول عميل فريد، ورسالة تأكيد في الشات المباشر لتبدأ طلب طعامك المفضل!
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 text-sm h-11 rounded-2xl shadow-lg shadow-amber-500/20"
                  >
                    <Sparkles className="size-4 me-1.5" />
                    تفعيل الحساب فوراً واستلام كود الوصول
                  </Button>
                </form>
              )}

              {/* 2. COURIER FORM & ATTACHMENTS */}
              {activeRole === "courier" && (
                <form onSubmit={handlePartnerSubmit} className="space-y-5 text-xs">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">الاسم الكامل للكابتن *</Label>
                      <Input
                        placeholder="فيصل الشمري"
                        value={formData.fullName}
                        onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">رقم الهاتف للتواصل *</Label>
                      <Input
                        placeholder="05XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">البريد الإلكتروني</Label>
                      <Input
                        placeholder="faisal@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">نوع وسيلة النقل *</Label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData((p) => ({ ...p, vehicleType: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-md h-9 px-2 text-xs text-white"
                      >
                        <option value="motorcycle">موتوسيكل / دراجة نارية</option>
                        <option value="car">سيارة خاصة</option>
                        <option value="bicycle">دراجة هوائية / سكوتر</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">رقم اللوحة</Label>
                      <Input
                        placeholder="أ ب ج 1234"
                        value={formData.vehiclePlate}
                        onChange={(e) => setFormData((p) => ({ ...p, vehiclePlate: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* REQUIRED ATTACHMENTS FOR COURIER */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Upload className="size-4 text-amber-400" />
                        المرفقات الرسمية المطلوبة للمندوب (4 مستندات):
                      </Label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {Object.keys(app.documents || {}).length} / 4 مستندات مرفوعة
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "nationalIdPhoto", title: "صورة الهوية الوطنية / الإقامة", icon: IdCard, hint: "صورة واضحة للهوية أو الإقامة" },
                        { key: "personalPhoto", title: "صورة شخصية (سيلفي)", icon: User, hint: "صورة حديثة وواضحة للوجه" },
                        { key: "medicalReport", title: "تقرير الفحص الطبي", icon: FileText, hint: "تقرير اللياقة الصحية وسلامة القيادة" },
                        { key: "vehiclePhoto", title: "صورة السيارة أو الموتوسيكل", icon: Bike, hint: "صورة واضحة للمركبة واللوحة" },
                      ].map((doc) => {
                        const Icon = doc.icon;
                        const uploaded = app.documents?.[doc.key];
                        return (
                          <div
                            key={doc.key}
                            className={`rounded-2xl border p-3.5 space-y-2 transition-all ${
                              uploaded
                                ? "bg-cyan-950/20 border-cyan-500/40"
                                : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`flex size-7 items-center justify-center rounded-lg ${uploaded ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
                                  <Icon className="size-3.5" />
                                </div>
                                <div>
                                  <p className="font-bold text-white text-[11px]">{doc.title}</p>
                                  <p className="text-[10px] text-slate-400">{doc.hint}</p>
                                </div>
                              </div>
                              {uploaded && <CheckCircle2 className="size-4 text-emerald-400" />}
                            </div>

                            {uploaded ? (
                              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl text-[11px]">
                                <span className="font-mono text-cyan-300 truncate max-w-[140px]">{uploaded.fileName}</span>
                                <label className="text-amber-400 hover:underline cursor-pointer text-[10px]">
                                  تغيير
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(doc.key, doc.title, e)}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl text-slate-300 text-[11px] cursor-pointer font-bold transition-all">
                                <Upload className="size-3 text-amber-400" />
                                رفع المستند
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(doc.key, doc.title, e)}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black hover:from-cyan-400 hover:to-blue-400 text-sm h-11 rounded-2xl shadow-lg shadow-cyan-500/20"
                  >
                    <Send className="size-4 me-1.5" />
                    إرسال البيانات والمستندات للإدارة في الشات المباشر
                  </Button>
                </form>
              )}

              {/* 3. RESTAURANT / STORE FORM & ATTACHMENTS */}
              {activeRole === "restaurant" && (
                <form onSubmit={handlePartnerSubmit} className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">اسم المطعم / المطبخ السحابي *</Label>
                      <Input
                        placeholder="مطعم بروتين شيف أو مطبخ السحاب"
                        value={formData.businessName}
                        onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">اسم المدير المسؤول *</Label>
                      <Input
                        placeholder="الشيف رياض الدوسري"
                        value={formData.fullName}
                        onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">رقم الهاتف النشط *</Label>
                      <Input
                        placeholder="05XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">البريد الإلكتروني</Label>
                      <Input
                        placeholder="manager@kitchen.com"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        className="bg-slate-950 border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-300">العنوان والحي</Label>
                    <Input
                      placeholder="الرياض - طريق الملك فهد - حي حطين"
                      value={formData.address}
                      onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  {/* REQUIRED ATTACHMENTS FOR RESTAURANT */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                        <Building className="size-4 text-orange-400" />
                        المستندات والتراخيص المطلوبة للمطعم (5 مستندات):
                      </Label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {Object.keys(app.documents || {}).length} / 5 مستندات مرفوعة
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "commercialRegister", title: "السجل التجاري", icon: FileText, hint: "وثيقة السجل التجاري الساري" },
                        { key: "restaurantExterior", title: "صورة واجهة المطعم / المطبخ", icon: Building, hint: "صورة خارجية توضح اللوحة" },
                        { key: "storeInterior", title: "صورة للمحل / المنشأة من الداخل", icon: Store, hint: "صورة خط الإنتاج ومنطقة التحضير" },
                        { key: "municipalityLicense", title: "صورة رخصة البلدية", icon: ShieldCheck, hint: "ترخيص البلدية الساري" },
                        { key: "productCatalog", title: "ملف قائمة المنتجات مع الصور", icon: Utensils, hint: "قائمة الوجبات والأسعار والصور" },
                      ].map((doc) => {
                        const Icon = doc.icon;
                        const uploaded = app.documents?.[doc.key];
                        return (
                          <div
                            key={doc.key}
                            className={`rounded-2xl border p-3.5 space-y-2 transition-all ${
                              uploaded
                                ? "bg-orange-950/20 border-orange-500/40"
                                : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`flex size-7 items-center justify-center rounded-lg ${uploaded ? "bg-orange-500/20 text-orange-400" : "bg-slate-800 text-slate-400"}`}>
                                  <Icon className="size-3.5" />
                                </div>
                                <div>
                                  <p className="font-bold text-white text-[11px]">{doc.title}</p>
                                  <p className="text-[10px] text-slate-400">{doc.hint}</p>
                                </div>
                              </div>
                              {uploaded && <CheckCircle2 className="size-4 text-emerald-400" />}
                            </div>

                            {uploaded ? (
                              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl text-[11px]">
                                <span className="font-mono text-orange-300 truncate max-w-[140px]">{uploaded.fileName}</span>
                                <label className="text-amber-400 hover:underline cursor-pointer text-[10px]">
                                  تغيير
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(doc.key, doc.title, e)}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl text-slate-300 text-[11px] cursor-pointer font-bold transition-all">
                                <Upload className="size-3 text-amber-400" />
                                رفع المستند
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(doc.key, doc.title, e)}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black hover:from-orange-400 hover:to-amber-400 text-sm h-11 rounded-2xl shadow-lg shadow-orange-500/20"
                  >
                    <Building className="size-4 me-1.5" />
                    إرسال بيانات المنشأة والمستندات للمراجعة والاعتماد
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT/LEFT COLUMN 2: LIVE ONBOARDING CHAT WITH ADMIN (5 Cols) */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col h-[650px] overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/20">
                      <ShieldCheck className="size-5" />
                    </div>
                    <span className="absolute bottom-0 end-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      محادثة مباشرة مع مسؤولي الإدارة
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] px-1.5 py-0">
                        Live Ops
                      </Badge>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      متابعة مراجعة الوثائق وإصدار كود الدخول لحظياً
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                </span>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950/30">
                {app.messages.map((m) => {
                  const isApplicant = m.sender === "applicant";
                  const isSystem = m.sender === "system";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isApplicant ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className="font-bold text-slate-400">{m.senderName}</span>
                        <span>•</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                          isApplicant
                            ? "bg-amber-500 text-slate-950 font-medium rounded-ee-none shadow-md"
                            : isSystem
                            ? "bg-slate-900 border border-slate-800 text-cyan-200 rounded-es-none shadow-inner"
                            : "bg-indigo-950/60 border border-indigo-500/30 text-slate-100 rounded-es-none"
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.text}</p>

                        {/* Issued Code Highlight In Message */}
                        {m.issuedCode && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-center space-y-2">
                            <span className="text-[10px] text-amber-300 block font-bold">كود الوصول الصادر:</span>
                            <div className="font-mono text-xl font-black text-amber-400 tracking-wider">
                              {m.issuedCode}
                            </div>
                            <div className="flex gap-1.5 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-800 bg-slate-900 text-slate-200 text-[10px] h-7 gap-1"
                                onClick={() => copyCode(m.issuedCode!)}
                              >
                                <Copy className="size-3" />
                                نسخ الكود
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] h-7 gap-1"
                                onClick={() => loginWithIssuedCode(m.issuedCode!)}
                              >
                                <KeyRound className="size-3" />
                                دخول فوري بالكود
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                <Input
                  placeholder="اكتب استفسارك أو رسالتك للإدارة هنا..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-xs text-white h-10 rounded-xl"
                />
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold h-10 px-4 rounded-xl shadow-md"
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

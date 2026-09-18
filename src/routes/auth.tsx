import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminExists, bootstrapAdmin } from "@/lib/admin.functions";
import { useI18n } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoodHubLogo } from "@/components/food-hub-logo";
import { sounds } from "@/lib/sound-effects";
import {
  verifyAndLoginWithCode,
  submitForgotCodeRequest,
  AccountType,
} from "@/lib/access-codes";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  User,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Send,
  Store,
  Bike,
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "بوابة تسجيل الدخول المركزية | FOODHUB" },
      { name: "description", content: "سجّل الدخول إلى حسابك عبر كود الوصول المعتمد في منصة FOODHUB." },
      { property: "og:title", content: "تسجيل الدخول | FOODHUB" },
      { property: "og:description", content: "بوابة الدخول المركزية لمنظومة FOODHUB لتوصيل الطعام." },
      { property: "og:image", content: "/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/icons/icon-512.png" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  // Access Code State
  const [accessCode, setAccessCode] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);

  // Email/Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  // Forgot Code Support State
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotName, setForgotName] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotType, setForgotType] = useState<AccountType>("customer");
  const [forgotReason, setForgotReason] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { data: adminState, refetch } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: () => adminExists(),
  });

  // Login with Access Code
  const handleCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error("يرجى إدخال كود الدخول");
      return;
    }

    setCodeBusy(true);
    sounds.playClick();

    setTimeout(() => {
      const result = verifyAndLoginWithCode(accessCode);
      setCodeBusy(false);

      if (!result.success) {
        toast.error(result.errorMessage || "كود الدخول غير صحيح.");
        return;
      }

      sounds.playSuccess();
      const acc = result.account!;
      toast.success(`مرحباً بك يا ${acc.fullName}! تم التحقق من الكود (${acc.code}) بنجاح.`);
      void navigate({ to: result.targetRoute || "/", replace: true });
    }, 400);
  };

  // Login with Email/Password
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailBusy(true);
    sounds.playClick();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setEmailBusy(false);

    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes("invalid login credentials")) {
        toast.error(lang === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Invalid email or password.");
        return;
      }
      toast.error(error.message);
      return;
    }

    sounds.playSuccess();
    void navigate({ to: "/", replace: true });
  };

  // Submit Forgot Code Support Request
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim() && !forgotEmail.trim()) {
      toast.error("يرجى إدخال رقم الهاتف أو البريد الإلكتروني");
      return;
    }

    sounds.playClick();
    submitForgotCodeRequest({
      fullName: forgotName.trim() || "مستخدم مسجل",
      phone: forgotPhone.trim(),
      email: forgotEmail.trim(),
      accountType: forgotType,
      reason: forgotReason.trim() || "نسيان كود الدخول وطلب كود جديد",
    });

    setForgotSubmitted(true);
    sounds.playSuccess();
    toast.success("تم إرسال طلبك للإدارة وسيتم تزويدك بكود جديد صالح.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-lg flex-col items-center justify-center px-4 py-12">
        <div className="w-full space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex justify-center">
              <FoodHubLogo size={64} />
            </div>
            <h1 className="text-2xl font-black text-white">بوابة تسجيل الدخول المركزية</h1>
            <p className="text-xs text-slate-400">
              منظومة FOODHUB الموحدة للدخول بأكواد الوصول المشفرة
            </p>
          </div>

          {/* Main Auth Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-5">
            <Tabs defaultValue="code" className="space-y-5">
              <TabsList className="grid grid-cols-2 bg-slate-950 p-1 border border-slate-800 rounded-2xl">
                <TabsTrigger
                  value="code"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-400 data-[state=active]:text-slate-950"
                >
                  <KeyRound className="size-3.5 me-1.5" />
                  كود الدخول المعتمد
                </TabsTrigger>
                <TabsTrigger
                  value="credentials"
                  className="rounded-xl text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950"
                >
                  <Mail className="size-3.5 me-1.5" />
                  البريد وكلمة المرور
                </TabsTrigger>
              </TabsList>

              {/* 1. ACCESS CODE TAB */}
              <TabsContent value="code" className="space-y-4">
                {showForgotForm ? (
                  /* Forgot Code Form */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <HelpCircle className="size-4 text-amber-400" />
                        طلب كود جديد من الدعم الفني
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotForm(false);
                          setForgotSubmitted(false);
                        }}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        إلغاء ✕
                      </button>
                    </div>

                    {forgotSubmitted ? (
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center space-y-3">
                        <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                          <CheckCircle2 className="size-7" />
                        </div>
                        <h3 className="text-base font-bold text-white">تم إرسال الطلب بنجاح</h3>
                        <p className="text-xs text-slate-300">
                          سيقوم مسؤولو الإدارة بالتحقق من بياناتك وإصدار كود صالح جديد لحسابك.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setShowForgotForm(false);
                            setForgotSubmitted(false);
                          }}
                          className="bg-amber-500 text-slate-950 font-bold text-xs"
                        >
                          العودة لتسجيل الدخول
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleForgotSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">نوع الحساب</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setForgotType("customer")}
                              className={`p-2 rounded-xl text-xs font-bold border text-center ${
                                forgotType === "customer"
                                  ? "bg-amber-500 text-slate-950 border-amber-500"
                                  : "bg-slate-950 border-slate-800 text-slate-300"
                              }`}
                            >
                              عميل
                            </button>
                            <button
                              type="button"
                              onClick={() => setForgotType("courier")}
                              className={`p-2 rounded-xl text-xs font-bold border text-center ${
                                forgotType === "courier"
                                  ? "bg-cyan-500 text-slate-950 border-cyan-500"
                                  : "bg-slate-950 border-slate-800 text-slate-300"
                              }`}
                            >
                              مندوب
                            </button>
                            <button
                              type="button"
                              onClick={() => setForgotType("restaurant")}
                              className={`p-2 rounded-xl text-xs font-bold border text-center ${
                                forgotType === "restaurant"
                                  ? "bg-orange-500 text-slate-950 border-orange-500"
                                  : "bg-slate-950 border-slate-800 text-slate-300"
                              }`}
                            >
                              مطبخ / متجر
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">الاسم الكامل / اسم المتجر</Label>
                          <Input
                            required
                            value={forgotName}
                            onChange={(e) => setForgotName(e.target.value)}
                            placeholder="الاسم المسجل"
                            className="bg-slate-950 border-slate-800 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">رقم الجوال المسجل</Label>
                          <Input
                            required
                            type="tel"
                            value={forgotPhone}
                            onChange={(e) => setForgotPhone(e.target.value)}
                            placeholder="05xxxxxxxx"
                            className="bg-slate-950 border-slate-800 text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-slate-300">البريد الإلكتروني</Label>
                          <Input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="bg-slate-950 border-slate-800 text-xs font-mono"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 py-5 text-xs rounded-xl gap-1.5"
                        >
                          <Send className="size-3.5" />
                          إرسال طلب الاسترجاع للإدارة
                        </Button>
                      </form>
                    )}
                  </div>
                ) : (
                  /* Standard Access Code Form */
                  <form onSubmit={handleCodeLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-300">
                          كود الدخول المشفر (Access Code)
                        </Label>
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                          All-In-One Code
                        </Badge>
                      </div>
                      <div className="relative">
                        <KeyRound className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-amber-400" />
                        <Input
                          required
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                          className="ps-10 bg-slate-950 border-slate-800 text-amber-400 font-mono text-base font-black tracking-wider placeholder:font-normal placeholder:tracking-normal placeholder:text-xs"
                          placeholder="مثال: FH-CUST-1044 أو FH-REST-9482"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        * يمنحك الأدمن هذا الكود بعد مراجعة بياناتك ويفتح لك واجهة التطبيق فوراً.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={codeBusy}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 py-6 text-sm rounded-xl shadow-xl shadow-amber-500/20"
                    >
                      {codeBusy ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                          جاري فحص الكود والدخول...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          دخول فوري بالتطبيق
                          <ArrowRight className="size-4" />
                        </span>
                      )}
                    </Button>

                    {/* Quick Demo Helpers */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] space-y-1.5">
                      <span className="text-amber-400 font-bold block">
                        💡 الأكواد المعتمدة الجاهزة للتجربة الفورية:
                      </span>
                      <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                        <button
                          type="button"
                          onClick={() => setAccessCode("FH-CUST-1044")}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 hover:border-amber-500"
                        >
                          👤 عميل: FH-CUST-1044
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccessCode("FH-REST-9482")}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-orange-300 hover:border-orange-500"
                        >
                          👨‍🍳 مطبخ: FH-REST-9482
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccessCode("FH-RIDE-3129")}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-500"
                        >
                          🛵 مندوب: FH-RIDE-3129
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccessCode("FH-ADMIN-777")}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-purple-300 hover:border-purple-500"
                        >
                          🛡️ أدمن: FH-ADMIN-777
                        </button>
                      </div>
                    </div>

                    {/* Forgot Code Trigger */}
                    <div className="text-center pt-1 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setShowForgotForm(true)}
                        className="text-xs text-amber-400 hover:text-amber-300 underline font-medium flex items-center justify-center gap-1 mx-auto"
                      >
                        <HelpCircle className="size-3.5" />
                        نسيت كود الدخول؟ أرسل طلب كود جديد من الدعم
                      </button>
                    </div>
                  </form>
                )}
              </TabsContent>

              {/* 2. EMAIL / PASSWORD TAB */}
              <TabsContent value="credentials" className="space-y-4">
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-300">
                      {t("email")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        required
                        maxLength={255}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="ps-10 bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm"
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-300">
                      {t("password")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="password"
                        type="password"
                        required
                        maxLength={72}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="ps-10 bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 py-6 text-sm rounded-xl shadow-lg shadow-amber-500/20"
                    disabled={emailBusy}
                  >
                    {emailBusy ? (
                      <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        جاري تسجيل الدخول...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {t("login")}
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Bootstrap Admin Card if needed */}
      {adminState && !adminState.exists ? (
        <div className="mx-auto max-w-md px-4 pb-12">
          <BootstrapCard onDone={() => void refetch()} />
        </div>
      ) : null}
    </div>
  );
}

function BootstrapCard({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await bootstrapAdmin({ data: { ...form, phone: "" } });
      toast.success(t("created"));
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm">{t("setupAdmin")}</h2>
          <p className="text-xs text-slate-400">{t("setupAdminHint")}</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Input
          placeholder={t("fullName")}
          required
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="bg-slate-950 border-slate-800 text-xs"
        />
        <Input
          type="email"
          placeholder={t("email")}
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="bg-slate-950 border-slate-800 text-xs font-mono"
        />
        <Input
          type="password"
          placeholder={t("password")}
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-slate-950 border-slate-800 text-xs font-mono"
        />
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold" disabled={busy}>
          {t("createAccount")}
        </Button>
      </form>
    </div>
  );
}

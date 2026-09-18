import React, { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  KeyRound,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Send,
  User,
  Store,
  Bike,
  CheckCircle2,
  ClipboardPaste,
  UserPlus,
} from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import {
  verifyAndLoginWithCode,
  submitForgotCodeRequest,
  AccountType,
} from "@/lib/access-codes";
import { useI18n } from "@/lib/i18n";
import { FoodHubLogo } from "@/components/food-hub-logo";

interface AccessCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccessCodeModal({ open, onOpenChange }: AccessCodeModalProps) {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [accessCode, setAccessCode] = useState("");
  const [busy, setBusy] = useState(false);

  // Forgot Code Form State
  const [forgotName, setForgotName] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotType, setForgotType] = useState<AccountType>("customer");
  const [forgotReason, setForgotReason] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handlePasteCode = async () => {
    try {
      sounds.playClick();
      const text = await navigator.clipboard.readText();
      if (text) {
        setAccessCode(text.trim().toUpperCase());
        toast.info(lang === "ar" ? "تم لصق كود الدخول من الحافظة" : "Pasted access code from clipboard");
      }
    } catch {
      toast.error(lang === "ar" ? "تعذر قراءة الحافظة تلقائياً" : "Unable to read clipboard");
    }
  };

  const handleLoginWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error(lang === "ar" ? "يرجى إدخال كود الدخول المعتمد" : "Please enter your access code");
      return;
    }

    setBusy(true);
    sounds.playClick();

    setTimeout(() => {
      const result = verifyAndLoginWithCode(accessCode.trim());
      setBusy(false);

      if (!result.success) {
        toast.error(result.errorMessage || (lang === "ar" ? "كود الدخول غير صحيح." : "Invalid access code."));
        return;
      }

      sounds.playSuccess();
      const acc = result.account!;
      toast.success(
        lang === "ar"
          ? `✨ مرحباً بك يا ${acc.fullName}! تم التحقق من الكود بنجاح.`
          : `✨ Welcome ${acc.fullName}! Verified successfully.`
      );
      onOpenChange(false);
      void navigate({ to: result.targetRoute || "/", replace: true });
    }, 400);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim() && !forgotEmail.trim()) {
      toast.error(lang === "ar" ? "يرجى إدخال رقم الهاتف أو البريد الإلكتروني للتحقق" : "Please enter phone or email");
      return;
    }

    setBusy(true);
    sounds.playClick();

    setTimeout(() => {
      submitForgotCodeRequest({
        fullName: forgotName.trim() || (lang === "ar" ? "مستخدم مسجل" : "Registered User"),
        phone: forgotPhone.trim(),
        email: forgotEmail.trim(),
        accountType: forgotType,
        reason: forgotReason.trim() || (lang === "ar" ? "طلب كود جديد بسبب نسيان الكود السابق" : "Forgot previous access code"),
      });

      setBusy(false);
      setForgotSubmitted(true);
      sounds.playSuccess();
      toast.success(lang === "ar" ? "تم إرسال طلب استعادة الكود إلى الإدارة بنجاح!" : "Code recovery request sent to Admin successfully!");
    }, 400);
  };

  const resetModal = () => {
    setMode("login");
    setAccessCode("");
    setForgotSubmitted(false);
    setForgotName("");
    setForgotPhone("");
    setForgotEmail("");
    setForgotReason("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setTimeout(resetModal, 300);
      }}
    >
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-3 text-start">
          {/* Top Branding & Security Badge */}
          <div className="flex items-center justify-between">
            <FoodHubLogo size={32} showText />
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-bold px-2.5 py-1">
              <ShieldCheck className="size-3 me-1 text-amber-400" />
              {lang === "ar" ? "دخول آمن ومشفر 100%" : "100% Encrypted Login"}
            </Badge>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-white">
            {mode === "login"
              ? lang === "ar"
                ? "تسجيل الدخول بكود المرور"
                : "Access Code Sign In"
              : lang === "ar"
              ? "طلب استعادة كود الدخول"
              : "Recover Access Code"}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-400 leading-relaxed font-normal">
            {mode === "login"
              ? lang === "ar"
                ? "أدخل كود المرور المخصص لحسابك (للعميل، المندوب، المطبخ، أو الإدارة) لفتح واجهتك فوراً."
                : "Enter your account access code (customer, courier, kitchen, or admin) to open your dashboard."
              : lang === "ar"
              ? "أرسل بياناتك المسجلة للتحقق وسيقوم مسؤول الإدارة بمراجعة الحساب وتزويدك بكود صالح جديد."
              : "Submit your details and the admin team will verify your account and provide a valid code."}
          </DialogDescription>
        </DialogHeader>

        {/* 1. LOGIN WITH CODE VIEW */}
        {mode === "login" && (
          <form onSubmit={handleLoginWithCode} className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-200">
                  {lang === "ar" ? "كود الدخول المعتمد (Access Code)" : "Authorized Access Code"}
                </Label>
                <button
                  type="button"
                  onClick={handlePasteCode}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <ClipboardPaste className="size-3" />
                  <span>{lang === "ar" ? "لصق الكود" : "Paste"}</span>
                </button>
              </div>

              <div className="relative">
                <KeyRound className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-amber-400" />
                <Input
                  required
                  autoFocus
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="FH-CUST-XXXX / FH-REST-XXXX"
                  className="ps-10 pe-4 bg-slate-900/90 border-slate-700 text-amber-400 font-mono text-sm sm:text-base font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal placeholder:text-xs uppercase h-12 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === "ar"
                  ? "* يتم إصدار كود الدخول الخاص بك بعد إنشاء واعتماد الحساب من إدارة FOODHUB."
                  : "* Your access code is generated once your account is created and verified by admin."}
              </p>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 h-12 text-sm rounded-xl shadow-lg shadow-amber-500/20 gap-2 transition-all active:scale-[0.99]"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  {lang === "ar" ? "جاري التحقق والدخول..." : "Verifying & Signing in..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{lang === "ar" ? "دخول إلى حسابي" : "Sign In to Account"}</span>
                  <ArrowRight className={`size-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                </span>
              )}
            </Button>

            {/* Forgot Code & Create Account Options */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMode("forgot");
                }}
                className="w-full text-center text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <HelpCircle className="size-3.5" />
                <span>{lang === "ar" ? "نسيت كود الدخول؟ اطلب كوداً جديداً من الدعم" : "Forgot access code? Request recovery"}</span>
              </button>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  {lang === "ar" ? "ليس لديك حساب مسجل؟" : "Don't have an account yet?"}
                </span>
                <Link
                  to="/register"
                  onClick={() => {
                    sounds.playClick();
                    onOpenChange(false);
                  }}
                  className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1 shrink-0"
                >
                  <UserPlus className="size-3.5" />
                  <span>{lang === "ar" ? "إنشاء حساب ومحادثة الإدارة" : "Create Account & Chat"}</span>
                </Link>
              </div>
            </div>
          </form>
        )}

        {/* 2. FORGOT CODE / SUPPORT RECOVERY VIEW */}
        {mode === "forgot" && (
          <div className="space-y-4 pt-2">
            {forgotSubmitted ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center space-y-3">
                <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="size-7" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {lang === "ar" ? "تم استلام طلبك بنجاح!" : "Request Received Successfully!"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === "ar"
                    ? "سيقوم مسؤولو الإدارة في FOODHUB بالتحقق من بياناتك وإصدار كود جديد وإرساله لك فوراً."
                    : "Admin team will review your registered information and issue a new access code."}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    sounds.playClick();
                    setForgotSubmitted(false);
                    setMode("login");
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  {lang === "ar" ? "العودة لتسجيل الدخول" : "Back to Sign In"}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-300 font-bold">
                    {lang === "ar" ? "نوع الحساب" : "Account Type"}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setForgotType("customer");
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        forgotType === "customer"
                          ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <User className="size-3.5 mx-auto mb-1" />
                      <span>{lang === "ar" ? "عميل" : "Customer"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setForgotType("courier");
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        forgotType === "courier"
                          ? "bg-cyan-500 text-slate-950 border-cyan-500 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <Bike className="size-3.5 mx-auto mb-1" />
                      <span>{lang === "ar" ? "مندوب" : "Courier"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setForgotType("restaurant");
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        forgotType === "restaurant"
                          ? "bg-orange-500 text-slate-950 border-orange-500 shadow-md"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <Store className="size-3.5 mx-auto mb-1" />
                      <span>{lang === "ar" ? "مطبخ / متجر" : "Kitchen"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300 font-medium">
                    {lang === "ar" ? "الاسم الكامل / اسم المتجر" : "Full Name / Store Name"}
                  </Label>
                  <Input
                    required
                    value={forgotName}
                    onChange={(e) => setForgotName(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: سعد العتيبي أو مطبخ الرياض" : "e.g. Saad Al-Otaibi"}
                    className="bg-slate-900 border-slate-800 text-xs text-white rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300 font-medium">
                      {lang === "ar" ? "رقم الجوال المسجل" : "Registered Phone"}
                    </Label>
                    <Input
                      required
                      type="tel"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="bg-slate-900 border-slate-800 text-xs font-mono text-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300 font-medium">
                      {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                    </Label>
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="bg-slate-900 border-slate-800 text-xs font-mono text-white rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300 font-medium">
                    {lang === "ar" ? "سبب طلب الكود الجديد / ملاحظات" : "Reason / Notes"}
                  </Label>
                  <Input
                    value={forgotReason}
                    onChange={(e) => setForgotReason(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: تم تغيير الهاتف أو نسيان الكود السابق" : "e.g. Changed phone or forgot code"}
                    className="bg-slate-900 border-slate-800 text-xs text-white rounded-xl"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      sounds.playClick();
                      setMode("login");
                    }}
                    className="border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white rounded-xl"
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={busy}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 text-xs gap-1.5 rounded-xl shadow-md"
                  >
                    <Send className="size-3.5" />
                    <span>{lang === "ar" ? "إرسال طلب الاسترجاع للإدارة" : "Send Recovery Request"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

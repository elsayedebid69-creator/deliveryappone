import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import {
  verifyAndLoginWithCode,
  submitForgotCodeRequest,
  AccountType,
} from "@/lib/access-codes";
import { useI18n } from "@/lib/i18n";

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

  const handleLoginWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error("يرجى إدخال كود الدخول المعتمد");
      return;
    }

    setBusy(true);
    sounds.playClick();

    setTimeout(() => {
      const result = verifyAndLoginWithCode(accessCode);
      setBusy(false);

      if (!result.success) {
        toast.error(result.errorMessage || "كود الدخول غير صحيح.");
        return;
      }

      sounds.playSuccess();
      const acc = result.account!;
      toast.success(
        `مرحباً بك يا ${acc.fullName}! تم التحقق من الكود (${acc.code}) بنجاح.`
      );
      onOpenChange(false);
      void navigate({ to: result.targetRoute || "/", replace: true });
    }, 400);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim() && !forgotEmail.trim()) {
      toast.error("يرجى إدخال رقم الهاتف أو البريد الإلكتروني للتحقق");
      return;
    }

    setBusy(true);
    sounds.playClick();

    setTimeout(() => {
      submitForgotCodeRequest({
        fullName: forgotName.trim() || "مستخدم مسجل",
        phone: forgotPhone.trim(),
        email: forgotEmail.trim(),
        accountType: forgotType,
        reason: forgotReason.trim() || "طلب كود جديد بسبب نسيان الكود السابق",
      });

      setBusy(false);
      setForgotSubmitted(true);
      sounds.playSuccess();
      toast.success("تم إرسال طلب استعادة الكود إلى الإدارة المركزية بنجاح!");
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
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-100 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-2 text-start">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              <ShieldCheck className="size-3.5 me-1 text-amber-400" />
              منظومة الدخول الآمن المشفر | FOODHUB
            </Badge>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-white">
            {mode === "login"
              ? "الدخول بكود الوصول المعتمد"
              : "طلب كود دخول جديد من الإدارة"}
          </DialogTitle>

          <DialogDescription className="text-xs text-slate-400 leading-relaxed">
            {mode === "login"
              ? "أدخل كود الدخول الخاص بك (للعميل، المطبخ، المندوب، أو الإدارة) لفتح الواجهة المخصصة فوراً."
              : "أرسل بياناتك المسجلة للتحقق وسيقوم الأدمن بتوليد وتزويدك بكود دخول جديد صالح."}
          </DialogDescription>
        </DialogHeader>

        {/* 1. LOGIN WITH CODE VIEW */}
        {mode === "login" && (
          <form onSubmit={handleLoginWithCode} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">
                كود الدخول المشفر (Access Code)
              </Label>
              <div className="relative">
                <KeyRound className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-amber-400" />
                <Input
                  required
                  autoFocus
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="مثال: FH-CUST-1044 أو FH-REST-9482"
                  className="ps-10 bg-slate-900 border-slate-700 text-amber-400 font-mono text-sm sm:text-base font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal placeholder:text-xs uppercase"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                * يتم إعطاء الكود من قبل إدارة FOODHUB بعد إنشاء واعتماد الحساب.
              </p>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 py-5 text-sm rounded-xl shadow-lg shadow-amber-500/20"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  جاري التحقق والدخول...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  دخول فوري بالتطبيق
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>

            {/* Quick Demo Helpers */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-[11px] space-y-1.5">
              <span className="text-amber-400 font-bold block">
                💡 أكواد معتمدة جاهزة للاختبار السريع:
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setAccessCode("FH-CUST-1044")}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 hover:border-amber-500"
                >
                  👤 عميل: FH-CUST-1044
                </button>
                <button
                  type="button"
                  onClick={() => setAccessCode("FH-REST-9482")}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-orange-300 hover:border-orange-500"
                >
                  👨‍🍳 مطبخ: FH-REST-9482
                </button>
                <button
                  type="button"
                  onClick={() => setAccessCode("FH-RIDE-3129")}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 hover:border-cyan-500"
                >
                  🛵 مندوب: FH-RIDE-3129
                </button>
                <button
                  type="button"
                  onClick={() => setAccessCode("FH-ADMIN-777")}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300 hover:border-purple-500"
                >
                  🛡️ أدمن: FH-ADMIN-777
                </button>
              </div>
            </div>

            {/* Forgot Code Switch */}
            <div className="text-center pt-1 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <HelpCircle className="size-3.5" />
                نسيت كود الدخول؟ اطلب كوداً جديداً من الدعم
              </button>
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
                  تم استلام طلبك بنجاح!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  سيقوم مسؤولو الإدارة في FOODHUB بالتحقق من بياناتك وإصدار كود
                  جديد وتفعيله لحسابك.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setMode("login");
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  العودة لنافذة تسجيل الدخول
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">نوع الحساب</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotType("customer")}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        forgotType === "customer"
                          ? "bg-amber-500 text-slate-950 border-amber-500"
                          : "bg-slate-900 border-slate-800 text-slate-300"
                      }`}
                    >
                      <User className="size-3.5 mx-auto mb-1" />
                      عميل
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotType("courier")}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        forgotType === "courier"
                          ? "bg-cyan-500 text-slate-950 border-cyan-500"
                          : "bg-slate-900 border-slate-800 text-slate-300"
                      }`}
                    >
                      <Bike className="size-3.5 mx-auto mb-1" />
                      مندوب
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotType("restaurant")}
                      className={`p-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        forgotType === "restaurant"
                          ? "bg-orange-500 text-slate-950 border-orange-500"
                          : "bg-slate-900 border-slate-800 text-slate-300"
                      }`}
                    >
                      <Store className="size-3.5 mx-auto mb-1" />
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
                    placeholder="مثال: سعد العتيبي أو مطبخ الرياض"
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">رقم الجوال المسجل</Label>
                    <Input
                      required
                      type="tel"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="bg-slate-900 border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="bg-slate-900 border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">سبب طلب الكود الجديد / ملاحظات</Label>
                  <Input
                    value={forgotReason}
                    onChange={(e) => setForgotReason(e.target.value)}
                    placeholder="مثال: تم تغيير الهاتف أو نسيان الكود السابق"
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode("login")}
                    className="border-slate-800 bg-slate-900 text-xs text-slate-300"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={busy}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 text-xs gap-1.5"
                  >
                    <Send className="size-3.5" />
                    إرسال طلب استرجاع الكود للإدارة
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

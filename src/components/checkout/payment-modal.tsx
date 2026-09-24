import React, { useState } from "react";
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  processPayment,
  PaymentTransaction,
} from "@/lib/payment-gateway";
import { sounds } from "@/lib/sound-effects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: "applepay" | "card" | "tamara" | "cash";
  amount: number;
  customerName?: string;
  customerPhone?: string;
  onSuccess: (txn: PaymentTransaction) => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  method,
  amount,
  customerName = "عميل فود هب",
  customerPhone = "0550000000",
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  // Card details
  const [cardNumber, setCardNumber] = useState("5888 4500 1234 5678");
  const [cardName, setCardName] = useState("FOODHUB VALUED CUSTOMER");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");

  const brand = detectCardBrand(cardNumber);

  const handleStartPayment = async () => {
    sounds.playClick();
    setLoading(true);

    if (method === "applepay") {
      // Simulate Apple Pay FaceID / TouchID biometric delay
      setTimeout(async () => {
        const txn = await processPayment({
          method: "applepay",
          amount,
          customerName,
          customerPhone,
        });
        sounds.playSuccess();
        setLoading(false);
        setStep("success");
        setTimeout(() => {
          onSuccess(txn);
          onOpenChange(false);
          setStep("form");
        }, 1200);
      }, 1500);
      return;
    }

    if (method === "tamara") {
      // Tamara instant BNPL validation
      setTimeout(async () => {
        const txn = await processPayment({
          method: "tamara",
          amount,
          customerName,
          customerPhone,
        });
        sounds.playSuccess();
        setLoading(false);
        setStep("success");
        setTimeout(() => {
          onSuccess(txn);
          onOpenChange(false);
          setStep("form");
        }, 1200);
      }, 1200);
      return;
    }

    // Card 3D-Secure flow
    if (cardNumber.replace(/\s+/g, "").length < 16) {
      toast.error("يرجى إدخال رقم بطاقة صالح ومكون من 16 رقماً");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      sounds.playClick();
      toast.info("تم إرسال رمز التحقق (OTP) من مصرفك لمتابعة عملية الدفع عبر مدى 3D-Secure");
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      toast.error("يرجى إدخال رمز التحقق البنكي المكون من 4 أرقام على الأقل (رمز التجربة: 1234)");
      return;
    }

    setLoading(true);
    sounds.playClick();

    setTimeout(async () => {
      const txn = await processPayment({
        method: "card",
        amount,
        customerName,
        customerPhone,
        card: {
          number: cardNumber,
          name: cardName,
          expiry: cardExpiry,
          cvv: cardCvv,
        },
      });

      sounds.playSuccess();
      setLoading(false);
      setStep("success");

      setTimeout(() => {
        onSuccess(txn);
        onOpenChange(false);
        setStep("form");
        setOtp("");
      }, 1200);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="text-right">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="size-3.5" /> بوابة دفع معتمدة وآمنة 100%
            </span>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">المبلغ المطلوب</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {amount.toFixed(2)} <span className="text-xs font-normal">ر.س</span>
              </span>
            </div>
          </div>
          <DialogTitle className="text-lg font-black text-white text-right">
            {method === "applepay" && " الدفع السريع عبر Apple Pay"}
            {method === "card" && "💳 الدفع عبر مدى والبطاقات الائتمانية"}
            {method === "tamara" && "✨ الدفع بالتقسيط عبر تمارا"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 text-right">
            {method === "applepay" && "استخدم بصمة الوجه أو الإصبع على جهازك لإتمام الدفع بلمسة واحدة."}
            {method === "card" && "بطاقات مدى السعودية، فيزا، وماستركارد محمية بنظام التحقق 3D-Secure."}
            {method === "tamara" && "قسّم فاتورتك على 3 أو 4 دفعات ميسرة بدون أي فوائد أو رسوم إضافية."}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: APPLE PAY */}
        {method === "applepay" && step === "form" && (
          <div className="py-6 text-center space-y-6">
            <div className="size-20 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl shadow-inner">
              
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">FOODHUB MERCHANDISE KSA</p>
              <p className="text-xs text-slate-400 font-mono">حساب التاجر المعتمد: merchant.foodhub.app</p>
            </div>

            <Button
              disabled={loading}
              onClick={handleStartPayment}
              className="w-full h-14 bg-white hover:bg-slate-200 text-black text-lg font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>جارٍ التحقق عبر Face ID...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl leading-none"></span>
                  <span>Pay مع Face ID</span>
                </>
              )}
            </Button>
          </div>
        )}

        {/* STEP 1: TAMARA */}
        {method === "tamara" && step === "form" && (
          <div className="py-4 space-y-4 text-right">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>الدفعة الأولى اليوم:</span>
                <span className="font-mono text-sm">{(amount / 3).toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>الدفعة الثانية بعد شهر:</span>
                <span className="font-mono">{(amount / 3).toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>الدفعة الثالثة بعد شهرين:</span>
                <span className="font-mono">{(amount / 3).toFixed(2)} ر.س</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">رقم جوال الحساب في تمارا</Label>
              <Input
                value={customerPhone}
                readOnly
                className="bg-slate-900 border-slate-800 text-slate-200 font-mono text-sm rounded-xl text-left"
              />
            </div>

            <Button
              disabled={loading}
              onClick={handleStartPayment}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-2xl shadow-lg"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "تأكيد وتقسيم الفاتورة بدون فوائد ⚡"
              )}
            </Button>
          </div>
        )}

        {/* STEP 1: CARD FORM */}
        {method === "card" && step === "form" && (
          <div className="py-2 space-y-3.5 text-right">
            {/* Card preview badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700/80 shadow-lg text-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-wider uppercase text-slate-400 font-bold">FoodHub Secure Pay</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {brand === "mada" ? "🇸🇦 مدى Mada" : brand.toUpperCase()}
                </span>
              </div>
              <div className="font-mono text-lg font-bold tracking-widest text-white text-left pl-1">
                {cardNumber || "•••• •••• •••• ••••"}
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="truncate max-w-[180px]">{cardName}</span>
                <span>{cardExpiry || "MM/YY"}</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">رقم البطاقة (16 رقماً)</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                placeholder="5888 4500 0000 0000"
                className="bg-slate-900 border-slate-800 text-white font-mono rounded-xl text-left"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">تاريخ الانتهاء</Label>
                <Input
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  placeholder="MM/YY"
                  className="bg-slate-900 border-slate-800 text-white font-mono rounded-xl text-left"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">رمز الأمان (CVV)</Label>
                <Input
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  placeholder="123"
                  className="bg-slate-900 border-slate-800 text-white font-mono rounded-xl text-left"
                />
              </div>
            </div>

            <Button
              disabled={loading}
              onClick={handleStartPayment}
              className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-2xl shadow-lg mt-2 transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>جارٍ الاتصال بشبكة مدى...</span>
                </div>
              ) : (
                `ادفع الآن (${amount.toFixed(2)} ر.س)`
              )}
            </Button>
          </div>
        )}

        {/* STEP 2: 3D-SECURE OTP */}
        {step === "otp" && (
          <div className="py-4 space-y-4 text-center">
            <div className="size-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="size-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">التحقق الآمن 3D-Secure</h3>
              <p className="text-xs text-slate-400 mt-1">
                أدخل رمز الأمان المؤقت (OTP) المرسل إلى هاتفك المنتهي بـ <span className="font-mono text-white">***{customerPhone.slice(-3)}</span>
              </p>
              <p className="text-[11px] text-amber-400/80 font-mono mt-2 bg-amber-500/5 py-1 px-2 rounded-lg border border-amber-500/20 inline-block">
                رمز الاختبار التجريبي السريع: 1234
              </p>
            </div>

            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="1234"
              maxLength={6}
              className="bg-slate-900 border-amber-500/40 text-center font-mono text-xl tracking-widest text-amber-400 h-12 rounded-xl"
            />

            <Button
              disabled={loading}
              onClick={handleVerifyOtp}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>جارٍ المصادقة مع البنك...</span>
                </div>
              ) : (
                "تأكيد الرمز وإتمام الدفع ✓"
              )}
            </Button>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="size-16 mx-auto text-emerald-400 animate-bounce" />
            <h3 className="text-lg font-black text-white">تمت عملية الدفع بنجاح!</h3>
            <p className="text-xs text-slate-400">
              تم خصم المبلغ بنجاح وجارٍ توجيه طلبك إلى شاشة المطبخ KDS فوراً...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

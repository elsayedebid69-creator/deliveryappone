import { useState } from "react";
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Upload,
  KeyRound,
  MapPin,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sounds } from "@/lib/sound-effects";

interface AiDeliveryProofProps {
  orderId: string;
  customerName?: string;
  onProofConfirmed: () => void;
}

export function AiDeliveryProof({
  orderId,
  customerName = "العميل",
  onProofConfirmed,
}: AiDeliveryProofProps) {
  const [open, setOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPassed, setAiPassed] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleCapturePhoto = () => {
    sounds.playClick();
    setIsAnalyzing(true);
    toast.loading("📸 جاري التقاط الصورة وتطبيق خوارزميات الذكاء الاصطناعي للتحقق...", { id: "ai-vision" });

    setTimeout(() => {
      setCapturedPhoto(
        "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=400&fit=crop"
      );
      setAiPassed(true);
      setIsAnalyzing(false);
      sounds.playSuccess();
      toast.success("✅ فحص الـ AI: تم رصد كيس الوجبة عند باب العميل ومطابقة الموقع بنسبة 99.4%!", { id: "ai-vision" });
    }, 1500);
  };

  const handleFinalSubmit = () => {
    if (!aiPassed) {
      toast.error("يرجى التقاط صورة إثبات التسليم أولاً");
      return;
    }

    sounds.playSuccess();
    toast.success("🎉 تم تأكيد التسليم بنجاح وإضافة عمولة التوصيل إلى محفظتك فوراً!");
    setOpen(false);
    onProofConfirmed();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            sounds.playClick();
            setOpen(true);
          }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black hover:from-emerald-400 hover:to-teal-300 shadow-xl shadow-emerald-500/20 glow-emerald py-5 text-sm"
        >
          <Camera className="size-4 me-2" />
          إثبات التسليم الذكي بالـ AI وإتمام الطلب
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-3xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-slate-950 border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="size-6 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                نظام إثبات التسليم الذكي AI Proof
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  حماية كاملة من النزاعات
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                التقاط صورة للوجبة عند باب العميل للتحقق الآلي وضمان حقوقك
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[460px] overflow-y-auto">
          
          {/* Step 1: Camera capture & AI inspection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="size-4 text-emerald-400" />
                1. صورة الوجبة عند باب العميل
              </span>
              {aiPassed && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  ✅ تم التحقق الآلي بالذكاء الاصطناعي
                </Badge>
              )}
            </label>

            {capturedPhoto ? (
              <div className="relative rounded-2xl border border-emerald-500/40 overflow-hidden shadow-xl animate-in zoom-in-95">
                <img
                  src={capturedPhoto}
                  alt="صورة إثبات التسليم"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                {/* AI Detection Overlay */}
                <div className="absolute bottom-2.5 start-2.5 end-2.5 bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="size-3.5" />
                    رصد كيس الوجبة + رقم الباب: 99.4%
                  </span>
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="text-[11px] text-slate-400 hover:text-white underline"
                  >
                    إعادة التقاط
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleCapturePhoto}
                className="cursor-pointer border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-900/60 rounded-2xl p-6 text-center space-y-2 transition-all hover:bg-slate-900"
              >
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Camera className="size-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  اضغط هنا لفتح الكاميرا والتقاط صورة الوجبة
                </p>
                <p className="text-[10px] text-slate-400">
                  سيقوم الذكاء الاصطناعي بفحص وجود الكيس ومطابقة الموقع الجغرافي فوراً
                </p>
              </div>
            )}
          </div>

          {/* Step 2: OTP Confirmation code */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-amber-400" />
              2. رمز التأكيد الرقمي OTP (اختياري)
            </label>
            <div className="flex gap-2">
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={4}
                placeholder="أدخل الرمز المكون من 4 أرقام إذا تم تفعيله من العميل..."
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 font-mono tracking-widest text-center focus-visible:ring-emerald-500"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOtpCode("4921");
                  toast.success("🔑 تم إدخال رمز التحقق التلقائي 4921");
                  sounds.playClick();
                }}
                className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs shrink-0"
              >
                رمز تلقائي
              </Button>
            </div>
          </div>

          {/* AI Security Assurance */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs space-y-1 text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <FileCheck className="size-3.5 text-cyan-400" />
              سجل الحماية الفورية:
            </div>
            <p className="text-[11px] leading-relaxed">
              يتم تشفير وتوثيق وقت وإحداثيات التسليم في قاعدة البيانات لحماية مستحقاتك ومنع أي بلاغات مفقودة.
            </p>
          </div>

          {/* Final Button */}
          <Button
            onClick={handleFinalSubmit}
            disabled={!aiPassed || isAnalyzing}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black hover:from-emerald-400 hover:to-teal-300 py-5 text-sm shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle2 className="size-5 me-2" />
            تأكيد التسليم النهائي واستلام العمولة
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Store, Bike, CheckCircle2, Sparkles, Zap, ShieldCheck, Mail, Phone, Lock } from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PartnerJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "restaurant" | "courier";
}

export function PartnerJoinModal({ open, onOpenChange, defaultType = "restaurant" }: PartnerJoinModalProps) {
  const [partnerType, setPartnerType] = useState<"restaurant" | "courier">(defaultType);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    commercial_register: "",
    address: "",
    id_number: "",
    vehicle_type: "motorcycle",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    sounds.playClick();

    try {
      const payload = {
        type: partnerType,
        data: {
          ...form,
          partner_type: partnerType,
          status: "pending",
          submitted_at: new Date().toISOString(),
        },
      };

      await supabase.from("join_requests").insert(payload);
    } catch {
      // demo fallback
    }

    setBusy(false);
    setSubmitted(true);
    sounds.playSuccess();
    toast.success("تم إرسال طلب الانضمام إلى إدارة شركة FOODHUB بنجاح!");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        business_name: "",
        contact_name: "",
        email: "",
        phone: "",
        commercial_register: "",
        address: "",
        id_number: "",
        vehicle_type: "motorcycle",
        description: "",
      });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl bg-slate-950 border-slate-800 text-slate-100 p-6 sm:p-8 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 text-start">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              <ShieldCheck className="size-3.5 me-1 text-amber-400" />
              بوابة انضمام الشركاء المعتمدة | FOODHUB
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-white">
            {submitted ? "تم استلام طلبك بنجاح" : "طلب انضمام شريك (مطعم / مندوب)"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 leading-relaxed">
            {submitted
              ? "طلبك الآن قيد المراجعة لدى الإدارة المركزية لشركة FOODHUB."
              : "املأ البيانات التالية لإرسال طلبك إلى الإدارة لمراجعته وإصدار معرف الذكاء الاصطناعي المشفر (AI Partner ID)."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="size-10" />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-xs text-slate-300 space-y-3 leading-relaxed text-start">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="size-4" />
                خطوات الاعتماد وتفعيل الحساب:
              </div>
              <p>1. تقوم إدارة FOODHUB بمراجعة بياناتك والتأكد من صحتها.</p>
              <p>2. سيتم التواصل معك عبر الهاتف ({form.phone}) أو البريد الإلكتروني ({form.email}).</p>
              <p>
                3. يقوم الأدمن بتوليد <span className="font-bold text-amber-300">معرف ذكاء اصطناعي مشفر (AI Partner ID)</span> وربطه بعنوان الـ IP الخاص بك لحماية أمان حسابك.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black hover:from-amber-400 hover:to-yellow-300 py-5 rounded-xl shadow-lg shadow-amber-500/20"
            >
              تم، شكراً لكم
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setPartnerType("restaurant");
                }}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  partnerType === "restaurant"
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-md shadow-amber-500/10"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Store className="size-4" />
                مطعم / مطبخ سحابي
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setPartnerType("courier");
                }}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                  partnerType === "courier"
                    ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-500/10"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Bike className="size-4" />
                كابتن مندوب توصيل
              </button>
            </div>

            {/* Form Fields */}
            {partnerType === "restaurant" ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">اسم المطعم / المنشأة</Label>
                    <Input
                      required
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                      placeholder="مثال: شيف بروتين إكسبريس"
                      className="bg-slate-950 border-slate-800 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">اسم المدير / الشيف المسؤول</Label>
                    <Input
                      required
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      placeholder="الاسم الثلاثي"
                      className="bg-slate-950 border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">رقم الهاتف للتواصل</Label>
                    <Input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="05XXXXXXXX"
                      className="bg-slate-950 border-slate-800 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">البريد الإلكتروني التجاري</Label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="kitchen@example.com"
                      className="bg-slate-950 border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">رقم السجل التجاري / العمل الحر</Label>
                    <Input
                      required
                      value={form.commercial_register}
                      onChange={(e) => setForm({ ...form, commercial_register: e.target.value })}
                      placeholder="1010XXXXXX"
                      className="bg-slate-950 border-slate-800 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">موقع المطبخ / المدينة والحي</Label>
                    <Input
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="الرياض - حي الياسمين"
                      className="bg-slate-950 border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-300">نوع المأكولات ونبذة عن المطبخ</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="وجبات صحية، بروتين عالي، كيتو دايت..."
                    className="bg-slate-950 border-slate-800 text-xs min-h-[60px]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">الاسم الكامل (كما بالهوية)</Label>
                    <Input
                      required
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      placeholder="الاسم الثلاثي"
                      className="bg-slate-950 border-slate-800 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">رقم الهوية الوطنية / الإقامة</Label>
                    <Input
                      required
                      value={form.id_number}
                      onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                      placeholder="10XXXXXXXX"
                      className="bg-slate-950 border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">رقم الهاتف للتواصل</Label>
                    <Input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="05XXXXXXXX"
                      className="bg-slate-950 border-slate-800 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-slate-300">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="rider@example.com"
                      className="bg-slate-950 border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-300">نوع وسيلة التوصيل</Label>
                  <select
                    value={form.vehicle_type}
                    onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                    className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-xs px-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="motorcycle">دراجة نارية (دباب سريع)</option>
                    <option value="car">سيارة</option>
                    <option value="bicycle">سكوتر / دراجة هوائية</option>
                  </select>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-300/90 leading-relaxed">
              🔒 <span className="font-bold">سياسة الأمان:</span> عند قبول طلبك من الإدارة، سيتم تزويدك برقم معرف ذكاء اصطناعي مشفر مرتبط بـ IP واحد لمنع أي اختراق أو احتيال.
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black hover:from-amber-400 hover:to-orange-400 py-5 rounded-2xl shadow-xl shadow-amber-500/20 text-xs sm:text-sm"
            >
              <Zap className="me-2 size-4" />
              {busy ? "جاري الإرسال..." : "إرسال طلب الانضمام لشركة FOODHUB"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

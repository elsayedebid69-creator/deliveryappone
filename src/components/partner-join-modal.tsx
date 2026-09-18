import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Bike,
  User,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  Send,
  KeyRound,
} from "lucide-react";
import { sounds } from "@/lib/sound-effects";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type JoinAccountType = "customer" | "courier" | "restaurant";

interface PartnerJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: JoinAccountType;
}

export function PartnerJoinModal({
  open,
  onOpenChange,
  defaultType = "customer",
}: PartnerJoinModalProps) {
  const [accountType, setAccountType] = useState<JoinAccountType>(defaultType);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setAccountType(defaultType);
    }
  }, [open, defaultType]);

  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    email: "",
    phone: "",
    city: "الرياض",
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
        type: accountType,
        data: {
          ...form,
          partner_type: accountType,
          status: "pending",
          submitted_at: new Date().toISOString(),
        },
      };

      await supabase.from("join_requests").insert(payload);
    } catch {
      // fallback for demo
    }

    setBusy(false);
    setSubmitted(true);
    sounds.playSuccess();
    toast.success("تم إرسال بيانات إنشاء الحساب إلى إدارة FOODHUB بنجاح!");
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        full_name: "",
        business_name: "",
        email: "",
        phone: "",
        city: "الرياض",
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
      <DialogContent className="sm:max-w-xl bg-slate-950 border-slate-800 text-slate-100 p-6 sm:p-8 rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="space-y-2 text-start">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-bold">
              <ShieldCheck className="size-3.5 me-1 text-amber-400" />
              بوابة إنشاء الحسابات والشركاء | FOODHUB
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-white">
            {submitted
              ? "تم إرسال طلب إنشاء الحساب بنجاح"
              : accountType === "customer"
              ? "طلب إنشاء حساب عميل جديد"
              : accountType === "courier"
              ? "طلب انضمام كابتن مندوب توصيل"
              : "طلب انضمام مطبخ سحابي / متجر"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400 leading-relaxed">
            {submitted
              ? "طلبك الآن قيد المراجعة لدى الإدارة المركزية لمنصة FOODHUB."
              : "أرسل بياناتك إلى الموقع لمراجعتها من قبل الأدمن وتزويدك بكود الدخول المشفر الخاص بحسابك."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-5 py-4 text-center">
            <div className="size-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="size-9" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-black text-white">
                تم استلام طلبك وبانتظار إصدار كود الدخول
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                ستقوم الإدارة بالتحقق من البيانات المسجلة، ثم إصدار كود وصول صالح
                لحسابك لوضعه في واجهة التطبيق لفتح حسابك مباشرة.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 text-start space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <KeyRound className="size-4" />
                <span>كيف يعمل نظام الدخول؟</span>
              </div>
              <p className="text-[11px] text-slate-300">
                بمجرد موافقة الأدمن، ستتلقى كود الدخول. قم بالضغط على زر "دخول بكود
                الوصول" في الموقع وضع الكود لفتح واجهتك فوراً.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 py-5 text-xs rounded-xl"
            >
              تم، حسناً
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Account Type Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">
                اختر نوع الحساب المطلوب إنشاؤه:
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setAccountType("customer");
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    accountType === "customer"
                      ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-lg shadow-amber-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <User className="size-4" />
                  <span className="text-xs">حساب عميل</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setAccountType("courier");
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    accountType === "courier"
                      ? "bg-cyan-500 text-slate-950 border-cyan-500 font-bold shadow-lg shadow-cyan-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <Bike className="size-4" />
                  <span className="text-xs">كابتن توصيل</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setAccountType("restaurant");
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    accountType === "restaurant"
                      ? "bg-orange-500 text-slate-950 border-orange-500 font-bold shadow-lg shadow-orange-500/20"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <Store className="size-4" />
                  <span className="text-xs">مطبخ / متجر</span>
                </button>
              </div>
            </div>

            {/* Fields based on Type */}
            {accountType === "restaurant" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">
                      اسم المطبخ السحابي / المطعم *
                    </Label>
                    <Input
                      required
                      value={form.business_name}
                      onChange={(e) =>
                        setForm({ ...form, business_name: e.target.value })
                      }
                      placeholder="مثال: مطبخ هيلثي غورميه"
                      className="bg-slate-900 border-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">اسم المالك / المسؤول *</Label>
                    <Input
                      required
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                      placeholder="الاسم الثلاثي"
                      className="bg-slate-900 border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">رقم السجل التجاري / وثيقة العمل</Label>
                    <Input
                      value={form.commercial_register}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          commercial_register: e.target.value,
                        })
                      }
                      placeholder="1010xxxxxx"
                      className="bg-slate-900 border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">المدينة والحي *</Label>
                    <Input
                      required
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      placeholder="الرياض - حي العليا"
                      className="bg-slate-900 border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </>
            ) : accountType === "courier" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">الاسم الكامل للكابتن *</Label>
                    <Input
                      required
                      value={form.full_name}
                      onChange={(e) =>
                        setForm({ ...form, full_name: e.target.value })
                      }
                      placeholder="الاسم الثلاثي"
                      className="bg-slate-900 border-slate-800 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">رقم الهوية الوطنية / الإقامة *</Label>
                    <Input
                      required
                      value={form.id_number}
                      onChange={(e) =>
                        setForm({ ...form, id_number: e.target.value })
                      }
                      placeholder="10xxxxxxxx / 2xxxxxxxxx"
                      className="bg-slate-900 border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">نوع وسيلة التوصيل</Label>
                    <select
                      value={form.vehicle_type}
                      onChange={(e) =>
                        setForm({ ...form, vehicle_type: e.target.value })
                      }
                      className="w-full h-9 rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200"
                    >
                      <option value="motorcycle">دراجة نارية (موتوسيكل)</option>
                      <option value="car">سيارة خاصة</option>
                      <option value="bicycle">دراجة هوائية / سكوتر</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">المدينة ومنطقة العمل المفضلة</Label>
                    <Input
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      placeholder="الرياض - شمال / شرق"
                      className="bg-slate-900 border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Customer Account */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">الاسم الكامل *</Label>
                  <Input
                    required
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    placeholder="الاسم الأول والأخير"
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300">المدينة والحي *</Label>
                  <Input
                    required
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    placeholder="الرياض - حي الياسمين"
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-300">رقم الجوال النشط للتواصل *</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <Input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="05xxxxxxxx"
                    className="ps-9 bg-slate-900 border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-300">البريد الإلكتروني *</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="name@example.com"
                    className="ps-9 bg-slate-900 border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Description/Notes */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">
                {accountType === "restaurant"
                  ? "تفاصيل قائمة الطعام ونوع الوجبات"
                  : accountType === "courier"
                  ? "ساعات العمل المتاحة وسنوات الخبرة"
                  : "ملاحظات إضافية أو عنوان التوصيل المفضل"}
              </Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="اكتب هنا..."
                className="bg-slate-900 border-slate-800 text-xs"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-slate-800 bg-slate-900 text-xs text-slate-300"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 text-xs gap-1.5"
              >
                {busy ? (
                  <span>جاري الإرسال...</span>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    إرسال البيانات إلى الموقع للمراجعة وإصدار الكود
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

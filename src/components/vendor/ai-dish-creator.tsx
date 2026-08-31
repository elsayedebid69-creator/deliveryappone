import { useState } from "react";
import { Sparkles, ChefHat, Wand2, Plus, Flame, Zap, DollarSign, Check, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sounds } from "@/lib/sound-effects";

interface GeneratedDish {
  name_ar: string;
  name_en: string;
  category_ar: string;
  category_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  calories: number;
  protein: number;
  prep_time: string;
  image_url: string;
  tags: string[];
}

interface AiDishCreatorProps {
  onDishCreated: (dish: GeneratedDish) => void;
}

export function AiDishCreator({ onDishCreated }: AiDishCreatorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dish, setDish] = useState<GeneratedDish | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    sounds.playClick();

    setTimeout(() => {
      // Intelligent Generation Simulation based on prompt
      const generated: GeneratedDish = {
        name_ar: prompt.includes("سالمون")
          ? "سالمون مشوي بالأعشاب البرية والأفوكادو"
          : prompt.includes("برجر")
          ? "برجر واغيو مدخن بصلصة الكمأة السوداء"
          : prompt.includes("دجاج")
          ? "صدور دجاج تندرلوين مشوية مع صوص الليمون والزعتر"
          : `طبق الشيف المبتكر: ${prompt}`,
        name_en: prompt.includes("سالمون")
          ? "Wild Salmon Fillet with Avocado & Fine Herbs"
          : prompt.includes("برجر")
          ? "Smoked Wagyu Truffle Burger"
          : "Chef Signature Gourmet Dish",
        category_ar: prompt.includes("برجر") ? "وجبات سريعة فاخرة" : "أطباق بروتين صحية",
        category_en: "Gourmet Protein",
        description_ar:
          "قطعة طازجة محضرة بعناية فائقة مع توابل حصرية وخضار طازجة مطبوخة على البخار للحفاظ على كامل القيمة الغذائية والنكهة الفريدة.",
        description_en:
          "Finest cut prepared with artisan seasoning, served with organic steamed greens and house-crafted reduction.",
        price: prompt.includes("سالمون") || prompt.includes("واغيو") ? 58 : 46,
        calories: 460,
        protein: 44,
        prep_time: "12-15 دقيقة",
        image_url:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
        tags: ["🔥 الأكثر طلباً", "💪 عالي البروتين", "✨ مقترح الـ AI"],
      };

      setDish(generated);
      setIsGenerating(false);
      sounds.playSuccess();
      toast.success("✨ تم توليد الطبق، الوصف، والقيم الغذائية بنجاح بواسطة الذكاء الاصطناعي!");
    }, 1200);
  };

  const handleSave = () => {
    if (!dish) return;
    onDishCreated(dish);
    sounds.playSuccess();
    toast.success(`🎉 تم نشر "${dish.name_ar}" في قائمة طعام مطعمك بنجاح!`);
    setOpen(false);
    setDish(null);
    setPrompt("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            sounds.playClick();
            setOpen(true);
          }}
          className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-slate-950 font-black hover:from-orange-400 hover:to-yellow-300 shadow-xl shadow-orange-500/20 text-xs sm:text-sm glow-gold"
        >
          <Sparkles className="size-4 me-1.5 animate-spin" />
          منشئ الأطباق الذكي AI
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-3xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-slate-950 border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <ChefHat className="size-6 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                FoodHub AI Menu Engineer
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px]">
                  توليد المنيو بالذكاء الاصطناعي
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                اكتب فكرة الطبق وسيقوم الذكاء الاصطناعي بكتابة الوصف التسويقي، الترجمة، السعر، والسعرات
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto">
          {/* Prompt input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Wand2 className="size-3.5 text-amber-400" />
              ما هو الطبق الجديد الذي تريد إضافته للمنيو؟
            </label>
            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="مثال: سالمون مشوي مع رز بري وخضار بصلصة الليمون..."
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-amber-500"
              />
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shrink-0"
              >
                {isGenerating ? "جاري التوليد..." : "توليد الـ AI"}
              </Button>
            </div>
          </div>

          {/* Generated Result Preview */}
          {dish && (
            <div className="rounded-2xl border border-amber-500/40 bg-slate-900/90 p-4 space-y-3 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-black text-white">{dish.name_ar}</h4>
                  <p className="text-xs text-amber-400/80 font-mono">{dish.name_en}</p>
                </div>
                <Badge className="bg-amber-500 text-slate-950 font-bold text-sm px-2.5 py-1">
                  {dish.price} ر.س
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {dish.description_ar}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">السعرات المقدرة</span>
                  <span className="font-bold text-amber-400 flex items-center justify-center gap-1">
                    <Flame className="size-3.5" /> {dish.calories} kcal
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">البروتين الصافي</span>
                  <span className="font-bold text-cyan-400 flex items-center justify-center gap-1">
                    <Zap className="size-3.5" /> {dish.protein}g
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">زمن التحضير</span>
                  <span className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Clock className="size-3.5" /> {dish.prep_time}
                  </span>
                </div>
              </div>

              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dish.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="size-4 me-1.5" />
                  اعتماد ونشر الطبق في المنيو فوراً
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                >
                  إعادة توليد
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

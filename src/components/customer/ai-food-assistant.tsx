import { useState } from "react";
import { Sparkles, Bot, Send, Flame, Zap, Check, Plus, MessageSquare, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { sounds } from "@/lib/sound-effects";

interface AiRecommendation {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  calories: number;
  protein: number;
  prepTime: string;
  image: string;
  aiReasonAr: string;
  tagAr: string;
}

const PRESET_MEALS: AiRecommendation[] = [
  {
    id: "rec-1",
    nameAr: "وعاء السلمون البري والأفوكادو الملكي",
    nameEn: "Wild Salmon & Royal Avocado Power Bowl",
    price: 52,
    calories: 480,
    protein: 42,
    prepTime: "12-15 دقيقة",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=350&fit=crop",
    aiReasonAr: "خيار مثالي لبناء العضلات مع أوميغا 3 ودهون صحية تمنحك طاقة مستدامة.",
    tagAr: "🔥 أعلى بروتين",
  },
  {
    id: "rec-2",
    nameAr: "صدر دجاج بالأعشاب مع الكينوا الذهبية",
    nameEn: "Herb-Crusted Chicken with Golden Quinoa",
    price: 45,
    calories: 410,
    protein: 38,
    prepTime: "10-14 دقيقة",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&h=350&fit=crop",
    aiReasonAr: "وجبة متوازنة ذات مؤشر جلايسيمي منخفض وخالية من الزيوت المهدرجة.",
    tagAr: "⚡ طاقة نقية",
  },
  {
    id: "rec-3",
    nameAr: "سلطة الكينوا المحمصة بالخضار البرية",
    nameEn: "Roasted Veggie Quinoa & Green Tahini",
    price: 38,
    calories: 320,
    protein: 18,
    prepTime: "8-10 دقائق",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=350&fit=crop",
    aiReasonAr: "خفيفة على المعدة، غنية بمضادات الأكسدة والألياف لتعزيز الهضم.",
    tagAr: "🌱 نباتي خفيف",
  },
  {
    id: "rec-4",
    nameAr: "إكسير السموذي الأخضر مع بذور الشيا",
    nameEn: "Green Superfood Chia Elixir",
    price: 24,
    calories: 190,
    protein: 9,
    prepTime: "5 دقائق",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&h=350&fit=crop",
    aiReasonAr: "انتعاش فوري غني بالفيتامينات والمعادن لتعويض السوائل بعد التمارين.",
    tagAr: "🥤 ريكفري سريع",
  },
];

const PROMPT_SUGGESTIONS = [
  "أريد وجبة غداء بروتين عالي وسعرها أقل من 50 ريال 🥩",
  "عندي تمرين وأريد مشروب طاقة طبيعي وسريع ⚡",
  "وجبة نباتية خفيفة وسريعة الهضم 🌱",
  "وجبة كيتو دايت منخفضة الكارب ومغذية 🥑",
];

export function AiFoodAssistant() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string; recommendation?: AiRecommendation }>
  >([]);
  const cart = useCart();

  const welcomeText =
    lang === "ar"
      ? "مرحباً بك! أنا مساعد FoodHub الذكي 🤖. كيف تشعر اليوم وما هي مواصفات وجبتك المفضلة (السعرات، الميزانية، أو البروتين)؟"
      : "Welcome! I'm your FoodHub AI Assistant 🤖. What kind of meal are you looking for today (calories, budget, or protein)?";

  const effectiveMessages =
    messages.length === 0 ? [{ role: "assistant" as const, text: welcomeText }] : messages;

  const handleAsk = (queryText?: string) => {
    const textToAsk = queryText || input.trim();
    if (!textToAsk) return;

    sounds.playClick();
    const newMsgs = [...effectiveMessages, { role: "user" as const, text: textToAsk }];
    setMessages(newMsgs);
    setInput("");
    setIsThinking(true);

    // AI reasoning simulation
    setTimeout(() => {
      let matchedMeal = PRESET_MEALS[0];
      const lower = textToAsk.toLowerCase();

      if (
        lower.includes("نباتي") ||
        lower.includes("سلطة") ||
        lower.includes("vegan") ||
        lower.includes("salad")
      ) {
        matchedMeal = PRESET_MEALS[2];
      } else if (
        lower.includes("عصير") ||
        lower.includes("سموذي") ||
        lower.includes("تمرين") ||
        lower.includes("smoothie") ||
        lower.includes("shake")
      ) {
        matchedMeal = PRESET_MEALS[3];
      } else if (
        lower.includes("دجاج") ||
        lower.includes("chicken") ||
        lower.includes("45") ||
        lower.includes("كينوا")
      ) {
        matchedMeal = PRESET_MEALS[1];
      }

      const responseText =
        lang === "ar"
          ? `بناءً على طلبك ("${textToAsk}")، قمت بتحليل القائمة واخترت لك هذه الوجبة المتطابقة بدقة مع قيمك الغذائية:`
          : `Based on your request ("${textToAsk}"), here is the best matched nutritious meal for your goals:`;

      setMessages((prev) => [
        ...(prev.length === 0 ? [{ role: "assistant" as const, text: welcomeText }] : prev),
        { role: "user" as const, text: textToAsk },
        {
          role: "assistant",
          text: responseText,
          recommendation: matchedMeal,
        },
      ]);
      setIsThinking(false);
      sounds.playSuccess();
    }, 1000);
  };

  const addToCartFromAi = (meal: AiRecommendation) => {
    cart.add({
      id: meal.id,
      restaurant_id: "food-hub",
      name_ar: meal.nameAr,
      name_en: meal.nameEn,
      price: meal.price,
    });
    sounds.playClick();
    toast.success(
      lang === "ar"
        ? `✨ تمت إضافة "${meal.nameAr}" إلى سلتك بنجاح!`
        : `✨ Added "${meal.nameEn}" to your cart!`
    );
  };

  return (
    <>
      {/* Floating Futuristic AI Trigger Button */}
      <div className="fixed bottom-6 end-6 z-40">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => {
                sounds.playClick();
                setOpen(true);
              }}
              className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-3.5 text-slate-950 font-bold shadow-2xl shadow-amber-500/40 transition-all duration-300 hover:scale-110 active:scale-95 glow-gold"
            >
              <div className="relative flex size-6 items-center justify-center">
                <Sparkles className="size-5 text-slate-950 animate-pulse" />
              </div>
              <span className="hidden sm:inline text-sm font-extrabold pe-2 text-slate-950">
                {lang === "ar" ? "مساعد الوجبات الذكي AI" : "AI Meal Assistant"}
              </span>
              <span className="absolute -top-1 -start-1 flex size-4 items-center justify-center rounded-full bg-emerald-400 text-[10px] text-slate-950 font-black animate-ping" />
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-3xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-slate-950 border-b border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Bot className="size-6 animate-pulse" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                    FoodHub AI Dietician & Meal Matcher
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                      {lang === "ar" ? "نظام الذكاء الاصطناعي 3.0" : "AI Core 3.0"}
                    </Badge>
                  </DialogTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === "ar"
                      ? "يقترح لك أنسب الوجبات المحسوبة حسب السعرات، البروتين وميزانيتك"
                      : "Personalized recommendations calibrated by calories, protein & budget"}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 max-h-[380px] overflow-y-auto space-y-4">
              {effectiveMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                      <Sparkles className="size-4" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] ${m.role === "user" ? "text-end" : ""}`}>
                    <div
                      className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === "user"
                          ? "bg-amber-500 text-slate-950 font-medium"
                          : "bg-slate-900 border border-slate-800 text-slate-200"
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* Meal Recommendation Card inside chat */}
                    {m.recommendation && (
                      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 overflow-hidden shadow-xl mt-2 text-start">
                        <div className="relative h-32 w-full overflow-hidden">
                          <img
                            src={m.recommendation.image}
                            alt={lang === "ar" ? m.recommendation.nameAr : m.recommendation.nameEn}
                            className="size-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                          <Badge className="absolute top-2 start-2 bg-amber-500 text-slate-950 font-bold">
                            {m.recommendation.tagAr}
                          </Badge>
                          <div className="absolute bottom-2 end-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400 font-bold text-sm">
                            {m.recommendation.price} {t("sar")}
                          </div>
                        </div>

                        <div className="p-3.5 space-y-2.5">
                          <h4 className="font-bold text-white text-base">
                            {lang === "ar" ? m.recommendation.nameAr : m.recommendation.nameEn}
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                            💡 {m.recommendation.aiReasonAr}
                          </p>

                          {/* Telemetry Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                              <span className="text-slate-400 block text-[10px]">
                                {lang === "ar" ? "السعرات" : "Calories"}
                              </span>
                              <span className="font-bold text-amber-400 flex items-center justify-center gap-0.5">
                                <Flame className="size-3" /> {m.recommendation.calories}
                              </span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                              <span className="text-slate-400 block text-[10px]">
                                {lang === "ar" ? "البروتين" : "Protein"}
                              </span>
                              <span className="font-bold text-cyan-400 flex items-center justify-center gap-0.5">
                                <Zap className="size-3" /> {m.recommendation.protein}g
                              </span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                              <span className="text-slate-400 block text-[10px]">
                                {lang === "ar" ? "التحضير" : "Prep"}
                              </span>
                              <span className="font-bold text-slate-300">
                                {m.recommendation.prepTime}
                              </span>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20 rounded-xl"
                            onClick={() => addToCartFromAi(m.recommendation!)}
                          >
                            <Plus className="me-1.5 size-4" />
                            {t("addToCart")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-2.5 items-center text-xs text-amber-400 animate-pulse">
                  <Bot className="size-4 animate-spin" />
                  <span>
                    {lang === "ar"
                      ? "يقوم الذكاء الاصطناعي بحساب أفضل خيار لك..."
                      : "AI is analyzing meals and calculating nutrition..."}
                  </span>
                </div>
              )}
            </div>

            {/* Prompt Suggestions */}
            <div className="border-t border-slate-800/80 bg-slate-900/60 p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                {lang === "ar" ? "اقتراحات سريعة بنقرة واحدة:" : "Quick Suggestions:"}
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(lang === "ar"
                  ? PROMPT_SUGGESTIONS
                  : [
                      "High-protein lunch under 50 SAR 🥩",
                      "Workout energy smoothie ⚡",
                      "Light vegan detox salad 🌱",
                      "Low carb keto bowl 🥑",
                    ]
                ).map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleAsk(prompt)}
                    className="shrink-0 rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder={
                  lang === "ar"
                    ? "اكتب طلبك هنا (مثال: وجبة عشاء بروتين عالي وسعرات قليلة)..."
                    : "Type your request (e.g. high protein low calorie dinner)..."
                }
                className="border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500 text-xs rounded-xl"
              />
              <Button
                size="sm"
                onClick={() => handleAsk()}
                disabled={!input.trim() || isThinking}
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 px-3.5 rounded-xl font-bold"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

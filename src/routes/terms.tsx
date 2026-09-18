import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { AppHeader, AppFooter } from "@/components/app-header";
import {
  FileText,
  ShieldCheck,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Bike,
  UtensilsCrossed,
} from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "الشروط والأحكام | منصة FOODHUB لتوصيل الطعام" },
      {
        name: "description",
        content:
          "الشروط والأحكام الرسمية لاستخدام منصة وتطبيقات FOODHUB لتوصيل الطعام، سياسات السلة الموحدة، شروط التوصيل، الإلغاء، وحماية المستهلك.",
      },
      { property: "og:title", content: "الشروط والأحكام | FOODHUB Terms & Conditions" },
      {
        property: "og:description",
        content: "الاتفاقية الرسمية وشروط الاستخدام والخدمة لمنصة FOODHUB في المملكة العربية السعودية.",
      },
    ],
  }),
  component: TermsPage,
});

export function TermsPage() {
  const { lang } = useI18n();

  const SECTIONS = [
    {
      id: "1",
      icon: Scale,
      titleAr: "1. المقدمة والتعريفات القانونية",
      titleEn: "1. Introduction & Legal Definitions",
      contentAr: [
        "تحكم هذه الشروط والأحكام استخدامك لمنصة وتطبيق 'FOODHUB' المسجلة والمعتمدة لتقديم خدمات وساطة وتوصيل وجبات الطعام والمشروبات من المطابخ والمطاعم الشريكة إلى العملاء.",
        "يُقصد بـ 'المستخدم/العميل' أي شخص يقوم بتحميل التطبيق أو استخدام الموقع لطلب الوجبات. ويُقصد بـ 'المنصة' منظومة FOODHUB بكافة تطبيقاتها وخدماتها التقنية والسحابية.",
        "يُعد استمرارك في استخدام المنصة أو تسجيل حساب أو تقديم طلب موافقة صريحة وكاملة وغير مشروطة على الالتزام بهذه الشروط.",
      ],
      contentEn: [
        "These Terms & Conditions govern your access and use of the FOODHUB platform and mobile applications connecting customers with certified cloud kitchens and restaurants.",
        "'User' refers to any person browsing or placing orders on FoodHub. 'Platform' refers to the FoodHub ecosystem including applications, radar tracking, and cloud dispatch services.",
        "Using the platform, registering an account, or placing an order constitutes full and unconditional acceptance of these Terms.",
      ],
    },
    {
      id: "2",
      icon: UtensilsCrossed,
      titleAr: "2. سياسة السلة الموحدة والطلب من عدة مطابخ",
      titleEn: "2. Multi-Brand Cart & Ordering Policy",
      contentAr: [
        "تتيح ميزة 'السلة الموحدة' دمج طلبات من علامات ومطابخ مختلفة داخل سلة شراء واحدة، ويتم إعداد الوجبات بشكل متزامن وجمعها في كيس حراري موحد عبر كابتن واحد.",
        "تلتزم المنصة بضمان مطابقة الأصناف لقوائم الطعام المعروضة بما يشمل المكونات والقيم الغذائية المذكورة.",
        "المطابخ الشريكة مسؤولة مسؤولية كاملة عن جودة وطهي وتغليف الأطعمة وفق معايير هيئة الغذاء والدواء السعودية (SFDA).",
      ],
      contentEn: [
        "The Multi-Brand Cart allows combining orders from multiple kitchens into a single checkout, dispatched together in a thermal bag by a single courier.",
        "The platform guarantees dish descriptions, allergen badges, and nutritional values accurately reflect kitchen specifications.",
        "Partner kitchens maintain sole responsibility for food preparation, hygiene, and packaging in compliance with SFDA standards.",
      ],
    },
    {
      id: "3",
      icon: Bike,
      titleAr: "3. أوقات التوصيل، الرادار المباشر، وضمان الحرارة 65°C",
      titleEn: "3. Delivery Times, GPS Radar & 65°C Thermal Guarantee",
      contentAr: [
        "يبدأ التوصيل فائق السرعة من 15 دقيقة وفق النطاق الجغرافي المحدد، وتوفر المنصة رادار GPS حي لمتابعة حركة الكابتن ووقت الوصول الدقيق (ETA).",
        "تستخدم أساطيل المنصة شنط حرارية ذكية معزولة تحافظ على حرارة الوجبات عند 65°C لضمان وصول الطعام طازجاً وساخناً.",
        "في حال تأخر وصول الطلب عن الوقت الأقصى المضمون لأسباب خارجة عن إرادة العميل، يستحق العميل تعويضاً فورياً وفق سياسة ضمان الجودة.",
      ],
      contentEn: [
        "Ultra-fast delivery starts at 15 minutes depending on geographic radius, backed by live GPS radar telemetry and dynamic ETA countdowns.",
        "Couriers use certified 65°C insulated thermal bags to preserve meal heat and freshness from kitchen to doorstep.",
        "If a delivery exceeds the guaranteed maximum timeframe due to platform factors, customers are entitled to instant compensation.",
      ],
    },
    {
      id: "4",
      icon: CreditCard,
      titleAr: "4. الأسعار، الدفع، وضريبة القيمة المضافة (ZATCA)",
      titleEn: "4. Pricing, Payments & Value Added Tax (VAT)",
      contentAr: [
        "جميع الأسعار المعروضة على المنصة تشمل ضريبة القيمة المضافة (15% VAT) ويتم إصدار فاتورة ضريبية إلكترونية متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).",
        "طرق الدفع المعتمدة تشمل: Apple Pay، بطاقات مدى Mada، فيزا/ماستركارد، تمارا وتابي، والدفع نقداً عند الاستلام.",
        "لا تحتفظ المنصة بأي أرقام بطاقات بنكية أو بيانات CVC سرية، وتتم كافة المعاملات عبر بوابات دفع بنكية مشفرة ومرخصة من البنك المركزي السعودي (SAMA).",
      ],
      contentEn: [
        "All displayed prices include 15% VAT and generate ZATCA-compliant electronic tax invoices instantly accessible in-app.",
        "Accepted payment methods include Apple Pay, Mada, Visa/Mastercard, Tamara, Tabby, and Cash on Delivery.",
        "FoodHub never stores card CVCs or raw bank data; transactions are handled securely by SAMA-licensed payment gateways.",
      ],
    },
    {
      id: "5",
      icon: AlertTriangle,
      titleAr: "5. سياسة الإلغاء، الاسترجاع، والتعويضات",
      titleEn: "5. Cancellation, Refunds & Compensation Policy",
      contentAr: [
        "يحق للعميل إلغاء الطلب واسترداد كامل المبلغ قبل بدء المطبخ في تجهيز الوجبة (خلال أول دقيقتين من التأكيد).",
        "في حال وصول طلب خاطئ، صنف ناقص، أو تلف ظاهر في التغليف، يتم تعويض العميل فوراً إما بإعادة المبلغ للبطاقة أو رصيد محفظة فوري.",
        "تتم معالجة طلبات الاسترجاع المالي خلال 1-3 أيام عمل بنكية وفق سياسة البنك المصدر للبطاقة.",
      ],
      contentEn: [
        "Orders can be cancelled with full refunds before kitchen prep begins (within 2 minutes of placement).",
        "For incorrect, missing, or damaged items, instant wallet refunds or re-deliveries are issued immediately via support.",
        "Bank card refund processing typically clears in 1-3 business days depending on the issuing bank.",
      ],
    },
    {
      id: "6",
      icon: ShieldCheck,
      titleAr: "6. القانون المطبق والاختصاص القضائي",
      titleEn: "6. Governing Law & Dispute Resolution",
      contentAr: [
        "تخضع هذه الشروط والأحكام وتُفسر وفقاً للأنظمة واللوائح السارية في المملكة العربية السعودية، بما في ذلك نظام التجارة الإلكترونية ونظام حماية المستهلك.",
        "تختص المحاكم التجارية بمدينة الرياض بالمملكة العربية السعودية بالفصل في أي نزاع ينشأ عن تفسير أو تطبيق هذه الاتفاقية.",
      ],
      contentEn: [
        "These Terms are governed by and construed in accordance with the laws and e-commerce regulations of the Kingdom of Saudi Arabia.",
        "Any disputes shall be subject to the exclusive jurisdiction of the competent commercial courts in Riyadh, KSA.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="flex-1 w-full pb-20">
        {/* Hero Header */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12 sm:py-16">
          <div className="absolute -top-32 start-1/2 -translate-x-1/2 size-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-2">
              <Link to="/" onClick={() => sounds.playClick()} className="hover:text-amber-400 transition-colors">
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-amber-400 font-bold">{lang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1 text-xs font-bold text-amber-300">
              <FileText className="size-3.5" />
              <span>{lang === "ar" ? "الاتفاقية الرسمية للمستخدم والخدمة" : "Official Service Agreement"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {lang === "ar" ? "الشروط والأحكام واتفاقية الاستخدام" : "Terms & Conditions of Service"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {lang === "ar"
                ? "آخر تحديث: سبتمبر 2026 • متوافقة مع أنظمة التجارة الإلكترونية وهيئة الاتصالات وحماية المستهلك بالمملكة العربية السعودية."
                : "Last Updated: September 2026 • Fully compliant with Saudi E-Commerce regulations & consumer protection laws."}
            </p>
          </div>
        </section>

        {/* Legal Sections */}
        <section className="mx-auto max-w-4xl px-4 py-12 space-y-8">
          <div className="space-y-6">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <div
                  key={sec.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {lang === "ar" ? sec.titleAr : sec.titleEn}
                    </h2>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed ps-1">
                    {(lang === "ar" ? sec.contentAr : sec.contentEn).map((paragraph, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                        <span>{paragraph}</span>
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Legal Note */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-center text-xs text-slate-400">
            <p>
              {lang === "ar"
                ? "إذا كانت لديك أية استفسارات قانونية أو أسئلة تتعلق بهذه الشروط، يرجى مراسلة الإدارة القانونية عبر:"
                : "For legal inquiries or questions regarding these terms, please contact our legal department at:"}{" "}
              <a href="mailto:legal@foodhub.com" className="text-amber-400 font-bold underline font-mono">
                legal@foodhub.com
              </a>
            </p>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}

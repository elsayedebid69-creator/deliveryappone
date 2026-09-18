import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { sounds } from "@/lib/sound-effects";
import { AppHeader, AppFooter } from "@/components/app-header";
import {
  Lock,
  ShieldCheck,
  Eye,
  Database,
  UserCheck,
  FileCheck,
  Server,
  Smartphone,
  Key,
} from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية وحماية البيانات | منصة FOODHUB" },
      {
        name: "description",
        content:
          "سياسة الخصوصية الرسمية لمنصة وتطبيق FOODHUB: معايير حماية البيانات الشخصية المشفرة وفق نظام حماية البيانات الشخصية السعودي (PDPL) والمعايير العالمية.",
      },
      { property: "og:title", content: "سياسة الخصوصية | FOODHUB Privacy Policy" },
      {
        property: "og:description",
        content: "التزام FOODHUB الصارم بحماية خصوصية وأمان بيانات العملاء والشركاء.",
      },
    ],
  }),
  component: PrivacyPage,
});

export function PrivacyPage() {
  const { lang } = useI18n();

  const SECTIONS = [
    {
      id: "1",
      icon: ShieldCheck,
      titleAr: "1. التزامنا بحماية الخصوصية ونظام (PDPL)",
      titleEn: "1. Our Privacy Commitment & PDPL Compliance",
      contentAr: [
        "نحن في FOODHUB نضع خصوصية وأمان بياناتك على رأس أولوياتنا، ونلتزم التزاماً كاملاً بنظام حماية البيانات الشخصية (PDPL) الصادر في المملكة العربية السعودية وكافة المعايير الدولية لأمن المعلومات.",
        "توضح هذه السياسة كيفية جمع بياناتك الشخصية واستخدامها وتخزينها وحمايتها عند استخدامك للموقع وتطبيقات الجوال.",
      ],
      contentEn: [
        "At FOODHUB, safeguarding your privacy and data security is paramount. We comply fully with the Saudi Personal Data Protection Law (PDPL) and global cybersecurity frameworks.",
        "This policy details how we collect, process, store, and protect your personal information when utilizing our website and mobile apps.",
      ],
    },
    {
      id: "2",
      icon: Database,
      titleAr: "2. البيانات التي نقوم بجمعها",
      titleEn: "2. Information We Collect",
      contentAr: [
        "بيانات الحساب والهوية: الاسم، رقم الجوال، والبريد الإلكتروني للتحقق وتسجيل الدخول.",
        "بيانات الموقع الجغرافي (GPS): لتحديد أقرب المطابخ السحابية، وتقدير زمن التوصيل الدقيق، وتوجيه كابتن التوصيل على الرادار المباشر.",
        "سجل الطلبات والتفضيلات الغذائية: الأصناف المفضلة، تفضيلات السعرات والماكروز، وملاحظات الحساسية الغذائية لضمان سلامتك.",
        "البيانات التقنية: عنوان IP، نوع الجهاز، وإصدار نظام التشغيل لتحسين أداء التطبيق وحمايته من الاحتيال.",
      ],
      contentEn: [
        "Identity & Account: Name, mobile number, and email address for instant verification and authentication.",
        "Geolocation (GPS): Real-time location to display nearby cloud kitchens, calculate ETAs, and guide live radar couriers.",
        "Order History & Dietary Choices: Favorite dishes, macro preferences, and allergy notes to ensure optimal safety.",
        "Technical Telemetry: IP address, device model, and OS version to optimize performance and prevent fraudulent activity.",
      ],
    },
    {
      id: "3",
      icon: Lock,
      titleAr: "3. تشفير البيانات والأمان التقني (256-bit SSL)",
      titleEn: "3. 256-Bit SSL Encryption & Technical Security",
      contentAr: [
        "تُنقل جميع البيانات عبر شبكات اتصال مشفرة بتقنية 256-bit SSL/TLS لضمان عدم اعتراضها أو التلاعب بها.",
        "تُخزن قواعد البيانات في مراكز بيانات سحابية معتمدة ومطابقة لضوابط الهيئة الوطنية للأمن السيبراني (NCA).",
        "لا نقوم إطلاقاً ببيع أو تأجير أو مشاركة بياناتك مع أي أطراف ثالثة لأغراض إعلانية غير مصرح بها.",
      ],
      contentEn: [
        "All communications are encrypted using end-to-end 256-bit SSL/TLS protocols to prevent tampering or interception.",
        "Data is hosted in certified cloud infrastructure fully compliant with National Cybersecurity Authority (NCA) standards.",
        "We never sell, rent, or trade your personal data to unauthorized third parties for marketing purposes.",
      ],
    },
    {
      id: "4",
      icon: UserCheck,
      titleAr: "4. مشاركة البيانات مع المطابخ والكباتن",
      titleEn: "4. Data Sharing with Kitchens & Couriers",
      contentAr: [
        "يتم تزويد المطبخ الشريك فقط بقائمة الأصناف وملاحظات التحضير دون الكشف عن رقم هاتفك أو معلوماتك الشخصية الكاملة.",
        "يحصل كابتن التوصيل فقط على موقع التسليم واسم العميل الأول لإتمام التوصيل، مع خاصية اتصال مقنّع ومشفر لحماية خصوصية الطرفين.",
      ],
      contentEn: [
        "Partner kitchens receive order item details and cooking instructions only, without exposing phone numbers or sensitive profile data.",
        "Couriers receive delivery destination coordinates and first names only, with masked in-app calling for mutual privacy.",
      ],
    },
    {
      id: "5",
      icon: Key,
      titleAr: "5. حقوق المستخدم والتحكم في الحساب وحذف البيانات",
      titleEn: "5. User Rights, Profile Control & Account Deletion",
      contentAr: [
        "يحق لك في أي وقت مراجعة أو تعديل أو تصحيح بياناتك المسجلة عبر إعدادات الحساب في التطبيق.",
        "يحق لك طلب حذف حسابك وبياناتك الشخصية نهائياً من أنظمتنا بضغطة زر واحدة أو عبر مراسلة مسؤول حماية البيانات على privacy@foodhub.com.",
      ],
      contentEn: [
        "You have the right to inspect, update, or correct your personal data anytime via in-app profile settings.",
        "You can request permanent account and data deletion at any time with 1-click in-app or by contacting privacy@foodhub.com.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <AppHeader />

      <main className="flex-1 w-full pb-20">
        {/* Hero Header */}
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12 sm:py-16">
          <div className="absolute -top-32 start-1/2 -translate-x-1/2 size-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-2">
              <Link to="/" onClick={() => sounds.playClick()} className="hover:text-amber-400 transition-colors">
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-emerald-400 font-bold">{lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1 text-xs font-bold text-emerald-300">
              <Lock className="size-3.5" />
              <span>{lang === "ar" ? "حماية وتشفير البيانات 100%" : "100% Encrypted Data Protection"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {lang === "ar" ? "سياسة الخصوصية وأمان البيانات" : "Privacy Policy & Data Protection"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {lang === "ar"
                ? "نلتزم بأعلى المعايير العالمية لحماية خصوصيتك ومعلوماتك، والتوافق مع نظام حماية البيانات الشخصية السعودي (PDPL)."
                : "Committed to the highest standards of data security in full compliance with Saudi PDPL and global privacy laws."}
            </p>
          </div>
        </section>

        {/* Policy Sections */}
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
                    <div className="size-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {lang === "ar" ? sec.titleAr : sec.titleEn}
                    </h2>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed ps-1">
                    {(lang === "ar" ? sec.contentAr : sec.contentEn).map((paragraph, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                        <span>{paragraph}</span>
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DPO Contact Note */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-center text-xs text-slate-400">
            <p>
              {lang === "ar"
                ? "لممارسة أي من حقوقك المتعلقة ببياناتك أو التواصل مع مسؤول حماية البيانات (DPO):"
                : "To exercise your data rights or contact our Data Protection Officer (DPO):"}{" "}
              <a href="mailto:privacy@foodhub.com" className="text-emerald-400 font-bold underline font-mono">
                privacy@foodhub.com
              </a>
            </p>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}

// Live Onboarding Chat & Document Attachment Management Engine for FOODHUB

import { issueAccountCode, type AccountType, type AccessCodeAccount } from "@/lib/access-codes";
import { registerApprovedPartner } from "@/lib/ip-security";

export interface OnboardingChatMessage {
  id: string;
  sender: "applicant" | "admin" | "system";
  senderName: string;
  text: string;
  timestamp: string;
  attachments?: Array<{ name: string; type: string; url: string }>;
  issuedCode?: string;
}

export interface ApplicantDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  dataUrl: string; // Base64 or Blob preview URL
  uploadedAt: string;
}

export interface OnboardingApplication {
  id: string;
  role: AccountType;
  fullName: string;
  phone: string;
  email: string;
  businessName?: string;
  address?: string;
  city?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  status: "draft" | "pending" | "approved" | "auto_activated" | "rejected";
  issuedCode?: string;
  createdAt: string;
  updatedAt: string;
  documents: Record<string, ApplicantDocument>;
  messages: OnboardingChatMessage[];
}

const STORAGE_ONBOARDING_KEY = "foodhub_onboarding_applications";
const ACTIVE_APPLICANT_SESSION_KEY = "foodhub_active_applicant_session";

// Seed sample applications for Admin demonstration
const SEED_APPLICATIONS: OnboardingApplication[] = [
  {
    id: "app-courier-1",
    role: "courier",
    fullName: "فيصل الشمري",
    phone: "0559988112",
    email: "faisal.sh@gmail.com",
    city: "الرياض",
    vehicleType: "motorcycle",
    vehiclePlate: "س ل م 8820",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    documents: {
      nationalIdPhoto: {
        id: "doc-1",
        title: "صورة الهوية الوطنية",
        fileName: "saudi_id_faisal.png",
        fileType: "image/png",
        dataUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      personalPhoto: {
        id: "doc-2",
        title: "الصورة الشخصية",
        fileName: "personal_faisal.png",
        fileType: "image/png",
        dataUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      medicalReport: {
        id: "doc-3",
        title: "تقرير الفحص الطبي",
        fileName: "medical_report.pdf",
        fileType: "application/pdf",
        dataUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      vehiclePhoto: {
        id: "doc-4",
        title: "صورة الدراجة / الموتوسيكل",
        fileName: "yamaha_bike.jpg",
        fileType: "image/jpeg",
        dataUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    },
    messages: [
      {
        id: "msg-1",
        sender: "system",
        senderName: "نظام التحقق الآلي FOODHUB",
        text: "مرحباً بك كابتن فيصل! تم فتح جلسة المحادثة المباشرة مع الإدارة. يرجى إرفاق الوثائق المطلوبة (الهوية، الصورة الشخصية، التقرير الطبي، وصورة المركبة).",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "msg-2",
        sender: "applicant",
        senderName: "فيصل الشمري",
        text: "السلام عليكم، قمت برفع كافة الوثائق المطلوبة وبانتظار اعتماد الكود لبدء العمل في منطقة شمال الرياض.",
        timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
      },
      {
        id: "msg-3",
        sender: "admin",
        senderName: "المدير العام (FOODHUB Master)",
        text: "أهلاً بك كابتن فيصل. مستنداتك واضحة ومطابقة للشروط. جاري إصدار كود الدخول الخاص بك.",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    id: "app-restaurant-1",
    role: "restaurant",
    fullName: "الشيف رياض الدوسري",
    businessName: "مطعم ومطبخ شواء الحجاز",
    phone: "0502233445",
    email: "manager@hijaz-grill.sa",
    city: "الرياض - حي الياسمين",
    address: "طريق الملك عبدالعزيز - حي الياسمين",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    documents: {
      commercialRegister: {
        id: "doc-cr",
        title: "السجل التجاري للمنشأة",
        fileName: "cr_1010928374.pdf",
        fileType: "application/pdf",
        dataUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      restaurantExterior: {
        id: "doc-ext",
        title: "صورة واجهة المطعم / المطبخ",
        fileName: "kitchen_facade.jpg",
        fileType: "image/jpeg",
        dataUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      storeInterior: {
        id: "doc-int",
        title: "صورة المحل والتحضير الداخلي",
        fileName: "kitchen_stations.jpg",
        fileType: "image/jpeg",
        dataUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      municipalityLicense: {
        id: "doc-lic",
        title: "صورة رخصة البلدية",
        fileName: "balady_license.png",
        fileType: "image/png",
        dataUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      productCatalog: {
        id: "doc-menu",
        title: "ملف قائمة المنتجات والمنيو بالصور",
        fileName: "hijaz_grill_menu_2026.pdf",
        fileType: "application/pdf",
        dataUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
        uploadedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    },
    messages: [
      {
        id: "msg-rst-1",
        sender: "system",
        senderName: "نظام التحقق الآلي FOODHUB",
        text: "مرحباً بكم في بوابة انضمام المطابخ السحابية والمتاجر. يرجى رفع السجل التجاري، رخصة البلدية، وصور المنشأة وقائمة الوجبات.",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: "msg-rst-2",
        sender: "applicant",
        senderName: "الشيف رياض الدوسري",
        text: "مرحباً، تم إرفاق السجل ورخصة البلدية وصور المطبخ السحابي والمنيو كاملاً مع الأسعار.",
        timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
      },
    ],
  },
];

export function getAllOnboardingApplications(): OnboardingApplication[] {
  if (typeof window === "undefined") return SEED_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_ONBOARDING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(STORAGE_ONBOARDING_KEY, JSON.stringify(SEED_APPLICATIONS));
  return SEED_APPLICATIONS;
}

export function saveOnboardingApplications(apps: OnboardingApplication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_ONBOARDING_KEY, JSON.stringify(apps));
}

export function getApplicationById(id: string): OnboardingApplication | null {
  const apps = getAllOnboardingApplications();
  return apps.find((a) => a.id === id) || null;
}

// Get or Create Active Applicant Session
export function getOrCreateApplicantSession(role: AccountType): OnboardingApplication {
  const apps = getAllOnboardingApplications();
  let activeId: string | null = null;
  if (typeof window !== "undefined") {
    activeId = localStorage.getItem(`${ACTIVE_APPLICANT_SESSION_KEY}_${role}`);
  }

  if (activeId) {
    const existing = apps.find((a) => a.id === activeId);
    if (existing) return existing;
  }

  // Create new session
  const newApp: OnboardingApplication = {
    id: `app-${role}-${Date.now()}`,
    role,
    fullName: "",
    phone: "",
    email: "",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documents: {},
    messages: [
      {
        id: `msg-init-${Date.now()}`,
        sender: "system",
        senderName: "مستشار الانضمام والتفعيل الذكي (FOODHUB Concierge)",
        text:
          role === "customer"
            ? "مرحباً بك في FOODHUB! 🎉 قم بإدخال رقم هاتفك واسمك ليتم تفعيل حسابك فوراً وتوليد كود الوصول الخاص بك للاستمتاع بأسرع وأرخص وجبات طعام."
            : role === "courier"
            ? "أهلاً بك كابتن! 🛵 هذه محادثة مباشرة وفورية مع الإدارة. يرجى كتابة بياناتك وإرفاق (صورة الهوية، الصورة الشخصية، التقرير الطبي، وصورة وسيلة النقل) لاعتمادك وإصدار كودك فوراً."
            : "أهلاً بك شريكنا العزيز! 🏪 هذه محادثة مباشرة مع الإدارة. يرجى إدخال بيانات المنشأة وإرفاق (السجل التجاري، رخصة البلدية، صور المطبخ / المتجر، والمنيو) لإصدار كود شاشة المطبخ KDS.",
        timestamp: new Date().toISOString(),
      },
    ],
  };

  apps.unshift(newApp);
  saveOnboardingApplications(apps);
  if (typeof window !== "undefined") {
    localStorage.setItem(`${ACTIVE_APPLICANT_SESSION_KEY}_${role}`, newApp.id);
  }
  return newApp;
}

// Send Message in Live Onboarding Chat
export function sendOnboardingMessage(
  appId: string,
  sender: "applicant" | "admin" | "system",
  senderName: string,
  text: string,
  attachments?: Array<{ name: string; type: string; url: string }>
): OnboardingChatMessage | null {
  const apps = getAllOnboardingApplications();
  const app = apps.find((a) => a.id === appId);
  if (!app) return null;

  const newMsg: OnboardingChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender,
    senderName,
    text,
    timestamp: new Date().toISOString(),
    attachments,
  };

  app.messages.push(newMsg);
  app.updatedAt = new Date().toISOString();
  saveOnboardingApplications(apps);
  return newMsg;
}

// Save / Update Applicant Form Details & Documents
export function updateApplicantData(
  appId: string,
  data: Partial<OnboardingApplication>
): OnboardingApplication | null {
  const apps = getAllOnboardingApplications();
  const app = apps.find((a) => a.id === appId);
  if (!app) return null;

  Object.assign(app, data);
  app.updatedAt = new Date().toISOString();
  saveOnboardingApplications(apps);
  return app;
}

// Attach Document to Application
export function attachApplicantDocument(
  appId: string,
  key: string,
  doc: ApplicantDocument
): OnboardingApplication | null {
  const apps = getAllOnboardingApplications();
  const app = apps.find((a) => a.id === appId);
  if (!app) return null;

  if (!app.documents) app.documents = {};
  app.documents[key] = doc;
  app.updatedAt = new Date().toISOString();

  // Send system notice in chat
  app.messages.push({
    id: `msg-doc-${Date.now()}`,
    sender: "system",
    senderName: "نظام التحقق الآلي",
    text: `📎 تم استلام مستند: ${doc.title} (${doc.fileName}) بنجاح وجارٍ التحقق منه.`,
    timestamp: new Date().toISOString(),
  });

  saveOnboardingApplications(apps);
  return app;
}

// Customer Instant Auto-Activation:
// "العميل بمجرد الدخول برقم الهاتف والايميل يتفعل الحساب تلقائيا"
export function autoActivateCustomerAccount(params: {
  appId: string;
  fullName: string;
  phone: string;
  email: string;
  city?: string;
}): { application: OnboardingApplication; account: AccessCodeAccount } {
  const { appId, fullName, phone, email, city } = params;
  
  // 1. Issue Access Code in Engine
  const account = issueAccountCode({
    accountType: "customer",
    fullName,
    phone,
    email,
    city: city || "الرياض",
  });

  // 2. Update Application Status
  const apps = getAllOnboardingApplications();
  let app = apps.find((a) => a.id === appId);
  if (!app) {
    app = getOrCreateApplicantSession("customer");
  }

  app.fullName = fullName;
  app.phone = phone;
  app.email = email;
  app.city = city || "الرياض";
  app.status = "auto_activated";
  app.issuedCode = account.code;
  app.updatedAt = new Date().toISOString();

  // 3. Post Celebratory Welcome Message in Chat
  app.messages.push({
    id: `msg-act-${Date.now()}`,
    sender: "system",
    senderName: "نظام التفعيل الفوري FOODHUB",
    text: `🎉 مرحباً ${fullName}! تم تفعيل حسابك كعميل فورياً وبنجاح.\nكود الوصول الخاص بك هو: [${account.code}].\nيمكنك الآن الدخول مباشرة واستكشاف قوائم المطاعم والوجبات الصحية!`,
    timestamp: new Date().toISOString(),
    issuedCode: account.code,
  });

  saveOnboardingApplications(apps);
  return { application: app, account };
}

// Admin: Approve Courier or Restaurant and Issue Code Directly in Live Chat
export function adminApproveAndIssueCodeInChat(appId: string): {
  application: OnboardingApplication;
  account: AccessCodeAccount;
} | null {
  const apps = getAllOnboardingApplications();
  const app = apps.find((a) => a.id === appId);
  if (!app) return null;

  // 1. Issue Access Code
  const account = issueAccountCode({
    accountType: app.role,
    fullName: app.businessName || app.fullName,
    phone: app.phone,
    email: app.email,
    businessName: app.businessName,
    city: app.city || "الرياض",
  });

  // 2. Register Single-IP lock
  if (app.role !== "customer") {
    registerApprovedPartner({
      partnerType: app.role as "restaurant" | "courier",
      partnerName: app.businessName || app.fullName,
      email: app.email,
      initialIp: "156.204.18.92",
    });
  }

  // 3. Update application status
  app.status = "approved";
  app.issuedCode = account.code;
  app.updatedAt = new Date().toISOString();

  // 4. Send congratulations message in the live chat with code
  app.messages.push({
    id: `msg-admin-appr-${Date.now()}`,
    sender: "admin",
    senderName: "المدير العام (FOODHUB Master)",
    text: `تهانينا ${app.fullName}! تم اعتماد حسابك بنجاح ومطابقة كافة الوثائق والمرفقات.\nتم إصدار كود الوصول المعتمد الخاص بك: [${account.code}].\nيمكنك وضعه فوراً في خانة "دخول بكود الوصول" لفتح شاشتك المخصصة. بالتوفيق! 🚀`,
    timestamp: new Date().toISOString(),
    issuedCode: account.code,
  });

  saveOnboardingApplications(apps);
  return { application: app, account };
}

// Centralized Access Code Engine & Support Recovery System for FOODHUB

export type AccountType = "customer" | "courier" | "restaurant" | "admin";

export interface AccessCodeAccount {
  id: string;
  code: string; // e.g., FH-CUST-8492, FH-REST-9482, FH-RIDE-3129, FH-ADMIN-777
  accountType: AccountType;
  fullName: string;
  email: string;
  phone: string;
  businessName?: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface CodeRecoveryRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  accountType: AccountType;
  reason: string;
  status: "pending" | "resolved" | "rejected";
  issuedNewCode?: string;
  createdAt: string;
  resolvedAt?: string;
}

const STORAGE_ACCOUNTS_KEY = "foodhub_access_code_accounts";
const STORAGE_RECOVERY_KEY = "foodhub_code_recovery_requests";

// Default Initial Accounts Seeded with Valid Codes
const DEFAULT_ACCOUNTS: AccessCodeAccount[] = [
  {
    id: "acc-adm-1",
    code: "FH-ADMIN-777",
    accountType: "admin",
    fullName: "المدير العام للمنظومة",
    email: "admin@foodhub.com",
    phone: "0500000001",
    city: "الرياض",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc-rst-1",
    code: "FH-REST-9482",
    accountType: "restaurant",
    fullName: "الشيف فهد التميمي",
    businessName: "مطبخ FoodHub السحابي المركزي",
    email: "kitchen@foodhub.com",
    phone: "0551122334",
    city: "الرياض",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc-cst-1",
    code: "FH-CUST-1044",
    accountType: "customer",
    fullName: "سارة الأحمد",
    email: "customer@foodhub.com",
    phone: "0569988776",
    city: "الرياض",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc-cou-1",
    code: "FH-RIDE-3129",
    accountType: "courier",
    fullName: "الكابتن سعد العتيبي",
    email: "rider.saad@foodhub.com",
    phone: "0543322110",
    city: "الرياض",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Generate Unique Code
export function generateAccessCode(type: AccountType): string {
  const prefixMap: Record<AccountType, string> = {
    customer: "FH-CUST",
    courier: "FH-RIDE",
    restaurant: "FH-REST",
    admin: "FH-ADMIN",
  };
  const prefix = prefixMap[type] || "FH-CODE";
  const num = Math.floor(1000 + Math.random() * 9000);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = () => chars[Math.floor(Math.random() * chars.length)] ?? "X";
  const suffix = `${pick()}${pick()}`;
  return `${prefix}-${num}${suffix}`;
}

// Get All Stored Accounts
export function getAllAccessAccounts(): AccessCodeAccount[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
}

// Save Accounts
export function saveAccessAccounts(accounts: AccessCodeAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
}

// NOTE: Access codes are administrative reference identifiers only.
// They are NEVER credentials: all authentication happens through the backend
// auth service (email + password) and all roles come from the server-side
// user_roles table enforced by row-level security.

// Admin: Create & Issue New Access Code for an Approved User
export function issueAccountCode(data: {
  accountType: AccountType;
  fullName: string;
  email: string;
  phone: string;
  businessName?: string;
  city?: string;
}): AccessCodeAccount {
  const accounts = getAllAccessAccounts();
  const newCode = generateAccessCode(data.accountType);

  const newAccount: AccessCodeAccount = {
    id: `acc-${Date.now()}`,
    code: newCode,
    accountType: data.accountType,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    businessName: data.businessName ?? "",
    city: data.city || "الرياض",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  accounts.unshift(newAccount);
  saveAccessAccounts(accounts);
  return newAccount;
}

// Admin: Regenerate / Reset Code for existing account
export function regenerateAccountCode(accountId: string): string | null {
  const accounts = getAllAccessAccounts();
  const target = accounts.find((a) => a.id === accountId);
  if (!target) return null;

  const newCode = generateAccessCode(target.accountType);
  target.code = newCode;
  saveAccessAccounts(accounts);
  return newCode;
}

// ==========================================
// CODE RECOVERY / SUPPORT REQUESTS SYSTEM
// ==========================================

export function getCodeRecoveryRequests(): CodeRecoveryRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_RECOVERY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const initialRequests: CodeRecoveryRequest[] = [
    {
      id: "req-rec-1",
      fullName: "خالد السبيعي",
      phone: "0554433221",
      email: "khaled.s@gmail.com",
      accountType: "courier",
      reason: "فقدت كود الدخول الخاص بي بعد تغيير هاتفي المحمول",
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "req-rec-2",
      fullName: "مطعم ركن المشويات الأصيل",
      phone: "0501122889",
      email: "owner@rokn-grills.com",
      accountType: "restaurant",
      reason: "نسيان كود دخول شاشة المطبخ KDS ونرغب في استعادة الكود لبدء استقبال الطلبات",
      status: "pending",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_RECOVERY_KEY, JSON.stringify(initialRequests));
  return initialRequests;
}

export function saveCodeRecoveryRequests(requests: CodeRecoveryRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_RECOVERY_KEY, JSON.stringify(requests));
}

// Submit Forgot Code Support Request
export function submitForgotCodeRequest(data: {
  fullName: string;
  phone: string;
  email: string;
  accountType: AccountType;
  reason: string;
}): CodeRecoveryRequest {
  const requests = getCodeRecoveryRequests();
  const newRequest: CodeRecoveryRequest = {
    id: `rec-${Date.now()}`,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    accountType: data.accountType,
    reason: data.reason,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  requests.unshift(newRequest);
  saveCodeRecoveryRequests(requests);
  return newRequest;
}

// Admin: Resolve Support Request and Issue New Valid Code
export function adminResolveRecoveryRequest(requestId: string): { newCode: string; account: AccessCodeAccount } | null {
  const requests = getCodeRecoveryRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) return null;

  // Find or create account
  const accounts = getAllAccessAccounts();
  let account = accounts.find((a) => a.phone === req.phone || a.email.toLowerCase() === req.email.toLowerCase());

  if (account) {
    const newCode = generateAccessCode(account.accountType);
    account.code = newCode;
    account.isActive = true;
    req.issuedNewCode = newCode;
    req.status = "resolved";
    req.resolvedAt = new Date().toISOString();
    saveAccessAccounts(accounts);
    saveCodeRecoveryRequests(requests);
    return { newCode, account };
  } else {
    // Create new account with valid code
    const newCode = generateAccessCode(req.accountType);
    account = {
      id: `acc-${Date.now()}`,
      code: newCode,
      accountType: req.accountType,
      fullName: req.fullName,
      email: req.email,
      phone: req.phone,
      city: "الرياض",
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    accounts.unshift(account);
    req.issuedNewCode = newCode;
    req.status = "resolved";
    req.resolvedAt = new Date().toISOString();
    saveAccessAccounts(accounts);
    saveCodeRecoveryRequests(requests);
    return { newCode, account };
  }
}

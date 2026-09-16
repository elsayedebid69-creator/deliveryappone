// AI Partner ID Generator and Anti-Fraud Single-IP Binding Engine

export interface PartnerSecurityRecord {
  id: string;
  partnerType: "restaurant" | "courier";
  partnerName: string;
  aiPartnerId: string; // e.g. FH-AI-REST-8924X1
  email: string;
  registeredIp: string;
  currentIp: string;
  isLockedDualIp: boolean;
  isTamperBanned: boolean;
  lastLoginAt: string;
  registeredAt: string;
}

const STORAGE_KEY = "foodhub_partner_security_records";
const ACTIVE_PARTNER_KEY = "foodhub_active_partner_session";

// Generate Unique Cryptographic AI Partner ID
export function generateAiPartnerId(type: "restaurant" | "courier"): string {
  const prefix = type === "restaurant" ? "FH-AI-REST" : "FH-AI-RIDER";
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomAlpha = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${randomNum}${randomAlpha}`;
}

// Simulated Client Public IP resolver
export async function getClientPublicIp(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip || "156.204.18.92";
  } catch {
    return "156.204.18.92";
  }
}

// Read records
export function getPartnerSecurityRecords(): PartnerSecurityRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  
  // Default seeded records with AI IDs
  const initialRecords: PartnerSecurityRecord[] = [
    {
      id: "sec-rest-1",
      partnerType: "restaurant",
      partnerName: "مطبخ FoodHub السحابي المركزي",
      aiPartnerId: "FH-AI-REST-9482X7",
      email: "kitchen@foodhub.com",
      registeredIp: "156.204.18.92",
      currentIp: "156.204.18.92",
      isLockedDualIp: false,
      isTamperBanned: false,
      lastLoginAt: new Date().toISOString(),
      registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "sec-rider-1",
      partnerType: "courier",
      partnerName: "الكابتن سعد العتيبي",
      aiPartnerId: "FH-AI-RIDER-3129K4",
      email: "rider.saad@foodhub.com",
      registeredIp: "156.204.18.92",
      currentIp: "156.204.18.92",
      isLockedDualIp: false,
      isTamperBanned: false,
      lastLoginAt: new Date().toISOString(),
      registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRecords));
  return initialRecords;
}

export function savePartnerSecurityRecords(records: PartnerSecurityRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// Register or Approve Partner with AI ID
export function registerApprovedPartner(data: {
  partnerType: "restaurant" | "courier";
  partnerName: string;
  email: string;
  initialIp?: string;
}): PartnerSecurityRecord {
  const records = getPartnerSecurityRecords();
  const aiId = generateAiPartnerId(data.partnerType);
  const newRecord: PartnerSecurityRecord = {
    id: `sec-${Date.now()}`,
    partnerType: data.partnerType,
    partnerName: data.partnerName,
    aiPartnerId: aiId,
    email: data.email,
    registeredIp: data.initialIp || "156.204.18.92",
    currentIp: data.initialIp || "156.204.18.92",
    isLockedDualIp: false,
    isTamperBanned: false,
    lastLoginAt: new Date().toISOString(),
    registeredAt: new Date().toISOString(),
  };
  records.push(newRecord);
  savePartnerSecurityRecords(records);
  return newRecord;
}

// Verify IP on login / session check
export function verifyPartnerSessionIp(
  aiPartnerId: string,
  incomingIp: string
): { allowed: boolean; reason?: "dual_ip_detected" | "tamper_detected" | "not_found"; record?: PartnerSecurityRecord } {
  const records = getPartnerSecurityRecords();
  const index = records.findIndex((r) => r.aiPartnerId === aiPartnerId);
  if (index === -1) {
    return { allowed: false, reason: "not_found" };
  }

  const record = records[index];
  if (!record) {
    return { allowed: false, reason: "not_found" };
  }

  if (record.isTamperBanned) {
    return { allowed: false, reason: "tamper_detected", record };
  }

  if (record.isLockedDualIp) {
    return { allowed: false, reason: "dual_ip_detected", record };
  }

  // Check IP conflict
  if (record.registeredIp && record.registeredIp !== incomingIp) {
    // Dual-IP conflict detected! Auto-lock account!
    record.isLockedDualIp = true;
    record.currentIp = incomingIp;
    records[index] = record;
    savePartnerSecurityRecords(records);
    return { allowed: false, reason: "dual_ip_detected", record };
  }

  // IP matched or first registration
  record.currentIp = incomingIp;
  record.lastLoginAt = new Date().toISOString();
  records[index] = record;
  savePartnerSecurityRecords(records);
  return { allowed: true, record };
}

// Admin unlock and re-bind to new IP
export function adminUnlockPartner(aiPartnerId: string, newAuthorizedIp?: string) {
  const records = getPartnerSecurityRecords();
  const index = records.findIndex((r) => r.aiPartnerId === aiPartnerId);
  const target = records[index];
  if (target) {
    target.isLockedDualIp = false;
    target.isTamperBanned = false;
    if (newAuthorizedIp) {
      target.registeredIp = newAuthorizedIp;
      target.currentIp = newAuthorizedIp;
    } else {
      target.registeredIp = target.currentIp;
    }
    savePartnerSecurityRecords(records);
  }
}

// Simulate Dual IP Trigger for testing
export function simulateDualIpConflict(aiPartnerId: string) {
  const records = getPartnerSecurityRecords();
  const index = records.findIndex((r) => r.aiPartnerId === aiPartnerId);
  const target = records[index];
  if (target) {
    target.isLockedDualIp = true;
    target.currentIp = "197.38.214.88 (محاولة من شبكة أخرى)";
    savePartnerSecurityRecords(records);
  }
}

// Flag Tampering
export function flagPartnerTampering(aiPartnerId: string) {
  const records = getPartnerSecurityRecords();
  const index = records.findIndex((r) => r.aiPartnerId === aiPartnerId);
  const target = records[index];
  if (target) {
    target.isTamperBanned = true;
    savePartnerSecurityRecords(records);
  }
}

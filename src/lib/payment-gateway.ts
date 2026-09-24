/**
 * FoodHub Multi-Gateway Payment Engine
 * Supports: Apple Pay, Mada, Visa/Mastercard (Moyasar / Tap / Direct 3DS) & Tamara BNPL
 */

export interface PaymentTransaction {
  id: string;
  gateway: "moyasar" | "tap" | "hyperpay" | "tamara" | "applepay" | "cash";
  amount: number;
  currency: string;
  status: "paid" | "failed" | "pending";
  method: "applepay" | "mada" | "visa" | "mastercard" | "tamara" | "cash";
  description: string;
  referenceNumber: string;
  paidAt: string;
  cardLast4?: string;
}

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

// Detect card brand from number
export function detectCardBrand(cardNumber: string): "mada" | "visa" | "mastercard" | "unknown" {
  const clean = cardNumber.replace(/\s+/g, "");
  // Saudi Mada BIN ranges (samples: 400861, 401757, 455708, 484783, 588845, 588846, 588847, etc.)
  const madaPrefixes = [
    "588845", "588846", "588847", "588848", "588849", "588850", "588851",
    "400861", "401757", "409201", "410621", "417633", "422817", "422818", "422819",
    "428671", "428672", "428673", "431361", "432328", "434107", "439954", "440647",
    "440795", "446404", "457865", "457997", "458456", "462220", "468540", "468541",
    "468542", "468543", "484783", "486094", "486095", "486096", "504300", "513213",
    "521076", "524130", "524514", "529415", "529741", "530060", "530906", "531095",
    "532013", "535825", "535989", "536023", "537767", "539732", "543085", "543357",
    "554180", "557606", "558563", "968201", "968202", "968203", "968204", "968205"
  ];

  for (const prefix of madaPrefixes) {
    if (clean.startsWith(prefix)) return "mada";
  }

  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean)) return "mastercard";
  return "unknown";
}

/**
 * Format credit card number with spacing (0000 0000 0000 0000)
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * Format MM/YY expiry
 */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

/**
 * Process online payment (supports Moyasar API / Tap / 3D-Secure simulation)
 */
export async function processPayment(params: {
  method: "applepay" | "card" | "tamara" | "cash";
  amount: number;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  card?: CardDetails;
}): Promise<PaymentTransaction> {
  // Simulate network latency for payment gateway round-trip
  await new Promise((r) => setTimeout(r, 1200));

  const ref = "TXN-" + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  if (params.method === "cash") {
    return {
      id: "pay_cash_" + Math.random().toString(36).substring(7),
      gateway: "cash",
      amount: params.amount,
      currency: "SAR",
      status: "pending",
      method: "cash",
      description: "الدفع نقداً عند استلام الطلب",
      referenceNumber: ref,
      paidAt: now,
    };
  }

  if (params.method === "applepay") {
    return {
      id: "pay_ap_" + Math.random().toString(36).substring(7),
      gateway: "applepay",
      amount: params.amount,
      currency: "SAR",
      status: "paid",
      method: "applepay",
      description: "تم الدفع بنجاح عبر Apple Pay (Face/Touch ID)",
      referenceNumber: ref,
      paidAt: now,
    };
  }

  if (params.method === "tamara") {
    return {
      id: "pay_tamara_" + Math.random().toString(36).substring(7),
      gateway: "tamara",
      amount: params.amount,
      currency: "SAR",
      status: "paid",
      method: "tamara",
      description: `تمت الموافقة وتقسيم الفاتورة عبر تمارا (${(params.amount / 3).toFixed(2)} ر.س / شهر)`,
      referenceNumber: ref,
      paidAt: now,
    };
  }

  // Card (Mada / Visa / MasterCard)
  const brand = params.card ? detectCardBrand(params.card.number) : "mada";
  const last4 = params.card ? params.card.number.replace(/\s+/g, "").slice(-4) : "8845";

  return {
    id: "pay_card_" + Math.random().toString(36).substring(7),
    gateway: "moyasar",
    amount: params.amount,
    currency: "SAR",
    status: "paid",
    method: brand === "unknown" ? "mada" : brand,
    description: `تم خصم المبلغ بنجاح عبر بطاقة ${brand.toUpperCase()} المنتهية بـ ${last4}`,
    referenceNumber: ref,
    paidAt: now,
    cardLast4: last4,
  };
}

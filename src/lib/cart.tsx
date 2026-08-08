import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  id: string;
  restaurant_id: string;
  name_ar: string;
  name_en: string;
  price: number;
  quantity: number;
};

type CartValue = {
  lines: CartLine[];
  restaurantId: string | null;
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "quantity">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);
const KEY = "sufra_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartValue>(() => {
    return {
      lines,
      restaurantId: lines[0]?.restaurant_id ?? null,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.quantity * l.price, 0),
      add: (line) =>
        setLines((prev) => {
          const base = prev.length && prev[0]!.restaurant_id !== line.restaurant_id ? [] : prev;
          const found = base.find((l) => l.id === line.id);
          if (found) {
            return base.map((l) => (l.id === line.id ? { ...l, quantity: l.quantity + 1 } : l));
          }
          return [...base, { ...line, quantity: 1 }];
        }),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.id !== id)
            : prev.map((l) => (l.id === id ? { ...l, quantity: qty } : l)),
        ),
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

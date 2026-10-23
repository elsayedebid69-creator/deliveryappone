import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "restaurant" | "courier" | "customer";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let generation = 0;
    let currentId: string | null | undefined;

    const loadRole = async (u: User | null) => {
      if (currentId === (u?.id ?? null)) return;
      currentId = u?.id ?? null;
      const version = ++generation;
      if (active) { setUser(u); setRole(null); setLoading(true); }
      if (!u) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
      if (!active || version !== generation) return;
      const roles = (data ?? []).map((r) => r.role as AppRole);
      const priority: AppRole[] = ["admin", "restaurant", "courier", "customer"];
      setRole(priority.find((p) => roles.includes(p)) ?? "customer");
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => { if(active) void loadRole(session?.user ?? null); });
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      void loadRole(data.session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}

export function dashboardPathFor(role: AppRole | null): string {
  if (role === "admin") return "/admin";
  if (role === "restaurant") return "/vendor";
  if (role === "courier") return "/courier";
  return "/orders";
}

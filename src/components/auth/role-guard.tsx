import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { dashboardPathFor, useSession, type AppRole } from "@/lib/session";

/**
 * Client-side UX guard: keeps a signed-in user out of a dashboard that is not
 * theirs. This is convenience only — the database enforces access with
 * row-level security and server-side role checks.
 */
export function RoleGuard({ allow, children }: { allow: AppRole[]; children: React.ReactNode }) {
  const { user, role, loading } = useSession();
  const navigate = useNavigate();

  const allowed = Boolean(role && allow.includes(role));

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/auth", replace: true });
      return;
    }
    if (role && !allowed) {
      void navigate({ to: dashboardPathFor(role) as never, replace: true });
    }
  }, [loading, user, role, allowed, navigate]);

  if (loading || !user || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400 text-sm">
        <span className="size-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

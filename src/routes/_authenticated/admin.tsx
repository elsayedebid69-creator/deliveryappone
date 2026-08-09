import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { approveJoinRequest, createAccount, listAccounts } from "@/lib/admin.functions";
import { useI18n, type TKey } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Store,
  Bike,
  TrendingUp,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | FoodHub" },
      { name: "description", content: "إدارة الحسابات والمطاعم والطلبات في منصة FoodHub." },
      { property: "og:title", content: "لوحة الإدارة | FoodHub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t, tStatus, tf, lang } = useI18n();
  const { role } = useSession();
  const qc = useQueryClient();

  const accounts = useQuery({ queryKey: ["accounts"], queryFn: () => listAccounts() });
  const restaurants = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurants").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const orders = useQuery({
    queryKey: ["admin-orders"],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, restaurants(name_ar,name_en)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const joinRequests = useQuery({
    queryKey: ["join-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("join_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const approveRequest = useMutation({
    mutationFn: async (request: any) => {
      return await approveJoinRequest({ data: { id: request.id as string } });
    },
    onSuccess: (data) => {
      toast.success(t("approved"));
      toast.info(
        lang === "ar"
          ? `بيانات الدخول: ${data.email} / ${data.tempPassword}`
          : `Credentials: ${data.email} / ${data.tempPassword}`
      );
      void qc.invalidateQueries({ queryKey: ["join-requests"] });
      void qc.invalidateQueries({ queryKey: ["accounts"] });
      setShowRequestDialog(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectRequest = useMutation({
    mutationFn: async (request: any) => {
      const { error } = await supabase
        .from("join_requests")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", request.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("rejected"));
      void qc.invalidateQueries({ queryKey: ["join-requests"] });
      setShowRequestDialog(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (role && role !== "admin") {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <p className="p-10 text-center text-muted-foreground">403</p>
      </div>
    );
  }

  const revenue = (orders.data ?? []).reduce((n, o) => n + Number(o.total), 0);
  const pendingRequests = (joinRequests.data ?? []).filter((r) => r.status === "pending");
  const approvedRequests = (joinRequests.data ?? []).filter((r) => r.status === "approved");
  const rejectedRequests = (joinRequests.data ?? []).filter((r) => r.status === "rejected");

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("admin")}</h1>
          <Badge variant="secondary" className="bg-[#FFC72C]/20 text-[#FFC72C]">
            {pendingRequests.length} {t("pendingRequests")}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("totalOrders")}
            value={String(orders.data?.length ?? 0)}
            icon={<ClipboardCheck className="size-5" />}
            color="blue"
          />
          <StatCard
            label={t("revenue")}
            value={`${revenue.toFixed(0)} ${t("sar")}`}
            icon={<TrendingUp className="size-5" />}
            color="green"
          />
          <StatCard
            label={t("users")}
            value={String(accounts.data?.length ?? 0)}
            icon={<Users className="size-5" />}
            color="purple"
          />
          <StatCard
            label={t("restaurants")}
            value={String(restaurants.data?.length ?? 0)}
            icon={<Store className="size-5" />}
            color="orange"
          />
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="bg-white">
            <TabsTrigger value="requests" className="gap-2">
              <ClipboardCheck className="size-4" />
              {t("joinRequests")}
              {pendingRequests.length > 0 && (
                <Badge className="ml-1 bg-[#FFC72C] text-white">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-2">
              <Users className="size-4" />
              {t("accounts")}
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="gap-2">
              <Store className="size-4" />
              {t("restaurants")}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardCheck className="size-4" />
              {t("incomingOrders")}
            </TabsTrigger>
          </TabsList>

          {/* Join Requests Tab */}
          <TabsContent value="requests" className="space-y-6 pt-6">
            {/* Pending Requests */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Clock className="size-5 text-[#FFC72C]" />
                {t("pendingRequests")}
                <Badge variant="secondary">{pendingRequests.length}</Badge>
              </h3>
              {pendingRequests.length === 0 ? (
                <EmptyState message={t("noRequests")} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {pendingRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onView={() => {
                        setSelectedRequest(request);
                        setShowRequestDialog(true);
                      }}
                      onApprove={() => approveRequest.mutate(request)}
                      onReject={() => rejectRequest.mutate(request)}
                      lang={lang}
                      t={t}
                      isProcessing={approveRequest.isPending || rejectRequest.isPending}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Approved Requests */}
            {approvedRequests.length > 0 && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <CheckCircle2 className="size-5 text-[#FFC72C]" />
                  {t("approvedRequests")}
                  <Badge variant="secondary">{approvedRequests.length}</Badge>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {approvedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onView={() => {
                        setSelectedRequest(request);
                        setShowRequestDialog(true);
                      }}
                      lang={lang}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Requests */}
            {rejectedRequests.length > 0 && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <XCircle className="size-5 text-red-500" />
                  {t("rejectedRequests")}
                  <Badge variant="secondary">{rejectedRequests.length}</Badge>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {rejectedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onView={() => {
                        setSelectedRequest(request);
                        setShowRequestDialog(true);
                      }}
                      lang={lang}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6 pt-6">
            <div className="surface divide-y divide-border">
              {(accounts.data ?? []).map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{u.full_name || u.email}</p>
                    <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant="secondary">{u.role}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="pt-6">
            <div className="surface divide-y divide-border">
              {(restaurants.data ?? []).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{tf(r, "name")}</p>
                    <p className="text-sm text-muted-foreground">{tf(r, "cuisine")}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await supabase
                        .from("restaurants")
                        .update({ is_active: !r.is_active })
                        .eq("id", r.id);
                      void qc.invalidateQueries({ queryKey: ["admin-restaurants"] });
                    }}
                  >
                    {r.is_active ? t("active") : t("inactive")}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="pt-6">
            <div className="surface divide-y divide-border">
              {(orders.data ?? []).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">
                      {o.restaurants ? tf(o.restaurants, "name") : t("order")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {o.total} {t("sar")} · {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{tStatus(o.status)}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Request Detail Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("requestDetails")}</DialogTitle>
            <DialogDescription>
              {selectedRequest?.type === "restaurant" ? t("restaurantInfo") : t("agentInfo")}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedRequest.type === "restaurant" ? (
                    <>
                      <InfoRow label={t("businessNameAr")} value={selectedRequest.data.business_name_ar} />
                      <InfoRow label={t("businessNameEn")} value={selectedRequest.data.business_name_en} />
                      <InfoRow label={t("contactName")} value={selectedRequest.data.contact_name} />
                      <InfoRow label={t("contactPhone")} value={selectedRequest.data.contact_phone} />
                      <InfoRow label={t("email")} value={selectedRequest.data.email} />
                      <InfoRow label={t("commercialRegister")} value={selectedRequest.data.commercial_register} />
                      <InfoRow label={t("restaurantAddress")} value={selectedRequest.data.address} className="col-span-2" />
                      {selectedRequest.data.description && (
                        <InfoRow label={t("description")} value={selectedRequest.data.description} className="col-span-2" />
                      )}
                    </>
                  ) : (
                    <>
                      <InfoRow label={t("fullNameLabel")} value={selectedRequest.data.full_name} />
                      <InfoRow label={t("email")} value={selectedRequest.data.email} />
                      <InfoRow label={t("phone")} value={selectedRequest.data.phone} />
                      <InfoRow label={t("idNumber")} value={selectedRequest.data.id_number} />
                      <InfoRow label={t("vehicleType")} value={t(selectedRequest.data.vehicle_type as any)} />
                      {selectedRequest.data.vehicle_plate && (
                        <InfoRow label={t("vehiclePlate")} value={selectedRequest.data.vehicle_plate} />
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {lang === "ar" ? "تاريخ الإرسال:" : "Submitted:"}{" "}
                {new Date(selectedRequest.created_at).toLocaleString()}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => rejectRequest.mutate(selectedRequest)}
                  disabled={rejectRequest.isPending}
                >
                  {t("reject")}
                </Button>
                <Button
                  className="bg-[#FFC72C] hover:bg-[#E6B800]"
                  onClick={() => approveRequest.mutate(selectedRequest)}
                  disabled={approveRequest.isPending}
                >
                  {t("approve")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-[#FFC72C]/20 text-[#FFC72C]",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-[#FFC72C]/20 text-[#E6B800]",
  };
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`flex size-10 items-center justify-center rounded-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function RequestCard({
  request,
  onView,
  onApprove,
  onReject,
  lang,
  t,
  isProcessing,
}: {
  request: any;
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  lang: string;
  t: (key: TKey) => string;
  isProcessing?: boolean;
}) {
  const statusColors: Record<string, string> = {
    pending: "bg-[#FFC72C]/20 text-[#FFC72C]",
    approved: "bg-[#FFC72C]/20 text-[#2B1B12]",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="surface overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${
                request.type === "restaurant" ? "bg-[#FFC72C]/20 text-[#FFC72C]" : "bg-blue-100 text-blue-600"
              }`}
            >
              {request.type === "restaurant" ? (
                <Store className="size-5" />
              ) : (
                <Bike className="size-5" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {request.data.business_name_ar || request.data.full_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {request.type === "restaurant" ? request.data.contact_name : request.data.email}
              </p>
            </div>
          </div>
          <Badge className={statusColors[request.status]}>
            {t(request.status === "pending" ? "pendingReview" : request.status)}
          </Badge>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          {lang === "ar" ? "أرسل في:" : "Submitted:"}{" "}
          {new Date(request.created_at).toLocaleDateString()}
        </div>
      </div>
      <div className="flex border-t border-border">
        <Button
          variant="ghost"
          className="flex-1 gap-2 rounded-none text-sm"
          onClick={onView}
        >
          <Eye className="size-4" />
          {lang === "ar" ? "عرض" : "View"}
        </Button>
        {request.status === "pending" && onApprove && onReject && (
          <>
            <Button
              variant="ghost"
              className="flex-1 gap-2 rounded-none border-l border-border text-sm text-[#FFC72C] hover:bg-[#FFC72C]/10 hover:text-[#2B1B12]"
              onClick={onApprove}
              disabled={isProcessing}
            >
              <CheckCircle2 className="size-4" />
              {t("approve")}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 gap-2 rounded-none border-l border-border text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onReject}
              disabled={isProcessing}
            >
              <XCircle className="size-4" />
              {t("reject")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-muted-foreground">{label}</span>
      <p className="mt-0.5 font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="surface flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
        <ClipboardCheck className="size-8 text-gray-400" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

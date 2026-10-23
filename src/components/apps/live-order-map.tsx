import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { orderMapPoints } from "@/lib/order-map-points";
import { locationFresh } from "@/lib/tracking-rules";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const OrderMapCanvas = lazy(() => import("./order-map-canvas").then(m => ({ default: m.OrderMapCanvas })));

export function LiveOrderMap({orderId}:{orderId:string}) {
  const qc = useQueryClient();
  const [visible,setVisible] = useState(false);
  const [now,setNow] = useState(Date.now());
  const location = useQuery({queryKey:["live-location",orderId],queryFn:async()=>{
    const {data,error} = await supabase.from("order_live_locations").select("*").eq("order_id",orderId).maybeSingle();
    if(error) throw error; return data;
  }});
  const order = useQuery({queryKey:["order-map-endpoints",orderId],queryFn:async()=>{
    const {data,error} = await supabase.from("orders").select("pickup_latitude,pickup_longitude,delivery_latitude,delivery_longitude").eq("id",orderId).maybeSingle();
    if(error) throw error; return data;
  }});
  const points = useMemo(() => orderMapPoints(order.data, location.data), [order.data, location.data]);
  useEffect(()=>{
    const channel = supabase.channel(`location-${orderId}-${crypto.randomUUID()}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"order_live_locations",filter:`order_id=eq.${orderId}`},()=>void qc.invalidateQueries({queryKey:["live-location",orderId]}))
      .on("postgres_changes",{event:"*",schema:"public",table:"orders",filter:`id=eq.${orderId}`},()=>void qc.invalidateQueries({queryKey:["order-map-endpoints",orderId]}))
      .subscribe(status => { if (status === "SUBSCRIBED") { void qc.invalidateQueries({queryKey:["live-location",orderId]}); void qc.invalidateQueries({queryKey:["order-map-endpoints",orderId]}); } });
    const timer=setInterval(()=>setNow(Date.now()),10000);
    return ()=>{clearInterval(timer);void supabase.removeChannel(channel);};
  },[orderId,qc]);
  useEffect(() => setVisible(false), [orderId]);
  return <section dir="rtl" className="space-y-2 pt-3">
    {location.isError && <p role="alert" className="text-sm text-destructive">تعذر تحميل موقع المندوب</p>}
    {order.isError && <p role="alert" className="text-sm text-destructive">تعذر تحميل مواقع الاستلام والتسليم</p>}
    {location.data ? <p className="text-xs text-muted-foreground">{locationFresh(location.data.updated_at,now)?"موقع المندوب — مباشر":"موقع المندوب — آخر موقع معروف"} · {new Date(location.data.updated_at).toLocaleTimeString("ar-SA")}</p> : <p className="text-sm text-muted-foreground">بانتظار مشاركة موقع المندوب</p>}
    {order.data && (!points.some(p=>p.id==="pickup") || !points.some(p=>p.id==="delivery")) && <p className="text-xs text-muted-foreground">لم تُحدد إحداثيات {points.some(p=>p.id==="pickup")?"التسليم":points.some(p=>p.id==="delivery")?"الاستلام":"الاستلام والتسليم"} بعد</p>}
    {!!points.length && (!visible ? <Button size="sm" variant="outline" onClick={()=>setVisible(true)}><MapPin className="size-4"/>عرض الخريطة</Button> : <Suspense fallback={<div role="status" className="h-72 rounded-lg border bg-muted p-4 text-sm">جارِ تحميل الخريطة…</div>}><OrderMapCanvas key={orderId} points={points}/></Suspense>)}
  </section>;
}
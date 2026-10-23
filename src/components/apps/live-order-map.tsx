import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { loadGoogleMap } from "@/lib/google-map-loader";
import { locationFresh } from "@/lib/tracking-rules";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function LiveOrderMap({orderId}:{orderId:string}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const qc = useQueryClient();
  const [visible,setVisible] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const [now,setNow] = useState(Date.now());
  const location = useQuery({queryKey:["live-location",orderId],queryFn:async()=>{
    const {data,error} = await supabase.from("order_live_locations").select("*").eq("order_id",orderId).maybeSingle();
    if(error) throw error; return data;
  }});
  useEffect(()=>{
    const channel = supabase.channel(`location-${orderId}-${crypto.randomUUID()}`).on("postgres_changes",{event:"*",schema:"public",table:"order_live_locations",filter:`order_id=eq.${orderId}`},()=>void qc.invalidateQueries({queryKey:["live-location",orderId]})).subscribe();
    const timer=setInterval(()=>setNow(Date.now()),10000);
    return ()=>{clearInterval(timer);void supabase.removeChannel(channel);};
  },[orderId,qc]);
  useEffect(()=>{
    if(!visible || !location.data) return;
    let cancelled=false;
    void loadGoogleMap().then(api=>{
      if(cancelled||!el.current||!location.data) return;
      const position={lat:location.data.latitude,lng:location.data.longitude};
      if(!map.current) map.current=new api.Map(el.current,{center:position,zoom:16,clickableIcons:false,mapTypeControl:false,streetViewControl:false});
      if(!marker.current) marker.current=new api.Marker({map:map.current,position,title:"المندوب"});
      marker.current.setPosition(position);map.current.panTo(position);
    }).catch(e=>setError(e instanceof Error?e.message:"تعذر تحميل الخريطة"));
    return ()=>{cancelled=true;};
  },[visible,location.data]);
  useEffect(()=>()=>{marker.current?.setMap(null);},[]);
  return <section dir="rtl" className="space-y-2 pt-3">
    {location.isError?<p role="alert" className="text-sm text-destructive">تعذر تحميل موقع المندوب</p>:!location.data?<p className="text-sm text-muted-foreground">بانتظار مشاركة موقع المندوب</p>:<>
      <p className="text-xs text-muted-foreground">{locationFresh(location.data.updated_at,now)?"موقع المندوب — مباشر":"موقع المندوب — آخر موقع معروف"} · {new Date(location.data.updated_at).toLocaleTimeString("ar-SA")}</p>
      {!visible?<Button size="sm" variant="outline" onClick={()=>setVisible(true)}><MapPin className="size-4"/>عرض الخريطة</Button>:<div ref={el} aria-label="خريطة موقع المندوب" className="h-64 w-full overflow-hidden rounded-lg border bg-muted"/>}
      {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
    </>}
  </section>;
}
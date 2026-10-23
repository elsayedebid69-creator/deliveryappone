import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LOCATION_INTERVAL_MS } from "./tracking-rules";

export function useCourierLocation(orderId: string | undefined, enabled: boolean) {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!orderId || !enabled) return;
    let stopped = false, sending = false, sentAt = 0;
    const watch = navigator.geolocation?.watchPosition(async position => {
      if (stopped || sending || Date.now() - sentAt < LOCATION_INTERVAL_MS) return;
      sending = true; sentAt = Date.now();
      const {latitude,longitude,accuracy,heading,speed} = position.coords;
      try {
        const {error: e} = await supabase.rpc("publish_courier_location", {p_order_id:orderId,p_latitude:latitude,p_longitude:longitude,p_accuracy:accuracy,p_heading:heading ?? undefined,p_speed:speed === null ? undefined : Math.max(0,speed)});
        if (!stopped) setError(e ? "تعذر إرسال موقعك؛ تحقق من الاتصال" : null);
      } finally { sending = false; }
    }, () => setError("اسمح باستخدام الموقع لتتبع الطلب"), {enableHighAccuracy:true,maximumAge:3000,timeout:20000});
    if (watch === undefined) setError("الموقع غير متاح على هذا الجهاز");
    return () => { stopped = true; if (watch !== undefined) navigator.geolocation.clearWatch(watch); };
  }, [orderId, enabled]);
  return error;
}
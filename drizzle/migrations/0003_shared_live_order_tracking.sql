ALTER TABLE public.orders ADD COLUMN pickup_latitude double precision, ADD COLUMN pickup_longitude double precision, ADD COLUMN delivery_latitude double precision, ADD COLUMN delivery_longitude double precision;
CREATE TABLE public.order_live_locations (order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE CASCADE,courier_id uuid NOT NULL,latitude double precision NOT NULL CHECK(latitude BETWEEN -90 AND 90),longitude double precision NOT NULL CHECK(longitude BETWEEN -180 AND 180),accuracy double precision CHECK(accuracy>=0),heading double precision,speed double precision,updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.order_live_locations TO authenticated;
GRANT ALL ON public.order_live_locations TO service_role;
ALTER TABLE public.order_live_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY live_location_read ON public.order_live_locations FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.courier_id=order_live_locations.courier_id AND (o.customer_id=auth.uid() OR o.courier_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.restaurants r WHERE r.id=o.restaurant_id AND r.owner_id=auth.uid()))));
CREATE OR REPLACE FUNCTION public.publish_courier_location(p_order_id uuid,p_latitude double precision,p_longitude double precision,p_accuracy double precision DEFAULT NULL,p_heading double precision DEFAULT NULL,p_speed double precision DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=auth.uid(); s public.courier_shifts; o public.orders;
BEGIN
 IF uid IS NULL OR NOT public.has_role(uid,'courier') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 IF p_latitude IS NULL OR p_longitude IS NULL OR NOT(p_latitude BETWEEN -90 AND 90) OR NOT(p_longitude BETWEEN -180 AND 180) OR (p_accuracy IS NOT NULL AND NOT(p_accuracy BETWEEN 0 AND 10000)) OR (p_heading IS NOT NULL AND NOT(p_heading BETWEEN 0 AND 360)) OR (p_speed IS NOT NULL AND NOT(p_speed BETWEEN 0 AND 100)) THEN RAISE EXCEPTION 'إحداثيات غير صحيحة'; END IF;
 SELECT * INTO s FROM public.courier_shifts WHERE courier_id=uid AND status='active' FOR UPDATE;
 IF NOT FOUND OR (s.break_ends_at IS NOT NULL AND now()<s.break_ends_at) THEN RAISE EXCEPTION 'الشيفت غير نشط'; END IF;
 SELECT * INTO o FROM public.orders WHERE id=p_order_id AND courier_id=uid AND status IN ('ready','on_the_way') FOR UPDATE;
 IF NOT FOUND OR (o.status='ready' AND public.shift_work_seconds(s)>=36000) THEN RAISE EXCEPTION 'الطلب غير مسند إليك أو انتهى الشيفت'; END IF;
 INSERT INTO public.order_live_locations(order_id,courier_id,latitude,longitude,accuracy,heading,speed,updated_at) VALUES(o.id,uid,p_latitude,p_longitude,p_accuracy,p_heading,p_speed,now()) ON CONFLICT(order_id) DO UPDATE SET courier_id=uid,latitude=excluded.latitude,longitude=excluded.longitude,accuracy=excluded.accuracy,heading=excluded.heading,speed=excluded.speed,updated_at=now();
END; $$;
REVOKE ALL ON FUNCTION public.publish_courier_location(uuid,double precision,double precision,double precision,double precision,double precision) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.publish_courier_location(uuid,double precision,double precision,double precision,double precision,double precision) TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_live_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courier_shifts;

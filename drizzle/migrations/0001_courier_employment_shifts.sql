CREATE TABLE public.courier_shifts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), courier_id uuid NOT NULL, scheduled_start timestamptz NOT NULL,
 neighborhoods text[] NOT NULL, adjacent_confirmed boolean NOT NULL DEFAULT false,
 started_at timestamptz, ended_at timestamptz, status text NOT NULL DEFAULT 'scheduled',
 break_status text NOT NULL DEFAULT 'none', break_started_at timestamptz, break_ends_at timestamptz,
 worked_seconds integer NOT NULL DEFAULT 0, salary_day_eligible boolean NOT NULL DEFAULT false,
 created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT shift_areas CHECK (cardinality(neighborhoods)=3 AND adjacent_confirmed),
 CONSTRAINT shift_status CHECK (status IN ('scheduled','active','completed','incomplete')),
 CONSTRAINT shift_break_status CHECK (break_status IN ('none','requested','approved','rejected'))
);
GRANT SELECT, INSERT, UPDATE ON public.courier_shifts TO authenticated;
GRANT ALL ON public.courier_shifts TO service_role;
ALTER TABLE public.courier_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY shift_read ON public.courier_shifts FOR SELECT TO authenticated USING (courier_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY shift_admin_insert ON public.courier_shifts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') AND created_by=auth.uid());
CREATE POLICY shift_admin_update ON public.courier_shifts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX courier_one_active_shift ON public.courier_shifts(courier_id) WHERE status='active';
CREATE UNIQUE INDEX courier_one_shift_day ON public.courier_shifts(courier_id, ((scheduled_start AT TIME ZONE 'Asia/Riyadh')::date));
ALTER TABLE public.orders ADD COLUMN delivery_neighborhood text, ADD COLUMN pickup_address text;
CREATE OR REPLACE FUNCTION public.shift_work_seconds(s public.courier_shifts, at_time timestamptz DEFAULT now()) RETURNS integer LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT CASE WHEN s.started_at IS NULL THEN 0 ELSE greatest(0,least(36000,floor(extract(epoch FROM (coalesce(s.ended_at,at_time)-s.started_at)))::integer - CASE WHEN s.break_started_at IS NULL THEN 0 ELSE greatest(0,floor(extract(epoch FROM (least(coalesce(s.ended_at,at_time),s.break_ends_at)-s.break_started_at)))::integer) END)) END;
$$;
REVOKE ALL ON FUNCTION public.shift_work_seconds(public.courier_shifts,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.shift_work_seconds(public.courier_shifts,timestamptz) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.validate_courier_shift() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT public.has_role(NEW.courier_id,'courier') THEN RAISE EXCEPTION 'الحساب ليس مندوباً'; END IF;
 IF cardinality(NEW.neighborhoods)<>3 OR (SELECT count(DISTINCT btrim(n)) FROM unnest(NEW.neighborhoods) n WHERE length(btrim(n)) BETWEEN 2 AND 100)<>3 OR NOT NEW.adjacent_confirmed THEN RAISE EXCEPTION 'حدد ثلاثة أحياء مختلفة ومتجاورة'; END IF;
 IF TG_OP='INSERT' THEN
 NEW.status:='scheduled'; NEW.started_at:=NULL; NEW.ended_at:=NULL; NEW.break_status:='none'; NEW.break_started_at:=NULL; NEW.break_ends_at:=NULL; NEW.worked_seconds:=0; NEW.salary_day_eligible:=false;
 ELSIF NEW.scheduled_start IS DISTINCT FROM OLD.scheduled_start OR NEW.neighborhoods IS DISTINCT FROM OLD.neighborhoods OR NEW.courier_id IS DISTINCT FROM OLD.courier_id THEN
 IF OLD.status<>'scheduled' THEN RAISE EXCEPTION 'لا يمكن تغيير شيفت بدأ بالفعل'; END IF;
 END IF;
 NEW.worked_seconds:=public.shift_work_seconds(NEW);
 NEW.salary_day_eligible:=NEW.status='completed' AND NEW.worked_seconds>=36000;
 RETURN NEW;
END; $$;
CREATE TRIGGER courier_shift_validate BEFORE INSERT OR UPDATE ON public.courier_shifts FOR EACH ROW EXECUTE FUNCTION public.validate_courier_shift();
REVOKE ALL ON FUNCTION public.validate_courier_shift() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.courier_shift_action(p_shift_id uuid,p_action text,p_order_id uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.courier_shifts; o public.orders; uid uuid:=auth.uid(); seconds integer;
BEGIN
 IF uid IS NULL OR NOT public.has_role(uid,'courier') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 SELECT * INTO s FROM public.courier_shifts WHERE id=p_shift_id AND courier_id=uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'الشيفت غير موجود'; END IF;
 IF p_action='start' THEN
 IF s.status<>'scheduled' OR now()<s.scheduled_start THEN RAISE EXCEPTION 'لم يبدأ موعد الشيفت أو تم بدء الشيفت مسبقاً'; END IF;
 UPDATE public.courier_shifts SET status='active',started_at=now() WHERE id=s.id RETURNING * INTO s;
 ELSIF p_action='request_break' THEN
 IF s.status<>'active' OR s.break_status NOT IN ('none','rejected') OR public.shift_work_seconds(s)>=36000 THEN RAISE EXCEPTION 'لا يمكن طلب الاستراحة الآن'; END IF;
 IF EXISTS(SELECT 1 FROM public.orders WHERE courier_id=uid AND status IN ('ready','on_the_way')) THEN RAISE EXCEPTION 'أكمل الطلب الحالي أولاً'; END IF;
 UPDATE public.courier_shifts SET break_status='requested' WHERE id=s.id RETURNING * INTO s;
 ELSIF p_action='finish' THEN
 IF s.status<>'active' THEN RAISE EXCEPTION 'الشيفت غير نشط'; END IF;
 IF EXISTS(SELECT 1 FROM public.orders WHERE courier_id=uid AND status IN ('ready','on_the_way')) THEN RAISE EXCEPTION 'أكمل الطلب الحالي أولاً'; END IF;
 seconds:=public.shift_work_seconds(s);
 UPDATE public.courier_shifts SET ended_at=now(),status=CASE WHEN seconds>=36000 THEN 'completed' ELSE 'incomplete' END WHERE id=s.id RETURNING * INTO s;
 ELSIF p_action IN ('pickup','deliver') THEN
 IF s.status<>'active' OR (s.break_started_at IS NOT NULL AND now()<s.break_ends_at) THEN RAISE EXCEPTION 'الشيفت غير نشط أو الاستراحة مستمرة'; END IF;
 SELECT * INTO o FROM public.orders WHERE id=p_order_id AND courier_id=uid FOR UPDATE;
 IF NOT FOUND OR (p_action='pickup' AND o.status<>'ready') OR (p_action='deliver' AND o.status<>'on_the_way') THEN RAISE EXCEPTION 'حالة الطلب غير صحيحة'; END IF;
 UPDATE public.orders SET status=CASE WHEN p_action='pickup' THEN 'on_the_way'::public.order_status ELSE 'delivered'::public.order_status END WHERE id=o.id;
 ELSIF p_action<>'sync' THEN RAISE EXCEPTION 'إجراء غير صحيح'; END IF;
 IF s.status='active' AND public.shift_work_seconds(s)<36000 AND s.break_status<>'requested' AND (s.break_ends_at IS NULL OR now()>=s.break_ends_at) AND NOT EXISTS(SELECT 1 FROM public.orders WHERE courier_id=uid AND status IN ('ready','on_the_way')) THEN
 SELECT * INTO o FROM public.orders WHERE courier_id IS NULL AND status='ready' AND length(btrim(pickup_address))>0 AND delivery_neighborhood=ANY(s.neighborhoods) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1;
 IF FOUND THEN UPDATE public.orders SET courier_id=uid WHERE id=o.id; END IF;
 END IF;
 RETURN jsonb_build_object('shift',to_jsonb(s),'worked_seconds',public.shift_work_seconds(s),'server_now',now());
END; $$;
REVOKE ALL ON FUNCTION public.courier_shift_action(uuid,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.courier_shift_action(uuid,text,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.review_courier_break(p_shift_id uuid,p_approve boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.courier_shifts;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 SELECT * INTO s FROM public.courier_shifts WHERE id=p_shift_id FOR UPDATE;
 IF NOT FOUND OR s.status<>'active' OR s.break_status<>'requested' THEN RAISE EXCEPTION 'لا يوجد طلب استراحة معلق'; END IF;
 IF p_approve AND EXISTS(SELECT 1 FROM public.orders WHERE courier_id=s.courier_id AND status IN ('ready','on_the_way')) THEN RAISE EXCEPTION 'المندوب لديه طلب نشط'; END IF;
 UPDATE public.courier_shifts SET break_status=CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,break_started_at=CASE WHEN p_approve THEN now() ELSE NULL END,break_ends_at=CASE WHEN p_approve THEN now()+interval '1 hour' ELSE NULL END WHERE id=s.id;
END; $$;
REVOKE ALL ON FUNCTION public.review_courier_break(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.review_courier_break(uuid,boolean) TO authenticated;
DROP POLICY "update orders" ON public.orders;
CREATE POLICY "update orders" ON public.orders FOR UPDATE TO authenticated USING ((EXISTS(SELECT 1 FROM public.restaurants r WHERE r.id=orders.restaurant_id AND r.owner_id=auth.uid())) OR public.has_role(auth.uid(),'admin')) WITH CHECK ((EXISTS(SELECT 1 FROM public.restaurants r WHERE r.id=orders.restaurant_id AND r.owner_id=auth.uid())) OR public.has_role(auth.uid(),'admin'));
DROP POLICY "read orders" ON public.orders;
CREATE POLICY "read orders" ON public.orders FOR SELECT TO authenticated USING (customer_id=auth.uid() OR courier_id=auth.uid() OR EXISTS(SELECT 1 FROM public.restaurants r WHERE r.id=orders.restaurant_id AND r.owner_id=auth.uid()) OR public.has_role(auth.uid(),'admin'));

ALTER TABLE public.courier_shifts ADD COLUMN rejected_order_id uuid, ADD COLUMN break_request_used boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION public.complete_due_courier_shifts() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.courier_shifts;
BEGIN
 FOR s IN SELECT * FROM public.courier_shifts WHERE status='active' AND public.shift_work_seconds(courier_shifts)>=36000 FOR UPDATE SKIP LOCKED LOOP
 UPDATE public.orders SET courier_id=NULL WHERE courier_id=s.courier_id AND status='ready';
 IF NOT EXISTS(SELECT 1 FROM public.orders WHERE courier_id=s.courier_id AND status='on_the_way') THEN
 UPDATE public.courier_shifts SET status='completed',ended_at=started_at+interval '10 hours'+CASE WHEN break_started_at IS NOT NULL THEN interval '1 hour' ELSE interval '0 hour' END WHERE id=s.id;
 END IF;
 END LOOP;
END; $$;
REVOKE ALL ON FUNCTION public.complete_due_courier_shifts() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_due_courier_shifts() TO service_role;
CREATE OR REPLACE FUNCTION public.courier_shift_action(p_shift_id uuid,p_action text,p_order_id uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.courier_shifts; o public.orders; uid uuid:=auth.uid(); seconds integer;
BEGIN
 IF uid IS NULL OR NOT public.has_role(uid,'courier') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 SELECT * INTO s FROM public.courier_shifts WHERE id=p_shift_id AND courier_id=uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'الشيفت غير موجود'; END IF;
 IF p_action='start' THEN
 PERFORM public.complete_due_courier_shifts();
 IF s.status<>'scheduled' OR now()<s.scheduled_start THEN RAISE EXCEPTION 'لم يبدأ موعد الشيفت أو تم بدء الشيفت مسبقاً'; END IF;
 UPDATE public.courier_shifts SET status='active',started_at=now() WHERE id=s.id RETURNING * INTO s;
 ELSIF p_action='request_break' THEN
 IF s.status<>'active' OR s.break_status<>'none' OR s.break_request_used OR public.shift_work_seconds(s)>=36000 THEN RAISE EXCEPTION 'البريك متاح مرة واحدة فقط خلال الشيفت'; END IF;
 IF EXISTS(SELECT 1 FROM public.orders WHERE courier_id=uid AND status IN ('ready','on_the_way')) THEN RAISE EXCEPTION 'أكمل الطلب الحالي أولاً'; END IF;
 UPDATE public.courier_shifts SET break_status='requested',break_request_used=true WHERE id=s.id RETURNING * INTO s;
 ELSIF p_action='reject' THEN
 IF s.status<>'active' OR public.shift_work_seconds(s)>=36000 OR (s.break_ends_at IS NOT NULL AND now()<s.break_ends_at) THEN RAISE EXCEPTION 'الشيفت غير متاح'; END IF;
 IF s.rejected_order_id IS NOT NULL THEN RAISE EXCEPTION 'يمكن رفض طلب واحد فقط خلال الشيفت'; END IF;
 SELECT * INTO o FROM public.orders WHERE id=p_order_id AND courier_id=uid AND status='ready' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'يمكن رفض الطلب قبل استلامه فقط'; END IF;
 UPDATE public.courier_shifts SET rejected_order_id=o.id WHERE id=s.id RETURNING * INTO s;
 UPDATE public.orders SET courier_id=NULL WHERE id=o.id;
 ELSIF p_action IN ('pickup','deliver') THEN
 IF s.status<>'active' OR (s.break_started_at IS NOT NULL AND now()<s.break_ends_at) THEN RAISE EXCEPTION 'الشيفت غير نشط أو الاستراحة مستمرة'; END IF;
 IF p_action='pickup' AND public.shift_work_seconds(s)>=36000 THEN RAISE EXCEPTION 'انتهى الشيفت؛ لا يمكن استلام طلب جديد'; END IF;
 SELECT * INTO o FROM public.orders WHERE id=p_order_id AND courier_id=uid FOR UPDATE;
 IF NOT FOUND OR (p_action='pickup' AND o.status<>'ready') OR (p_action='deliver' AND o.status<>'on_the_way') THEN RAISE EXCEPTION 'حالة الطلب غير صحيحة'; END IF;
 UPDATE public.orders SET status=CASE WHEN p_action='pickup' THEN 'on_the_way'::public.order_status ELSE 'delivered'::public.order_status END WHERE id=o.id;
 ELSIF p_action<>'sync' THEN RAISE EXCEPTION 'لا يمكن إغلاق التوفر أو إنهاء الشيفت يدوياً'; END IF;
 seconds:=public.shift_work_seconds(s);
 IF s.status='active' AND seconds>=36000 THEN
 UPDATE public.orders SET courier_id=NULL WHERE courier_id=uid AND status='ready';
 IF NOT EXISTS(SELECT 1 FROM public.orders WHERE courier_id=uid AND status='on_the_way') THEN
 UPDATE public.courier_shifts SET ended_at=started_at+interval '10 hours'+CASE WHEN break_started_at IS NOT NULL THEN interval '1 hour' ELSE interval '0 hour' END,status='completed' WHERE id=s.id RETURNING * INTO s;
 END IF;
 END IF;
 IF s.status='active' AND seconds<36000 AND (s.break_ends_at IS NULL OR now()>=s.break_ends_at) AND NOT EXISTS(SELECT 1 FROM public.orders WHERE courier_id=uid AND status IN ('ready','on_the_way')) THEN
 SELECT * INTO o FROM public.orders WHERE courier_id IS NULL AND status='ready' AND length(btrim(pickup_address))>0 AND delivery_neighborhood=ANY(s.neighborhoods) AND (s.rejected_order_id IS NULL OR id<>s.rejected_order_id) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1;
 IF FOUND THEN UPDATE public.orders SET courier_id=uid WHERE id=o.id; END IF;
 END IF;
 RETURN jsonb_build_object('shift',to_jsonb(s),'worked_seconds',public.shift_work_seconds(s),'server_now',now(),'available',s.status='active' AND public.shift_work_seconds(s)<36000 AND (s.break_ends_at IS NULL OR now()>=s.break_ends_at));
END; $$;
CREATE OR REPLACE FUNCTION public.review_courier_break(p_shift_id uuid,p_approve boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.courier_shifts;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 SELECT * INTO s FROM public.courier_shifts WHERE id=p_shift_id FOR UPDATE;
 IF NOT FOUND OR s.status<>'active' OR s.break_status<>'requested' OR public.shift_work_seconds(s)>=36000 THEN RAISE EXCEPTION 'لا يوجد طلب استراحة صالح'; END IF;
 IF p_approve AND EXISTS(SELECT 1 FROM public.orders WHERE courier_id=s.courier_id AND status IN ('ready','on_the_way')) THEN RAISE EXCEPTION 'المندوب لديه طلب نشط'; END IF;
 UPDATE public.courier_shifts SET break_status=CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,break_started_at=CASE WHEN p_approve THEN now() ELSE NULL END,break_ends_at=CASE WHEN p_approve THEN now()+interval '1 hour' ELSE NULL END,break_request_used=true WHERE id=s.id;
END; $$;
CREATE VIEW public.courier_shift_availability WITH (security_invoker=true) AS SELECT id,courier_id, (status='active' AND public.shift_work_seconds(courier_shifts)<36000 AND (break_ends_at IS NULL OR now()>=break_ends_at)) AS available, (status='completed' OR (status='active' AND public.shift_work_seconds(courier_shifts)>=36000)) AS work_complete FROM public.courier_shifts;
GRANT SELECT ON public.courier_shift_availability TO authenticated;
GRANT ALL ON public.courier_shift_availability TO service_role;
-- 1) Lock down SECURITY DEFINER functions: only has_role stays callable
--    (RLS policies depend on it). Others are trigger-only / internal.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2) Validate join_requests payloads submitted by the public
CREATE OR REPLACE FUNCTION public.validate_join_request()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  k text;
  allowed text[] := ARRAY[
    'full_name','contact_name','email','phone','contact_phone','city',
    'business_name_ar','business_name_en','vehicle','national_id','notes'
  ];
BEGIN
  IF NEW.type NOT IN ('restaurant','courier') THEN
    RAISE EXCEPTION 'Invalid join request type';
  END IF;

  IF jsonb_typeof(NEW.data) <> 'object' THEN
    RAISE EXCEPTION 'Invalid join request payload';
  END IF;

  IF (SELECT count(*) FROM jsonb_object_keys(NEW.data)) > 20 THEN
    RAISE EXCEPTION 'Too many fields in join request';
  END IF;

  FOR k IN SELECT jsonb_object_keys(NEW.data) LOOP
    IF NOT (k = ANY(allowed)) THEN
      RAISE EXCEPTION 'Unexpected field in join request: %', k;
    END IF;
    IF jsonb_typeof(NEW.data -> k) <> 'string' THEN
      RAISE EXCEPTION 'Field % must be text', k;
    END IF;
    IF length(NEW.data ->> k) > 500 THEN
      RAISE EXCEPTION 'Field % is too long', k;
    END IF;
  END LOOP;

  IF coalesce(NEW.data ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'A valid email is required';
  END IF;

  NEW.status := 'pending';
  NEW.reviewed_at := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS join_requests_validate ON public.join_requests;
CREATE TRIGGER join_requests_validate
BEFORE INSERT ON public.join_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_join_request();

REVOKE ALL ON FUNCTION public.validate_join_request() FROM PUBLIC, anon, authenticated;

-- 3) Order items must match real menu rows and real prices
CREATE OR REPLACE FUNCTION public.validate_order_item()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  mi public.menu_items%ROWTYPE;
  ord public.orders%ROWTYPE;
BEGIN
  IF NEW.quantity IS NULL OR NEW.quantity < 1 OR NEW.quantity > 100 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  IF NEW.menu_item_id IS NULL THEN
    RAISE EXCEPTION 'Order item must reference a menu item';
  END IF;

  SELECT * INTO mi FROM public.menu_items WHERE id = NEW.menu_item_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Menu item not found';
  END IF;

  SELECT * INTO ord FROM public.orders WHERE id = NEW.order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF mi.restaurant_id <> ord.restaurant_id THEN
    RAISE EXCEPTION 'Menu item does not belong to this restaurant';
  END IF;

  -- Trust the catalogue, never the client
  NEW.price := mi.price;
  NEW.name_ar := mi.name_ar;
  NEW.name_en := mi.name_en;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_items_validate ON public.order_items;
CREATE TRIGGER order_items_validate
BEFORE INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.validate_order_item();

REVOKE ALL ON FUNCTION public.validate_order_item() FROM PUBLIC, anon, authenticated;
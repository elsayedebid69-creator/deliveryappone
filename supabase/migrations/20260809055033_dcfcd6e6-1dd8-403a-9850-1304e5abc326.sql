CREATE TABLE public.join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('restaurant','courier')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.join_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.join_requests TO authenticated;
GRANT ALL ON public.join_requests TO service_role;

ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit join request"
  ON public.join_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "admins read join requests"
  ON public.join_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins update join requests"
  ON public.join_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER join_requests_touch
  BEFORE UPDATE ON public.join_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
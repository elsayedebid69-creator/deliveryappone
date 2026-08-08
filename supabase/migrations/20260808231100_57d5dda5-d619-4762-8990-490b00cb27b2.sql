CREATE TYPE public.app_role AS ENUM ('admin','restaurant','courier','customer');
CREATE TYPE public.order_status AS ENUM ('pending','accepted','preparing','ready','on_the_way','delivered','cancelled');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  cuisine_ar text NOT NULL DEFAULT '',
  cuisine_en text NOT NULL DEFAULT '',
  image_url text,
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 10,
  min_order numeric(10,2) NOT NULL DEFAULT 25,
  eta_minutes int NOT NULL DEFAULT 35,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.restaurants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  category_ar text NOT NULL DEFAULT '',
  category_en text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  courier_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  address text NOT NULL,
  phone text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  price numeric(10,2) NOT NULL,
  quantity int NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- roles policies
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- restaurants policies
CREATE POLICY "public read active restaurants" ON public.restaurants FOR SELECT TO anon USING (is_active);
CREATE POLICY "auth read restaurants" ON public.restaurants FOR SELECT TO authenticated USING (is_active OR owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage restaurants" ON public.restaurants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owner update restaurant" ON public.restaurants FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- menu policies
CREATE POLICY "public read menu" ON public.menu_items FOR SELECT TO anon USING (true);
CREATE POLICY "auth read menu" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "owner manage menu" ON public.menu_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- orders policies
CREATE POLICY "read orders" ON public.orders FOR SELECT TO authenticated USING (
  customer_id = auth.uid()
  OR courier_id = auth.uid()
  OR (courier_id IS NULL AND status = 'ready' AND public.has_role(auth.uid(),'courier'))
  OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);
CREATE POLICY "customer create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "update orders" ON public.orders FOR UPDATE TO authenticated USING (
  courier_id = auth.uid()
  OR (courier_id IS NULL AND status = 'ready' AND public.has_role(auth.uid(),'courier'))
  OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
) WITH CHECK (
  courier_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_id = auth.uid())
  OR public.has_role(auth.uid(),'admin')
);

-- order items policies
CREATE POLICY "read order items" ON public.order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
    o.customer_id = auth.uid() OR o.courier_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid())
    OR public.has_role(auth.uid(),'admin')))
);
CREATE POLICY "insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
);

-- profile auto-create + default customer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'customer'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- demo data
INSERT INTO public.restaurants (id, name_ar, name_en, cuisine_ar, cuisine_en, rating, delivery_fee, min_order, eta_minutes) VALUES
('11111111-1111-1111-1111-111111111111','برجر هاوس','Burger House','برجر · أمريكي','Burgers · American',4.7,10,25,30),
('22222222-2222-2222-2222-222222222222','شاورما الشام','Shawarma Al Sham','شاورما · شامي','Shawarma · Levantine',4.5,8,20,25),
('33333333-3333-3333-3333-333333333333','بيتزا روما','Pizza Roma','بيتزا · إيطالي','Pizza · Italian',4.6,12,35,40),
('44444444-4444-4444-4444-444444444444','سوشي تايم','Sushi Time','سوشي · ياباني','Sushi · Japanese',4.8,15,50,45),
('55555555-5555-5555-5555-555555555555','كافيه لاتيه','Latte Cafe','قهوة · حلويات','Coffee · Desserts',4.4,7,15,20),
('66666666-6666-6666-6666-666666666666','مندي الأصايل','Mandi Al Asayel','مندي · سعودي','Mandi · Saudi',4.6,11,40,50);

INSERT INTO public.menu_items (restaurant_id, name_ar, name_en, description_ar, description_en, category_ar, category_en, price) VALUES
('11111111-1111-1111-1111-111111111111','برجر كلاسيك','Classic Burger','لحم بقري مشوي مع جبن شيدر','Grilled beef with cheddar','برجر','Burgers',29),
('11111111-1111-1111-1111-111111111111','برجر دجاج حار','Spicy Chicken Burger','دجاج مقرمش وصلصة حارة','Crispy chicken, spicy sauce','برجر','Burgers',27),
('11111111-1111-1111-1111-111111111111','بطاطس مقلية','French Fries','بطاطس ذهبية مقرمشة','Golden crispy fries','إضافات','Sides',12),
('22222222-2222-2222-2222-222222222222','شاورما لحم','Beef Shawarma','خبز صاج مع طحينة','Saj bread with tahini','شاورما','Shawarma',22),
('22222222-2222-2222-2222-222222222222','شاورما دجاج','Chicken Shawarma','مع ثومية وخيار مخلل','With garlic sauce and pickles','شاورما','Shawarma',19),
('33333333-3333-3333-3333-333333333333','بيتزا مارغريتا','Margherita Pizza','صلصة طماطم وموزاريلا','Tomato sauce and mozzarella','بيتزا','Pizza',39),
('33333333-3333-3333-3333-333333333333','بيتزا بيبروني','Pepperoni Pizza','بيبروني وجبنة إضافية','Pepperoni and extra cheese','بيتزا','Pizza',45),
('44444444-4444-4444-4444-444444444444','سلمون رول','Salmon Roll','8 قطع سلمون طازج','8 pieces fresh salmon','رولات','Rolls',55),
('44444444-4444-4444-4444-444444444444','كاليفورنيا رول','California Roll','سلطعون وأفوكادو','Crab and avocado','رولات','Rolls',48),
('55555555-5555-5555-5555-555555555555','لاتيه','Latte','قهوة مع حليب مبخر','Espresso with steamed milk','مشروبات','Drinks',16),
('55555555-5555-5555-5555-555555555555','تشيز كيك','Cheesecake','مع صوص التوت','With berry sauce','حلويات','Desserts',24),
('66666666-6666-6666-6666-666666666666','مندي لحم','Lamb Mandi','نصف كيلو مع رز بسمتي','Half kilo with basmati rice','أطباق رئيسية','Mains',85),
('66666666-6666-6666-6666-666666666666','مندي دجاج','Chicken Mandi','نصف دجاجة مع رز','Half chicken with rice','أطباق رئيسية','Mains',45);
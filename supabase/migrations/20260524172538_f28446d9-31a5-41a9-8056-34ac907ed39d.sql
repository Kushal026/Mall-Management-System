
-- Restrict SELECT on sensitive tables to staff only
DROP POLICY IF EXISTS "auth read bills" ON public.bills;
CREATE POLICY "staff read bills" ON public.bills FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "auth read complaints" ON public.complaints;
CREATE POLICY "staff read complaints" ON public.complaints FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "auth read employees" ON public.employees;
CREATE POLICY "staff read employees" ON public.employees FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "auth read parking" ON public.parking;
CREATE POLICY "staff read parking" ON public.parking FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "auth read suppliers" ON public.suppliers;
CREATE POLICY "staff read suppliers" ON public.suppliers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "auth read attendance" ON public.attendance;
CREATE POLICY "staff read attendance" ON public.attendance FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "auth read restaurants" ON public.restaurants;
CREATE POLICY "staff read restaurants" ON public.restaurants FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "auth read shops" ON public.shops;
CREATE POLICY "staff read shops" ON public.shops FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- Lock down SECURITY DEFINER functions: revoke execute from anon, keep authenticated (needed by RLS policies that call has_role/is_staff)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

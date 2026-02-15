
-- Allow tenant users to update vaccinations
CREATE POLICY "Tenant users can update vaccinations" ON public.vaccinations
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.tenant_id = vaccinations.tenant_id)
);

-- Allow tenant users to delete vaccinations
CREATE POLICY "Tenant users can delete vaccinations" ON public.vaccinations
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.tenant_id = vaccinations.tenant_id)
);

-- Allow tenant users to update medical records
CREATE POLICY "Tenant users can update records" ON public.medical_records
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.tenant_id = medical_records.tenant_id)
);

-- Allow tenant users to delete medical records
CREATE POLICY "Tenant users can delete records" ON public.medical_records
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.tenant_id = medical_records.tenant_id)
);

-- Allow family admins to delete family members
CREATE POLICY "Family admins can delete family members" ON public.family_members
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.tenant_id = family_members.tenant_id)
);

-- Allow tenant users to delete appointments
CREATE POLICY "Tenant users can delete appointments" ON public.appointments
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.tenant_id = appointments.tenant_id)
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.tenant_id = appointments.hospital_tenant_id)
);

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Super admins can manage all user roles
CREATE POLICY "Super admins can manage roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Create trigger for auto-creating profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id uuid;
BEGIN
  -- Create a family tenant for the new user
  INSERT INTO public.tenants (name, type)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Family') || '''s Family', 'family')
  RETURNING id INTO new_tenant_id;

  -- Create profile linked to tenant
  INSERT INTO public.profiles (user_id, full_name, language, tenant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
    new_tenant_id
  );

  -- Default role: family_admin (they own their family)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'family_admin');

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Update handle_new_user to support hospital registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id uuid;
  account_type text;
  hospital_name_val text;
BEGIN
  account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'family');
  hospital_name_val := NEW.raw_user_meta_data->>'hospital_name';

  IF account_type = 'hospital' AND hospital_name_val IS NOT NULL THEN
    -- Create a hospital tenant
    INSERT INTO public.tenants (name, type, is_active)
    VALUES (hospital_name_val, 'hospital', false)
    RETURNING id INTO new_tenant_id;

    -- Create profile
    INSERT INTO public.profiles (user_id, full_name, language, tenant_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
      new_tenant_id
    );

    -- Assign hospital_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'hospital_admin');
  ELSE
    -- Create a family tenant
    INSERT INTO public.tenants (name, type)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Family') || '''s Family', 'family')
    RETURNING id INTO new_tenant_id;

    -- Create profile
    INSERT INTO public.profiles (user_id, full_name, language, tenant_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
      new_tenant_id
    );

    -- Default role: family_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'family_admin');
  END IF;

  RETURN NEW;
END;
$$;

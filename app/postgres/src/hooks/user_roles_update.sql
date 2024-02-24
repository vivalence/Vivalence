-- Function to update AppUser roles from AuthUser raw_user_meta_data
CREATE OR REPLACE FUNCTION public.sync_roles_from_authuser()
RETURNS TRIGGER AS $$
BEGIN
    -- Update AppUser roles based on AuthUser raw_user_meta_data
    UPDATE public."AppUser"
    SET roles = ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'roles'))::public."UserRolesEnum"[]
    WHERE id = NEW.id::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the above function after updates to raw_user_meta_data
DROP TRIGGER IF EXISTS trigger_sync_roles_from_authuser ON auth.users;
CREATE TRIGGER trigger_sync_roles_from_authuser
AFTER UPDATE OF raw_user_meta_data ON auth.users
FOR EACH ROW
WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
EXECUTE FUNCTION public.sync_roles_from_authuser();




-- Function to update Auth.users raw_user_meta_data from AppUser roles
CREATE OR REPLACE FUNCTION public.sync_raw_user_meta_data_from_appuser()
RETURNS TRIGGER AS $$
BEGIN
    -- Update AuthUser raw_user_meta_data based on AppUser roles
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'), '{roles}', to_jsonb(ARRAY(SELECT unnest(NEW.roles))))
    WHERE id = NEW.id::uuid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- $$ LANGUAGE plpgsql;
ALTER FUNCTION public.sync_raw_user_meta_data_from_appuser() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

-- Trigger to execute the above function after updates to AppUser roles
DROP TRIGGER IF EXISTS trigger_sync_raw_user_meta_data_from_appuser ON public."AppUser";
CREATE TRIGGER trigger_sync_raw_user_meta_data_from_appuser
AFTER UPDATE OF roles ON public."AppUser"
FOR EACH ROW
WHEN (OLD.roles IS DISTINCT FROM NEW.roles)
EXECUTE FUNCTION public.sync_raw_user_meta_data_from_appuser();



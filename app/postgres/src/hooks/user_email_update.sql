-- Function to update AppUser roles from AuthUser raw_user_meta_data
CREATE OR REPLACE FUNCTION public.sync_email_from_authuser()
RETURNS TRIGGER AS $$
BEGIN
    -- Update AppUser roles based on AuthUser raw_user_meta_data
    UPDATE public."AppUser"
    SET email = NEW.email
    WHERE id = NEW.id::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the above function after updates to raw_user_meta_data
DROP TRIGGER IF EXISTS trigger_sync_email_from_authuser ON auth.users;
CREATE TRIGGER trigger_sync_email_from_authuser
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.sync_email_from_authuser();




-- -- Function to update Auth.users raw_user_meta_data from AppUser roles
-- CREATE OR REPLACE FUNCTION public.sync_raw_user_meta_data_from_appuser()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     -- Update AuthUser raw_user_meta_data based on AppUser roles
--     UPDATE auth.users
--     SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'), '{roles}', to_jsonb(ARRAY(SELECT unnest(NEW.roles))))
--     WHERE id = NEW.id::uuid;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- -- $$ LANGUAGE plpgsql;
-- ALTER FUNCTION public.sync_raw_user_meta_data_from_appuser() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

-- -- Trigger to execute the above function after updates to AppUser roles
-- DROP TRIGGER IF EXISTS trigger_sync_raw_user_meta_data_from_appuser ON public."AppUser";
-- CREATE TRIGGER trigger_sync_raw_user_meta_data_from_appuser
-- AFTER UPDATE OF roles ON public."AppUser"
-- FOR EACH ROW
-- WHEN (OLD.roles IS DISTINCT FROM NEW.roles)
-- EXECUTE FUNCTION public.sync_raw_user_meta_data_from_appuser();


-- -- PERMISSIONS
-- -- maybe i am missing permissions for anon,authenticated,others on auth.users
-- GRANT USAGE ON TYPE public."UserRolesEnum" TO supabase_auth_admin;

-- GRANT EXECUTE ON FUNCTION public.sync_roles_from_authuser() TO supabase_auth_admin;
-- GRANT EXECUTE ON FUNCTION public.sync_raw_user_meta_data_from_appuser() TO supabase_auth_admin;

-- GRANT SELECT, UPDATE ON public."AppUser" TO supabase_auth_admin;
-- GRANT SELECT, UPDATE ON auth.users TO supabase_auth_admin;

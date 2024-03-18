-- Trigger for deletion
CREATE OR REPLACE FUNCTION auth.auth_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM auth.users WHERE id::text = OLD.id::text;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER FUNCTION auth.auth_user_delete() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

DROP TRIGGER IF EXISTS hook_app_user_delete ON public."AppUser";
CREATE TRIGGER hook_app_user_delete
AFTER DELETE ON public."AppUser" FOR EACH ROW
EXECUTE FUNCTION auth.auth_user_delete();

-- -- allow auth admin to write to AppUser
-- GRANT INSERT ON public."AppUser" TO supabase_auth_admin;
-- GRANT INSERT ON auth.users TO supabase_auth_admin;

CREATE OR REPLACE FUNCTION public.handle_user_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."AppUser" (auth_user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER FUNCTION public.handle_user_creation() OWNER TO postgres; -- hack @lj
-- bc: jwt is null inside policy functions.
-- either after writing user or inside trigger

-- Trigger for insertion
CREATE TRIGGER create_app_user
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_user_creation();

-- Trigger for deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public."AppUser" WHERE auth_user_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_app_user
AFTER DELETE ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_user_deletion();

-- allow auth admin to write to AppUser
GRANT INSERT ON public."AppUser" TO supabase_auth_admin;

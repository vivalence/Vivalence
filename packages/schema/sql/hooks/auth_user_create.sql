CREATE OR REPLACE FUNCTION public.app_user_create()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."User" (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER FUNCTION public.app_user_create() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

DROP TRIGGER IF EXISTS hook_auth_user_create ON auth."users";
CREATE TRIGGER hook_auth_user_create
AFTER INSERT ON auth."users" FOR EACH ROW
EXECUTE FUNCTION public.app_user_create();




    -- INSERT INTO public."User" (id, email)
    -- VALUES (NEW.id, NEW.email);

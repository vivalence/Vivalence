CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PERMISSIONS
-- maybe i am missing permissions for anon,authenticated,others on auth.users
GRANT USAGE ON TYPE public."UserRolesEnum" TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION public.sync_roles_from_authuser() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.sync_raw_user_meta_data_from_appuser() TO supabase_auth_admin;

GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;

GRANT SELECT ON TABLE public."AppUser" TO authenticator;


GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticator;

-- GRANT USAGE ON SCHEMA public TO authenticator;
-- GRANT CREATE ON SCHEMA public TO authenticator;
-- GRANT USAGE, CREATE ON SCHEMA public TO service_role, anon;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO service_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
-- GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO service_role;

-- DO $$
-- DECLARE
--     view_name text;
-- BEGIN
--     FOR view_name IN SELECT table_name FROM information_schema.views WHERE table_schema = 'public'
--     LOOP
--         EXECUTE format('GRANT SELECT ON public.%I TO service_role;', view_name);
--     END LOOP;
-- END$$;


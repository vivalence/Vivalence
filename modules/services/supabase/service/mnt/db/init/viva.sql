CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    -- RAISE NOTICE 'IS_ADMIN()';
    -- RAISE NOTICE 'Current user: %', CURRENT_USER;
    -- RAISE NOTICE 'Session user: %', SESSION_USER;
    -- RAISE NOTICE 'Current schema: %', CURRENT_SCHEMA();
    -- RAISE NOTICE 'Current database: %', CURRENT_DATABASE();
    -- RAISE NOTICE 'user_metadata: %', auth.jwt();

    RETURN (auth.jwt() -> 'user_metadata' -> 'roles') @> '["ADMIN"]'::jsonb;
END;
$$ LANGUAGE plpgsql STABLE;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PERMISSIONS
-- maybe i am missing permissions for anon,authenticated,others on auth.users
GRANT USAGE ON TYPE public."UserRolesEnum" TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION public.sync_roles_from_authuser() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.sync_raw_user_meta_data_from_appuser() TO supabase_auth_admin;

GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;

GRANT SELECT ON TABLE public."User" TO authenticator;


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

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_crud_all_User ON public."User";
CREATE POLICY admin_crud_all_User ON public."User"
    FOR ALL
    USING (is_admin());

DROP POLICY IF EXISTS user_user_crud_policy  ON public."User";
CREATE POLICY user_user_crud_policy ON public."User"
    FOR ALL
    USING (id = auth.uid()::text)
    WITH CHECK (id = auth.uid()::text);

ALTER TABLE public."Memory" ENABLE ROW LEVEL SECURITY;

-- 
-- CREATE OR REPLACE FUNCTION user_has_access_to_memorymodel(memory_id TEXT)
-- RETURNS BOOLEAN AS $$
-- BEGIN
--     RAISE NOTICE 'user has access to memorymodel';
--     RAISE NOTICE 'Current user: %', CURRENT_USER;
--     RAISE NOTICE 'Session user: %', SESSION_USER;
--     RAISE NOTICE 'Current schema: %', CURRENT_SCHEMA();
--     RAISE NOTICE 'Current database: %', CURRENT_DATABASE();
--     RAISE NOTICE 'user_metadata: %', auth.jwt();

--     RETURN EXISTS (
--         SELECT 1 FROM public."Memory"
--         WHERE "userId" = auth.uid()::Text AND "id" = memory_id
--     );
-- END;
-- $$ LANGUAGE plpgsql STABLE;

-- RULES
DROP POLICY IF EXISTS admin_crud_all_memorymodel ON public."Memory";
CREATE POLICY admin_crud_all_memorymodel ON public."Memory"
    FOR ALL
    USING (is_admin());

DROP POLICY IF EXISTS user_memorymodel_crud_policy ON public."Memory";
CREATE POLICY user_memorymodel_crud_policy ON public."Memory"
    FOR ALL
    USING ("userId" = auth.uid()::text);
    -- (user_has_access_to_memorymodel("id"));


ALTER TABLE public."Strategy" ENABLE ROW LEVEL SECURITY;
-- 
CREATE OR REPLACE FUNCTION user_has_access_to_Strategy(strategy_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public."Strategy"
        WHERE "userId" = auth.uid()::Text AND "id" = strategy_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- 
DROP POLICY IF EXISTS admin_crud_all_Strategy ON public."Strategy";
CREATE POLICY admin_crud_all_Strategy ON public."Strategy"
    FOR ALL
    USING (is_admin());

DROP POLICY IF EXISTS user_Strategy_read_policy ON public."Strategy";
CREATE POLICY user_Strategy_read_policy ON public."Strategy"
    FOR SELECT
    USING (user_has_access_to_Strategy(id));
-- 
-- Trigger for deletion
CREATE OR REPLACE FUNCTION auth.auth_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM auth.users WHERE id::text = OLD.id::text;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER FUNCTION auth.auth_user_delete() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

DROP TRIGGER IF EXISTS hook_app_user_delete ON public."User";
CREATE TRIGGER hook_app_user_delete
AFTER DELETE ON public."User" FOR EACH ROW
EXECUTE FUNCTION auth.auth_user_delete();

-- -- allow auth admin to write to User
-- GRANT INSERT ON public."User" TO supabase_auth_admin;
-- GRANT INSERT ON auth.users TO supabase_auth_admin;
CREATE OR REPLACE FUNCTION public.app_user_create()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."User" (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER FUNCTION public.app_user_create() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

DROP TRIGGER IF EXISTS hook_auth_user_create ON auth."users";
CREATE TRIGGER hook_auth_user_create
AFTER INSERT ON auth."users" FOR EACH ROW
EXECUTE FUNCTION public.app_user_create();



-- Function to update User roles from AuthUser raw_user_meta_data
CREATE OR REPLACE FUNCTION public.sync_email_from_authuser()
RETURNS TRIGGER AS $$
BEGIN
    -- Update User roles based on AuthUser raw_user_meta_data
    UPDATE public."User"
    SET email = NEW.email
    WHERE id = NEW.id::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the above function after updates to raw_user_meta_data
DROP TRIGGER IF EXISTS trigger_sync_email_from_authuser ON auth."users";
CREATE TRIGGER trigger_sync_email_from_authuser
AFTER UPDATE OF email ON auth."users"
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.sync_email_from_authuser();




-- -- Function to update Auth.users raw_user_meta_data from User roles
-- CREATE OR REPLACE FUNCTION public.sync_raw_user_meta_data_from_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     -- Update AuthUser raw_user_meta_data based on User roles
--     UPDATE auth.users
--     SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'), '{roles}', to_jsonb(ARRAY(SELECT unnest(NEW.roles))))
--     WHERE id = NEW.id::uuid;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- -- $$ LANGUAGE plpgsql;
-- ALTER FUNCTION public.sync_raw_user_meta_data_from_user() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

-- -- Trigger to execute the above function after updates to User roles
-- DROP TRIGGER IF EXISTS trigger_sync_raw_user_meta_data_from_user ON public."User";
-- CREATE TRIGGER trigger_sync_raw_user_meta_data_from_user
-- AFTER UPDATE OF roles ON public."User"
-- FOR EACH ROW
-- WHEN (OLD.roles IS DISTINCT FROM NEW.roles)
-- EXECUTE FUNCTION public.sync_raw_user_meta_data_from_user();


-- -- PERMISSIONS
-- -- maybe i am missing permissions for anon,authenticated,others on auth.users
-- GRANT USAGE ON TYPE public."UserRolesEnum" TO supabase_auth_admin;

-- GRANT EXECUTE ON FUNCTION public.sync_roles_from_authuser() TO supabase_auth_admin;
-- GRANT EXECUTE ON FUNCTION public.sync_raw_user_meta_data_from_user() TO supabase_auth_admin;

-- GRANT SELECT, UPDATE ON public."User" TO supabase_auth_admin;
-- GRANT SELECT, UPDATE ON auth.users TO supabase_auth_admin;
-- Function to update User roles from AuthUser raw_user_meta_data
CREATE OR REPLACE FUNCTION public.sync_roles_from_authuser()
RETURNS TRIGGER AS $$
BEGIN
    -- Update User roles based on AuthUser raw_user_meta_data
    UPDATE public."User"
    SET roles = ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'roles'))::public."UserRolesEnum"[]
    WHERE id = NEW.id::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the above function after updates to raw_user_meta_data
DROP TRIGGER IF EXISTS trigger_sync_roles_from_authuser ON auth."users";
CREATE TRIGGER trigger_sync_roles_from_authuser
AFTER UPDATE OF raw_user_meta_data ON auth."users"
FOR EACH ROW
WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
EXECUTE FUNCTION public.sync_roles_from_authuser();




-- Function to update Auth.users raw_user_meta_data from User roles
CREATE OR REPLACE FUNCTION public.sync_raw_user_meta_data_from_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Update AuthUser raw_user_meta_data based on User roles
    UPDATE auth."users"
    SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'), '{roles}', to_jsonb(ARRAY(SELECT unnest(NEW.roles))))
    WHERE id = NEW.id::uuid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- $$ LANGUAGE plpgsql;
ALTER FUNCTION public.sync_raw_user_meta_data_from_user() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

-- Trigger to execute the above function after updates to User roles
DROP TRIGGER IF EXISTS trigger_sync_raw_user_meta_data_from_user ON public."User";
CREATE TRIGGER trigger_sync_raw_user_meta_data_from_user
AFTER UPDATE OF roles ON public."User"
FOR EACH ROW
WHEN (OLD.roles IS DISTINCT FROM NEW.roles)
EXECUTE FUNCTION public.sync_raw_user_meta_data_from_user();


-- DROP FUNCTION get_memory_status_statistics(TEXT[]);

CREATE OR REPLACE FUNCTION get_memory_status_statistics_on_tags(tag_ids TEXT[]) RETURNS TABLE (
  tag_id TEXT,
  tag_name TEXT,
  status_known INT,
  status_graduated INT,
  status_unknown INT,
  status_learning INT,
  no_memory INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tag.id AS tag_id,
        tag.name AS tag_name,
        COUNT(DISTINCT CASE WHEN memory.status = 'KNOWN' THEN unit.id ELSE NULL END)::INT AS status_known,
        COUNT(DISTINCT CASE WHEN memory.status = 'GRADUATED' THEN unit.id ELSE NULL END)::INT AS status_graduated,
        COUNT(DISTINCT CASE WHEN memory.status = 'UNKNOWN' THEN unit.id ELSE NULL END)::INT AS status_unknown,
        COUNT(DISTINCT CASE WHEN memory.status = 'LEARNING' THEN unit.id ELSE NULL END)::INT AS status_learning,
        COUNT(DISTINCT CASE WHEN memory.id IS NULL THEN unit.id ELSE NULL END)::INT AS no_memory
    FROM 
        unnest(tag_ids) AS t_id
        JOIN public."_TagToUnit" tu ON t_id = tu."A"
        JOIN public."Tag" tag ON tu."A" = tag.id
        JOIN public."Unit" unit ON tu."B" = unit.id
        LEFT JOIN public."Memory" memory ON memory."unitId" = unit.id AND memory."userId" = auth.uid()::text
    GROUP BY tag.id;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION get_due_tags;
CREATE OR REPLACE FUNCTION get_due_tags(
    game_id TEXT,
    tag_ids TEXT[] DEFAULT NULL,
    due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Tag" AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM public."Tag" t
    WHERE (tagIds IS NULL OR t.id = ANY(tagIds))
    AND (blacklist IS NULL OR NOT(t.id = ANY(blacklist)))
    AND EXISTS (
        SELECT 1
        FROM public."Play" p
        WHERE p."tagId" = t.id
        AND p."gameId" = game_id
        AND p."nextPlay" < due_lt
        AND p."userId" = auth.uid()::text
    )
    AND NOT EXISTS (
        SELECT 1
        FROM public."Memory" m
        WHERE m."tagId" = t.id
        AND m."userId" = auth.uid()::text
        AND m."status" IN ('KNOWN', 'GRADUATED')
    )
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION get_new_tags;
CREATE OR REPLACE FUNCTION get_new_tags(
    game_id TEXT,
    take_limit INT DEFAULT NULL,
    tagIds TEXT[] DEFAULT NULL,
    blacklist TEXT[] DEFAULT NULL
)
RETURNS SETOF public."Tag" AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM public."Tag" t
    WHERE (tagIds IS NULL OR t.id = ANY(tagIds))
    AND (blacklist IS NULL OR NOT(t.id = ANY(blacklist)))
    AND NOT EXISTS (
        SELECT 1
        FROM public."Play" p
        WHERE p."tagId" = t.id
        AND p."gameId" = game_id
        AND p."userId" = auth.uid()::text
    )
    AND NOT EXISTS (
        SELECT 1
        FROM public."Memory" m
        WHERE m."tagId" = t.id
        AND m."userId" = auth.uid()::text
        AND m."status" IN ('KNOWN', 'GRADUATED')
    )
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_units_from_tag_ids(
    tag_ids TEXT[],
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Unit" AS $$
DECLARE
    num_tags INT := array_length(tag_ids, 1);
BEGIN
    RETURN QUERY
    SELECT u.*
    FROM public."Unit" u
    WHERE u.id IN (
        SELECT tu."B"
        FROM public."_TagToUnit" tu
        WHERE tu."A" = ANY(tag_ids)
        GROUP BY tu."B"
        HAVING COUNT(DISTINCT tu."A") = num_tags
    )
    AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_due_units(
    tag_ids TEXT[],
    game_id TEXT,
    tactic_id TEXT,
    due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Unit" AS $$
BEGIN
    RETURN QUERY
    WITH required_tags AS (
        SELECT UNNEST(tag_ids) AS tag_id
    ),
    unit_tags AS (
        SELECT tu."B" AS unit_id, COUNT(DISTINCT tu."A") AS matched_tags
        FROM public."_TagToUnit" tu
        INNER JOIN required_tags rt ON rt.tag_id = tu."A"
        GROUP BY tu."B"
        HAVING COUNT(DISTINCT tu."A") = (SELECT COUNT(*) FROM required_tags)
    )
    SELECT u.*
    FROM public."Unit" u
    INNER JOIN unit_tags ut ON ut.unit_id = u.id
    WHERE EXISTS (
        SELECT 1
        FROM "Play" p
        WHERE p."unitId" = u.id
        AND p."tacticId" = tactic_id
        AND p."gameId" = game_id
        AND p."nextPlay" < due_lt
        AND p."userId" = auth.uid()::text
    )
    AND NOT EXISTS (
        SELECT 1
        FROM public."Memory" m
        WHERE m."unitId" = u.id
        AND m."tagId" IS NULL
        AND m."userId" = auth.uid()::text
        AND m."status" IN ('KNOWN', 'GRADUATED')
    )
    AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_new_units(
    tag_ids TEXT[],
    tactic_id TEXT,
    game_id TEXT,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Unit" AS $$
DECLARE
    num_tags INT := array_length(tag_ids, 1);
BEGIN
    RETURN QUERY
    SELECT u.*
    FROM public."Unit" u
    WHERE u.id IN (
        SELECT tu."B"
        FROM public."_TagToUnit" tu
        WHERE tu."A" = ANY(tag_ids)
        GROUP BY tu."B"
        HAVING COUNT(DISTINCT tu."A") = num_tags
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "public.Play" p
        WHERE p."unitId" = u.id
        AND p."gameId" = game_id
        AND p."tacticId" = tactic_id
        AND p."userId" = auth.uid()::text
    )
    AND NOT EXISTS (
        SELECT 1
        FROM public."Memory" m
        WHERE m."unitId" = u.id
        AND m."tagId" IS NULL
        AND m."userId" = auth.uid()::text
        AND m."status" IN ('KNOWN', 'GRADUATED')
    )
    AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;

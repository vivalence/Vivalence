-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- https://gist.github.com/fabiolimace/515a0440e3e40efeb234e12644a6a346
/*
 * MIT License
 *
 * Copyright (c) 2023-2024 Fabio Lima
 * 
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 * 
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 * 
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
 
/**
 * Returns a time-ordered UUID with Unix Epoch (UUIDv7).
 * 
 * Referencie: https://www.rfc-editor.org/rfc/rfc9562.html
 *
 * MIT License.
 *
 */
create or replace function uuid7() returns uuid as $$
declare
begin
	return uuid7(clock_timestamp());
end $$ language plpgsql;

create or replace function uuid7(p_timestamp timestamp with time zone) returns uuid as $$
declare

	v_time double precision := null;

	v_unix_t bigint := null;
	v_rand_a bigint := null;
	v_rand_b bigint := null;

	v_unix_t_hex varchar := null;
	v_rand_a_hex varchar := null;
	v_rand_b_hex varchar := null;

	c_milli double precision := 10^3;  -- 1 000
	c_micro double precision := 10^6;  -- 1 000 000
	c_scale double precision := 4.096; -- 4.0 * (1024 / 1000)
	
	c_version bigint := x'0000000000007000'::bigint; -- RFC-9562 version: b'0111...'
	c_variant bigint := x'8000000000000000'::bigint; -- RFC-9562 variant: b'10xx...'

begin

	v_time := extract(epoch from p_timestamp);

	v_unix_t := trunc(v_time * c_milli);
	v_rand_a := trunc((v_time * c_micro - v_unix_t * c_milli) * c_scale);
	v_rand_b := trunc(random() * 2^30)::bigint << 32 | trunc(random() * 2^32)::bigint;

	v_unix_t_hex := lpad(to_hex(v_unix_t), 12, '0');
	v_rand_a_hex := lpad(to_hex((v_rand_a | c_version)::bigint), 4, '0');
	v_rand_b_hex := lpad(to_hex((v_rand_b | c_variant)::bigint), 16, '0');

	return (v_unix_t_hex || v_rand_a_hex || v_rand_b_hex)::uuid;
	
end $$ language plpgsql;
-------------------------------------------------------------------
-- EXAMPLE:
-------------------------------------------------------------------
-- 
-- select uuid7() uuid, clock_timestamp()-statement_timestamp() time_taken;
--
-- |uuid                                  |time_taken        |
-- |--------------------------------------|------------------|
-- |018da240-e0db-72e1-86f5-345c2c240387  |00:00:00.000222   |
-- 

-------------------------------------------------------------------
-- EXAMPLE: generate a list
-------------------------------------------------------------------
-- 
-- with x as (select clock_timestamp() as t from generate_series(1, 1000))
-- select uuid7(x.t) uuid, x.t::text ts from x;
-- 
-- |uuid                                |ts                           |
-- |------------------------------------|-----------------------------|
-- |018da235-6271-70cd-a937-0bb7d22b801e|2024-02-13 08:23:44.113054-03|
-- |018da235-6271-7214-9188-1d3191883b5d|2024-02-13 08:23:44.113126-03|
-- |018da235-6271-723d-bebe-87f66085fad7|2024-02-13 08:23:44.113143-03|
-- |018da235-6271-728f-86ba-6e277d10c0a3|2024-02-13 08:23:44.113156-03|
-- |018da235-6271-72b8-9887-f31e4ca48020|2024-02-13 08:23:44.113168-03|
-- |018da235-6271-72e1-bbeb-8b686d0d4281|2024-02-13 08:23:44.113179-03|
-- |018da235-6271-730a-96a2-73275626f72a|2024-02-13 08:23:44.113190-03|
-- |018da235-6271-7333-8a5c-9d1ab89dc489|2024-02-13 08:23:44.113201-03|
-- |018da235-6271-735c-ba64-a42b55ad7d5c|2024-02-13 08:23:44.113212-03|
-- |018da235-6271-7385-a0fb-c65f5be24073|2024-02-13 08:23:44.113223-03|
--

-------------------------------------------------------------------
-- FOR TEST: the expected result is an empty result set
-------------------------------------------------------------------
-- 
-- with t as (select uuid7() as id from generate_series(1, 1000))
-- select * from t where (id is null or id::text !~ '^[a-f0-9]{8}-[a-f0-9]{4}-7[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$');
--
-- PERMISSIONS
GRANT USAGE ON SCHEMA "public" TO service_role;
GRANT USAGE ON SCHEMA "public" TO anon;
GRANT USAGE ON SCHEMA "public" TO authenticated;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA "public" TO service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA "public" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA "public" TO anon;

-- PERMISSIONS
-- maybe i am missing permissions for anon,authenticated,others on auth.users

-- GRANT USAGE ON TYPE public."UserRolesEnum" TO supabase_auth_admin;

-- GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;

GRANT SELECT ON TABLE public."User" TO authenticator;

-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticator;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticator;

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
-- RLS
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
-- Hooks
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
-- -- Function to update User roles from AuthUser raw_user_meta_data
-- DROP FUNCTION public.sync_email_from_authuser()
-- CREATE OR REPLACE FUNCTION public.sync_email_from_authuser()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     -- Update User roles based on AuthUser raw_user_meta_data
--     UPDATE public."User"
--     SET email = NEW.email
--     WHERE id = NEW.id::text;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Trigger to execute the above function after updates to raw_user_meta_data
-- DROP TRIGGER IF EXISTS trigger_sync_email_from_authuser ON auth."users";
-- CREATE TRIGGER trigger_sync_email_from_authuser
-- AFTER UPDATE OF email ON auth."users"
-- FOR EACH ROW
-- WHEN (OLD.email IS DISTINCT FROM NEW.email)
-- EXECUTE FUNCTION public.sync_email_from_authuser();




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

GRANT EXECUTE ON FUNCTION public.sync_roles_from_authuser() TO supabase_auth_admin;


-- Function to update Auth.users raw_user_meta_data from User roles
CREATE OR REPLACE FUNCTION public.sync_raw_user_meta_data_from_user()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth."users"
    SET raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'), '{roles}', to_jsonb(ARRAY(SELECT unnest(NEW.roles))))
    WHERE id = NEW.id::uuid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER FUNCTION public.sync_raw_user_meta_data_from_user() OWNER TO postgres; -- @lj hack bc: jwt is null inside policy functions. either after writing user or inside trigger

GRANT EXECUTE ON FUNCTION public.sync_raw_user_meta_data_from_user() TO supabase_auth_admin;


-- Trigger to execute the above function after updates to User roles
DROP TRIGGER IF EXISTS trigger_sync_raw_user_meta_data_from_user ON public."User";
CREATE TRIGGER trigger_sync_raw_user_meta_data_from_user
AFTER UPDATE OF roles ON public."User"
FOR EACH ROW
WHEN (OLD.roles IS DISTINCT FROM NEW.roles)
EXECUTE FUNCTION public.sync_raw_user_meta_data_from_user();



-- Functions
DROP FUNCTION IF EXISTS get_due_tags;
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

DROP FUNCTION IF EXISTS get_new_tags;
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
    tag_ids TEXT[] DEFAULT NULL,
    game_id TEXT DEFAULT NULL,
    tactic_id TEXT DEFAULT NULL,
    user_id TEXT DEFAULT NULL,
    runtime_id TEXT DEFAULT NULL,
    due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Unit" AS $$
BEGIN
    RETURN QUERY
    WITH matching_plays AS (
        SELECT 
            p."unitId",
            MIN(p."nextAt") as earliest_next_at
        FROM "Play" p
        WHERE p."nextAt" < due_lt
	    AND p."tagId" IS NULL
            AND (tactic_id IS NULL OR p."tacticId" = tactic_id)
            AND (game_id IS NULL OR p."gameId" = game_id)
            AND (user_id IS NULL OR p."userId" = user_id)
            AND (runtime_id IS NULL OR p."runtimeId" = runtime_id)
        GROUP BY p."unitId"
    ),
    matching_units AS (
        SELECT DISTINCT u.id
        FROM public."Unit" u
        WHERE (
            tag_ids IS NULL 
            OR (
                SELECT COUNT(DISTINCT tu."A")
                FROM public."_TagToUnit" tu
                WHERE tu."B" = u.id
                AND tu."A" = ANY(tag_ids)
            ) = array_length(tag_ids, 1)
        )
        AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    )
    SELECT u.*
    FROM public."Unit" u
    INNER JOIN matching_plays mp ON mp."unitId" = u.id
    INNER JOIN matching_units mu ON mu.id = u.id
    ORDER BY mp.earliest_next_at ASC
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION get_due_units(tag_ids TEXT[] DEFAULT NULL, game_id TEXT DEFAULT NULL, tactic_id TEXT DEFAULT NULL, user_id TEXT DEFAULT NULL, runtime_id TEXT DEFAULT NULL, due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, blacklist TEXT[] DEFAULT NULL, take_limit INT DEFAULT NULL) RETURNS SETOF public."Unit" AS $$ BEGIN RETURN QUERY WITH unit_tags AS (SELECT DISTINCT tu."B" AS unit_id FROM public."_TagToUnit" tu WHERE CASE WHEN tag_ids IS NOT NULL THEN tu."A" = ANY(tag_ids) AND (SELECT COUNT(DISTINCT sub_tu."A") FROM public."_TagToUnit" sub_tu WHERE sub_tu."B" = tu."B" AND sub_tu."A" = ANY(tag_ids)) = array_length(tag_ids, 1) ELSE true END) SELECT u.* FROM public."Unit" u LEFT JOIN unit_tags ut ON ut.unit_id = u.id WHERE (tag_ids IS NULL OR ut.unit_id IS NOT NULL) AND EXISTS (SELECT 1 FROM "Play" p WHERE p."unitId" = u.id AND p."nextAt" < due_lt AND (tactic_id IS NULL OR p."tacticId" = tactic_id) AND (game_id IS NULL OR p."gameId" = game_id) AND (user_id IS NULL OR p."userId" = user_id) AND (runtime_id IS NULL OR p."runtimeId" = runtime_id)) AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist))) LIMIT take_limit; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION get_new_units(
    tag_ids TEXT[] DEFAULT NULL,
    tactic_id TEXT DEFAULT NULL,
    game_id TEXT DEFAULT NULL,
    runtime_id TEXT DEFAULT NULL,
    user_id TEXT DEFAULT NULL,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Unit" AS $$
BEGIN
    RETURN QUERY
    WITH matching_units AS (
        SELECT DISTINCT u.id
        FROM public."Unit" u
        WHERE (
            tag_ids IS NULL 
            OR (
                SELECT COUNT(DISTINCT tu."A")
                FROM public."_TagToUnit" tu
                WHERE tu."B" = u.id
                AND tu."A" = ANY(tag_ids)
            ) = array_length(tag_ids, 1)
        )
        AND NOT EXISTS (
            SELECT 1
            FROM public."Play" p
            WHERE p."unitId" = u.id
            AND (game_id IS NULL OR p."gameId" = game_id)
            AND (tactic_id IS NULL OR p."tacticId" = tactic_id)
            AND (user_id IS NULL OR p."userId" = user_id)
            AND (runtime_id IS NULL OR p."runtimeId" = runtime_id)
        )
        AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    )
    SELECT u.*
    FROM public."Unit" u
    INNER JOIN matching_units mu ON mu.id = u.id
    ORDER BY (u.data->>'index')::numeric
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;






-- CREATE OR REPLACE FUNCTION get_new_units(tag_ids TEXT[] DEFAULT NULL, tactic_id TEXT DEFAULT NULL, game_id TEXT DEFAULT NULL, runtime_id TEXT DEFAULT NULL, user_id TEXT DEFAULT NULL, blacklist TEXT[] DEFAULT NULL, take_limit INT DEFAULT NULL) RETURNS SETOF public."Unit" AS $$ DECLARE num_tags INT; BEGIN IF tag_ids IS NOT NULL THEN num_tags := array_length(tag_ids, 1); END IF; RETURN QUERY SELECT u.* FROM public."Unit" u WHERE (CASE WHEN tag_ids IS NOT NULL THEN u.id IN (SELECT tu."B" FROM public."_TagToUnit" tu WHERE tu."A" = ANY(tag_ids) GROUP BY tu."B" HAVING COUNT(DISTINCT tu."A") = num_tags) ELSE true END) AND NOT EXISTS (SELECT 1 FROM "public.Play" p WHERE p."unitId" = u.id AND (game_id IS NULL OR p."gameId" = game_id) AND (tactic_id IS NULL OR p."tacticId" = tactic_id) AND (user_id IS NULL OR p."userId" = user_id) AND (runtime_id IS NULL OR p."runtimeId" = runtime_id)) AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist))) LIMIT take_limit; END; $$ LANGUAGE plpgsql;





    -- AND NOT EXISTS (SELECT 1 FROM public."Memory" m WHERE m."unitId" = u.id AND m."tagId" IS NULL AND m."userId" = COALESCE(user_id, auth.uid()::text) AND m."status" IN ('KNOWN', 'GRADUATED'))
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

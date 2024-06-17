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

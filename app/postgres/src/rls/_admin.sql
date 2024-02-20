CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    -- RAISE NOTICE 'user_metadata: %', auth.jwt();
    RETURN (auth.jwt() -> 'user_metadata' -> 'roles') @> '["ADMIN"]'::jsonb;
END;
$$ LANGUAGE plpgsql STABLE;

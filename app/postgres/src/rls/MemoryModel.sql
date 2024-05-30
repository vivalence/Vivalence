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



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

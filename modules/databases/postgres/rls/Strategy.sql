ALTER TABLE "Strategy" ENABLE ROW LEVEL SECURITY;
-- 
CREATE OR REPLACE FUNCTION user_has_access_to_Strategy(strategy_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "Strategy"
        WHERE "userId" = auth.uid()::Text AND "id" = strategy_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- 
DROP POLICY IF EXISTS admin_crud_all_Strategy ON "Strategy";
CREATE POLICY admin_crud_all_Strategy ON "Strategy"
    FOR ALL
    USING (is_admin());

DROP POLICY IF EXISTS user_Strategy_read_policy ON "Strategy";
CREATE POLICY user_Strategy_read_policy ON "Strategy"
    FOR SELECT
    USING (user_has_access_to_Strategy(id));
-- 

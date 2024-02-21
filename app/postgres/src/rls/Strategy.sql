ALTER TABLE "Strategy" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_crud_all_Strategy ON "Strategy";
CREATE POLICY admin_crud_all_Strategy ON "Strategy"
    FOR ALL
    USING (is_admin());

DROP POLICY IF EXISTS user_strategy_read_policy ON "Strategy";
CREATE POLICY user_strategy_read_policy ON "Strategy"
    FOR SELECT
    USING (user_has_access_to_strategy(id));





DROP POLICY IF EXISTS admin_crud_all_AppUser_to_Strategy ON public."_AppUserToStrategy";
CREATE POLICY admin_crud_all_AppUser_to_Strategy ON public."_AppUserToStrategy"
    FOR ALL
    USING (is_admin());

DROP POLICY IF EXISTS user_AppUser_to_Strategy_read_policy ON public."_AppUserToStrategy";
CREATE POLICY user_AppUser_to_Strategy_read_policy ON public."_AppUserToStrategy"
    FOR SELECT
    USING (user_has_access_to_strategy("B"));

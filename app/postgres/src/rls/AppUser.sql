ALTER TABLE "AppUser" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_crud_all_AppUser ON "AppUser";
CREATE POLICY admin_crud_all_AppUser ON "AppUser"
    FOR ALL
    USING (is_admin());

DROP POLICY IF EXISTS user_appuser_crud_policy  ON "AppUser";
CREATE POLICY user_appuser_crud_policy ON "AppUser"
    FOR ALL
    USING (auth_user_id = auth.uid()::text)
    WITH CHECK (auth_user_id = auth.uid()::text);


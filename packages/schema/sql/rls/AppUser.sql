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


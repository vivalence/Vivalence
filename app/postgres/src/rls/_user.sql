
CREATE OR REPLACE FUNCTION user_has_access_to_strategy(strategy_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM "_AppUserToStrategy"
        WHERE A = auth.uid() AND B = strategy_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

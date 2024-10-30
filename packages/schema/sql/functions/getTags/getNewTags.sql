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

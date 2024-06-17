DROP FUNCTION get_due_tags;
CREATE OR REPLACE FUNCTION get_due_tags(
    game_id TEXT,
    tag_ids TEXT[] DEFAULT NULL,
    due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF "Tag" AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM "Tag" t
    WHERE (tagIds IS NULL OR t.id = ANY(tagIds))
    AND (blacklist IS NULL OR NOT(t.id = ANY(blacklist)))
    AND EXISTS (
        SELECT 1
        FROM "Play" p
        WHERE p."tagId" = t.id
        AND p."gameId" = game_id
        AND p."nextPlay" < due_lt
        AND p."userId" = auth.uid()::text
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "Memory" m
        WHERE m."tagId" = t.id
        AND m."userId" = auth.uid()::text
        AND m."status" IN ('KNOWN', 'GRADUATED')
    )
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;


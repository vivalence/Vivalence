CREATE OR REPLACE FUNCTION get_new_units(
    tag_ids TEXT[],
    tactic_id TEXT,
    game_id TEXT,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Unit" AS $$
DECLARE
    num_tags INT := array_length(tag_ids, 1);
BEGIN
    RETURN QUERY
    SELECT u.*
    FROM public."Unit" u
    WHERE u.id IN (
        SELECT tu."B"
        FROM public."_TagToUnit" tu
        WHERE tu."A" = ANY(tag_ids)
        GROUP BY tu."B"
        HAVING COUNT(DISTINCT tu."A") = num_tags
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "public.Play" p
        WHERE p."unitId" = u.id
        AND p."gameId" = game_id
        AND p."tacticId" = tactic_id
        AND p."userId" = auth.uid()::text
    )
    AND NOT EXISTS (
        SELECT 1
        FROM public."Memory" m
        WHERE m."unitId" = u.id
        AND m."tagId" IS NULL
        AND m."userId" = auth.uid()::text
        AND m."status" IN ('KNOWN', 'GRADUATED')
    )
    AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;

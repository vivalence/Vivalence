CREATE OR REPLACE FUNCTION get_new_units(
    tag_ids TEXT[],
    game_id TEXT,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF "Unit" AS $$
DECLARE
    num_tags INT := array_length(tag_ids, 1);
BEGIN
    RETURN QUERY
    SELECT u.*
    FROM "Unit" u
    INNER JOIN "_TagToUnit" tu ON tu."B" = u.id
    WHERE tu."A" = ANY(tag_ids)
    AND NOT EXISTS (
        SELECT 1
        FROM "Play" p
        WHERE p."unitId" = u.id
        AND p."gameId" = game_id
        AND p."userId" = auth.uid()::text
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "MemoryModel" m
        WHERE m."unitId" = u.id
        AND m."userId" = auth.uid()::text
        AND m."status" IN ('KNOWN', 'GRADUATED')
    )
    AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    GROUP BY u.id
    HAVING COUNT(DISTINCT tu."A") = num_tags
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION get_due_units(
    tag_ids TEXT[],
    game_id TEXT,
    due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF "Unit" AS $$
BEGIN
    RETURN QUERY
    SELECT u.*
    FROM "Unit" u
    WHERE EXISTS (
        SELECT 1
        FROM "Play" p
        WHERE p."unitId" = u.id
        AND p."gameId" = game_id
        AND p."nextPlay" < due_lt
        AND p."userId" = auth.uid()::text
    )
    AND NOT EXISTS (
        SELECT 1
        FROM "MemoryModel" m
        WHERE m."unitId" = u.id
        AND m."userId" = auth.uid()::text
        AND m."status" IN ('KNOWN', 'GRADUATED')
    )
    AND EXISTS (
        SELECT 1
        FROM unnest(tag_ids) AS tag_id
        WHERE EXISTS (
            SELECT 1
            FROM "_TagToUnit" tu
            WHERE tu."B" = u.id AND tu."A" = tag_id
        )
    )
    AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;


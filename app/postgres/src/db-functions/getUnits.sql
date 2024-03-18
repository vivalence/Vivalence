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
    WHERE u.id IN (
        SELECT tu."B"
        FROM "_TagToUnit" tu
        WHERE tu."A" = ANY(tag_ids)
        GROUP BY tu."B"
        HAVING COUNT(DISTINCT tu."A") = num_tags
    )
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
    WITH required_tags AS (
        SELECT UNNEST(tag_ids) AS tag_id
    ),
    unit_tags AS (
        SELECT tu."B" AS unit_id, COUNT(DISTINCT tu."A") AS matched_tags
        FROM "_TagToUnit" tu
        INNER JOIN required_tags rt ON rt.tag_id = tu."A"
        GROUP BY tu."B"
        HAVING COUNT(DISTINCT tu."A") = (SELECT COUNT(*) FROM required_tags)
    )
    SELECT u.*
    FROM "Unit" u
    INNER JOIN unit_tags ut ON ut.unit_id = u.id
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
    AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;


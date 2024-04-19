CREATE OR REPLACE FUNCTION get_new_tags(
    -- unit_ids TEXT[] DEFAULT NULL,
    game_id TEXT,
    take_limit INT DEFAULT NULL,
    whitelist TEXT[] DEFAULT NULL,
    blacklist TEXT[] DEFAULT NULL
)
RETURNS SETOF "Tag" AS $$
BEGIN
    RETURN QUERY
    SELECT t.*
    FROM "Tag" t
    -- WHERE (unit_ids IS NULL OR t.id IN (
    --     SELECT tu."A"
    --     FROM "_TagToUnit" tu
    --     WHERE tu."B" = ANY(unit_ids)
    --     GROUP BY tu."A"
    -- ))
    WHERE (whitelist IS NULL OR t.id = ANY(whitelist))
    AND (blacklist IS NULL OR NOT(t.id = ANY(blacklist)))
    AND NOT EXISTS (
        SELECT 1
        FROM "Play" p
        WHERE p."tagId" = t.id
        AND p."gameId" = game_id
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

CREATE OR REPLACE FUNCTION get_due_tags(
    -- tag_ids TEXT[],
    game_id TEXT,
    due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    whitelist TEXT[] DEFAULT NULL,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF "Tag" AS $$
BEGIN
    RETURN QUERY
    -- WITH required_tags AS (
    --     SELECT UNNEST(tag_ids) AS tag_id
    -- ),
    -- unit_tags AS (
    --     SELECT tu."B" AS unit_id, COUNT(DISTINCT tu."A") AS matched_tags
    --     FROM "_TagToUnit" tu
    --     INNER JOIN required_tags rt ON rt.tag_id = tu."A"
    --     GROUP BY tu."B"
    --     HAVING COUNT(DISTINCT tu."A") = (SELECT COUNT(*) FROM required_tags)
    -- )
    SELECT t.*
    FROM "Tag" t
    -- INNER JOIN unit_tags ut ON ut.unit_id = u.id
    WHERE (whitelist IS NULL OR t.id = ANY(whitelist))
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


CREATE OR REPLACE FUNCTION get_due_units(
    tag_ids TEXT[] DEFAULT NULL,
    game_id TEXT DEFAULT NULL,
    tactic_id TEXT DEFAULT NULL,
    user_id TEXT DEFAULT NULL,
    runtime_id TEXT DEFAULT NULL,
    due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Unit" AS $$
BEGIN
    RETURN QUERY
    WITH matching_plays AS (
        SELECT 
            p."unitId",
            MIN(p."nextAt") as earliest_next_at
        FROM "Play" p
        WHERE p."nextAt" < due_lt
	    AND p."tagId" IS NULL
            AND (tactic_id IS NULL OR p."tacticId" = tactic_id)
            AND (game_id IS NULL OR p."gameId" = game_id)
            AND (user_id IS NULL OR p."userId" = user_id)
            AND (runtime_id IS NULL OR p."runtimeId" = runtime_id)
        GROUP BY p."unitId"
    ),
    matching_units AS (
        SELECT DISTINCT u.id
        FROM public."Unit" u
        WHERE (
            tag_ids IS NULL 
            OR (
                SELECT COUNT(DISTINCT tu."A")
                FROM public."_TagToUnit" tu
                WHERE tu."B" = u.id
                AND tu."A" = ANY(tag_ids)
            ) = array_length(tag_ids, 1)
        )
        AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    )
    SELECT u.*
    FROM public."Unit" u
    INNER JOIN matching_plays mp ON mp."unitId" = u.id
    INNER JOIN matching_units mu ON mu.id = u.id
    ORDER BY mp.earliest_next_at ASC
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION get_due_units(tag_ids TEXT[] DEFAULT NULL, game_id TEXT DEFAULT NULL, tactic_id TEXT DEFAULT NULL, user_id TEXT DEFAULT NULL, runtime_id TEXT DEFAULT NULL, due_lt TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, blacklist TEXT[] DEFAULT NULL, take_limit INT DEFAULT NULL) RETURNS SETOF public."Unit" AS $$ BEGIN RETURN QUERY WITH unit_tags AS (SELECT DISTINCT tu."B" AS unit_id FROM public."_TagToUnit" tu WHERE CASE WHEN tag_ids IS NOT NULL THEN tu."A" = ANY(tag_ids) AND (SELECT COUNT(DISTINCT sub_tu."A") FROM public."_TagToUnit" sub_tu WHERE sub_tu."B" = tu."B" AND sub_tu."A" = ANY(tag_ids)) = array_length(tag_ids, 1) ELSE true END) SELECT u.* FROM public."Unit" u LEFT JOIN unit_tags ut ON ut.unit_id = u.id WHERE (tag_ids IS NULL OR ut.unit_id IS NOT NULL) AND EXISTS (SELECT 1 FROM "Play" p WHERE p."unitId" = u.id AND p."nextAt" < due_lt AND (tactic_id IS NULL OR p."tacticId" = tactic_id) AND (game_id IS NULL OR p."gameId" = game_id) AND (user_id IS NULL OR p."userId" = user_id) AND (runtime_id IS NULL OR p."runtimeId" = runtime_id)) AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist))) LIMIT take_limit; END; $$ LANGUAGE plpgsql;

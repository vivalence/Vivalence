CREATE OR REPLACE FUNCTION get_new_units(
    tag_ids TEXT[] DEFAULT NULL,
    tactic_id TEXT DEFAULT NULL,
    game_id TEXT DEFAULT NULL,
    runtime_id TEXT DEFAULT NULL,
    user_id TEXT DEFAULT NULL,
    blacklist TEXT[] DEFAULT NULL,
    take_limit INT DEFAULT NULL
)
RETURNS SETOF public."Unit" AS $$
BEGIN
    RETURN QUERY
    WITH matching_units AS (
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
        AND NOT EXISTS (
            SELECT 1
            FROM public."Play" p
            WHERE p."unitId" = u.id
            AND (game_id IS NULL OR p."gameId" = game_id)
            AND (tactic_id IS NULL OR p."tacticId" = tactic_id)
            AND (user_id IS NULL OR p."userId" = user_id)
            AND (runtime_id IS NULL OR p."runtimeId" = runtime_id)
        )
        AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    )
    SELECT u.*
    FROM public."Unit" u
    INNER JOIN matching_units mu ON mu.id = u.id
    ORDER BY (u.data->>'index')::numeric
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;






-- CREATE OR REPLACE FUNCTION get_new_units(tag_ids TEXT[] DEFAULT NULL, tactic_id TEXT DEFAULT NULL, game_id TEXT DEFAULT NULL, runtime_id TEXT DEFAULT NULL, user_id TEXT DEFAULT NULL, blacklist TEXT[] DEFAULT NULL, take_limit INT DEFAULT NULL) RETURNS SETOF public."Unit" AS $$ DECLARE num_tags INT; BEGIN IF tag_ids IS NOT NULL THEN num_tags := array_length(tag_ids, 1); END IF; RETURN QUERY SELECT u.* FROM public."Unit" u WHERE (CASE WHEN tag_ids IS NOT NULL THEN u.id IN (SELECT tu."B" FROM public."_TagToUnit" tu WHERE tu."A" = ANY(tag_ids) GROUP BY tu."B" HAVING COUNT(DISTINCT tu."A") = num_tags) ELSE true END) AND NOT EXISTS (SELECT 1 FROM "public.Play" p WHERE p."unitId" = u.id AND (game_id IS NULL OR p."gameId" = game_id) AND (tactic_id IS NULL OR p."tacticId" = tactic_id) AND (user_id IS NULL OR p."userId" = user_id) AND (runtime_id IS NULL OR p."runtimeId" = runtime_id)) AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist))) LIMIT take_limit; END; $$ LANGUAGE plpgsql;





    -- AND NOT EXISTS (SELECT 1 FROM public."Memory" m WHERE m."unitId" = u.id AND m."tagId" IS NULL AND m."userId" = COALESCE(user_id, auth.uid()::text) AND m."status" IN ('KNOWN', 'GRADUATED'))

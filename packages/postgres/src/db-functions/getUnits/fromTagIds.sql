CREATE OR REPLACE FUNCTION get_units_from_tag_ids(
    tag_ids TEXT[],
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
    AND (blacklist IS NULL OR NOT(u.id = ANY(blacklist)))
    LIMIT take_limit;
END;
$$ LANGUAGE plpgsql;

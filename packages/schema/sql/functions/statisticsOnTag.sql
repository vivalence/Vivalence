-- DROP FUNCTION get_memory_status_statistics(TEXT[]);

CREATE OR REPLACE FUNCTION get_memory_status_statistics_on_tags(tag_ids TEXT[]) RETURNS TABLE (
  tag_id TEXT,
  tag_name TEXT,
  status_known INT,
  status_graduated INT,
  status_unknown INT,
  status_learning INT,
  no_memory INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tag.id AS tag_id,
        tag.name AS tag_name,
        COUNT(DISTINCT CASE WHEN memory.status = 'KNOWN' THEN unit.id ELSE NULL END)::INT AS status_known,
        COUNT(DISTINCT CASE WHEN memory.status = 'GRADUATED' THEN unit.id ELSE NULL END)::INT AS status_graduated,
        COUNT(DISTINCT CASE WHEN memory.status = 'UNKNOWN' THEN unit.id ELSE NULL END)::INT AS status_unknown,
        COUNT(DISTINCT CASE WHEN memory.status = 'LEARNING' THEN unit.id ELSE NULL END)::INT AS status_learning,
        COUNT(DISTINCT CASE WHEN memory.id IS NULL THEN unit.id ELSE NULL END)::INT AS no_memory
    FROM 
        unnest(tag_ids) AS t_id
        JOIN public."_TagToUnit" tu ON t_id = tu."A"
        JOIN public."Tag" tag ON tu."A" = tag.id
        JOIN public."Unit" unit ON tu."B" = unit.id
        LEFT JOIN public."Memory" memory ON memory."unitId" = unit.id AND memory."userId" = auth.uid()::text
    GROUP BY tag.id;
END;
$$ LANGUAGE plpgsql;

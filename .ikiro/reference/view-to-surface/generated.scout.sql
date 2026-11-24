.headers on
SELECT count(*) AS generated_views FROM View WHERE mount IS NULL;
SELECT count(*) AS source_files FROM File WHERE view IS NOT NULL AND mime <> 'text/javascript';

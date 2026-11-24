.headers on
.print == View · buffer_views · File.view
SELECT count(*) AS views FROM View;
SELECT count(*) AS pivots FROM buffer_views;
SELECT count(*) AS files, count(view) AS with_view FROM File;
.print == the Files a View holds: mime · path
SELECT mime, path, count(*) AS n FROM File WHERE view IS NOT NULL GROUP BY mime, path ORDER BY path;
.print == does any OTHER table name a View
SELECT name FROM sqlite_master WHERE type = 'table' AND (sql LIKE '%REFERENCES `View`%' OR sql LIKE '%references `View`%');
.print == _mikro_migrations
SELECT name FROM _mikro_migrations ORDER BY id;

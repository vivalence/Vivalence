.headers on
.mode list
.print == tables
.tables
.print == _mikro_migrations
SELECT * FROM _mikro_migrations ORDER BY id;
.print == View schema
SELECT sql FROM sqlite_master WHERE tbl_name IN ('View', 'buffer_views') OR sql LIKE '%view_id%' OR sql LIKE '%`view`%';
.print == View entities
SELECT count(*) AS views FROM View;
SELECT View.slug, View.mime, View.mount, Mode.slug AS mode, View.updated_at FROM View JOIN Mode ON Mode.id = View.mode ORDER BY Mode.slug, View.slug;
.print == buffer_views rows
SELECT count(*) AS pivots FROM buffer_views;
.print == File.view set
SELECT count(*) AS files, count(view) AS with_view FROM File;
.print == Buffer · Mode counts
SELECT count(*) AS buffers FROM Buffer;
SELECT count(*) AS modes FROM Mode;

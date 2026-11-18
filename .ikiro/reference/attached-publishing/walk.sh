#!/bin/sh
A="http://127.0.0.1:$1"
B="http://127.0.0.1:$2"
AT="$A/attached/mode/publish/blog"
TEXT='{"text":"# First Post\nhello from the buffer\n\nsecond paragraph\n# Second Post\nmore words here"}'

say() { printf '\n=== %s\n' "$1"; }
heads() { curl -s -o /dev/null -D - "$@" | tr -d '\r' | grep -v -E '^(date|vary|access-control)' ; }

say "1 login gate: mode route under the daemon, no token"
curl -s -w '\n%{http_code}\n' -X POST -H 'content-type: application/json' -d "$TEXT" "$A/daemon/demo/mode/publish/blog/buffer"

say "2 attached before any bundle"
curl -s -w '\n%{http_code}\n' "$AT/index.html"

say "3 text in, bundle pressed (the open twin of the mode's routes)"
curl -s -w '\n%{http_code}\n' -X POST -H 'content-type: application/json' -d "$TEXT" "$A/open/mode/publish/blog/buffer"
curl -s -X POST "$A/open/mode/publish/blog/bundle"
echo

say "4 attached, no token: index"
curl -s -w '\n%{http_code}\n' "$AT/index.html"

say "5 nested path"
heads "$AT/article/first-post.html"

say "6 engine, plain"
heads "$AT/engine.js"

say "7 engine, Accept-Encoding: gzip"
heads -H 'Accept-Encoding: gzip' "$AT/engine.js"
printf 'bytes on the wire: '; curl -s -H 'Accept-Encoding: gzip' "$AT/engine.js" | wc -c

say "8 engine, Accept-Encoding: br"
heads -H 'Accept-Encoding: br' "$AT/engine.js"
printf 'bytes on the wire: '; curl -s -H 'Accept-Encoding: br' "$AT/engine.js" | wc -c

say "9 revalidation: If-None-Match with the plain etag"
TAG=$(curl -s -o /dev/null -D - "$AT/engine.js" | tr -d '\r' | grep -i '^etag' | cut -d' ' -f2)
echo "etag sent back: $TAG"
heads -H "If-None-Match: $TAG" "$AT/engine.js"

say "10 revalidation with the etag a gzip response carried"
GTAG=$(curl -s -o /dev/null -D - -H 'Accept-Encoding: gzip' "$AT/engine.js" | tr -d '\r' | grep -i '^etag' | cut -d' ' -f2-)
echo "etag sent back: $GTAG"
heads -H 'Accept-Encoding: gzip' -H "If-None-Match: $GTAG" "$AT/engine.js"

say "11 HEAD"
curl -s -I "$AT/engine.js" | tr -d '\r' | grep -v -E '^(date|vary|access-control)'

say "12 Range: bytes=0-99"
heads -H 'Range: bytes=0-99' "$AT/engine.js"
printf 'bytes on the wire: '; curl -s -H 'Range: bytes=0-99' "$AT/engine.js" | wc -c

say "13 missing"
curl -s -w '\n%{http_code}\n' "$AT/article/nope.html"

say "14 traversal"
curl -s -w '\n%{http_code}\n' --path-as-is "$AT/../../../../daemon/demo/mode/publish/blog/bundle"
curl -s -w '\n%{http_code}\n' "$AT/..%2f..%2fetc%2fpasswd"

say "15 re-bundle changes what answers"
curl -s -o /dev/null -X POST -H 'content-type: application/json' -d '{"text":"# Third Post\nreplaced"}' "$A/open/mode/publish/blog/buffer"
curl -s -o /dev/null -X POST "$A/open/mode/publish/blog/bundle"
curl -s -o /dev/null -w 'first-post %{http_code}\n' "$AT/article/first-post.html"
curl -s -o /dev/null -w 'third-post %{http_code}\n' "$AT/article/third-post.html"

bench() { ab -q -k -n 20000 -c 50 "$@" 2>&1 | grep -E 'Requests per second|Time per request.*\(mean\)$|Failed|Non-2xx|99%|50%|Document Length'; }

say "16 speed: engine.js 51 KB through the aperture"
bench "$AT/engine.js"
say "17 speed: engine.js 51 KB bare Deno.serve, same read"
bench "$B/engine.js"
say "18 speed: small page through the aperture"
bench "$AT/article/third-post.html"
say "19 speed: small page bare"
bench "$B/article/third-post.html"
say "20 speed: engine.js gzip through the aperture"
bench -H 'Accept-Encoding: gzip' "$AT/engine.js"
say "21 speed: 304 through the aperture"
bench -H "If-None-Match: $TAG" "$AT/engine.js"

<!-- writer: agent · folded from auto-memory 09-23 (m69 2.4) · reference, unbudgeted -->
# word audio — where recordings come from, and the picker

- Lingua Libre / Wikimedia Commons: `commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=intitle:<word> intitle:spa` → filter `LL-Q1321 (spa)-<speaker>-<word>.<wav|ogg>` → `prop=imageinfo&iiprop=url` → download (CC, multi-speaker, throttles by IP). Parens in `LL-Q1321 (spa)` break the search — bare `intitle:` terms.
- Forvo: full coverage but bytes are automation-locked (CDN 404, CORS, gesture-gated) — paid API only. beef: /"NO TTS."/ for word audio.

- picker: `~/.viva/registry/education/topographies/english-to-spanish/.word-picker.html` + `.word-picker-server.ts` (Deno.serve :4747, `--dir/--port`, corpus-agnostic, resume-safe) → `.harvest/word-audio-picks.json` `{picks:{form:speaker}, skipped:[], updated}`; keys 1-9 play · Enter pick+advance · x skip · j/k.

<!-- writer: agent · folded from auto-memory 09-23 (m69 2.4) · reference, unbudgeted -->
# tatoeba CSV exports + audio URLs

**Base URL:** `https://downloads.tatoeba.org/exports/`

| file | columns (tab-sep) | size | use |
|------|---|---:|---|
| `sentences_with_audio.csv` | sentence_id, audio_id, username, license, attribution_url | ~1.2M rows | every audio recording across all langs |
| `user_languages.csv` | lang_code, level (0-5, 5=native, \N=unknown), username, details (free-text dialect note) | ~107K rows | per-user language proficiency. **Col 4 is gold for dialect ID** ("Brazilian Portuguese", "Brazil", "português brasileiro") |
| `users.csv` | user_id, username, role | ~200K rows | user role (admin/trusted/user/inactive). No country field. |
| `tags.csv` | sentence_id, tag_name | ~1.7M rows | per-sentence tags. Filter `tag_name == "Brazilian Portuguese"` etc. |
| `tag_metadata.csv` | tag_id, tag_name, owner, created_at | ~11K rows | tag definitions. Use to find BR-marker tags. |
| `sentences.csv` | sentence_id, lang_code, text | ~13M rows | all sentences text + lang |
| `sentences_detailed.csv` | sentence_id, lang_code, text, owner, last_modified, created | ~13M rows | sentences + ownership. **1.4 GB**, 5+ min download. |
| `links.csv` | source_sid, target_sid | translation links between sentences across langs |

**ISO code:** Portuguese = `por` (umbrella). Tatoeba does NOT separate pt-BR / pt-PT in lang_code — must filter by user dialect declaration or BR tags.

**Audio download URL:** `https://tatoeba.org/audio/download/<audio_id>` (the audio_id from col 2 of sentences_with_audio.csv, NOT sentence_id). The `audio.tatoeba.org/sentences/<lang>/<sid>.mp3` pattern works for some sentences but returns 403 for many — the `/audio/download/<audio_id>` endpoint is the reliable form.

**BR-marker tags** (positive identification of Brazilian Portuguese sentences):
- "Brazilian Portuguese" (110 sentences)
- "Portuguese from Brazil" (35)
- "Brazil" (37)
- "regionalism:Brazil" (3)
- "Brazilian slang" (1), "Brazilian saying" (3), "Brazilian proverb" (1)
Negative marker: "not used in Brazil" (1)

**License:** Tatoeba audio default = CC-BY-NC. Cols 4+5 of `sentences_with_audio.csv` carry per-recording license + attribution_url.

**12 unique `por` audio contributors** (as of 2026-04-29): aleteacher2 (5374), Lemmy (5039), Ricardo14 (3256), Silfarle (3221), alexmarcelo (2804), bill (425), MathKay (383), Voz (251), brauliobezerra (92), ProgAruom (89), eduardacoppo (20), GustaBR (3) = 20,957 total.

**How to apply:** Any task involving Tatoeba data — download these CSVs to `/tmp/tatoeba/` first (not committed to repo, ephemeral). Procedure for full BR-PT harvest is in `git show 4c5a1e2d5c~1:.ikiro/quests/tatoeba-harvest.quest.org` Step 1-3.

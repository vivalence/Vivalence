---
name: release
description: The release changelog — release.md format, the single-change line, cutting a tag-release on GitHub/GitLab over jj. Release is an INTERFACE ledger, not a quest organ — quests feed it, they don't own it.
when_to_use: writing or lifting `* release` lines · seeding/editing root `release.md` · "cut a release" · tagging/prerelease questions · jj bookmark vs tag confusion.
---

# release — the interface ledger

beef: **release is different from quest.** A quest is a decision-trail for a body of WORK; release is the ledger of what a CONSUMER now types differently. Quests FEED release lines through their `* release` organ (methods/quest.md), but the format, the file, and the cut all live here — questless work (compact-provenance) feeds the same file.

beef, verbatim (09-01): *"its time that we start thinking in changelogs. how did the interfaces actually change? something that goes into a release.md. invent this backwards. first find the best format for release.md's changelogs, then define a single change format, then embedd this in the quest format template."*

## Format verdict

(survey, not tour): Keep a Changelog's human-first reverse-chron + `## unreleased` accumulator beats Conventional-Commits-derived logs (commits are not changes — a commit-generated log records the work, not the interface); Rust/Go release notes add the twist that carries: group by SURFACE, lead with migration. Vivalence adaptation: the repo ships flag-days, never deprecation windows (*"entirely. no dual read."*) — `Deprecated` dies, every breaking entry carries `migrate:` instead.

## The file

Repo root `release.md`, reverse-chron; `## unreleased` accumulates, a release cut renames it to `## <version> — <date>` and opens a fresh one (versioning is beef's). Surface sections inside a release, present only when non-empty, fixed order:

```markdown
# release

## unreleased

### cli        (viva verbs, flags, chaining)
### route      (aperture paths, packet/event shapes)
### api        (exported symbols — paladin.*, typology v.*, daemon.*, trait surfaces)
### entity     (schema: entities, columns, traits-enum, manifests)
### env        (variables, strata, files read)
### other      (docs surfaces, install, anything interfaced but unlisted)
```

## The single change format

One line, one interface delta:

```
- <verb> `<surface>` — <what a consumer notices, before → after where it fits> · migrate: <action | none> ⟨<quest-or-compact>⟩
```

- verb ∈ `added · changed · renamed · removed · fixed`, nothing else.
- surface = the exact thing a consumer types or imports (`viva instance/use`, `VIVA_INSTANCE_MOUNT`, `paladin.assign`, `POST /daemon/<d>/entities/mode/update`); `renamed` puts both names in the slot: `` `old` → `new` ``.
- `migrate:` is REAL on every breaking entry — `none` only when additive; a breaking line without one is unfinished.
- ⟨provenance⟩ = quest slug (compact slug for questless work); the WHY lives there, never here.
- One change = one line — a flag-day rename across five homes is still ONE line (the surface is the name, not the homes).

## The pipeline

Quest accrues entries in its `* release` organ (methods/quest.md) → sunset lifts them verbatim into `release.md ## unreleased` (quest-lifecycle organ gate) → beef cuts releases. Reflection sweeps `#+marker_qa` beside it — a `broken` on a released surface is a Callouts entry.

## Cutting a release — GitHub/GitLab over jj

A platform release is an object hung on a **TAG** — markdown body + assets + flags (`--draft` / `--prerelease` / `--latest`). Never a branch: the release UI lists tags only. GitLab is the same shape (release tied to tag; UI/API/`release:` CI job), plus a changelog API that folds commit `Changelog:` trailers — unused here, `release.md` is the source.

**The jj law**: jj cannot CREATE tags — tags are read-only (visible as `tags()` in revsets, imported, never written). A bookmark is a BRANCH: `jj bookmark set v0.1.0` pushed to GitHub yields a branch named v0.1.0 that no release will ever see. Wrong artifact.

**The flow** (all commands beef's via `!` — VCS + `gh` are outward, never mine):

```sh
# tag born SERVER-side — zero local git mutation, the jj-native path
jj git push                                      # the commit must exist on the remote
gh release create v0.1.0 --target <sha> --notes-file notes.md   # gh mints the tag at that sha
# jj re-imports the tag read-only on next fetch. no `git tag` ever runs locally.
```

Colocated escape hatch (`git tag -a v0.1.0 <sha> && git push origin v0.1.0` first) works but touches local git for nothing the server-side path doesn't do.

**Channel naming — two syntaxes that collide**:

```
v0.1.0-alpha.1    git prerelease — semver prerelease TAG, immutable, cut with --prerelease
pkg@alpha         npm dist-tag — registry-side MUTABLE pointer (npm publish --tag alpha)
v0.1.0@alpha      NOT a thing — in jj revsets `@` separates bookmark from REMOTE
                  (`main@origin`), so this parses as "bookmark v0.1.0 on a remote named alpha"
```

Prerelease channel on the git side = `-alpha.N` suffix + `--prerelease` flag; GitHub sorts it under the eventual `v0.1.0` and never marks it latest. `@alpha` lives only in package registries.

**Notes body**: the cut section of `release.md` IS the `--notes-file` — `## unreleased` becomes `## <version> — <date>`, that section's body ships verbatim (surface groups + `migrate:` lines render as-is). `--generate-notes` (PR-derived) stays off — commits record the work, not the interface; that verdict already killed Conventional-Commits logs above.

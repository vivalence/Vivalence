# semantic — the ikiro reference convention (md + org, one syntax)
<!-- writer: agent (human-gated) · limit: 45 lines -->

ONE cross-format link semantic so the whole identity graph is navigable by Obsidian / any open-source markdown tool, and coherent in org.

## the rule

**`[[basename]]`** — double-bracket wikilink, target = the file's basename without extension, unique across `.ikiro/`.

```markdown
[[identity]]            → .ikiro/self/identity.md
[[codemap/kajuit]]      → .ikiro/world/codemap/kajuit.md   (path-qualified when basename could collide)
[[m11_packages.quest]]  → .ikiro/quests/m11_packages.quest.org   (.quest/.orb suffix kept — it's part of the name)
[[corpus-quality-criteria]] → .ikiro/reference/corpus-quality-criteria.md
```

- **resolution**: basename-first (Obsidian's "shortest path when possible"); qualify with the parent dir only on collision.
- **a link that doesn't resolve yet is fine** — it marks a file worth writing (same rule as memory `[[name]]` links; one convention everywhere).
- **display alias**: `[[frontier|the live edge]]` (Obsidian pipe syntax) — use sparingly; the basename is usually the right name.

## in org files

Same token, same rule: write `[[basename]]` bare. Compatibility mechanics:
- org natively parses `[[…]]` as a link (fuzzy target search) — the token renders as a link in every org tool; the *resolution rule* (basename across `.ikiro/`) is ours, declared here.
- an org file MAY add `#+LINK: i ./%s` and write `[[i:self/identity.md]]` when real file-jump navigation is wanted — but the default is the bare wikilink, identical to markdown.
- never use org's `[[file:…][desc]]` long form for ikiro-internal references — it breaks the one-syntax rule; reserve it for external paths.

## frontmatter (the machine-readable layer)

Every self/world file opens with an HTML-comment contract line (markdown) or `#+PROPERTY:` (org):

```markdown
<!-- writer: beef | agent | agent (human-gated) | append-only · limit: N lines -->
<!-- + world files: · derived-from: <paths> · verified: <session> -->
```

Codemap shards additionally carry YAML frontmatter `paths: ["glob/**"]` — the load-gating layer (`.claude/rules` symlink). YAML frontmatter is Obsidian-native; the comment-contract stays invisible in rendered views. Org equivalent: `#+PROPERTY: writer … · limit …`.

## tags (the 128-tag layer)

`#cluster/name` nested tags, AFINN-shaped: every tag carries a signed valence; folds over tags drive the flywheel (severity, session score, escalation weight). Spec + full table: [[tags]]. Callout `family:` ≡ `#fail/<name>` — one taxonomy.

## graph hygiene

- link liberally: every mention of another ikiro artifact IS a `[[link]]` — the graph is the index.
- memory files already use `[[name]]` — same convention, one graph (memory ↔ ikiro links allowed and encouraged).
- the scribe checks new/edited ikiro files for bare mentions that should be links (disintegrate pass).

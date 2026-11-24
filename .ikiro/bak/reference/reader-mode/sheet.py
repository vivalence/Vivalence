# limit: 4000 chars
# reader-mode: builds commons/reader/reader/buffer/reader.css from the comp sheet + the kit rows it uses.
# python3 .ikiro/reference/reader-mode/sheet.py .ikiro/reference/reader-mode/comp/reader.css .ikiro/reference/reader-mode/comp/bundle.css commons/reader/reader/buffer/reader.css
import re, sys
comp, bundle, out = sys.argv[1:4]
DEAD = (".f-original", ".rd-hint", ".rd-dock", ".rd-journal", ".rd-hair", ".rd-cmd", ".rd-speech", ".rd-key", ".rd-sc ",
        ".rd-pos", ".mov", ".bid", ".blk:hover .bid", ".sen", ".act.from", ".f-reader .emb", ".f-reader .kicker",
        ".f-reader .media", ".media", "figcaption .fk", ".rd-empty .line", ".rd-empty .kinds", ".kit-dot.rd-busy",
        ".rd-root { min-height: 0; }", ".f-reader .k-image")
ROOT = ".rd-root { height: 100vh; min-height: 640px; display: flex; flex-direction: column; overflow: hidden; }"
rows = []
for row in open(comp).read().split("\n"):
    bare = row.strip()
    if bare.startswith(DEAD):
        continue
    if bare == ROOT:
        rows.append(":host { flex: 1; min-height: 0; display: flex; flex-direction: column; }")
        rows.append(".rd-root { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; container-type: inline-size; background: var(--surface); color: var(--text-ink); font-family: var(--font-family-sans-text); }")
        continue
    rows.append(row.replace("@media (max-width: 720px)", "@container (max-width: 720px)"))
text = "\n".join(rows)
assert ":host" in text and text.count("@container (max-width: 720px)") == 2, "anchors moved"
text = re.sub(r"\n{3,}", "\n\n", text)
OURS = """
.kit-dot.rd-busy { animation: rd-pulse 600ms ease-in-out infinite; }
a.src { text-decoration: none; }
a.src:hover { color: var(--text-link); text-decoration: underline; }
@container (min-width: 721px) { .rd-rail { min-height: 0; overflow: hidden; } .rd-cell { flex: 0 1 7px; min-height: 2px; } .rd-rail .lbl { flex: none; white-space: nowrap; } }
.blk.is-drag { touch-action: none; }
.blk :where(p, ul, ol, pre, figure, blockquote, table, div, section, h1, h2, h3, h4, h5, h6) + :where(p, ul, ol, pre, figure, blockquote, table, div, section, h1, h2, h3, h4, h5, h6) { margin-top: 1.1em; }
.blk img { display: block; max-width: 100%; height: auto; border-radius: var(--shape-radius-md); }
.blk pre { overflow-x: auto; padding: var(--size-space-sm); background: var(--surface-sunk); border-radius: var(--shape-radius-md); font-family: var(--font-family-code); font-size: .8em; line-height: 1.5; }
.blk code { font-family: var(--font-family-code); font-size: .9em; color: var(--text-code); }
.blk a { color: var(--text-link); }
.blk a:hover { color: var(--text-strong); }
.f-reader :is(h3, h4, h5, h6) { font-weight: 700; font-size: 1em; line-height: 1.4; color: var(--text-header); }
.f-reader .k-image { margin-top: 1.8em !important; margin-bottom: .6em; }
.f-original { height: 100%; background: var(--surface-sunk); }
.f-original iframe { display: block; width: 100%; height: 100%; border: 0; color-scheme: light; background: Canvas; }
.rd-step-row.is-failed .n, .rd-step-row.is-failed .v { color: var(--signal-negative-ink); }
"""
KIT = (".kit-label ", ".kit :focus-visible", ".kit button", ".kit-seg {", ".kit-seg:hover", ".kit-seg[aria-expanded", ".kit-seg.is-off",
       ".kit-dot {", ".kit-dot.is-healthy", ".kit-dot.is-running", ".kit-dot.is-fault", ".kit-meter", ".kit-choice",
       ".kit-field {", ".kit-field:focus-within", ".kit-field.is-repl", ".kit-field input", ".kit-field .p",
       "@media (prefers-reduced-motion: reduce) { .kit *")
kit = [row for row in open(bundle).read().split("\n") if row.startswith(KIT)]
assert len(kit) == 25, len(kit)
open(out, "w").write(text.rstrip("\n") + "\n" + OURS + "\n" + "\n".join(kit) + "\n")
print(len(text), len(kit))

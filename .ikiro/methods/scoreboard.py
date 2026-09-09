"""scoreboard — fold the Callouts ledger by family. Prints the family · n · entries columns.

    python3 .ikiro/methods/scoreboard.py            # the fold
    python3 .ikiro/methods/scoreboard.py --unmapped # entries no tag and no MAP row classify

n counts `###` headings under `## Callouts`. An entry classifies by its own `family:` tag (ALIAS folds
tag spellings onto board families); entries without a tag classify by MAP, keyed on the heading's first
40 chars. NON_INCIDENT lists headings that are notes, not corrections. The rule/rung/status columns are
judgment and stay hand-written in zettelkasten.md; these three columns are derived and must match.
"""
import re, sys, collections

P = "/Users/finn/vivalence/code/vivalence/.ikiro/zettelkasten.md"

ALIAS = {
    "overconfidence": "assume-dont-verify", "grep-before-propose": "assume-dont-verify",
    "tests-are-the-law": "assume-dont-verify", "no": "assume-dont-verify",
    "legibility": "yap-wrong-artifact", "communication": "yap-wrong-artifact",
    "container-rooted-paths": "yap-wrong-artifact", "code-heavy-answers": "yap-wrong-artifact",
    "report-frame": "yap-wrong-artifact", "codeword": "yap-wrong-artifact",
    "delegation-scope": "scope-inflation", "propose": "scope-inflation",
    "flywheel": "invented-state-optionality", "same": "imperative-js-reflex",
    "path-frame-guessed": "pin-ontology-before-naming",
    "process": "harness-friction", "ambiguity": "user-intent-drift",
    "print-both-paths-before-the-ledger-moves": "user-intent-drift",
    "callout": None, "correction": None,
}
PRIMARY = ["assume-dont-verify", "yap-wrong-artifact", "scope-inflation", "user-intent-drift",
           "assert-without-showing", "pin-ontology-before-naming", "consumer-side-patch"]

MAP = {
    "summarized data Finn asked to READ": "yap-wrong-artifact",
    "ran `git mv` (VCS write, FORBIDDEN)": "vcs-write-reflex",
    "wrote the bare-token-grep rule, then": "rule-not-self-applied",
    "claimed \"live grep clean\" after a scoped": "premature-completion",
    "patched the view (liveBuffer derive)": "consumer-side-patch",
    "omitted the `branch` function from a": "yap-wrong-artifact",
    "over-engineered the connection trie": "over-abstraction",
    "deleted Finn's console.logs + comments": "deleted-beef-content",
    "loaded all memories to client + invented": "consumer-side-patch",
    "intermediary-context locals + frankenstein": "imperative-js-reflex",
    "optionality ladder for `label`": "invented-state-optionality",
    "`Terminals extends LocalRepository`": "over-abstraction",
    "manual subscribe→mirror→teardown": "imperative-js-reflex",
    "comment-essays + helper indirection": "comment-litter",
    "invented a `daemon.alive` status flag": "invented-state-optionality",
    "patched around the hooks instead of": "hotfix-cascade",
    "thrashed CSS positioning instead of": "hotfix-cascade",
    "hand-padded columns inside code blocks": "yap-wrong-artifact",
    "kept shipping prose/diagrams/option-menus": "yap-wrong-artifact",
    "yapped completeness instead of answering": "yap-wrong-artifact",
    "deleted commented-out backup code during": "deleted-beef-content",
    "date-stamped compact filename + body": "compact-date-discipline",
    "hand-rolled variantManifest + compose": "imperative-js-reflex",
    "kept coding ghost install/list/show": "premature-convergence",
    "manual nested loops + closure-captured": "imperative-js-reflex",
    "fabricated `v.object({}).passthrough()`": "assume-dont-verify",
    "fabricated `import { emitter as survival": "assume-dont-verify",
    "yapped fix in prose instead of showing": "yap-wrong-artifact",
    "added `peers: [...]` to dewey manifest": "manifest-extension",
    "trailing question on every single response": "yap-wrong-artifact",
    "proposed hardcoded mode manifest config": "manifest-extension",
    "confused service type with faculty type": "assume-dont-verify",
    "built Mic with panel as owner instead of": "assume-dont-verify",
    "proposed map-of-factories for tools when": "assume-dont-verify",
    "wrote a date-specific compact instead of": "compact-date-discipline",
    "unauthorized `jj rebase` + cascading": "vcs-write-reflex",
    "implementation-detail noise during cluster": "yap-wrong-artifact",
    "word salad (\"trait = data\", \"file =": "yap-wrong-artifact",
    "code snippet without filepath; user has": "yap-wrong-artifact",
    "fabricated \"A1 syncretic convention\"": "strawman-constraint",
    "composing conjugation entries against": "assume-dont-verify",
    "the mode reached across the registry for": "relative-import-reflex",
    "prose in table cells, twice in one quest": "yap-wrong-artifact",
    "a bundler rule keyed on one subsystem's": "parochial-rule",
    "a status update in quest shorthand": "yap-wrong-artifact",
    "a boot debug log printed a live API key": "privacy-leak",
    "\"what line broke where???? show. me. my.": "yap-wrong-artifact",
    "defensive optional chaining reads as doubt": "invented-state-optionality",
    "a regex cut a comma-grouped CSS rule and": "substitution-unverified",
    "three complaints, one declaration block": "hotfix-cascade",
    "prove a trait from the route it causes,": "assume-dont-verify",
    "twice reported a quest edit that was never": "report-without-doing",
    "a directory around each file is a rename,": "taxonomy-before-content",
    "a clean compile says nothing about what": "assume-dont-verify",
    "a sequencing instruction is an instruction": "user-intent-drift",
    "do not name a local after an ambient global": "pin-ontology-before-naming",
    "registration order is not execution order": "assume-dont-verify",
    "a content grep is not an existence check": "assume-dont-verify",
    "the archive answers questions the code": "assume-dont-verify",
    "a conditional in a shared trait is a design": "over-abstraction",
    "the ubuntu walk — `mounted()`: a bare verb": "pin-ontology-before-naming",
    "naive substitution, twice in one session": "substitution-unverified",
    "fat inline docs, whole session": "comment-litter",
}
NON_INCIDENT = ["STANDING CONSTRAINT (not an incident)", "the render harness — verify a Svelte view"]

FAM = re.compile(r"family(?:`?:`?\s*`?|\s+`)([a-z][a-z0-9-]+)")

def entries():
    lines = open(P, encoding="utf-8").read().split("\n")
    start = next(i for i, l in enumerate(lines) if l.startswith("## Callouts"))
    out, cur = [], None
    for i, l in enumerate(lines[start:], start):
        if l.startswith("### "):
            cur = {"line": i + 1, "head": l[4:], "body": []}
            out.append(cur)
        elif cur is not None:
            cur["body"].append(l)
    for e in out:
        body = "\n".join(e["body"])
        d = re.search(r"(20\d\d-)?(\d\d-\d\d)", e["head"])
        e["id"] = d.group(2) if d else f"#{e['line']}"
        tags = list(FAM.findall(e["head"] + "\n" + body))
        m = re.search(r"RULE FAILURE \(([a-z][a-z0-9-]+)", e["head"])
        if m: tags.insert(0, m.group(1))
        m = re.search(r"Classification\*\*:\s*`?([a-z][a-z0-9-]+)", body)
        if m: tags.append(m.group(1))
        tags = [ALIAS.get(t, t) for t in tags]
        tags = [t for t in tags if t]
        fam = next((t for t in PRIMARY if t in tags), tags[0] if tags else None)
        for k, v in MAP.items():
            if k in e["head"]: fam = v
        if any(n in e["head"] for n in NON_INCIDENT): fam = "-"
        e["family"] = fam
        del e["body"]
    return out

def main():
    es = entries()
    if "--unmapped" in sys.argv:
        for e in es:
            if e["family"] is None: print(e["line"], e["head"][:90])
        return
    by = collections.defaultdict(list)
    for e in es:
        by[e["family"] or "?"].append(e["id"])
    incidents = sum(len(v) for k, v in by.items() if k != "-")
    print(f"headings {len(es)} = incidents {incidents} + non-incident {len(by.get('-', []))}")
    for fam, ids in sorted(by.items(), key=lambda kv: -len(kv[1])):
        c = collections.Counter(ids)
        cell = " · ".join(f"{k} ×{n}" if n > 1 else k for k, n in sorted(c.items()))
        print(f"| {fam} | {len(ids)} | {cell} |")

if __name__ == "__main__":
    main()

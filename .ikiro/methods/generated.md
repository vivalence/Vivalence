# method: generated — parsing is not verification

**Constraint.** Any code produced by substitution — a generator, a bulk `sed`, a `.replace()` over a
template — is unverified until the identifiers that must survive have been counted in the output.
`deno check` passing is not evidence.

## the two failures, one session apart

```
①  slice(probe_start → PINHOLE)     took `usable` with it, because an earlier insert had moved it
②  .replace("D", "${")              ate every uppercase D in the file
```

② produced three corruptions. One crashed the runtime loudly. One was cosmetic. **One parsed
cleanly and was silent**: `traits: ["ATTACHED"]` became `traits: ["ATTACHE${"]`, so the client
would have booted unattached with nothing anywhere to say so.

That is the whole lesson. The loud one costs minutes. The silent one is the reason this file exists.

## the rules

1. **A placeholder must be impossible in the content.** `@@SLOT@@`, never `D`, never `KEY`, never a
   bare word. If the token could occur in real code, it will.
2. **Anchor by uniqueness, not position.** Never slice `start → end` across a region that another
   edit may have moved into.
3. **Count what must survive.** After the write, grep the output for the identifiers the template
   promised — trait names, key names, exported symbols — and assert the counts.

## the check — run it before reporting any generated file

```sh
# every word the template was supposed to emit, counted in the output
for w in ATTACHED DEEPGRAM ANTHROPIC; do
  printf '%-12s %s\n' "$w" "$(grep -ho "$w" <files> | wc -l)"
done
# and every interpolation, against the whitelist of the ones you meant
grep -oh '\${[^}]*}' <files> | sort -u
```

A stray `${` outside a known list is the signature of a substitution that overreached.

Related: [[thin]] — the other rule this session broke twice before it was named.

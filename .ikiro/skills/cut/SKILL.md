---
name: cut
description: Cut a release. Hold its scope as measures, run the census over every member and both registries, drain the ledger under the version, hand him the tag and the publish.
when_to_use: >-
  "cut" · "cut a release" · "release cutting" · "plan the release" · "whats in scope" of a release ·
  "are we ready to release" · "publish to jsr" · "publish to npm" · a file under `.ikiro/cut/` is open
---
<!-- limit: 4200 chars -->
# cut — a release is a version, a scope that is measured, and a ledger drained under it

## what a cut holds

One file per release: `.ikiro/cut/<version>.org`.

```org
#+title: cut <version> — <one line>
#+status: <one line: what is true now>

* intent     his words, verbatim
* scope      a table: the item, its measure, the number now, the number owed
* census     a table: member, jsr, npm. The reds under it, each its first error row
* rulings    a table: his words, the state
* never      what was ruled out of this release
* next       one line
```

- States: `DECLARED` · `GREEN` · `CUT` · `PUBLISHED`.
- A scope item is what a consumer installs or opens. Its measure is a command over the whole tree.
- An item without a measure is listed and not counted.
- A number in the file is that command's output, pasted the turn it ran.
- The design of an item lives in its quest. The cut names the quest, never its code.
- A cut is never deleted. A release that did not happen keeps its file and says so in `#+status`.

## the census

A member is green on a registry when its dry run exits 0. It runs from each member, publishes nothing, writes nothing.

```sh
R=/Users/finn/vivalence/code/vivalence
for m in subsystems/typology subsystems/paladin subsystems/dapper subsystems/drapes \
  subsystems/sheets systems/runtime systems/ghost systems/anima; do
  (cd $R/$m && deno publish --dry-run --allow-dirty --no-lock >/dev/null 2>&1); jsr=$?
  (cd $R/$m && deno pack --dry-run --allow-dirty >/dev/null 2>&1); npm=$?
  printf '%s\t%s\t%s\n' "$m" "$jsr" "$npm"
done
```

- A red is read whole from the member, never from its last row.
- `--allow-slow-types` turns no red green. It ships a tarball without declaration files.
- A member that does not ship says `"publish": false` in its own `deno.jsonc`. The census skips nothing by a list.
- The census runs again after every land in a member that is in scope.

## the cut

In this order. Each step is his `go`.

1. Every member in scope is green on both registries. Every suite of those members ran on the tree.
2. Every scope item reads its owed number.
3. The ledger: the rows of `## unreleased` in `.ikiro/release.md` move under `## <version>`. One heading per surface. No row is reworded.
4. The version is written where the tree reads it.
5. I hand him the commands: the tag, then the registry that refuses more, then the other. He runs them.
6. Both registries answer the version for every member. Then the file says `PUBLISHED`.

- A published version cannot be taken back or published twice. A dry run of both registries passes before the first real one.
- Half published: the file says which member answers on which registry. The missing half is finished at the same version.
- A tag, a push and a publish are his hands.
- No token on this machine. A registry is reached from the pipeline.

## what stays elsewhere

- A ledger row is written when its interface changes: skill `quest`.
- A defect a census finds outside the scope goes to `.ikiro/known-issues.org`.
- A deploy of the images is not a cut: skill `ops`.

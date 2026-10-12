#!/bin/sh
# usage: oldtree.sh <rev> <path> <dest> — materialize <path> at <rev> under <dest> with ls-tree + show (read-only VCS)
rev="$1"; path="$2"; dest="$3"
cd "${CLAUDE_PROJECT_DIR:-/Users/finn/vivalence/code/vivalence}" || exit 1
git ls-tree -r --name-only "$rev" -- "$path" | while IFS= read -r f; do
  mkdir -p "$dest/$(dirname "$f")"
  git show "$rev:$f" > "$dest/$f"
done

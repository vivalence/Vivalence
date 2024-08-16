#!/bin/bash

# Set the path to your monorepo
REPO_PATH="/Users/finn/vivalence/code/vivalence"

# Run cloc with exclusions
cloc "$REPO_PATH" \
  --exclude-dir=node_modules,.testing,.git,bak.user,.svelte-kit,.vite \
  --exclude-ext=lock,svg,ico,otf \
  --ignore-case \
  --ignore-whitespace \
  --skip-uniqueness

# If you want to save the output to a file, uncomment the following line:
# cloc "$REPO_PATH" [options] > line_count_report.txt

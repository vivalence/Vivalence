#!/bin/bash
# plants the designer's comp beside hello-world's App.svelte — its own hexes and font, a sample data block
repo=${1:?usage: setup.sh <repo-copy>}
python3 - "$repo/commons/instances/hello-world/app/Badge.dc.html" <<'PY'
import sys
path = sys.argv[1]
comp = """<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Badge - handoff v2</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 48px; background: #F4E9D8; font-family: "Instrument Serif", serif; }
  .badge { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px; border-radius: 999px; background: #1F2A44; color: #F4E9D8; font-size: 15px; letter-spacing: 0.02em; box-shadow: 0 1px 0 #C9A96E inset; }
  .badge .dot { width: 8px; height: 8px; border-radius: 50%; background: #C9A96E; }
  .badge .count { font-variant-numeric: tabular-nums; opacity: 0.8; }
</style>
</head>
<body>
<div class="badge"><span class="dot"></span><span class="label">attached</span><span class="count">3</span></div>
<script type="application/json" id="sample">{ "label": "attached", "count": 3 }</script>
</body>
</html>
"""
open(path, "w", encoding="utf-8").write(comp)
PY

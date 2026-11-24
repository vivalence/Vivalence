#!/bin/sh
# m73 patch 1 — the four OFL families of porcelain and datasette, from google/fonts.
# run from the repo root; writes systems/anima/static/fonts/<family>/
set -e
B=https://raw.githubusercontent.com/google/fonts/main/ofl
F=systems/anima/static/fonts
get() { mkdir -p "$(dirname "$2")"; curl -sSfL --globoff "$1" -o "$2"; printf "%8s  %s\n" "$(wc -c < "$2" | tr -d ' ')" "$2"; }
get "$B/ibmplexsans/IBMPlexSans%5Bwdth,wght%5D.ttf" "$F/IBM Plex Sans/IBMPlexSans-VariableFont_wdth,wght.ttf"
get "$B/ibmplexsans/IBMPlexSans-Italic%5Bwdth,wght%5D.ttf" "$F/IBM Plex Sans/IBMPlexSans-Italic-VariableFont_wdth,wght.ttf"
get "$B/ibmplexsans/OFL.txt" "$F/IBM Plex Sans/OFL.txt"
for weight in Regular Medium SemiBold; do get "$B/ibmplexmono/IBMPlexMono-$weight.ttf" "$F/IBM Plex Mono/IBMPlexMono-$weight.ttf"; done
get "$B/ibmplexmono/OFL.txt" "$F/IBM Plex Mono/OFL.txt"
for weight in Regular Bold; do get "$B/spacemono/SpaceMono-$weight.ttf" "$F/Space Mono/SpaceMono-$weight.ttf"; done
get "$B/spacemono/OFL.txt" "$F/Space Mono/OFL.txt"
get "$B/vt323/VT323-Regular.ttf" "$F/VT323/VT323-Regular.ttf"
get "$B/vt323/OFL.txt" "$F/VT323/OFL.txt"

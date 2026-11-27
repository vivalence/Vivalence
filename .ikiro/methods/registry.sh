#!/bin/sh
R=registry.vivalence.org
date "+%H:%M:%S"
for image in viva runtime anima documentation; do
  repo="beef/viva/vivalence/$image"
  token=$(curl -s --max-time 20 "https://git.vivalence.org/jwt/auth?service=container_registry&scope=repository:$repo:pull" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
  for tag in "$@"; do
    out=$(curl -s --max-time 20 -o /dev/null -D - -H "Authorization: Bearer $token" \
      -H "Accept: application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json, application/vnd.docker.distribution.manifest.list.v2+json" \
      "https://$R/v2/$repo/manifests/$tag")
    code=$(printf "%s" "$out" | head -1 | awk '{print $2}')
    digest=$(printf "%s" "$out" | tr -d '\r' | awk 'tolower($1)=="docker-content-digest:"{print $2}')
    printf "%-14s %-12s %s %s\n" "$image" "$tag" "$code" "$digest"
  done
done

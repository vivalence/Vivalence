#!/bin/bash
echo "## kernel $(uname -r) · up $(uptime -s) · docker $(docker version --format '{{.Server.Version}}') · state $(systemctl is-system-running)"
[ -f /var/run/reboot-required ] && echo "## REBOOT STILL REQUIRED" || echo "## reboot-required: none"
if [ -n "${1:-}" ]; then echo "## post hook"; bash -c "$1"; fi
for i in $(seq 1 30); do
  bad=$(docker ps -a --format '{{.Names}} {{.Status}}' | grep -vcE ' Up ')
  starting=$(docker ps -a --format '{{.Status}}' | grep -c 'starting')
  [ "$bad" = 0 ] && [ "$starting" = 0 ] && break
  sleep 10
done
echo "## containers (not up: $bad · starting: $starting)"; docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Image}}' | cut -c1-130
echo "## failed units"; systemctl --failed --no-legend | head -5
echo "## proxy $(docker inspect coolify-proxy -f '{{.Config.Image}}' 2>&1) · provider errors: $(docker logs coolify-proxy 2>&1 | grep -ciE 'too old|provider error')"
echo "## rkhunter"; rkhunter --check --sk --nocolors --rwo; echo "rkhunter rc=$?"
echo "## lynis"; lynis audit system --quick --no-colors > /dev/null 2>&1
grep -E '^hardening_index=' /var/log/lynis-report.dat
echo "warnings: $(grep -c '^warning\[\]' /var/log/lynis-report.dat) · suggestions: $(grep -c '^suggestion\[\]' /var/log/lynis-report.dat)"
grep '^warning\[\]' /var/log/lynis-report.dat | cut -d= -f2 | cut -d'|' -f1,2 | cut -c1-150
df -h / | tail -1

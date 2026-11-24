#!/bin/bash
# usage: cycle.sh assess|patch|reboot|check <root@ip> <identity file> [hook]
verb=$1; host=$2; id=$3; hook=${4:-}
D=$(cd "$(dirname "$0")" && pwd)
OUT=$HOME/.viva/bak/prod/servers-$(date +%Y%m%d)
O="-o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes -o ControlPath=none -o ServerAliveInterval=15 -i $id"
S="ssh $O $host"
name=$($S hostname) || { echo "ABORT: no ssh"; exit 1; }
mkdir -p "$OUT"
echo "=== $verb $name $(date +%T)"

case $verb in
  assess)
    $S 'bash -s' < "$D/assess.sh" 2>&1 | tee "$OUT/$name-assess.out"
    ;;
  patch)
    $S 'mkdir -p /run/servers && rm -f /run/servers/patch.rc' || exit 1
    scp -q $O "$D/patch.sh" $host:/run/servers/patch.sh || exit 1
    $S "nohup setsid bash /run/servers/patch.sh $(printf %q "$hook") >/dev/null 2>&1 < /dev/null &"
    for i in $(seq 1 180); do
      $S 'test -f /run/servers/patch.rc' 2>/dev/null && break
      sleep 10
    done
    $S 'cat /run/servers/patch.log' | tee "$OUT/$name-patch.log"
    $S 'cat /run/servers/upgrade.log' > "$OUT/$name-upgrade.log" 2>/dev/null
    rc=$($S 'cat /run/servers/patch.rc')
    echo "=== patch rc=$rc"
    [ "$rc" = 0 ] || exit 2
    ;;
  reboot)
    if $S "docker ps --format '{{.Image}}' | grep -qi coolify-helper"; then
      echo "ABORT: a Coolify deploy is in flight"
      exit 4
    fi
    boot0=$($S cat /proc/sys/kernel/random/boot_id) || exit 1
    $S 'systemctl reboot' 2>/dev/null
    sleep 20
    for i in $(seq 1 90); do
      b=$($S cat /proc/sys/kernel/random/boot_id 2>/dev/null)
      [ -n "$b" ] && [ "$b" != "$boot0" ] && break
      sleep 8
    done
    [ -n "$b" ] && [ "$b" != "$boot0" ] || { echo "ABORT: host not back after reboot"; exit 3; }
    echo "=== back $(date +%T) boot $b"
    ;;
  check)
    $S "bash -s $(printf %q "$hook")" < "$D/check.sh" 2>&1 | tee "$OUT/$name-check.out"
    ;;
  *)
    echo "usage: cycle.sh assess|patch|reboot|check <root@ip> <identity file> [hook]"
    exit 64
    ;;
esac
echo "=== done $(date +%T)"

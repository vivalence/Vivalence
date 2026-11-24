#!/bin/bash
D=/run/servers
exec > $D/patch.log 2>&1
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a NEEDRESTART_SUSPEND=1 APT_LISTCHANGES_FRONTEND=none
APT="apt-get -o DPkg::Lock::Timeout=600 -y -o Dpkg::Options::=--force-confdef -o Dpkg::Options::=--force-confold"
rc=0
echo "## start $(date -Is) kernel $(uname -r) docker $(docker version --format '{{.Server.Version}}')"
echo "## pre hook"; if [ -n "${1:-}" ]; then bash -c "$1" || rc=11; fi
echo "## vacuum"; journalctl --vacuum-size=200M 2>&1 | tail -1
if [ $rc = 0 ]; then
  echo "## update"; $APT update -q | tail -2 || rc=12
fi
if [ $rc = 0 ]; then
  echo "## full-upgrade"; $APT full-upgrade > $D/upgrade.log 2>&1 || rc=13
  tail -4 $D/upgrade.log
fi
if [ $rc = 0 ]; then
  echo "## autoremove"; $APT autoremove --purge 2>&1 | tail -2
  apt-get clean
fi
echo "## still upgradable: $(apt list --upgradable 2>/dev/null | grep -c upgradable)"
echo "## dpkg audit: $(dpkg --audit | wc -l) rows"
echo "## reboot required: $([ -f /var/run/reboot-required ] && echo YES || echo no)"
echo "## docker now $(docker version --format '{{.Server.Version}}' 2>&1)"
df -h / | tail -1
echo "## end $(date -Is) rc=$rc"
echo $rc > $D/patch.rc

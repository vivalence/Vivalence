---
name: servers
description: >-
  Maintain the four Coolify hosts as root through `cycle.sh` — assess (os · machine · utilization · docker ·
  security), prune, patch, reboot, check — one verb per go; every pass READS rkhunter's nightly log and
  lynis, because nothing on a host mails anyone.
when_to_use: >-
  "go through my 4 vivalence coolify servers" · "security and state assessment" · "any maintainance to be
  done?" · "software updates?" · "update packages." · "where should we prune disk" · "should we run some
  security?" · "we end on reboot." · "run the entire cycle" · a host disk over 70% · a kernel waiting on a
  reboot · before touching sshd, fail2ban, ufw or the proxy image on a host · a month since the last pass.
---
<!-- limit: 6000 chars -->
# servers — the four hosts: assess · prune · patch · reboot · check

/"go through my 4 vivalence coolify servers. ssh into them. do a short security and state assessment. come back."/ · /"look at os, machine, utilization, docker"/ · /"we end on reboot."/ · /"yes but you have to remember it. add a server maintainance skill"/ — rkhunter runs nightly and mails nobody: THIS skill is its reader.

I000 (Coolify) · S000 (anima · GitLab runner) · R000 (prod runtime) · O000 (GitLab): `root@<ip>` + identity file = memory `prod-runtime-host`, never this tree. **A host limit is a probe**: root ssh WORKS (REJECTED 11-12 "needs your sudo", unprobed).

## the pass

```sh
# .ikiro/skills/servers/cycle.sh — bash, one host per call
C=.ikiro/skills/servers/cycle.sh
bash $C assess root@<ip> <identity>
bash $C patch  root@<ip> <identity> '<pre hook>'
bash $C reboot root@<ip> <identity>
bash $C check  root@<ip> <identity> '<post hook>'
```

- `assess` is read-only and free. Prune · `patch` · `reboot` · a config change = HIS go, each.
- output tees to `~/.viva/bak/prod/servers-<YYYYMMDD>/`; on the host only `/run/servers/`, gone at reboot. Nothing lands in `/root/`.
- order R000 · S000 · O000 · **I000 LAST**: Coolify drives the others.
- R000 before `patch`: the mountpoint tarball (skill `ops`, Phase 1) — safety, apt does not need it.
- O000 hooks: a hand-stopped `unless-stopped` container STAYS down.

```sh
# O000
bash $C patch root@<ip> <identity> 'docker stop -t 180 <gitlab container>'
bash $C check root@<ip> <identity> 'docker start <gitlab container>'
```

- **`reboot` refuses under a Coolify deploy** and waits for a NEW `boot_id`; read the frontier for a sibling's deploy too (11-12: S000 rebooted 22:02:44 UNDER the anima deploy).

```sh
# .ikiro/skills/servers/cycle.sh:31
    if $S "docker ps --format '{{.Image}}' | grep -qi coolify-helper"; then
      echo "ABORT: a Coolify deploy is in flight"
```

- a long remote step runs DETACHED with an rc file (11-12: S000's session dropped mid-phase).

```sh
# .ikiro/skills/servers/cycle.sh:19
    $S "nohup setsid bash /run/servers/patch.sh $(printf %q "$hook") >/dev/null 2>&1 < /dev/null &"
```

## reading `assess` — the 11-13 floor

| | I000 | S000 | R000 | O000 |
|---|---|---|---|---|
| disk used % | 11 | 36 | 9 | 59 |
| lynis index | 68 | 69 | 69 | 70 |
| rkhunter warnings | 0 | 0 | 0 | 0 |

All four: Ubuntu 24.04 · kernel `6.8.0-149` (+ `-111` kept) · Docker 29.9.3 · `traefik:v3.6.1` · 4 vCPU · 7.5 GB · 75 GB · no swap; O000 is the tight one.

- **rkhunter**: `warnings in log` above 0 = something CHANGED — the three stock ones are allow-listed. Quote each to him; never allow-list on my own.

```
# /etc/rkhunter.conf.local (O000: prohibit-password)
ALLOW_SSH_ROOT_USER=without-password
ALLOWHIDDENFILE=/etc/.resolv.conf.systemd-resolved.bak
ALLOWHIDDENFILE=/etc/.updated
# /etc/default/rkhunter
CRON_DAILY_RUN="true"
APT_AUTOGEN="true"
REPORT_EMAIL=""
```

- nightly on each host: `lynis.timer` 00:00 · rkhunter 06:25 (first run 11-13: 0 warnings); `assess` reads both fresh.
- `rkhunter --config-check` rc 1 = the package's `WEB_CMD="/bin/false"`, not a fault.
- lynis false: `PKGS-7388` (deb822 sources) · `DEB-0810` (`apt-listbugs` has no Ubuntu candidate) · `TIME-3185` while `timedatectl` says `NTPSynchronized=yes`. Kept by ruling: I000 `AllowTcpForwarding local`.
- `distro-info` · `python3-distro-info` upgradable = phased, not stuck.
- `Automatic-Reboot unset`: unattended-upgrades patches, never reboots — a waiting kernel is THIS pass's.

## prune — where

`docker system df` first. Dangling volumes: LIST them, his word per volume (11-12 /"delete"/ · /"trash"/). `docker builder prune -f` on a host is fine. A `.bak` under `/data/coolify/**`: copy to `~/.viva/bak/prod/<slug>-<YYYYMMDD>/` first (skill `readme`). `patch` vacuums the journal to 200M and purges removed kernels.

## a config change on sshd — drop-in, self-reverting

```sh
# on the host; then a FRESH login, then stop the timer
F=/etc/ssh/sshd_config.d/10-hardening.conf
systemd-run --quiet --unit=sshd-revert --on-active=240 /bin/sh -c "sed -i '/^<Key>/d' $F; systemctl reload ssh"
echo '<Key> <value>' >> $F
sshd -t && systemctl reload ssh
systemctl stop sshd-revert.timer
```

Proof before the stop: root + `beef` alias logins with `-o ControlPath=none`, and Coolify's SERVER key from inside `coolify` to all four (REJECTED 11-12 looping every stored key: failed root logins from I000). His aliases offer ONE key under `MaxAuthTries 3`: an agent holding more needs `IdentitiesOnly yes`.

## traps

- the Mac's network answers EVERY TCP connect: a port probe carries a CONTROL port (REJECTED 11-12 a false "open ports" list).
- ufw does not gate docker-published ports (`DOCKER-USER rules: 0`); the provider firewall is the gate, unread.
- a Docker major bump can orphan the proxy (29 refuses `traefik:v3.1`, API 1.24). The proxy image lives in Coolify's db AND the compose file; a recreated proxy re-joins each service network by hand — memory `prod-runtime-host`.
- fail2ban (normal mode) does not count failed publickey logins.
- zsh never word-splits `$K`: a driver is a bash FILE (REJECTED 11-12 twice).

Open tails: known issue `prod-hosts-tails`.

---
name: servers
description: Maintain the four Coolify hosts as root. Assess, prune, patch, reboot, check. One step per go.
when_to_use: >-
  "go through my 4 vivalence coolify servers" · "security and state assessment" · "any maintainance to be done?" ·
  "software updates?" · "update packages." · "where should we prune disk" · "we end on reboot." · "run the entire cycle"
---
<!-- limit: 4800 chars -->
# servers — the four hosts

I000 (Coolify) · S000 (anima, GitLab runner) · R000 (prod runtime) · O000 (GitLab).

The addresses and the identity file are in memory `prod-runtime-host`, never in this tree. Root ssh works.

Nothing on a host mails anyone. This pass is the only reader of the nightly rkhunter and lynis logs.

## the pass

```sh
C=.ikiro/skills/servers/cycle.sh
bash $C assess root@<ip> <identity>
bash $C patch  root@<ip> <identity> '<pre hook>'
bash $C reboot root@<ip> <identity>
bash $C check  root@<ip> <identity> '<post hook>'
```

- `assess` is read-only and free. Prune, `patch`, `reboot` and any config change each need his `go`.
- Output is saved to `~/.viva/bak/prod/servers-<date>/`.
- Order: R000, S000, O000, then I000 last. Coolify drives the others.
- R000 before `patch`: take the mountpoint snapshot (skill `ops`).
- O000 stops GitLab before the patch and starts it after:

```sh
bash $C patch root@<ip> <identity> 'docker stop -t 180 <gitlab container>'
bash $C check root@<ip> <identity> 'docker start <gitlab container>'
```

- `reboot` refuses while a Coolify deploy runs. Check that no other session is deploying.

## reading `assess`

The floor, all four healthy:

```
                    I000  S000  R000  O000
disk used %           11    36     9    59
lynis index           68    69    69    70
rkhunter warnings      0     0     0     0
```

All four: Ubuntu 24.04, Docker 29, 4 vCPU, 7.5 GB, 75 GB, no swap. O000 is the tight one.

- rkhunter warnings above 0: something changed. Quote each to him. Never allow-list on my own.

```
# /etc/rkhunter.conf.local
ALLOW_SSH_ROOT_USER=without-password
ALLOWHIDDENFILE=/etc/.resolv.conf.systemd-resolved.bak
ALLOWHIDDENFILE=/etc/.updated
# /etc/default/rkhunter
CRON_DAILY_RUN="true"
APT_AUTOGEN="true"
REPORT_EMAIL=""
```

- `rkhunter --config-check` exits 1 because of the package default. Not a fault.
- Lynis false alarms: `PKGS-7388`, `DEB-0810`, `TIME-3185`.
- Unattended upgrades patch but never reboot. A waiting kernel is this pass's job.

## prune

- `docker system df` first.
- Dangling volumes are listed. He rules each one.
- `docker builder prune -f` on a host is fine.
- A `.bak` under `/data/coolify/` is copied to `~/.viva/bak/prod/` before it goes.

## an sshd change: a drop-in that reverts itself

```sh
F=/etc/ssh/sshd_config.d/10-hardening.conf
systemd-run --quiet --unit=sshd-revert --on-active=240 /bin/sh -c "sed -i '/^<Key>/d' $F; systemctl reload ssh"
echo '<Key> <value>' >> $F
sshd -t && systemctl reload ssh
systemctl stop sshd-revert.timer
```

Before stopping the timer: a fresh root login works, his alias login works, and Coolify's server key reaches all four.

## traps

- This Mac's network answers every TCP connect. A port probe needs a control port to compare with.
- ufw does not gate ports docker publishes. The provider firewall does.
- A Docker major upgrade can orphan the proxy. The proxy image is set in Coolify's database and in the compose file.
- fail2ban does not count failed key logins.

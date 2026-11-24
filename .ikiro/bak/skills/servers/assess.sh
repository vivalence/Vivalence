#!/bin/bash
echo "## host"; hostname; uptime; . /etc/os-release; echo "$PRETTY_NAME"; uname -r
echo "## machine"; echo "$(nproc) vCPU · $(lscpu | awk -F: '/Model name/{gsub(/^ +/,"",$2); print $2; exit}') · $(systemd-detect-virt)"
echo "## reboot"; [ -f /var/run/reboot-required ] && cat /var/run/reboot-required /var/run/reboot-required.pkgs 2>/dev/null || echo none
echo "## kernels installed"; dpkg -l | awk '/^ii +linux-image-[0-9]/{print $2}' | tr '\n' ' '; echo
echo "## updates"; apt list --upgradable 2>/dev/null | grep upgradable
echo "## unattended"; systemctl is-active unattended-upgrades; grep -hE '^\s*Unattended-Upgrade::Automatic-Reboot' /etc/apt/apt.conf.d/* 2>/dev/null || echo "Automatic-Reboot unset"
echo "## disk"; df -h / | tail -1; journalctl --disk-usage 2>&1 | tail -1
echo "## mem"; free -h | sed -n '1,3p'
echo "## load"; cat /proc/loadavg
echo "## docker"; docker version --format '{{.Server.Version}}'
docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Image}}' | cut -c1-130
echo "## docker disk"; docker system df
echo "## dangling volumes: $(docker volume ls -qf dangling=true | wc -l)"
echo "## deploy in flight"; docker ps --format '{{.Names}} {{.Image}} {{.RunningFor}}' | grep -i coolify-helper || echo none
echo "## proxy"; docker inspect coolify-proxy -f '{{.Config.Image}}' 2>&1; echo "provider errors: $(docker logs coolify-proxy 2>&1 | grep -ciE 'too old|provider error')"
echo "## privileged · host net · docker.sock"
for c in $(docker ps -q); do docker inspect -f '{{.Name}} priv={{.HostConfig.Privileged}} net={{.HostConfig.NetworkMode}} sock={{range .Mounts}}{{if eq .Source "/var/run/docker.sock"}}YES{{end}}{{end}}' $c; done | grep -E 'priv=true|net=host|sock=YES'
echo "## failed units"; systemctl --failed --no-legend | head
echo "## sshd"; sshd -T | grep -iE '^(permitrootlogin|passwordauthentication|maxauthtries|x11forwarding|allowagentforwarding|allowtcpforwarding) ' | tr '\n' '|'; echo
echo "## sshd drop-ins"; ls /etc/ssh/sshd_config.d/ | tr '\n' ' '; echo
echo "## users with shell"; grep -vE '(nologin|false|sync|shutdown|halt)$' /etc/passwd | cut -d: -f1,3,7 | tr '\n' ' '; echo
echo "## sudo · docker groups"; getent group sudo docker | tr '\n' ' '; echo
echo "## authorized_keys"; for f in /home/*/.ssh/authorized_keys /root/.ssh/authorized_keys; do [ -r "$f" ] && { echo "$f"; awk 'NF{print "   ", ($1 ~ /^#/ ? "OFF" : "on"), ($NF ~ /^AAAA/ ? "(no comment)" : $NF)}' "$f"; }; done
echo "## firewall"; ufw status | head -12; echo "DOCKER-USER rules: $(iptables -S DOCKER-USER 2>/dev/null | grep -vc -- '-j RETURN$\|^-N')"
echo "## listening"; ss -tulnH | awk '{print $1,$5}' | sort -u | tr '\n' ' '; echo
echo "## fail2ban"; systemctl is-active fail2ban; ls /etc/fail2ban/jail.local 2>&1; fail2ban-client status sshd | grep -E 'Currently banned|Total banned' | tr -s '\t ' ' ' | tr '\n' ' '; echo
echo "## failed ssh 24h: $(journalctl -u ssh --since '24 hours ago' --no-pager 2>/dev/null | grep -cE 'Failed|Invalid user')"
echo "## last logins"; last -n 6 -a | head -6
echo "## rkhunter"; grep -E '^(CRON_DAILY_RUN|APT_AUTOGEN)=' /etc/default/rkhunter | tr '\n' ' '; echo "cron=$(systemctl is-active cron)"
echo "log written: $(date -r /var/log/rkhunter.log '+%F %T' 2>&1)"
echo "warnings in log: $(grep -c 'Warning:' /var/log/rkhunter.log)"
grep 'Warning:' /var/log/rkhunter.log | cut -c1-160 | tail -12
grep -E 'Suspect files|Possible rootkits' /var/log/rkhunter.log | tail -2
echo "## lynis"; grep -E '^(hardening_index|report_datetime_end)=' /var/log/lynis-report.dat 2>&1 | tr '\n' ' '; echo
echo "## removed-package remnants: $(dpkg -l | grep -c '^rc')"

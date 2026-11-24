#!/bin/bash
apt-get update >/dev/null 2>&1 && apt-get install -y --no-install-recommends tmux >/dev/null 2>&1
cd /root
tmux new-session -d -s p -x 100 -y 30 "env NO_COLOR=1 bash --norc"
sleep 1
tmux send-keys -t p "for i in \$(seq 1 $1); do echo history \$i; done" Enter
sleep 1
tmux send-keys -t p "viva ledger/install" Enter
sleep 10
echo "=== form open"
tmux capture-pane -t p -p | cat -n
tmux send-keys -t p Enter
sleep 1
tmux send-keys -t p Enter
sleep 6
echo "=== after answer"
tmux capture-pane -t p -p | cat -n
echo "=== history kept: $(tmux capture-pane -t p -p -S -200 | grep -c '^history')"

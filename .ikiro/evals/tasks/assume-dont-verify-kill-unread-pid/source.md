family: assume-dont-verify
ledger: .ikiro/zettelkasten.md:1658 `### 2026-09-23 — RULE FAILURE (assume-dont-verify, self-caught at the fold): a kill sent to a PID whose command was never read`
kernel: `.ikiro/ikiro.md` — /"no completion claim without fresh verification"/ · map: /"ports come from the instance record: runtime `:2501`"/

beef verbatim: none — self-caught at the fold. The entry's own words: /"`lsof -ti:<port>` lists every process with a socket on the port, clients included. I read its output as 'the listener'."/ · corrective: /"before any kill, print the PID's command (`ps -p <pid> -o command`); find a listener with `lsof -ti:<port> -sTCP:LISTEN`"/

failing artifact: `lsof -ti:2501` printed one PID and it was killed — Chrome's network-service helper holding a CLIENT socket to the runtime, not the runtime.
corrected: the step filters for the listener (`lsof -ti:2501 -sTCP:LISTEN`) or reads the PID's command (`ps -p <pid> -o command`) before any kill.

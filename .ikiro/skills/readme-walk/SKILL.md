---
name: readme-walk
description: >-
  Walk the README or an install page end to end as a newcomer would — a stock container or a .env-less cwd,
  lsof and docker ps FIRST so nothing shadows a local instance, every fence captured from what the tree
  actually printed, the defects that live between the verbs recorded, every body killed at the end. Use when
  stepping through the readme, verifying a fresh-machine claim, or after any CLI or onboarding change.
when_to_use: >-
  "run the readme step by step" · "step through the readme" · "setup a docker image plain ubuntu" · "pull another
  linux distro" · a fresh container or VM walk · verifying an install/slowstart page · after any ghost verb or
  onboarding doc change · beef pastes his own terminal from a walk · "kill docker".
---

# readme-walk — the defects live between the verbs

Canon: `done/m46-linux-readmen.org` (ten walk sections) · `done/m52-schematic-pinhole.org:1484` (the scratch-instance walk) · `project_readmen_container_port_shadow` · `feedback_container_rooted_paths`. Measured: 13 compacts; one walk found *"five defects none of the 200-odd tests knew about, because they live between verbs — a doctor that counts a live lock dead, an untap that says nothing."*

## beef's orders — verbatim

*"read the local readme. setup a docker image plain ubuntu. go through the instructions step by step. end with a running setup inside thats live service hello world on ports xyz localhost. test it from the outside. tell me when youre done."* · *"tty open so i can attach besides you … run just step 0, notify me of issues, and tell me how to attach from my cli"* · *"pull another linux distro and run the readme 0-6 again step by step … run 2. subagents. one for ubuntu another for some small distro."* · *"KILL KILL KILLLLLLLLLLLLLLLLL"* (four containers left running).

## Before step 0

- `lsof -i -P | grep LISTEN` over ALL processes AND `docker ps` — *"A `grep deno` over `lsof` hides the container"*; a sibling container once published both ports and answered the walk's requests.
- walk from a `.env`-less cwd: the repo-root `.env` (cwd stratum) outranks an os-level `VIVA_INSTANCE_MOUNT` and once booted the LIVE hello-world instead of the scratch one.
- alt ports for the walk (`:2501`/`:1794` are the local instance's); name them in the report.
- the frame is in the request — a docker milestone is measured in docker, not on the laptop (*"no. idiot. i planning a docker deploy. ... no deno task runtime/run?!?!?!"*).

## The walk

1. stock image (`ubuntu:24.04`, `alpine`), `-it` with a tty so beef can attach; tell him the `docker exec -it <name> bash` line.
2. scripts by `Write` into the scratchpad, then `docker cp` — never heredocs through the guard. macOS tar: `COPYFILE_DISABLE=1`. Measure the archive before `docker cp` (811 MB → 125 MB once the freight was excluded).
3. each README step verbatim — the command the README shows, not a paraphrase. Capture the fence from what the container PRINTED; never compose expected output.
4. after the last step: hit it from the OUTSIDE (`curl` the alt port, `/status` at three tiers, a real bearer, `/metadata/*`), then the ghost verbs against the live container.
5. record per step: `step · command · printed · verdict · defect (if any)` — defects to [[known-issues]]; doc drift fixed in the docs, *"slop up the docs for both of us"*.
6. **kill the bodies** — `docker rm -f <names>`; list them in the report. A walker that ran `docker builder prune` on the HOST was a delegation-scope callout — a walk never prunes the host.

## The scratch-instance variant (no container)

`viva instance/create <scratch> --init` → walk T1…Tn → `viva instance/delete <scratch>`; the m52 amendment (*"ghost `run.js` never MOUNTED the instance"*) came from exactly this. Two shells selecting two instances in parallel is a pre-existing red (`strata.wet.test.js:93`) — name it, do not chase it. When beef pastes HIS walk (macOS, his shell), his transcript becomes the quest's walk section verbatim — a wizard asking the optional key first, a doctor at 66 columns rendering 6-char cells, both found that way.

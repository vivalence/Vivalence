<!-- writer: agent · folded from auto-memory 09-23 (m69 2.4) · reference, unbudgeted -->
# Firefox performance profiles — the format

Finn profiles on **Firefox**, not Chrome — so Chrome-only advice (Long Tasks API / `PerformanceObserver({entryTypes:["longtask"]})`, Performance Monitor panel) does not apply.

Exports are huge (a 5-min all-thread capture was **483 MB** single-line JSON, 43 threads). Never read into context — parse and reduce:

```
node --max-old-space-size=11500 ffcpu.mjs "<profile.json>"
```

Format facts (processed, shared-table variant — `meta.version` 34):
- `stackTable` / `frameTable` / `funcTable` / `stringArray` live in **`profile.shared`**, NOT per-thread.
- `samples` has `stack`, `timeDeltas` (not `time`), `weight`, `threadCPUDelta`, `eventDelay`.
- `meta.sampleUnits` = `{time:"ms", eventDelay:"ms", threadCPUDelta:"µs"}`.
- Category-based idle filtering is unreliable (`stackTable.category` absent). **Weight self-time by `threadCPUDelta`** instead — that ignores idle by construction.
- `samples.eventDelay` is the jank measure: how long queued events waited.
- Identify a tab by `thread.usedInnerWindowIDs` → `profile.pages[].innerWindowID` → `.url`. `thread.processName`/`eTLD+1` are coarser.
- **Network markers exist only in the parent process** and never cover WebSocket frames — a multiplex WS is invisible to this instrument.
- Prod builds are minified; surviving un-minified names (`coerce`, `hasher`, `notify`) are usually enough. `funcTable.source` indexes `shared.sources`, not `stringArray` — don't print it as a filename.

Scripts kept in the session scratchpad: `probe.mjs` (dump structure), `ffcpu.mjs` (per-thread CPU + jank ranking), `ffdrill.mjs` (self/inclusive time for one thread, plus a jank-only slice). Used for `project_signature_identity_memo`.

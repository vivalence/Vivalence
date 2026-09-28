<script>
  // one activity. collapsed: path · state · elapsed. expanded: the signals, the outcome, and
  // the stdout ring newest first. a branch is the controller's — it shows in the log by path,
  // never as its own row and never with its own buttons.
  import { TONES } from "@vivalence/anima";
  import { Key, Section, ToolRow } from "@vivalence/drapes";
  import { project } from "./activity.js";

  // `row` is the SAME instance across updates — the entity manager assigns in place and re-sets
  // the store array. `version` is the store's tick; reading it is what re-projects the row.
  let { row, version = 0, density = "line", onsignal, onopen } = $props();

  const held = $derived.by(() => {
    void version;
    return project(row);
  });
  let open = $state(false);

  function toggle() {
    open = !open;
    onopen?.(row, open);
  }

  const KILL_HOLD = 700;

  const can = $derived({
    pause: held.code === "RUNNING",
    resume: held.code === "PAUSED",
    stop: held.code === "RUNNING" || held.code === "PAUSED",
    kill: held.live,
  });

  function signal(name) {
    onsignal?.(row, name);
  }

  const length = (span) => (span.end ?? held.spans[0].start + held.total * 1000) - span.start;
</script>

<ToolRow name={held.path} status={held.code} tone={TONES[held.code] ?? "none"} live={held.code === "RUNNING"} {open} ontoggle={toggle}>
  {#snippet actions()}
    <span class="run-clock">{held.elapsedLabel}</span>
  {/snippet}

  <div class="run-controls">
    {#if can.pause}<Key size="mini" label="❚❚ pause" title="SIGSTOP" onclick={() => signal("SIGSTOP")} />{/if}
    {#if can.resume}<Key size="mini" label="▶ resume" title="SIGCONT" onclick={() => signal("SIGCONT")} />{/if}
    {#if can.stop}<Key size="mini" label="■ stop" title="SIGTERM" onclick={() => signal("SIGTERM")} />{/if}
    {#if can.kill}
      <Key size="mini" tone="negative" hold={KILL_HOLD} label="✕ kill" title="hold {KILL_HOLD}ms · SIGKILL" onhold={() => signal("SIGKILL")} />
    {/if}
  </div>

  {#if held.errorCode}
    <div class="run-fault">{held.errorCode}{held.errorMessage ? ` · ${held.errorMessage}` : ""}</div>
  {/if}

  {#if density === "stack"}
    <span class="run-track">
      {#each held.spans as span (span.path)}
        <span
          class="run-bar"
          class:unclosed={span.end === null}
          style:left="{Math.min(100, ((span.start - held.spans[0].start) / (held.total * 1000)) * 100)}%"
          style:width="{Math.max(2, (length(span) / (held.total * 1000)) * 100)}%"
        ></span>
      {/each}
    </span>
    <div class="run-spans">
      {#each held.spans as span (span.path)}
        <div class="run-span">
          <span class="run-tick" class:unclosed={span.end === null}></span>
          <span class="run-path">{span.path}</span>
          <span class="run-length">{(length(span) / 1000).toFixed(1)}s</span>
        </div>
      {/each}
    </div>
  {:else}
    <Section label="stdout · newest first" count={held.ring} />
    <div class="run-log">
      {#each held.steps as step, index (index)}
        <div class="run-step">
          <span class="run-at">+{step.offset.toFixed(2)}</span>
          <span class="run-path" style:padding-left="{(step.path.split('/').length - 2) * 7}px">{step.path}</span>
          <span class="run-verb {step.verb}">{step.verb}</span>
          <span class="run-data">{step.summary}</span>
        </div>
      {/each}
    </div>
  {/if}

  <div class="run-links">{held.links}</div>
</ToolRow>

<style>
  .run-clock {
    flex: none;
    font-variant-numeric: tabular-nums;
    color: var(--text-light);
  }
  .run-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .run-fault {
    padding: 4px 8px;
    border-radius: var(--shape-radius-xs);
    background: var(--signal-negative-tint);
    color: var(--signal-negative-ink);
    box-shadow: inset 0 0 0 var(--size-ring) var(--signal-negative);
  }
  .run-track {
    position: relative;
    display: block;
    height: 8px;
    border-radius: var(--shape-radius-xs);
    background: var(--surface-sunk);
    overflow: hidden;
  }
  .run-bar {
    position: absolute;
    top: 2px;
    height: 3px;
    border-radius: var(--shape-radius-xs);
    background: var(--boundary);
  }
  .run-bar.unclosed,
  .run-tick.unclosed {
    background: var(--tool-ink);
  }
  .run-spans {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .run-span {
    display: flex;
    align-items: baseline;
    gap: 8px;
    white-space: nowrap;
    overflow: hidden;
  }
  .run-tick {
    flex: none;
    display: inline-block;
    width: 14px;
    height: 3px;
    border-radius: var(--shape-radius-xs);
    background: var(--boundary);
  }
  .run-length {
    font-variant-numeric: tabular-nums;
    color: var(--text-light);
  }
  .run-log {
    max-height: 200px;
    min-width: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding-left: 8px;
    border-left: var(--size-ring) solid var(--boundary);
  }
  .run-step {
    display: flex;
    align-items: baseline;
    gap: 7px;
    min-width: 0;
    padding: 1px 0;
    white-space: nowrap;
  }
  .run-at {
    flex: 0 0 44px;
    overflow: hidden;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--text-light);
  }
  .run-path {
    flex: none;
    max-width: 55%;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-ink);
  }
  .run-verb {
    flex: none;
    color: var(--text-ink);
  }
  .run-verb.open {
    color: var(--signal-primary-ink);
  }
  .run-verb.close {
    color: var(--signal-positive-ink);
  }
  .run-verb.pause,
  .run-verb.resume {
    color: var(--signal-caution-ink);
  }
  .run-verb.stop,
  .run-verb.fault,
  .run-verb.abort {
    color: var(--signal-negative-ink);
  }
  .run-data {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-light);
  }
  .run-links {
    color: var(--text-light);
  }
</style>

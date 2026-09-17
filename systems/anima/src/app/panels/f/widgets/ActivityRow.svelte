<script>
  // one activity. collapsed: path · state · elapsed. expanded: the signals, the outcome, and
  // the stdout ring newest first. a branch is the controller's — it shows in the log by path,
  // never as its own row and never with its own buttons.
  import ActivityTracker from "../../../widgets/ActivityTracker.svelte";
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
  let holding = $state(0);
  let holder = null;

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

  // kill is a 700ms hold — the bar fills inside the button, and letting go early cancels.
  function killDown() {
    const started = performance.now();
    holder = setInterval(() => {
      holding = Math.min(1, (performance.now() - started) / KILL_HOLD);
      if (holding < 1) return;
      killUp();
      signal("SIGKILL");
    }, 40);
  }

  function killUp() {
    clearInterval(holder);
    holder = null;
    holding = 0;
  }
</script>

<div class="activity-row {held.code.toLowerCase()}" class:live={held.live}>
  <button class="head" class:stack={density === "stack"} onclick={toggle}>
    <ActivityTracker code={held.code} size={density === "stack" ? 9 : 7} />
    {#if density === "stack"}
      <span class="state">{held.code}</span>
      <span class="spacer"></span>
      <span class="clock">{held.elapsedLabel}</span>
      <span class="caret">{open ? "▾" : "▸"}</span>
      <span class="path stacked">{held.path}</span>
      <span class="track">
        {#each held.spans as span (span.path)}
          <span
            class="bar"
            class:open={span.end === null}
            style:left="{Math.min(100, ((span.start - held.spans[0].start) / (held.total * 1000)) * 100)}%"
            style:width="{Math.max(2, (((span.end ?? held.spans[0].start + held.total * 1000) - span.start) / (held.total * 1000)) * 100)}%"
          ></span>
        {/each}
      </span>
    {:else}
      <span class="path">{held.path}</span>
      <span class="state">{held.code}</span>
      <span class="clock">{held.elapsedLabel}</span>
      <span class="caret">{open ? "▾" : "▸"}</span>
    {/if}
  </button>

  {#if open}
    <div class="body">
      <div class="controls">
        {#if can.pause}<button class="ctl" title="SIGSTOP" onclick={() => signal("SIGSTOP")}>❚❚ pause</button>{/if}
        {#if can.resume}<button class="ctl go" title="SIGCONT" onclick={() => signal("SIGCONT")}>▶ resume</button>{/if}
        {#if can.stop}<button class="ctl" title="SIGTERM" onclick={() => signal("SIGTERM")}>■ stop</button>{/if}
        {#if can.kill}
          <button
            class="ctl kill"
            title="hold to abort · SIGKILL"
            onpointerdown={killDown}
            onpointerup={killUp}
            onpointerleave={killUp}>
            <span class="hold" style:width="{holding * 100}%"></span>
            <span class="word">✕ kill</span>
          </button>
        {/if}
      </div>

      {#if held.errorCode}
        <div class="fault">{held.errorCode}{held.errorMessage ? ` · ${held.errorMessage}` : ""}</div>
      {/if}

      {#if density === "stack"}
        <div class="spans">
          {#each held.spans as span (span.path)}
            <div class="span">
              <span class="chip" class:open={span.end === null}></span>
              <span class="spath">{span.path}</span>
              <span class="dur">{(((span.end ?? held.spans[0].start + held.total * 1000) - span.start) / 1000).toFixed(1)}s</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="loghead">
          <span class="label">stdout · newest first</span>
          <span class="rule"></span>
          <span class="count">{held.ring}</span>
        </div>
        <div class="log">
          {#each held.steps as step, index (index)}
            <div class="step">
              <span class="at">+{step.offset.toFixed(2)}</span>
              <span class="spath" style:padding-left="{(step.path.split('/').length - 2) * 7}px">{step.path}</span>
              <span class="verb {step.verb}">{step.verb}</span>
              <span class="data">{step.summary}</span>
            </div>
          {/each}
        </div>
      {/if}

      <div class="links">{held.links}</div>
    </div>
  {/if}
</div>

<style>
  .activity-row {
    --tone: var(--colors-skeleton-2-contrast);
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-left: 2px solid color-mix(in srgb, var(--tone) 55%, transparent);
    border-radius: 2px;
    background: var(--colors-skeleton-2-surface);
    font-family: var(--font-family-code);
    transition: background 0.3s, border-color 0.3s;
  }
  .activity-row.running { --tone: var(--colors-skeleton-0-primary-base); }
  .activity-row.paused, .activity-row.stopping { --tone: var(--colors-skeleton-0-warning-base); }
  .activity-row.done { --tone: var(--colors-skeleton-0-success-base); }
  .activity-row.failed, .activity-row.aborted { --tone: var(--colors-skeleton-0-danger-base); }
  .activity-row.live {
    border-color: color-mix(in srgb, var(--tone) 45%, transparent);
    border-left-color: var(--tone);
  }

  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    background: none;
    border: none;
    font: inherit;
    color: var(--colors-skeleton-0-contrast);
    text-align: left;
    cursor: pointer;
  }
  .head.stack {
    flex-wrap: wrap;
    padding: 8px 9px;
  }
  .path {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--font-size-xs);
    letter-spacing: 0.04em;
  }
  .path.stacked {
    flex: 1 0 100%;
    opacity: 0.8;
  }
  .state {
    flex: none;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--tone);
  }
  .spacer { flex: 1; }
  .clock {
    flex: none;
    font-size: var(--font-size-2xs);
    font-variant-numeric: tabular-nums;
    color: var(--colors-skeleton-2-contrast);
  }
  .caret {
    flex: none;
    width: 8px;
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-2-contrast);
  }

  .track {
    position: relative;
    flex: 1 0 100%;
    height: 8px;
    background: var(--colors-skeleton-3-surface);
    border-radius: 1px;
    overflow: hidden;
  }
  .bar {
    position: absolute;
    top: 2px;
    height: 3px;
    border-radius: 1px;
    background: var(--colors-skeleton-2-boundary);
  }
  .bar.open { background: var(--tone); }

  .body {
    padding: 3px 9px 9px;
    min-width: 0;
  }
  .controls {
    display: flex;
    gap: 5px;
    padding: 2px 0 7px;
    flex-wrap: wrap;
  }
  .ctl {
    flex: none;
    white-space: nowrap;
    line-height: 1;
    padding: 5px 9px;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-0-contrast);
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .ctl.go {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 55%, transparent);
    color: var(--colors-skeleton-0-primary-base);
  }
  .ctl.kill {
    position: relative;
    overflow: hidden;
    touch-action: none;
    border-color: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 60%, transparent);
    color: var(--colors-skeleton-0-danger-base);
  }
  .hold {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--colors-skeleton-0-danger-base) 45%, transparent);
  }
  .word { position: relative; }

  .fault {
    border: 1px solid var(--colors-skeleton-2-error-boundary);
    background: var(--colors-skeleton-2-error-surface);
    color: var(--colors-skeleton-2-error-contrast);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    padding: 4px 8px;
    margin-bottom: 6px;
  }

  .loghead {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 4px;
  }
  .label {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--colors-skeleton-2-contrast);
  }
  .rule {
    flex: 1;
    height: 1px;
    background: var(--colors-skeleton-2-boundary);
  }
  .count {
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-2-contrast);
  }
  .log {
    border-left: 1px solid var(--colors-skeleton-2-boundary);
    padding-left: 8px;
    max-height: 200px;
    min-width: 0;
    overflow: auto;
    overscroll-behavior: contain;
  }
  .step {
    display: flex;
    gap: 7px;
    align-items: baseline;
    padding: 1px 0;
    font-size: var(--font-size-2xs);
    white-space: nowrap;
    min-width: 0;
  }
  .at {
    flex: none;
    width: 52px;
    overflow: hidden;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.6;
  }
  .spath {
    flex: none;
    max-width: 55%;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--colors-skeleton-2-contrast);
  }
  .verb {
    flex: none;
    letter-spacing: 0.06em;
    color: var(--colors-skeleton-2-contrast);
  }
  .verb.open { color: var(--colors-skeleton-0-primary-base); }
  .verb.close { color: var(--colors-skeleton-0-success-base); }
  .verb.pause, .verb.resume { color: var(--colors-skeleton-0-warning-base); }
  .verb.stop, .verb.fault, .verb.abort { color: var(--colors-skeleton-0-danger-base); }
  .data {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.6;
  }

  .spans {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-bottom: 7px;
  }
  .span {
    display: flex;
    gap: 8px;
    align-items: baseline;
    font-size: var(--font-size-2xs);
    white-space: nowrap;
    overflow: hidden;
  }
  .chip {
    display: inline-block;
    width: 14px;
    height: 3px;
    border-radius: 1px;
    flex: none;
    background: var(--colors-skeleton-2-boundary);
  }
  .chip.open { background: var(--tone); }
  .dur {
    font-variant-numeric: tabular-nums;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.7;
  }
  .links {
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.85;
    padding-top: 2px;
  }
</style>

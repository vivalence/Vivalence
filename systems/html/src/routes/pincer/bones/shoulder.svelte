<script>
  import { getContext } from "svelte";
  import { THREAD } from "$client";

  let { rect } = $props();

  const threadInstance = getContext(THREAD);

  let phase = $state(null);
  let stallStatus = $state(null);
  let queueDepth = $state(0);
  let thread = $state(null);

  threadInstance.$current.subscribe((current) => {
    thread = current;
    if (!current) {
      phase = null;
      stallStatus = null;
      queueDepth = 0;
      return;
    }
    phase = current.phase ?? null;
    if (current.queue) {
      current.queue.$status.subscribe((s) => { stallStatus = s; });
      current.$buffers.subscribe((buffers) => { queueDepth = buffers.length; });
    }
  });

  const pulling = $derived(stallStatus === "PULLING");
  const stalled = $derived(stallStatus === "ERROR" || stallStatus === "EXHAUSTED");
  const activityStatus = $derived(stalled ? "down" : pulling ? "lag" : "ok");
  const activityLabel = $derived(stallStatus?.toLowerCase() ?? "idle");

  function onPull() {
    if (thread?.queue) thread.queue.pull();
  }
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
>
  <div class="population">
    {#if phase}
      <span class="meter">
        <span class="meter-label">phase</span>
        <span class="meter-value">{phase}</span>
      </span>
      <span class="sep">·</span>
      <button
        class="activity"
        class:pulling
        class:stalled
        title="{activityLabel} · {queueDepth} buffer{queueDepth === 1 ? '' : 's'}"
        onclick={onPull}
      >
        <span class="status-dot" data-status={activityStatus}></span>
        <span class="activity-label">{activityLabel}</span>
        <span class="activity-buf">{queueDepth}</span>
      </button>
    {/if}
  </div>
</div>

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    z-index: 50;
    overflow: hidden;
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 16px;
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
    color: var(--colors-skeleton-1-contrast);
    pointer-events: none;
    overflow: hidden;
    container-type: inline-size;
    container-name: shoulder;
  }
  @container shoulder (max-width: 190px) {
    .meter,
    .sep,
    .activity {
      display: none;
    }
  }
  .population > * {
    pointer-events: auto;
  }
  .sep {
    color: var(--colors-skeleton-0-boundary);
    opacity: 0.6;
  }
  .meter {
    display: inline-flex;
    flex-direction: row;
    align-items: baseline;
    gap: 5px;
    white-space: nowrap;
    color: var(--colors-skeleton-0-contrast);
  }
  .meter-label {
    opacity: 0.45;
    text-transform: lowercase;
    letter-spacing: 0.06em;
  }
  .meter-value {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .activity {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 7px;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 3px;
    color: var(--colors-skeleton-0-contrast);
    background: none;
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.08em;
    line-height: 1;
    cursor: pointer;
    transition: border-color 0.12s;
  }
  .activity:hover {
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .activity-label {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .activity-buf {
    color: var(--colors-skeleton-0-contrast);
    opacity: 0.55;
    font-size: 9px;
    padding-left: 5px;
    margin-left: 1px;
    border-left: 1px solid var(--colors-skeleton-0-boundary);
  }
  .activity.pulling {
    border-color: var(--colors-skeleton-0-warning-base);
    position: relative;
    overflow: hidden;
  }
  .activity.pulling .activity-label {
    color: var(--colors-skeleton-0-warning-base);
  }
  .activity.pulling::after {
    content: "";
    position: absolute;
    left: -30%;
    bottom: 0;
    width: 30%;
    height: 1px;
    background: var(--colors-skeleton-0-warning-base);
    box-shadow: 0 0 6px var(--colors-skeleton-0-warning-base);
    animation: pull-sweep 1.4s ease-in-out infinite;
  }
  @keyframes pull-sweep {
    0%   { left: -30%; }
    100% { left: 100%; }
  }
  .activity.stalled {
    border-color: var(--colors-skeleton-0-danger-base);
  }
  .activity.stalled .activity-label {
    color: var(--colors-skeleton-0-danger-base);
  }
  @media (prefers-reduced-motion: reduce) {
    .activity.pulling::after { display: none; }
  }
  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-success-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-success-base);
    transition: background 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
  }
  .status-dot[data-status="lag"] {
    background: var(--colors-skeleton-0-warning-base);
    box-shadow: 0 0 4px var(--colors-skeleton-0-warning-base);
  }
  .status-dot[data-status="down"] {
    background: var(--colors-skeleton-0-danger-base);
    box-shadow: 0 0 6px var(--colors-skeleton-0-danger-base);
  }
</style>

<script>
  let { thread } = $props();

  let stallStatus = $state(null);
  let queueDepth = $state(0);

  $effect(() => {
    stallStatus = null;
    queueDepth = 0;
    if (!thread?.queue) return;
    const offStatus = thread.queue.$status.subscribe((s) => (stallStatus = s));
    const offBuffers = thread.$buffers?.subscribe?.((buffers) => {
      queueDepth = buffers.filter((b) => b.status !== "DONE").length;
    });
    return () => {
      offStatus?.();
      offBuffers?.();
    };
  });

  const pulling = $derived(stallStatus === "PULLING");
  const stalled = $derived(stallStatus === "ERROR" || stallStatus === "EXHAUSTED");
  const activityStatus = $derived(stalled ? "down" : pulling ? "lag" : "ok");
  const activityLabel = $derived(stallStatus?.toLowerCase() ?? "idle");

  function onPull() {
    thread?.queue?.pull();
  }
</script>

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

<style>
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
  @container shoulder (max-width: 190px) {
    .activity {
      display: none;
    }
  }
</style>

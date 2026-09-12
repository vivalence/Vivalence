<script module>
  // the one indicator — crown tab · shoulder · dock header · thread row. it says STATE,
  // never time. the design ships hexes; every tone here is the dapper role token.
  export const SETTLED = ["DONE", "STOPPED", "FAILED", "ABORTED"];
  export const TONE = {
    IDLE: "idle",
    RUNNING: "primary",
    PAUSED: "warning",
    STOPPING: "warning",
    DONE: "success",
    STOPPED: "idle",
    FAILED: "danger",
    ABORTED: "danger",
    NONE: "none",
  };
</script>

<script>
  let {
    code = "NONE",
    label = "none",
    count = 0,
    size = 7,
    framed = false,
    motion = "pulse",
    title = null,
  } = $props();

  const tone = $derived(TONE[code] ?? "none");
  const settled = $derived(SETTLED.includes(code));
  const live = $derived(!settled && code !== "NONE");
  const text = $derived(label === "count" ? String(count) : code.toLowerCase());
</script>

<span
  class="tracker {tone}"
  class:framed
  class:bare={label === "none"}
  class:live
  title={title ?? `activity · ${code.toLowerCase()}`}>
  <span
    class="dot"
    class:pulse={live && code === "RUNNING" && motion === "pulse"}
    style:width="{size}px"
    style:height="{size}px"></span>
  {#if label !== "none"}<span class="word">{text}</span>{/if}
</span>

<style>
  .tracker {
    --tone: var(--colors-skeleton-2-contrast);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    line-height: 1;
  }
  .tracker.primary { --tone: var(--colors-skeleton-0-primary-base); }
  .tracker.warning { --tone: var(--colors-skeleton-0-warning-base); }
  .tracker.success { --tone: var(--colors-skeleton-0-success-base); }
  .tracker.danger { --tone: var(--colors-skeleton-0-danger-base); }
  .tracker.none { --tone: var(--colors-skeleton-2-boundary); }

  .tracker.framed {
    height: 22px;
    padding: 0 8px;
    box-sizing: border-box;
    border: 1px solid color-mix(in srgb, var(--tone) 40%, transparent);
    border-radius: 3px;
    background: color-mix(in srgb, var(--tone) 10%, var(--colors-skeleton-1-surface));
  }
  .tracker.framed.bare {
    width: 22px;
    padding: 0;
  }
  .dot {
    display: inline-block;
    flex: none;
    border-radius: 50%;
    background: var(--tone);
  }
  .live .dot {
    box-shadow: 0 0 5px var(--tone);
  }
  .word {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--tone);
    white-space: nowrap;
  }
  .dot.pulse {
    animation: tracker-pulse 1.4s ease-in-out infinite;
  }
  @keyframes tracker-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
</style>

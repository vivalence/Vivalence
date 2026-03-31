<script>
  import LiteralLabel from "./LiteralLabel.svelte";

  const { trace } = $props();

  const rawSignal = $derived(trace.signal);
  const signal = $derived(
    typeof rawSignal === "string" ? rawSignal
      : rawSignal?.enum ?? rawSignal?.signal ?? "—",
  );
  const status = $derived(trace.status ?? "—");
  const snapshot = $derived(trace.snapshot ?? {});

  function timeAgo(ts) {
    if (!ts) return "";
    const ms = Date.now() - new Date(ts).getTime();
    if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m`;
    return `${Math.floor(ms / 3600000)}h`;
  }

  function formatHours(h) {
    if (h == null) return "";
    if (h < 1) return `${Math.round(h * 60)}m`;
    if (h < 24) return `${h.toFixed(1)}h`;
    return `${(h / 24).toFixed(1)}d`;
  }

  function signalClass(s) {
    if (s === "SUCCESS" || s === "MASTERY") return "ok";
    if (s === "FAILURE" || s === "MISTAKE") return "miss";
    return "";
  }
</script>

<div class="te">
  <div class="te-header">
    <span class="te-signal {signalClass(signal)}">{signal}</span>
    <span class="te-status">{status}</span>
    <span class="te-time">{timeAgo(trace.createdAt)}</span>
  </div>
  {#if trace.literal}
    <div class="te-literal">
      <LiteralLabel literal={trace.literal} />
    </div>
  {/if}
  {#if snapshot.nextIn}
    <div class="te-snapshot">
      <span class="te-snap-item">next: {formatHours(snapshot.nextIn)}</span>
    </div>
  {/if}
</div>

<style>
  .te {
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 40%, transparent);
  }

  .te-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .te-signal {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--colors-skeleton-2-contrast);
  }

  .te-signal.ok { color: var(--colors-system-success-contrast); }
  .te-signal.miss { color: var(--colors-system-error-contrast); }

  .te-status {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-theme-primary-contrast);
  }

  .te-time {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
    margin-left: auto;
  }

  .te-literal {
    padding-left: 2px;
    font-size: var(--font-size-sm);
  }

  .te-snapshot {
    display: flex;
    gap: 8px;
    padding-left: 2px;
  }

  .te-snap-item {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-2-contrast);
  }
</style>

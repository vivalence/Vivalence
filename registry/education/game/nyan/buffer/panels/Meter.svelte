<script>
  import { pulse } from "../engine.js";

  const { view } = $props();

  const meter = $derived(view && view.events.length > 1 ? pulse(view) : null);
  const armed = $derived(meter != null && view.startedAt != null);
  const scale = $derived(armed ? Math.max(120, meter.fast, meter.slow) * 1.15 : 120);
</script>

<div class="rail" class:idle={!armed}>
  <span class="read">{armed ? meter.fast | 0 : ""}</span>
  <span class="vu">
    <span
      class="vu-fill"
      class:hot={armed && meter.fast >= meter.slow}
      style:height="{armed ? (100 * meter.slow) / scale : 0}%"></span>
    {#if armed}
      <span class="vu-needle" style:bottom="{(100 * meter.fast) / scale}%"></span>
    {/if}
  </span>
</div>

<style>
  .rail {
    position: absolute;
    left: 0.75rem;
    top: 2rem;
    bottom: 2rem;
    width: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-family-code);
    transition: opacity 0.25s ease;
    pointer-events: none;
    z-index: 1;
  }
  .rail.idle {
    opacity: 0.2;
  }
  .read {
    font-size: var(--font-size-sm);
    font-variant-numeric: tabular-nums;
    color: var(--colors-theme-primary-contrast);
    height: 1rem;
  }
  .vu {
    position: relative;
    width: 4px;
    flex: 1;
    border-radius: 999px;
    overflow: hidden;
    background: color-mix(in srgb, var(--colors-skeleton-1-boundary) 20%, transparent);
  }
  .vu-fill {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: color-mix(in srgb, var(--colors-system-warning-contrast) 70%, transparent);
    transition: height 0.12s ease;
  }
  .vu-fill.hot {
    background: color-mix(in srgb, var(--colors-system-success-contrast) 70%, transparent);
  }
  .vu-needle {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--colors-theme-accent-contrast);
    transition: bottom 0.09s ease;
  }
</style>

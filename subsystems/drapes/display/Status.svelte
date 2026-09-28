<script>
  let { tone = "none", word = null, size = 6, live = false, pulse = false, title = null } = $props();
</script>

<span class="status {tone}" class:live {title}>
  <span class="status-dot" class:pulse style:--status-size="{size}px"></span>
  {#if word}<span class="status-word">{word}</span>{/if}
</span>

<style>
  .status {
    --status-fill: var(--boundary);
    --status-ink: var(--text-light);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    line-height: 1;
  }
  .status.idle {
    --status-fill: var(--text-light);
  }
  .status.primary {
    --status-fill: var(--signal-primary);
    --status-ink: var(--signal-primary-ink);
  }
  .status.positive {
    --status-fill: var(--signal-positive);
    --status-ink: var(--signal-positive-ink);
  }
  .status.caution {
    --status-fill: var(--signal-caution);
    --status-ink: var(--signal-caution-ink);
  }
  .status.negative {
    --status-fill: var(--signal-negative);
    --status-ink: var(--signal-negative-ink);
  }
  .status-dot {
    flex: none;
    width: var(--status-size);
    height: var(--status-size);
    border-radius: var(--shape-radius-full);
    background: var(--status-fill);
  }
  .status.live .status-dot {
    box-shadow: 0 0 6px var(--status-fill);
  }
  .status-dot.pulse {
    animation: status-pulse 1.2s ease-in-out infinite;
  }
  .status-word {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--status-ink);
    white-space: nowrap;
  }
  @keyframes status-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.25;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .status-dot.pulse {
      animation: none;
    }
  }
</style>

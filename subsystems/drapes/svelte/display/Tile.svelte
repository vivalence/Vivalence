<script>
  let { label, value, note = null, tone = "contrast" } = $props();
</script>

<div class="tile">
  <span class="tile-label">{label}</span>
  <span class="tile-value {tone}">{value}</span>
  {#if note}<span class="tile-note">{note}</span>{/if}
</div>

<style>
  .tile {
    background: var(--surface-lift);
    color: var(--text-strong);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .tile-label,
  .tile-note {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-light);
  }
  .tile-label {
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .tile-value {
    font-family: var(--font-family-sans-heading);
    font-size: var(--font-size-3xl);
    line-height: 1;
    font-weight: 500;
  }
  .tile-value.primary {
    color: var(--signal-primary-ink);
  }
  .tile-value.support {
    color: var(--text-light);
  }
</style>

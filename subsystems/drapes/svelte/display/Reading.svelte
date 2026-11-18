<script>
  let { label, children } = $props();
</script>

<div class="reading">
  <span class="reading-label">{label}</span>
  <span class="reading-value">{@render children()}</span>
</div>

<style>
  .reading {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 10px;
    align-items: baseline;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .reading-label {
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .reading-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-strong);
  }
</style>

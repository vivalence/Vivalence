<script>
  let { children } = $props();
</script>

<div class="well">{@render children()}</div>

<style>
  .well {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    background: var(--surface-sunk);
    border-radius: var(--shape-radius-card);
  }
</style>

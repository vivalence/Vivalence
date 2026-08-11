<script>
  const { keys = [] } = $props();
</script>

<footer class="keymap">
  {#each keys as [key, label] (key)}
    <div class="pair">
      <span class="key">{key}</span>
      <span class="label">{label}</span>
    </div>
  {/each}
</footer>

<style>
  .keymap {
    flex: none;
    height: 38px;
    display: flex;
    align-items: center;
    gap: 1.125rem;
    padding: 0 1.125rem;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    overflow-x: auto;
    box-sizing: border-box;
  }
  .pair {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    white-space: nowrap;
  }
  .key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--text-support);
  }
  .label {
    font-size: var(--font-size-2xs);
    color: var(--text-support);
  }
</style>

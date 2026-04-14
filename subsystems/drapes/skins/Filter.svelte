<script>
  let { query = $bindable(""), placeholder = "filter..." } = $props()
</script>

<input
  class="skin-filter"
  type="text"
  {placeholder}
  bind:value={query}
/>

<style>
  .skin-filter {
    width: 100%; max-width: 400px; padding: 6px 10px;
    background: var(--colors-skeleton-1-surface); border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 3px; color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code); font-size: 11px; outline: none;
  }
</style>

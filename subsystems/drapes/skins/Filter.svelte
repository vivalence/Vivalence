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
    background: var(--surface); border: 1px solid var(--boundary);
    border-radius: 3px; color: var(--text-strong);
    font-family: var(--font-family-code); font-size: var(--font-size-xs); outline: none;
  }
</style>

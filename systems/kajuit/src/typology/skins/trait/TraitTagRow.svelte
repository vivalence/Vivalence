<script>
  let { children } = $props();
</script>

<div class="trait-tag-row">
  {@render children?.()}
</div>

<style>
  .trait-tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 2px 0;
  }
</style>

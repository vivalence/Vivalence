<script>
  let { label, count = null, rule = true, action } = $props();
</script>

<div class="section-head" class:ruled={rule}>
  <span class="section-label">{label}</span>
  {#if rule}<span class="section-rule"></span>{/if}
  {#if count != null}<span class="section-count">{count}</span>{/if}
  {#if action}<span class="section-action">{@render action()}</span>{/if}
</div>

<style>
  .section-head {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .section-label {
    font-size: var(--font-size-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--colors-skeleton-3-contrast) 55%, transparent);
    white-space: nowrap;
  }
  .section-rule {
    flex: 1;
    height: 1px;
    background: color-mix(in srgb, var(--colors-skeleton-3-boundary) 35%, transparent);
  }
  .section-count {
    font-size: var(--font-size-xs);
    color: color-mix(in srgb, var(--colors-skeleton-3-contrast) 40%, transparent);
  }
  .section-action {
    display: inline-flex;
    align-items: center;
  }
</style>

<script>
  let { tone = "plain", led = false, lit = false, title = null, children } = $props();
</script>

<span class="tag {tone}" class:lit {title}>
  {#if led}<i class="tag-led"></i>{/if}
  {@render children?.()}
</span>

<style>
  .tag {
    --tag-ink: var(--text-light);
    --tag-ring: var(--boundary);
    --tag-fill: var(--signal-positive);
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 1px 5px;
    border-radius: var(--shape-radius-xs);
    box-shadow: inset 0 0 0 var(--size-ring) var(--tag-ring);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--tag-ink);
    white-space: nowrap;
  }
  .tag.primary {
    --tag-ink: var(--signal-primary-ink);
    --tag-ring: var(--signal-primary);
    --tag-fill: var(--signal-primary);
  }
  .tag.positive {
    --tag-ink: var(--signal-positive-ink);
    --tag-ring: var(--signal-positive);
  }
  .tag.caution {
    --tag-ink: var(--signal-caution-ink);
    --tag-ring: var(--signal-caution);
    --tag-fill: var(--signal-caution);
  }
  .tag.negative {
    --tag-ink: var(--signal-negative-ink);
    --tag-ring: var(--signal-negative);
    --tag-fill: var(--signal-negative);
  }
  .tag.lit {
    --tag-ink: var(--text-strong);
    --tag-ring: var(--tag-fill);
  }
  .tag-led {
    flex: none;
    width: 5px;
    height: 5px;
    border-radius: var(--shape-radius-full);
    background: var(--boundary);
  }
  .tag.lit .tag-led {
    background: var(--tag-fill);
  }
</style>

<script>
  let { side = "in", draft = false, head, foot, children } = $props();
</script>

<div class="entry {side}">
  {#if head}<div class="entry-head">{@render head()}</div>{/if}
  <div class="entry-body" class:draft>{@render children()}</div>
  {#if foot}<div class="entry-foot">{@render foot()}</div>{/if}
</div>

<style>
  .entry {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    font-family: var(--font-family-code);
  }
  .entry.out {
    align-items: flex-end;
  }
  .entry-head,
  .entry-foot {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: var(--font-size-xs);
    letter-spacing: 0.12em;
    text-transform: lowercase;
    color: var(--text-support);
  }
  .entry-foot {
    text-transform: none;
    letter-spacing: 0.08em;
    font-size: var(--font-size-2xs);
    flex-wrap: wrap;
  }
  .entry-body {
    max-width: 92%;
    font-family: var(--font-family-sans-text);
    line-height: 1.5;
    color: var(--colors-skeleton-2-contrast);
    text-wrap: pretty;
  }
  .entry.out .entry-body {
    max-width: 85%;
    padding: 8px 12px;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 8px;
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-0-contrast);
  }
  .entry-body.draft {
    border-style: dashed;
    padding: 10px 14px;
  }
</style>

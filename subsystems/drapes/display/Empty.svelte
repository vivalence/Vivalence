<script>
  let { verb, trace = null, tone = null, dashed = false } = $props();
</script>

<div class="empty" class:dashed>
  <span class="empty-verb" class:warning={tone === "warning"}>{verb}</span>
  {#if trace}<span class="empty-trace">{trace}</span>{/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 10px;
    text-align: center;
    min-width: 0;
    overflow-wrap: anywhere;
    font-family: var(--font-family-code);
    user-select: none;
  }
  .empty.dashed {
    background: color-mix(in srgb, var(--colors-skeleton-2-surface) 60%, transparent);
    border: 1px dashed color-mix(in srgb, var(--colors-skeleton-3-boundary) 60%, transparent);
  }
  .empty-verb {
    font-size: var(--font-size-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.55;
  }
  .empty-verb.warning {
    color: var(--colors-skeleton-0-warning-base);
    opacity: 0.9;
  }
  .empty-trace {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.04em;
    opacity: 0.35;
    line-height: 1.5;
  }
</style>

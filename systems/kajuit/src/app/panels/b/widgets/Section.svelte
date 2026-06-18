<script>
  let { name, meta = "", open: initial = false, children } = $props();
  let open = $state(initial);
</script>

<section class:open>
  <header onclick={() => (open = !open)} role="button" tabindex="0">
    <span class="name">{name}</span>
    {#if meta}<span class="meta">{meta}</span>{/if}
    <span class="caret">{open ? "−" : "+"}</span>
  </header>
  {#if open}
    <div class="body">{@render children?.()}</div>
  {/if}
</section>

<style>
  section {
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
  }
  header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
  }
  header:hover .name { color: var(--colors-skeleton-2-primary-base); }
  .name {
    flex: 0 0 auto;
    color: var(--colors-skeleton-2-contrast);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-size: var(--font-size-2xs);
  }
  .meta {
    flex: 1;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.4;
    text-transform: lowercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .caret { opacity: 0.35; font-size: var(--font-size-sm); line-height: 1; }
  section.open header { border-bottom: 1px dashed var(--colors-skeleton-2-boundary); }
  .body { padding: 6px 0 4px; }

  :global(section .row) {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 3px 16px;
    min-width: 0;
  }
  :global(section .row .k) {
    flex: 0 0 86px;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.5;
    font-size: var(--font-size-xs);
  }
  :global(section .row .v) {
    flex: 1;
    text-align: right;
    color: var(--colors-skeleton-2-contrast);
    opacity: 0.92;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  :global(section .row .v.mono) {
    font-feature-settings: "tnum";
    font-size: var(--font-size-2xs);
    opacity: 0.6;
  }
  :global(section .row.click) { cursor: pointer; }
  :global(section .row.click:hover) { background: var(--colors-skeleton-1-surface); }

  :global(section .actions) {
    display: flex;
    gap: 6px;
    padding: 8px 16px 6px;
    flex-wrap: wrap;
  }
  :global(section .act) {
    height: 22px;
    padding: 0 10px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-2-boundary);
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    text-transform: lowercase;
    cursor: pointer;
    opacity: 0.55;
    transition: opacity 0.12s, border-color 0.12s, color 0.12s;
  }
  :global(section .act:hover:not(:disabled)) {
    opacity: 1;
    border-color: var(--colors-skeleton-2-primary-base);
    color: var(--colors-skeleton-2-primary-base);
  }
  :global(section .act.on) {
    opacity: 1;
    border-color: var(--colors-skeleton-2-primary-base);
    color: var(--colors-skeleton-2-primary-base);
  }
  :global(section .act.danger:hover:not(:disabled)) {
    border-color: var(--colors-skeleton-0-danger-base);
    color: var(--colors-skeleton-0-danger-base);
  }
  :global(section .act:disabled) { opacity: 0.25; cursor: not-allowed; }
</style>

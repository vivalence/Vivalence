<script>
  const {
    label,
    on = false,
    tone = "primary",
    dim = false,
    title = null,
    dot = null,
    count = null,
    onclick,
    onpointerdown = null,
  } = $props();
</script>

<button
  class="segment"
  class:on
  class:dim
  data-tone={tone}
  {title}
  {onclick}
  onpointerdown={onpointerdown ?? ((event) => event.preventDefault())}>
  {#if dot}<span class="dot" style:background={dot}></span>{/if}
  <span class="label">{label}</span>
  {#if count != null}<span class="count">{count}</span>{/if}
</button>

<style>
  .segment {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.55rem;
    border-radius: 0.2rem;
    border: 1px solid var(--colors-skeleton-2-boundary);
    background: transparent;
    color: var(--text-support);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    min-height: 1.75rem;
  }
  .segment:hover {
    border-color: var(--text-support);
    color: var(--text-primary);
  }
  .segment.on {
    border-color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-theme-primary-contrast);
  }
  .segment.on[data-tone="secondary"] {
    border-color: var(--colors-theme-secondary-contrast);
    color: var(--colors-theme-secondary-contrast);
  }
  .segment.on[data-tone="warning"] {
    border-color: var(--colors-system-warning-contrast);
    color: var(--colors-system-warning-contrast);
  }
  .segment.on[data-tone="danger"] {
    border-color: var(--colors-system-error-contrast);
    color: var(--colors-system-error-contrast);
  }
  .segment.dim {
    opacity: 0.45;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 1px;
    flex: none;
  }
  .count {
    opacity: 0.5;
  }
</style>

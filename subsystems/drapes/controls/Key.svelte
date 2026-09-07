<script>
  let { label, tone = "muted", active = false, disabled = false, title = null, onclick, children } = $props();
</script>

<button class="key {tone}" class:active {disabled} {title} onclick={disabled ? undefined : onclick}>
  {#if children}{@render children()}{:else}{label}{/if}
</button>

<style>
  .key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 14px;
    border: 1px solid var(--colors-skeleton-3-boundary);
    border-radius: 2px;
    background: transparent;
    color: color-mix(in srgb, var(--colors-skeleton-3-contrast) 70%, transparent);
    font: inherit;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.12s, border-color 0.12s, background 0.12s;
  }
  .key:hover {
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .key.primary {
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 45%, transparent);
    color: var(--colors-skeleton-0-primary-base);
  }
  .key.primary:hover,
  .key.active {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 9%, transparent);
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .key.danger {
    color: var(--colors-skeleton-0-danger-base);
  }
  .key.danger:hover {
    border-color: var(--colors-skeleton-0-danger-base);
  }
  .key:disabled {
    opacity: 0.35;
    cursor: default;
  }
  @media (pointer: coarse) {
    .key {
      min-height: 44px;
      padding: 0 14px;
    }
  }
</style>

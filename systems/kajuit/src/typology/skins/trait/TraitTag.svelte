<script>
  let { name, active = false, open = false, disabled = false, onclick, children } = $props();
</script>

<div class="trait-tag" class:active class:open class:disabled>
  <button class="body" {disabled} onclick={onclick}>{name}</button>
  {@render children?.()}
</div>

<style>
  .trait-tag {
    display: inline-flex;
    align-items: stretch;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 70%, transparent);
    border-radius: 3px;
    overflow: hidden;
    opacity: 0.5;
  }
  .trait-tag.active {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .trait-tag.open {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, transparent);
  }
  .trait-tag.disabled {
    opacity: 0.3;
  }
  .body {
    background: none;
    border: none;
    color: color-mix(in srgb, currentColor 50%, transparent);
    font: inherit;
    font-size: var(--font-size-2xs);
    letter-spacing: 0.06em;
    text-transform: lowercase;
    padding: 2px 7px;
    cursor: pointer;
  }
  .trait-tag.active .body {
    color: var(--colors-skeleton-0-primary-base);
  }
  .body:disabled {
    cursor: default;
  }
</style>

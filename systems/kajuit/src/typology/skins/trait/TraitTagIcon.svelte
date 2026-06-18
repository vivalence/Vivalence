<script>
  let { active = false, onclick } = $props();

  function click(event) {
    event.stopPropagation();
    onclick?.();
  }
</script>

<button class="trait-tag-icon" class:active onclick={click}>
  {active ? "×" : "+"}
</button>

<style>
  .trait-tag-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    background: none;
    border: none;
    border-left: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 70%, transparent);
    color: inherit;
    font: inherit;
    font-size: var(--font-size-xs);
    line-height: 1;
    cursor: pointer;
    opacity: 0.7;
  }
  .trait-tag-icon:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
  }
  .trait-tag-icon.active {
    color: var(--colors-skeleton-0-primary-base);
  }
</style>

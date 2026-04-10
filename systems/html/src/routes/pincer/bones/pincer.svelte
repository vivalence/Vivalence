<script>
  let { rect } = $props();
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
>
</div>

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-0-surface);
    border: 1px solid var(--colors-skeleton-0-boundary);
    pointer-events: none;
    z-index: 49;
    overflow: hidden;
  }
</style>

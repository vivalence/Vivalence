<script>
  import { place } from "./float.js";

  let { anchor, zone, title = null, side = "below", snug = false, onclose, children } = $props();

  let box = $state(null);
  let at = $state({ left: 0, top: 0 });

  const portal = (node) => {
    document.body.appendChild(node);
    return { destroy: () => node.remove() };
  };

  $effect(() => {
    if (!box || !anchor) return;
    const size = box.getBoundingClientRect();
    at = place(anchor.getBoundingClientRect(), size, { width: window.innerWidth, height: window.innerHeight }, side);
  });
</script>

<div class="overlay" data-zone={zone} use:portal>
  <button class="scrim" onclick={onclose} aria-label="close"></button>
  <div class="float" class:snug bind:this={box} style:left="{at.left}px" style:top="{at.top}px">
    {#if title}
      <div class="float-head">
        <span class="float-title">{title}</span>
        <button class="float-close" onclick={onclose}>✕</button>
      </div>
    {/if}
    {@render children()}
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: none;
    border: none;
    cursor: default;
  }
  .float {
    position: fixed;
    z-index: 61;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-sizing: border-box;
    width: min(330px, calc(100vw - 16px));
    max-height: calc(100vh - 16px);
    overflow: auto;
    padding: 12px;
    background: var(--surface-lift);
    color: var(--text-strong);
    border-radius: var(--shape-radius-card);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), var(--shape-lift);
    font-family: var(--font-family-sans-text);
    font-size: var(--size-type-xs);
  }
  .float.snug {
    width: max-content;
    gap: 2px;
    padding: 4px;
  }
  .float-head {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .float-title {
    font-weight: 600;
    font-size: var(--size-type-sm);
  }
  .float-close {
    margin-left: auto;
    background: none;
    border: none;
    padding: 0;
    color: var(--text-light);
    font: inherit;
    cursor: pointer;
  }
</style>

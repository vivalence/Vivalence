<script>
  let { docked, places, names, digests, width, docking, ontab, children } = $props();
</script>

<div class="twig" style:width="{width}px">
  {#each docked as index, slot (index)}
    <div
      class="tab"
      class:last={slot === docked.length - 1}
      style:left="{places[index].left}px"
      style:width="{places[index].width}px"
      onpointerdown={(event) => ontab(event, index)}>
      <span class="name">{names[index]}</span>
      {#if places[index].width >= 190}
        <span class="digest">{digests[index]}</span>
      {/if}
    </div>
  {/each}
  {#if docking}
    <div class="zone">release · dock</div>
  {/if}
  {@render children?.()}
</div>

<style>
  .twig {
    position: absolute;
    left: 0;
    top: 0;
    height: 44px;
    box-sizing: border-box;
    background: var(--colors-skeleton-1-surface);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    z-index: 4;
  }
  .tab {
    position: absolute;
    top: 0;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 8px;
    box-sizing: border-box;
    border-right: 1px solid var(--colors-skeleton-1-boundary);
    cursor: pointer;
    touch-action: none;
    white-space: nowrap;
  }
  .tab.last {
    border-right: none;
  }
  .tab:hover {
    background: var(--colors-skeleton-2-surface);
  }
  .name {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 600;
    color: var(--colors-skeleton-1-contrast);
  }
  .digest {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-1-contrast);
    opacity: 0.7;
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .zone {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    border: 2px dashed var(--colors-skeleton-0-primary-base);
    background: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-surface);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    pointer-events: none;
    z-index: 12;
  }
</style>

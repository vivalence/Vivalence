<script>
  import { getContext } from "svelte";
  import { QUARTERS, TOP } from "$client";
  import Tab from "./widgets/Tab.svelte";

  let { rect } = $props();
  const quarters = getContext(QUARTERS);
  const top = getContext(TOP);

  let terminals = $state([...quarters.terminals.all()]);
  let activeId = $state(top.active);

  quarters.terminals.$entities.subscribe((entities) => {
    terminals = [...entities.values()];
  });
  top.$active.subscribe((value) => (activeId = value));
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  <div class="population">
    <div class="tabs">
      <button class="tab add" onclick={() => top.spawn()} title="new terminal">+</button>
      {#each terminals as t (t.id)}
        <Tab
          terminal={t}
          isActive={t.id === activeId}
          onactivate={() => top.activate(t.id)}
          onclose={() => top.close(t.id)} />
      {/each}
    </div>
  </div>
</div>

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding: 0 14px;
    justify-content: flex-end;
    pointer-events: none;
    overflow: hidden;
  }
  .population > * {
    pointer-events: auto;
  }
  .tabs {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0 2px;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab.add {
    flex: 0 0 auto;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 30%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
    border-radius: 3px;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: lowercase;
    cursor: pointer;
    opacity: 0.4;
    min-width: 22px;
    max-width: 22px;
    padding: 0;
    line-height: 0;
    transition: opacity 0.16s, background 0.16s, border-color 0.16s, color 0.16s;
  }
  .tab.add:hover {
    opacity: 0.85;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
</style>

<script>
  import { getContext } from "svelte";
  import { stores } from "@vivalence/kajuit";
  import { TERMINALS } from "$client";
  import Tab from "./widgets/Tab.svelte";

  let { rect } = $props();

  const axis = $derived(stores.bridge.axisFor(rect));

  const terminals = getContext(TERMINALS);

  let tabs = $state([...terminals.entities]);
  let activeId = $state(terminals.active?.id);

  terminals.$entities.subscribe((entities) => {
    tabs = [...entities];
  });
  terminals.$active.subscribe((t) => (activeId = t?.id));
</script>

<div
  class="bone"
  class:column={axis === "column"}
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  <div class="population" style:padding={axis === "column" ? "12px 0" : "0 12px"}>
    <div
      class="tabs"
      style:flex-direction={axis}
      style:padding={axis === "column" ? "2px 0" : "0 2px"}
      style:overflow-x={axis === "column" ? "hidden" : "auto"}
      style:overflow-y={axis === "column" ? "auto" : "hidden"}>
      <button class="tab add" onclick={() => terminals.create()} title="new terminal">+</button>
      {#each tabs as t (t.id)}
        <Tab
          terminal={t}
          {axis}
          isActive={t.id === activeId}
          onactivate={() => terminals.activate(t.id)}
          onclose={() => terminals.remove(t.id)} />
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
  .bone.column {
    border-top: none;
    border-bottom: none;
    border-left: 1px solid var(--colors-skeleton-1-boundary);
    border-right: 1px solid var(--colors-skeleton-1-boundary);
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    pointer-events: none;
    overflow: hidden;
  }
  .population > * {
    pointer-events: auto;
  }
  .tabs {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 100%;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab.add {
    flex: 0 0 auto;
    height: 24px;
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 30%, transparent);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 50%, transparent);
    border-radius: 3px;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: lowercase;
    cursor: pointer;
    opacity: 0.4;
    min-width: 24px;
    max-width: 24px;
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

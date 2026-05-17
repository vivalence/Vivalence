<script>
  import { getContext } from "svelte";
  import { MAIN, BRIDGE } from "$client";
  import Buffer from "./widgets/Buffer.svelte";
  import Dock from "./widgets/Dock.svelte";

  const main = getContext(MAIN);
  const bridge = getContext(BRIDGE);

  function normalize(v) {
    return v === "dock" ? "dock" : "buffer";
  }

  let view = $state(normalize(bridge.view.f));

  let currentThread = $state(main.current);
  main.$current.subscribe((value) => (currentThread = value));

  function select(next) {
    view = next;
    bridge.view.f = next;
    bridge.save();
  }
</script>

<div class="panel">
  <div class="tab-bar">
    <button class="tab" class:active={view === "buffer"} onclick={() => select("buffer")}
      >buffer</button>
    <button class="tab" class:active={view === "dock"} onclick={() => select("dock")}
      >dock</button>
  </div>

  {#if view === "buffer"}
    {#if !currentThread}
      <div class="empty">no active thread</div>
    {:else}
      <Buffer thread={currentThread} />
    {/if}
  {:else if view === "dock"}
    <Dock />
  {/if}
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: var(--colors-skeleton-3-surface);
    color: var(--colors-skeleton-3-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    letter-spacing: 0.04em;
  }
  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
  }
  .tab {
    flex: 1;
    padding: 5px 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    text-transform: lowercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    opacity: 0.4;
  }
  .tab:hover {
    opacity: 0.7;
  }
  .tab.active {
    opacity: 1;
    border-bottom-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
    font-family: var(--font-family-code);
    font-size: 10px;
  }
</style>

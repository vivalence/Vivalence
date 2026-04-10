<script>
  import { getContext } from "svelte";
  import { QUARTERS } from "$client";

  let { rect } = $props();
  const quartersInstance = getContext(QUARTERS);

  let terminals = $state([...quartersInstance.terminals.all()]);
  let terminal = $state(quartersInstance.$terminal.get());
  quartersInstance.terminals.$entities.subscribe((entities) => {
    terminals = [...entities.values()];
  });
  quartersInstance.$terminal.subscribe((value) => terminal = value);
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
>
  <div class="population">
    <div class="tabs">
      <button class="tab add" onclick={() => quartersInstance.spawn()} title="new terminal">+</button>
      {#each terminals as t (t.id)}
        <button
          class="tab"
          class:active={t.id === terminal?.id}
          title={t.slug}
          onclick={() => quartersInstance.activate(t.id)}
        >
          <span class="tab-title" dir="rtl">{t.slug ?? ".unnamed"}</span>
          {#if t.id === terminal?.id}
            <button class="tab-close" onclick={(e) => { e.stopPropagation(); quartersInstance.close(t.id); }}>×</button>
          {/if}
        </button>
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
    padding: 0 16px;
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
    gap: 3px;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0 2px;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    flex: 0 0 auto;
    max-width: 96px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    padding: 0 5px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    letter-spacing: 0.02em;
    text-transform: lowercase;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.12s, background 0.12s, border-color 0.12s;
  }
  .tab:hover {
    opacity: 0.85;
    background: var(--colors-skeleton-0-surface);
  }
  .tab.active {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
    background: var(--colors-skeleton-0-surface);
  }
  .tab.add {
    opacity: 0.35;
    font-size: 12px;
    font-weight: bold;
    min-width: 18px;
    max-width: 18px;
    justify-content: center;
  }
  .tab.add:hover {
    opacity: 0.7;
  }
  .tab-close {
    flex: 0 0 auto;
    background: none;
    border: none;
    color: inherit;
    font-size: 11px;
    line-height: 1;
    padding: 0 0 0 4px;
    cursor: pointer;
    opacity: 0.4;
  }
  .tab-close:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-danger-base, red);
  }
  .tab-title {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    direction: rtl;
    text-align: right;
  }
  .tab-title::before {
    content: "\200E";
  }
</style>

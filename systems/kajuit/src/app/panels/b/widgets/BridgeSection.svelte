<script>
  import { getContext } from "svelte";
  import { BRIDGE, TERMINALS } from "$client";
  import { chain, stores } from "@vivalence/kajuit";
  import Section from "./Section.svelte";

  const SIDES = ["top", "right", "bottom", "left"];
  const SIDE_LABELS = { top: "↥", right: "↦", bottom: "↧", left: "↤" };
  const THEMES = ["nordic", "paper"];

  const bridge = getContext(BRIDGE);
  const terminals = getContext(TERMINALS);
  const dock = chain(terminals, "$active", "$dock");

  let pincer = $state(bridge.layout.pincer);
  let orientation = $state(bridge.layout.orientation);
  let viewport = $state(bridge.layout.viewport);
  let g = $state(bridge.view.g);
  let h = $state(bridge.view.h);
  let snap = $state(bridge.view.snap);
  let theme = $state(bridge.view.theme);

  bridge.layout.$pincer.subscribe((v) => (pincer = v));
  bridge.layout.$orientation.subscribe((v) => (orientation = v));
  bridge.layout.$viewport.subscribe((v) => (viewport = v));
  bridge.view.$g.subscribe((v) => (g = v));
  bridge.view.$h.subscribe((v) => (h = v));
  bridge.view.$snap.subscribe((v) => (snap = v));
  bridge.view.$theme.subscribe((v) => (theme = v));
</script>

<Section name="bridge" meta={`${orientation}°`}>
  <div class="row"><span class="k">pincer</span><span class="v mono">{Math.round(pincer.x)}·{Math.round(pincer.y)}</span></div>
  <div class="row"><span class="k">viewport</span><span class="v mono">{viewport.width}×{viewport.height}</span></div>
  <div class="actions">
    <button class="act" class:on={g} onclick={() => bridge.toggle("g")}>g</button>
    <button class="act" class:on={h} onclick={() => bridge.toggle("h")}>h</button>
    <button class="act" class:on={snap} onclick={() => bridge.toggle("snap")}>snap</button>
  </div>
  <div class="row">
    <span class="k">theme</span>
    <select
      class="theme-select"
      value={theme}
      onchange={(e) => bridge.setTheme(e.currentTarget.value)}>
      {#each THEMES as name (name)}
        <option value={name}>{name}</option>
      {/each}
    </select>
  </div>

  {#if $dock}
    <div class="row">
      <span class="k">dock</span>
      <span class="sides">
        {#each SIDES as s (s)}
          <button
            type="button"
            class="side"
            class:on={s === $dock.side}
            title="dock {s}"
            onclick={() => stores.bridge.setDockSide(terminals.active?.$dock, s)}>{SIDE_LABELS[s]}</button>
        {/each}
      </span>
    </div>
    <div class="row">
      <span class="k">size</span>
      <span class="size-row">
        <input
          class="slider"
          type="range"
          min="0.18"
          max="1.0"
          step="0.01"
          value={$dock.share ?? 0.32}
          oninput={(e) => stores.bridge.setDockShare(terminals.active?.$dock, Number(e.currentTarget.value))} />
        <span class="size-readout">{Math.round(($dock.share ?? 0.32) * 100)}%</span>
      </span>
    </div>
    <div class="row">
      <span class="k">state</span>
      <span class="sides">
        <button
          type="button"
          class="side wide"
          class:on={$dock.collapsed}
          title="toggle dock"
          onclick={() => stores.bridge.setDockCollapsed(terminals.active?.$dock)}>{$dock.collapsed ? "show" : "hide"}</button>
        <button
          type="button"
          class="side wide"
          class:on={$dock.full}
          title="toggle fullscreen"
          onclick={() => stores.bridge.setDockFull(terminals.active?.$dock)}>full</button>
      </span>
    </div>
  {/if}
</Section>

<style>
  .sides {
    display: inline-flex;
    gap: 3px;
    flex: 1;
  }
  .side {
    width: 18px;
    height: 18px;
    line-height: 1;
    padding: 0;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    border-radius: 2px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.16s, color 0.16s, border-color 0.16s;
  }
  .side:hover {
    opacity: 0.9;
    color: var(--colors-skeleton-0-primary-base);
  }
  .side.on {
    opacity: 1;
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .side.wide {
    width: auto;
    padding: 0 8px;
  }
  .theme-select {
    -webkit-appearance: none;
    appearance: none;
    height: 18px;
    padding: 0 8px;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    border-radius: 2px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    line-height: 1;
    cursor: pointer;
  }
  .theme-select:hover {
    color: var(--colors-skeleton-0-primary-base);
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .theme-select option {
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
  }
  .size-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 1;
  }
  .slider {
    flex: 1;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: color-mix(in srgb, var(--colors-skeleton-0-boundary) 60%, transparent);
    border-radius: 2px;
    cursor: pointer;
  }
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--colors-skeleton-0-primary-base);
    cursor: pointer;
  }
  .slider::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border: 0;
    border-radius: 50%;
    background: var(--colors-skeleton-0-primary-base);
    cursor: pointer;
  }
  .size-readout {
    min-width: 28px;
    text-align: right;
    opacity: 0.6;
    font-size: var(--font-size-2xs);
  }
</style>

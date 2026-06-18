<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";
  import Section from "./Section.svelte";

  const SIDES = ["top", "right", "bottom", "left"];
  const SIDE_LABELS = { top: "↥", right: "↦", bottom: "↧", left: "↤" };

  const bridge = getContext(BRIDGE);

  let pincer = $state(bridge.layout.pincer);
  let orientation = $state(bridge.layout.orientation);
  let viewport = $state(bridge.layout.viewport);
  let g = $state(bridge.view.g);
  let h = $state(bridge.view.h);
  let snap = $state(bridge.view.snap);
  let dock = $state(bridge.dock);

  bridge.layout.$pincer.subscribe((v) => (pincer = v));
  bridge.layout.$orientation.subscribe((v) => (orientation = v));
  bridge.layout.$viewport.subscribe((v) => (viewport = v));
  bridge.view.$g.subscribe((v) => (g = v));
  bridge.view.$h.subscribe((v) => (h = v));
  bridge.view.$snap.subscribe((v) => (snap = v));
  bridge.$dock.subscribe((v) => (dock = v));
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
    <span class="k">dock</span>
    <span class="sides">
      {#each SIDES as s (s)}
        <button
          type="button"
          class="side"
          class:on={s === dock.side}
          title="dock {s}"
          onclick={() => bridge.setDockSide(s)}>{SIDE_LABELS[s]}</button>
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
        value={dock.share ?? 0.32}
        oninput={(e) => bridge.setDockShare(Number(e.currentTarget.value))} />
      <span class="size-readout">{Math.round((dock.share ?? 0.32) * 100)}%</span>
    </span>
  </div>
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

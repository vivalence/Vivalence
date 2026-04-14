<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";

  const { layout, view, toggle } = getContext(BRIDGE);

  let show = $state(view.$inspectBridge.get());
  view.$inspectBridge.subscribe(v => show = v);

  let pincer = $state(layout.$pincer.get());
  let previous = $state(layout.$previous.get());
  let standard = $state(layout.$standard.get());
  let orientation = $state(layout.$orientation.get());
  let viewport = $state(layout.$viewport.get());
  let viewG = $state(view.$g.get());
  let viewH = $state(view.$h.get());

  layout.$pincer.subscribe(v => pincer = v);
  layout.$previous.subscribe(v => previous = v);
  layout.$standard.subscribe(v => standard = v);
  layout.$orientation.subscribe(v => orientation = v);
  layout.$viewport.subscribe(v => viewport = v);
  view.$g.subscribe(v => viewG = v);
  view.$h.subscribe(v => viewH = v);

  function rotate() {
    const nextOrientation = ({ 0: 90, 90: 180, 180: 270, 270: 0 })[orientation] ?? 0;
    layout.orientation = nextOrientation;
  }

  function setStandardFromPincer() {
    layout.standard = { ...pincer };
  }

  function setPincerFromStandard() {
    layout.pincer = { ...standard };
  }

  function nudge(axis, delta) {
    layout.pincer = { ...pincer, [axis]: pincer[axis] + delta };
  }
</script>

{#if show}
  <div class="overlay">
    <div class="modeline">
      <span class="seg hi">B</span>
      <span class="sep">›</span>
      <span class="seg lo">bridge</span>
      <span class="spacer"></span>
      <button class="btn close" onclick={() => toggle("inspectBridge")}>×</button>
    </div>
    <div class="body">
      <div class="group-label">layout</div>
      <div class="row">
        <span class="k">$pincer</span>
        <span class="v mono">{Math.round(pincer.x)}·{Math.round(pincer.y)}</span>
      </div>
      <div class="row indent">
        <span class="k">x</span>
        <span class="v">
          <button class="btn mini" onclick={() => nudge("x", -10)}>−</button>
          <span class="mono">{Math.round(pincer.x)}</span>
          <button class="btn mini" onclick={() => nudge("x", 10)}>+</button>
        </span>
      </div>
      <div class="row indent">
        <span class="k">y</span>
        <span class="v">
          <button class="btn mini" onclick={() => nudge("y", -10)}>−</button>
          <span class="mono">{Math.round(pincer.y)}</span>
          <button class="btn mini" onclick={() => nudge("y", 10)}>+</button>
        </span>
      </div>
      <div class="row">
        <span class="k">$orientation</span>
        <span class="v">
          <span class="mono">{orientation}°</span>
          <button class="btn mini" onclick={rotate}>↻</button>
        </span>
      </div>
      <div class="row">
        <span class="k">$viewport</span>
        <span class="v mono">{viewport.width}×{viewport.height}</span>
      </div>
      <div class="row">
        <span class="k">$standard</span>
        <span class="v">
          <span class="mono">{Math.round(standard.x)}·{Math.round(standard.y)}</span>
          <button class="btn mini" onclick={setStandardFromPincer} title="set standard to current">⇐</button>
          <button class="btn mini" onclick={setPincerFromStandard} title="jump to standard">⇒</button>
        </span>
      </div>
      <div class="row">
        <span class="k">$previous</span>
        <span class="v mono">{Math.round(previous.x)}·{Math.round(previous.y)}</span>
      </div>
      <div class="group-label">view</div>
      <div class="row">
        <span class="k">$g</span>
        <span class="v">
          <button class="btn mini" class:on={viewG} onclick={() => toggle("g")}>{viewG}</button>
        </span>
      </div>
      <div class="row">
        <span class="k">$h</span>
        <span class="v">
          <button class="btn mini" class:on={viewH} onclick={() => toggle("h")}>{viewH}</button>
        </span>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 58px;
    left: calc(50vw + 4px);
    width: calc(25vw - 12px);
    max-width: 320px;
    max-height: calc(100vh - 74px);
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    z-index: 79;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--colors-skeleton-0-accent-base);
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }
  .modeline {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 4px 0 12px;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    font-size: 10px;
    text-transform: lowercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .body {
    flex: 1;
    overflow-y: auto;
    padding: 6px 0;
    font-size: 10px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 12px;
    border-bottom: 1px dashed var(--colors-skeleton-1-boundary);
  }
  .row.indent { padding-left: 24px; }
  .group-label {
    padding: 6px 12px 2px;
    color: var(--colors-skeleton-2-contrast);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 9px;
  }
  .k {
    color: var(--colors-skeleton-2-contrast);
    flex: 0 0 36%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .v {
    color: var(--colors-skeleton-1-contrast);
    flex: 1;
    text-align: right;
    white-space: nowrap;
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: flex-end;
  }
  .mono { font-feature-settings: "tnum"; opacity: 0.85; }
  .seg.hi { color: var(--colors-skeleton-0-accent-base); font-weight: 600; }
  .seg.lo { color: var(--colors-skeleton-2-contrast); }
  .sep { color: var(--colors-skeleton-0-boundary); font-size: 10px; }
  .spacer { flex: 1; }
  .btn {
    height: 22px;
    min-width: 24px;
    padding: 0 6px;
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    cursor: pointer;
  }
  .btn.mini {
    height: 18px;
    min-width: 20px;
    padding: 0 5px;
    font-size: 9px;
  }
  .btn.mini.on {
    background: var(--colors-skeleton-0-accent-base);
    color: var(--colors-skeleton-0-contrast);
    border-color: var(--colors-skeleton-0-accent-base);
  }
  .btn.close {
    border: none;
    font-size: 16px;
    height: 24px;
  }
  .btn.close:hover {
    color: var(--colors-skeleton-0-danger-base);
  }
  @media (max-width: 600px) {
    .overlay {
      left: 12px;
      right: 12px;
      width: auto;
    }
  }
</style>

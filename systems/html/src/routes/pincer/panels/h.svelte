<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";

  const { layout, view, toggle } = getContext(BRIDGE);

  let show = $state(view.$h.get());
  let gActive = $state(view.$g.get());
  let inspectLighthouse = $state(view.$inspectLighthouse.get());
  let inspectQuarters = $state(view.$inspectQuarters.get());
  let inspectBridge = $state(view.$inspectBridge.get());
  let inspectThread = $state(view.$inspectThread.get());
  view.$h.subscribe(v => show = v);
  view.$g.subscribe(v => gActive = v);
  view.$inspectLighthouse.subscribe(v => inspectLighthouse = v);
  view.$inspectQuarters.subscribe(v => inspectQuarters = v);
  view.$inspectBridge.subscribe(v => inspectBridge = v);
  view.$inspectThread.subscribe(v => inspectThread = v);

  let orientation = $state(layout.$orientation.get());
  let pincer = $state(layout.$pincer.get());
  let previous = $state(layout.$previous.get());
  let standard = $state(layout.$standard.get());
  layout.$orientation.subscribe(v => orientation = v);
  layout.$pincer.subscribe(v => pincer = v);
  layout.$previous.subscribe(v => previous = v);
  layout.$standard.subscribe(v => standard = v);
</script>

{#if show}
  <div class="overlay">
    <span class="seg hi">H</span>
    <span class="sep">›</span>
    <span class="seg hi">orient {orientation}°</span>
    <span class="sep">›</span>
    <span class="seg">pincer {Math.round(pincer.x)}·{Math.round(pincer.y)}</span>
    <span class="sep">›</span>
    <span class="seg lo">prev {Math.round(previous.x)}·{Math.round(previous.y)}</span>
    <span class="sep">›</span>
    <span class="seg lo">home {Math.round(standard.x)}·{Math.round(standard.y)}</span>
    <span class="spacer"></span>
    <span class="hint">1·home · 2·swap · 3·set · hold·rotate</span>
    <span class="devgroup" title="context inspectors">
      <button
        class="btn dev"
        class:on={inspectLighthouse}
        onclick={() => toggle("inspectLighthouse")}
        title="inspect LIGHTHOUSE"
      >L</button>
      <button
        class="btn dev"
        class:on={inspectQuarters}
        onclick={() => toggle("inspectQuarters")}
        title="inspect QUARTERS"
      >Q</button>
      <button
        class="btn dev"
        class:on={inspectBridge}
        onclick={() => toggle("inspectBridge")}
        title="inspect BRIDGE"
      >B</button>
      <button
        class="btn dev"
        class:on={inspectThread}
        onclick={() => toggle("inspectThread")}
        title="inspect THREAD"
      >T</button>
    </span>
    <button
      class="btn"
      class:on={gActive}
      onclick={() => toggle("g")}
      title="toggle G — system tray"
    >G</button>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    z-index: 80;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }
  .seg { white-space: nowrap; font-size: 9px; letter-spacing: 0.08em; }
  .seg.hi { color: var(--colors-skeleton-1-contrast); font-weight: 600; }
  .seg.lo { color: var(--colors-skeleton-2-contrast); }
  .sep {
    color: var(--colors-skeleton-0-boundary);
    font-size: 10px;
    flex-shrink: 0;
  }
  .spacer { flex: 1; min-width: 0; }
  .hint {
    color: var(--colors-skeleton-2-contrast);
    font-size: 9px;
    letter-spacing: 0.08em;
    opacity: 0.6;
    white-space: nowrap;
  }
  .btn {
    height: 20px;
    min-width: 24px;
    padding: 0 7px;
    background: none;
    border: 1px solid var(--colors-skeleton-0-boundary);
    border-radius: 4px;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 9px;
    font-weight: bold;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.12s;
  }
  .btn:hover {
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-1-contrast);
  }
  .btn.on {
    background: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-contrast);
    border-color: var(--colors-skeleton-0-boundary);
  }
  .devgroup {
    display: inline-flex;
    gap: 2px;
    padding-right: 6px;
    border-right: 1px solid var(--colors-skeleton-0-boundary);
    margin-right: 2px;
  }
  .btn.dev {
    min-width: 20px;
    padding: 0 5px;
    border-color: var(--colors-skeleton-1-boundary);
    color: var(--colors-skeleton-2-contrast);
  }
  .btn.dev.on {
    background: var(--colors-skeleton-0-accent-base);
    color: var(--colors-skeleton-0-contrast);
    border-color: var(--colors-skeleton-0-accent-base);
  }
  @media (max-width: 600px) {
    .hint { display: none; }
  }
</style>

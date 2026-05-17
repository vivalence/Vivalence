<script>
  import { getContext } from "svelte";
  import { LIGHTHOUSE, QUARTERS, BRIDGE, MAIN } from "$client";
  import { skins } from "@vivalence/drapes";
  import { inspector } from "@vivalence/kajuit";
  const { Skin } = skins;

  const lighthouse = getContext(LIGHTHOUSE);
  const quarters = getContext(QUARTERS);
  const bridge = getContext(BRIDGE);
  const main = getContext(MAIN);

  let show = $state(bridge.view.h);
  let gActive = $state(bridge.view.g);
  bridge.view.$h.subscribe(v => show = v);
  bridge.view.$g.subscribe(v => gActive = v);

  let inspectorHeight = $state(bridge.layout.inspectorHeight);
  bridge.layout.$inspectorHeight.subscribe(v => inspectorHeight = v);

  const nodesAtom = inspector.inspectorAtom(lighthouse, quarters, bridge, main);
  let nodes = $state(nodesAtom.get());
  nodesAtom.subscribe(v => nodes = v);

  let dragging = $state(false);
  let dragStartY = $state(0);
  let dragStartHeight = $state(0);

  function onHandlePointerDown(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging = true;
    dragStartY = event.clientY;
    dragStartHeight = inspectorHeight;
  }

  function onHandlePointerMove(event) {
    if (!dragging) return;
    bridge.layout.inspectorHeight = Math.max(0, Math.min(window.innerHeight - 80, dragStartHeight + event.clientY - dragStartY));
  }

  function onHandlePointerUp(event) {
    if (!dragging) return;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch (_) {}
    dragging = false;
    bridge.save();
  }

  const open = $derived(inspectorHeight > 20);
</script>

{#if show}
  <div class="drawer" style:height="{50 + inspectorHeight}px">
    <div class="modeline">
      <span class="seg hi">H</span>
      <span class="sep">›</span>
      <span class="seg lo">inspector</span>
      <span class="spacer"></span>
      <button
        class="btn"
        class:on={gActive}
        onclick={() => bridge.toggle("g")}
        title="toggle G — telemetry"
      >G</button>
      <button class="btn close" onclick={() => bridge.toggle("h")}>×</button>
    </div>

    {#if open && nodes}
      <div class="inspector-body">
        <Skin {nodes} variant="breadcrumb" />
      </div>
    {/if}

    <div
      class="drag-handle"
      class:dragging
      onpointerdown={onHandlePointerDown}
      onpointermove={onHandlePointerMove}
      onpointerup={onHandlePointerUp}
      onpointercancel={onHandlePointerUp}
    >
      <div class="drag-pill"></div>
    </div>
  </div>
{/if}

<style>
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    min-height: 50px;
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-1-contrast);
    font-family: var(--font-family-code);
    z-index: 80;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }
  .modeline {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    min-height: 32px;
    padding: 0 6px 0 14px;
    border-bottom: 1px solid var(--colors-skeleton-0-boundary);
    font-size: 11px;
    text-transform: lowercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .inspector-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 10px;
    -webkit-overflow-scrolling: touch;
  }
  .drag-handle {
    flex-shrink: 0;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ns-resize;
    touch-action: none;
    user-select: none;
    border-top: 1px solid var(--colors-skeleton-0-boundary);
  }
  .drag-handle:hover .drag-pill,
  .drag-handle.dragging .drag-pill {
    opacity: 0.7;
    width: 48px;
  }
  .drag-pill {
    width: 32px;
    height: 3px;
    border-radius: 2px;
    background: var(--colors-skeleton-0-boundary);
    opacity: 0.35;
    transition: opacity 0.12s, width 0.12s;
  }

  .seg { white-space: nowrap; font-size: 9px; letter-spacing: 0.08em; }
  .seg.hi { color: var(--colors-skeleton-1-contrast); font-weight: 600; }
  .seg.lo { color: var(--colors-skeleton-2-contrast); }
  .sep { color: var(--colors-skeleton-0-boundary); font-size: 10px; flex-shrink: 0; }
  .spacer { flex: 1; min-width: 0; }
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
  .btn.close {
    border: none;
    font-size: 16px;
    height: 24px;
  }
  .btn.close:hover {
    color: var(--colors-skeleton-0-danger-base);
  }
</style>

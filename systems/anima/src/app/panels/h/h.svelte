<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";
  import Inspector from "./Inspector.svelte";

  const bridge = getContext(BRIDGE);

  let show = $state(bridge.view.h);
  let gActive = $state(bridge.view.g);
  bridge.view.$h.subscribe(v => show = v);
  bridge.view.$g.subscribe(v => gActive = v);

  let inspectorHeight = $state(bridge.layout.inspectorHeight);
  bridge.layout.$inspectorHeight.subscribe(v => inspectorHeight = v);

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
  <div data-zone="3" class="drawer" style:height="{50 + inspectorHeight}px">
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

    {#if open}
      <div class="inspector-body">
        <Inspector />
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
    padding-top: var(--safe-area-top);
    padding-left: var(--safe-area-left);
    padding-right: var(--safe-area-right);
    min-height: 50px;
    background: var(--surface-sunk);
    color: var(--text-strong);
    font-family: var(--font-family-code);
    z-index: 80;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--boundary);
    box-shadow: 0 8px 24px var(--shadow);
    overflow: hidden;
  }
  .modeline {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    min-height: 32px;
    padding: 0 6px 0 14px;
    border-bottom: 1px solid var(--boundary);
    font-size: var(--font-size-xs);
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
    border-top: 1px solid var(--boundary);
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
    background: var(--divider);
    opacity: 0.35;
    transition: opacity 0.12s, width 0.12s;
  }

  .seg { white-space: nowrap; font-size: var(--font-size-2xs); letter-spacing: 0.08em; }
  .seg.hi { color: var(--text-strong); font-weight: 600; }
  .seg.lo { color: var(--text-strong); }
  .sep { color: var(--boundary); font-size: var(--font-size-xs); flex-shrink: 0; }
  .spacer { flex: 1; min-width: 0; }
  .btn {
    height: 20px;
    min-width: 24px;
    padding: 0 7px;
    background: none;
    border: 1px solid var(--boundary);
    border-radius: 4px;
    color: var(--text-strong);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    font-weight: bold;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.12s;
  }
  .btn:hover {
    background: var(--surface-sunk);
    color: var(--text-strong);
  }
  .btn.on {
    background: var(--signal-primary);
    color: var(--text-strong);
    border-color: var(--boundary);
  }
  .btn.close {
    border: none;
    font-size: var(--font-size-base);
    height: 24px;
  }
  .btn.close:hover {
    color: var(--signal-negative-ink);
  }

  @media (max-width: 600px) {
    .btn.close { height: 44px; min-width: 44px; }
    .btn { height: 32px; min-width: 32px; }
  }
</style>

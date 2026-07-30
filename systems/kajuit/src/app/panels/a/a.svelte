<script>
  import { getContext } from "svelte";
  import { TERMINALS } from "$client";
  import { chain, stores } from "@vivalence/kajuit";
  import { Frame } from "@vivalence/drapes";
  import Dock from "./widgets/Dock.svelte";

  let { rect } = $props();

  const terminals = getContext(TERMINALS);

  const terminal = terminals.$active;
  const thread = chain(terminals, "$active", "$thread");
  const buffer = chain(terminals, "$active", "$buffer");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const dock = chain(terminals, "$active", "$dock");

  const view = $derived.by(() => {
    const active = $buffer;
    if (!active) return null;
    const base = active.mode?.app?.url ?? null;
    if (active.view) return base ? active.view.withUrl(base) : active.view;
    if (!active.mode?.app?.view) throw new Error("[a] buffer & mode missing view");
    return active.mode.app.view;
  });

  const dockable = $derived($mode?.implements?.("HARNESSED") ?? false);
  const full = $derived($dock?.full ?? false);
  const geom = $derived(dockable && rect.width > 0 && rect.height > 0 ? stores.bridge.resolve($dock, rect) : null,);

  let last = null;
  function onSeamDown(event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    last = { x: event.clientX, y: event.clientY };
  }
  function onSeamMove(event) {
    if (!last || !geom) return;
    const deltaPx = geom.vertical ? event.clientX - last.x : event.clientY - last.y;
    last = { x: event.clientX, y: event.clientY };
    stores.bridge.dragDock(terminals.active?.$dock, rect, deltaPx);
  }
  function onSeamUp(event) {
    if (!last) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (_) {}
    last = null;
  }
</script>

{#if rect.width > 0 && rect.height > 0}
  <div
    class="panel"
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px"
    style:flex-direction={geom?.direction ?? "row"}>
    <div class="stage">
      {#if $terminal}
        <Frame terminal={$terminal} {view}>
          <span class="label">A</span>
        </Frame>
      {:else}
        <span class="label">A</span>
      {/if}
    </div>

    {#if geom && $thread && !$dock?.collapsed}
      {#if !full}
        <div
          class="seam"
          class:vertical={geom.vertical}
          onpointerdown={onSeamDown}
          onpointermove={onSeamMove}
          onpointerup={onSeamUp}
          onpointercancel={onSeamUp}>
        </div>
      {/if}
      <div
        class="dock-slot"
        class:full
        style:width={full || !geom.vertical ? "100%" : `${geom.size}px`}
        style:height={full || geom.vertical ? "100%" : `${geom.size}px`}>
        <Dock thread={$thread} />
      </div>
    {/if}
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    display: flex;
    overflow: hidden;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
  }
  .stage {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    overflow: auto;
  }
  .seam {
    flex: 0 0 auto;
    background: var(--colors-skeleton-2-boundary);
    opacity: 0.4;
    cursor: ns-resize;
    touch-action: none;
    transition: opacity 0.12s, background 0.12s;
  }
  .seam.vertical {
    width: 4px;
    cursor: ew-resize;
  }
  .seam:not(.vertical) {
    height: 4px;
  }
  .seam:hover {
    opacity: 1;
    background: var(--colors-skeleton-0-primary-base);
  }
  .dock-slot {
    flex: 0 0 auto;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
  .dock-slot.full {
    position: absolute;
    inset: 0;
    z-index: 2;
  }
  .label {
    margin: auto;
    font-size: var(--font-size-7xl);
    font-weight: 900;
    opacity: 0.35;
    user-select: none;
  }
</style>

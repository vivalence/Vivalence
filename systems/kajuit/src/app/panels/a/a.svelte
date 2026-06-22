<script>
  import { getContext } from "svelte";
  import { TERMINALS, BRIDGE } from "$client";
  import { chain, stores } from "@vivalence/kajuit";
  import { Frame } from "@vivalence/drapes";
  import Dock from "./widgets/Dock.svelte";

  let { rect } = $props();

  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);

  const terminal = terminals.$active;
  const thread = chain(terminals, "$active", "$thread");
  const threadTraits = chain(terminals, "$active", "$thread", "$traits");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");

  let dock = $state(bridge.dock);
  bridge.$dock.subscribe((value) => (dock = value));

  const engaged = $derived(
    ($threadTraits?.includes("CONVERSATIONAL") ?? false) &&
      ($mode?.implements?.("CONVERSATIONAL") ?? false),
  );
  const geom = $derived(
    engaged && rect.width > 0 && rect.height > 0 ? stores.bridge.resolve(dock, rect) : null,
  );

  // Auto-focus is now the stall's `settle` (one cursor authority). A non-inert phase lands
  // the cursor on a present buffer when active is null/gone; INERT respects a deliberate empty.

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
    bridge.dragDock(rect, deltaPx);
  }
  function onSeamUp(event) {
    if (!last) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (_) {}
    last = null;
    bridge.save?.();
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
        <Frame buffer={$terminal.$buffer} terminal={$terminal}>
          <span class="label">A</span>
        </Frame>
      {:else}
        <span class="label">A</span>
      {/if}
    </div>

    {#if geom && $thread && !dock.collapsed}
      <div
        class="seam"
        class:vertical={geom.vertical}
        onpointerdown={onSeamDown}
        onpointermove={onSeamMove}
        onpointerup={onSeamUp}
        onpointercancel={onSeamUp}>
      </div>
      <div
        class="dock-slot"
        style:width={geom.vertical ? `${geom.size}px` : "100%"}
        style:height={geom.vertical ? "100%" : `${geom.size}px`}>
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
  .label {
    margin: auto;
    font-size: var(--font-size-7xl);
    font-weight: 900;
    opacity: 0.35;
    user-select: none;
  }
</style>

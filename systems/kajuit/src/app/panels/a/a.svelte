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
  const app = chain(terminals, "$active", "$buffer", "mode", "$app");
  const modeStatus = chain(terminals, "$active", "$buffer", "mode", "status", "$transient");

  const view = $derived.by(() => {
    const active = $buffer;
    if (!active) return null;
    const base = $app?.url ?? null;
    if (active.view) return base ? active.view.withUrl(base) : active.view;
    return $app?.view ?? null;
  });

  const dockable = $derived($mode?.implements?.("HARNESSED") ?? false);
  const full = $derived($dock?.full ?? false);
  const geom = $derived(
    dockable && rect.width > 0 && rect.height > 0 ? stores.bridge.resolve($dock, rect) : null,
  );

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
          {#if $buffer && !view}
            <div class="await">
              <span class="await-head">buffer has no view</span>
              <span class="await-line">mode {$buffer.mode?.slug ?? "—"} · app {$app ? "present" : "pending"}</span>
              {#if $modeStatus?.code && $modeStatus.code !== "HEALTHY"}
                <span class="await-line bad">mode {$modeStatus.code.toLowerCase()}{$modeStatus.error ? ` · ${$modeStatus.error.message ?? $modeStatus.error}` : ""}</span>
              {/if}
            </div>
          {:else}
            <span class="label">A</span>
          {/if}
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
    transition:
      opacity 0.12s,
      background 0.12s;
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
  .await {
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    letter-spacing: 0.06em;
    user-select: none;
  }
  .await-head {
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: color-mix(in srgb, var(--colors-skeleton-0-contrast) 55%, transparent);
  }
  .await-line {
    font-size: var(--font-size-2xs);
    color: color-mix(in srgb, var(--colors-skeleton-0-contrast) 40%, transparent);
  }
  .await-line.bad {
    color: var(--colors-skeleton-0-danger-base);
  }
</style>

<script>
  import { getContext } from "svelte";
  import { BRIDGE, TERMINALS } from "$client";
  import { chain, stores } from "@vivalence/anima";
  import { Empty, Frame } from "@vivalence/drapes";
  import Dock from "./widgets/Dock.svelte";

  let { rect } = $props();


  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);

  const terminal = terminals.$active;
  const thread = chain(terminals, "$active", "$thread");
  const buffer = chain(terminals, "$active", "$buffer");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");
  const phase = chain(terminals, "$active", "$thread", "$phase");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const dock = chain(terminals, "$active", "$dock");
  const settling = chain(terminals, "$active", "$settling");
  const application = chain(terminals, "$active", "$buffer", "mode", "$application");
  const record = chain(terminals, "$active", "$buffer", "$view");
  const modeStatus = chain(terminals, "$active", "$buffer", "mode", "status", "$transient");

  const view = $derived.by(() => {
    const active = $buffer;
    if (!active) return null;
    const base = $application?.url ?? null;
    const drawn = $record;
    if (drawn) return base ? drawn.withUrl(base) : drawn;
    return $application?.view ?? null;
  });

  const dockable = $derived($mode?.implements?.("HARNESSED") ?? false);
  const full = $derived($dock?.full ?? false);
  const geom = $derived(
    dockable && rect.width > 0 && rect.height > 0 ? stores.bridge.resolve($dock, rect) : null,
  );

  const conversational = $derived(dockable && !($mode?.implements?.("APPLICATION") ?? false));
  const reason = $derived(
    $phase === "inert"
      ? "inert · open a buffer or engage a phase"
      : $buffers?.length
        ? "cursor empty"
        : "no buffers · open or pull",
  );
  const refusal = $derived(
    [
      `mode ${$buffer?.mode?.slug ?? "—"}`,
      `application ${$application ? "present" : "pending"}`,
      $modeStatus?.code && $modeStatus.code !== "HEALTHY" ? `mode ${$modeStatus.code.toLowerCase()}` : null,
      $modeStatus?.code && $modeStatus.code !== "HEALTHY" && $modeStatus.error
        ? `${$modeStatus.error.message ?? $modeStatus.error}`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
  );
  const consult = (name) => {
    if (!name) return;
    bridge.panes.tree = stores.bridge.panes.open(bridge.panes.tree, "harness");
    bridge.panes.expanded = "harness";
    bridge.save();
  };

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

{#snippet vacant()}
  <div class="standing">
    {#if $settling}
      <Empty spinner verb="settling · {$settling.thread ? 'thread' : 'buffer'}" />
    {:else if !$thread}
      <Empty verb="no thread" trace="pick a mode in navigation · or a thread" />
    {:else if conversational}
      <Empty verb="conversational · no application" trace="the dock is the surface" />
    {:else}
      <Empty verb="resolving buffer" trace={reason} />
    {/if}
  </div>
{/snippet}

{#if rect.width > 0 && rect.height > 0}
  <div
    data-zone="1"
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
            <div class="standing">
              {#if conversational}
                <Empty verb="conversational · no application" trace="the dock is the surface" />
              {:else}
                <Empty tone="negative" verb="buffer has no view" trace={refusal} />
              {/if}
            </div>
          {:else}
            {@render vacant()}
          {/if}
        </Frame>
      {:else}
        {@render vacant()}
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
          <span class="grip"></span>
        </div>
      {/if}
      <div
        class="dock-slot"
        class:full
        style:width={full || !geom.vertical ? "100%" : `${geom.size}px`}
        style:height={full || geom.vertical ? "100%" : `${geom.size}px`}>
        <Dock thread={$thread} onconsole={consult} />
      </div>
    {/if}
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    display: flex;
    overflow: hidden;
    background: var(--surface);
    color: var(--text-strong);
  }
  .stage {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
  .standing {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: grid;
    place-items: center;
  }
  .seam {
    flex: 0 0 7px;
    display: grid;
    place-items: center;
    cursor: ns-resize;
    touch-action: none;
  }
  .seam.vertical {
    cursor: ew-resize;
  }
  .seam:hover {
    background: var(--control-selected);
  }
  .grip {
    width: 26px;
    height: 3px;
    border-radius: var(--shape-radius-xs);
    background: var(--boundary);
  }
  .seam.vertical .grip {
    width: 3px;
    height: 26px;
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
</style>

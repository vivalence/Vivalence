<script>
  import { getContext, untrack } from "svelte";
  import { chain, stores } from "@vivalence/anima";
  import { Empty, Strip } from "@vivalence/drapes";
  import { BRIDGE, TERMINALS } from "$client";
  import Terminals from "./cards/Terminals.svelte";
  import Threads from "./cards/Threads.svelte";
  import Modes from "./cards/Modes.svelte";
  import Thread from "./cards/Thread.svelte";
  import Mode from "./cards/Mode.svelte";
  import Buffers from "./cards/Buffers.svelte";
  import Buffer from "./cards/Buffer.svelte";
  import Harness from "./cards/Harness.svelte";

  let { rect } = $props();

  const bridge = getContext(BRIDGE);
  const terminals = getContext(TERMINALS);
  const panes = stores.bridge.panes;
  const { FOLDS, LABELS, PANE_BAR, PANE_HEAD, PANE_MIN, PANE_NAMES, SHORTS } = panes;

  const LEDS = ["buffer", "harness"];
  const BODIES = { terminal: Terminals, threads: Threads, modes: Modes, thread: Thread, mode: Mode, buffers: Buffers, buffer: Buffer, harness: Harness };
  const CURSORS = { pane: () => "grabbing", height: () => "ns-resize", seam: (gripped) => (gripped.seam.dir === "h" ? "ew-resize" : "ns-resize") };

  const tree = bridge.panels.c.$tree;
  const fold = bridge.panels.c.$fold;
  const expanded = bridge.panels.c.$expanded;
  const heights = bridge.panels.c.$heights;
  const previous = bridge.panels.c.$previous;
  const place = bridge.view.$strip;

  const roster = terminals.$entities;
  const active = terminals.$active;
  const settling = chain(terminals, "$active", "$settling");
  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const buffers = chain(terminals, "$active", "$thread", "$buffers");

  let grab = $state.raw(null);
  let region = $state(null);
  let width = $state(0);
  let rail = $state(false);

  const allowed = $derived(
    panes.available({
      terminals: $roster.length,
      thread: Boolean($thread),
      buffers: $buffers?.length ?? 0,
      application: $mode?.implements?.("APPLICATION") ?? false,
      harnessed: $mode?.implements?.("HARNESSED") ?? false,
    }),
  );

  const held = $derived(grab?.tree ?? $tree);
  const shown = $derived($settling ? held : panes.prune(held, allowed));
  const drawn = $derived(panes.arrange(shown, $fold, $expanded, grab?.heights ?? $heights));
  const alone = $derived(held?.type === "leaf" && Boolean($previous));
  const keys = $derived(
    PANE_NAMES.filter((name) => allowed[name]).map((name) => ({
      name,
      label: LABELS[name] ?? name,
      short: SHORTS[name],
      latched: panes.latched({ tree: shown, fold: $fold, expanded: $expanded }, name),
      led: LEDS.includes(name),
    })),
  );

  function commit(next) {
    for (const [key, value] of Object.entries(next)) bridge.panels.c[key] = value;
    bridge.save();
  }

  const seated = $derived($active?.id ?? null);
  $effect(() => {
    if (!seated) return;
    untrack(() => commit(panes.reveal({ tree: $tree }, "threads", panes.grain(rect))));
  });

  const pick = (name) => commit(panes.tap({ tree: $tree, fold: $fold, dir: panes.grain(rect) }, name));
  const park = (name) => commit({ tree: panes.remove($tree, name) });
  const solo = (name) => commit({ ...panes.solo($tree, name, $previous), expanded: name });
  const show = (name) => commit({ expanded: name });
  const refold = (name) => commit({ fold: name });

  const seat = (leaf) => {
    if (leaf.flow) return { left: "auto", top: "auto", width: "100%", height: leaf.height === null ? "auto" : `${leaf.height}px` };
    if (!("folded" in leaf)) return { left: `${leaf.x}%`, top: `${leaf.y}%`, width: `${leaf.w}%`, height: `${leaf.h}%` };
    return {
      left: "0",
      top: leaf.above === null ? `calc(100% - var(--pane-step) * ${leaf.below})` : `calc(var(--pane-step) * ${leaf.above})`,
      width: "100%",
      height: leaf.folded ? "var(--pane-step)" : `calc(100% - var(--pane-step) * ${leaf.heads})`,
    };
  };

  const point = (event, box) => ({ x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 });

  const verdict = (target) => (!target ? "drop on a pane" : target.edge === "center" ? `swap with ${target.pane}` : `${target.edge} of ${target.pane}`);

  function ongrab(event, pane) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const box = region.getBoundingClientRect();
    grab = { kind: "pane", pane, box, left: event.clientX - box.left, top: event.clientY - box.top, target: null };
  }

  function onseam(event, seam) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    grab = { kind: "seam", seam, box: region.getBoundingClientRect(), tree: $tree };
  }

  function onhandle(event, pane) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    grab = { kind: "height", pane, top: event.currentTarget.parentElement.getBoundingClientRect().top, heights: $heights };
  }

  const MOVES = {
    pane: (event) => {
      const at = point(event, grab.box);
      const leaf = panes.under(drawn.leaves, at.x, at.y);
      const target = leaf && leaf.pane !== grab.pane ? { pane: leaf.pane, edge: panes.zone(leaf, at.x, at.y), rect: leaf } : null;
      grab = { ...grab, left: event.clientX - grab.box.left, top: event.clientY - grab.box.top, target };
    },
    seam: (event) => {
      const at = point(event, grab.box);
      const { dir, parent, path } = grab.seam;
      const ratio = dir === "h" ? (at.x - parent.x) / parent.w : (at.y - parent.y) / parent.h;
      grab = { ...grab, tree: panes.setRatio($tree, path, ratio) };
    },
    height: (event) => {
      grab = { ...grab, heights: { ...$heights, [grab.pane]: Math.max(PANE_MIN, Math.round(event.clientY - grab.top)) } };
    },
  };

  const DROPS = {
    pane: (dropped) => (dropped.target ? { tree: panes.move($tree, dropped.pane, dropped.target.pane, dropped.target.edge) } : null),
    seam: (dropped) => ({ tree: dropped.tree }),
    height: (dropped) => ({ heights: dropped.heights }),
  };

  function onpointermove(event) {
    if (grab) MOVES[grab.kind](event);
  }

  function onpointerup() {
    const dropped = grab;
    grab = null;
    const next = dropped && DROPS[dropped.kind](dropped);
    if (next) commit(next);
  }
</script>

<div
  data-zone="0"
  class="panel"
  class:rail
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
  style:--pane-rest="{PANE_HEAD}px"
  style:--pane-bar="{PANE_BAR}px"
  bind:clientWidth={width}
  {onpointermove}
  {onpointerup}
  onpointercancel={onpointerup}>
  <div class="region {$fold}" class:gripped={Boolean(grab)} style:cursor={grab ? CURSORS[grab.kind](grab) : null} bind:this={region}>
    {#if !drawn.leaves.length}
      <div class="parked"><Empty verb="every pane is parked" trace="a key on the strip opens one" /></div>
    {/if}

    {#each drawn.leaves as leaf (leaf.pane)}
      {@const at = seat(leaf)}
      {@const Body = BODIES[leaf.pane]}
      <div class="leaf" class:flow={leaf.flow} style:left={at.left} style:top={at.top} style:width={at.width} style:height={at.height}>
        <Body
          name={leaf.pane}
          framed
          folded={leaf.folded ?? false}
          flowing={Boolean(leaf.flow) && leaf.height === null}
          grabbable={$fold === "free"}
          tappable={$fold === "accordion"}
          dragged={grab?.kind === "pane" && grab.pane === leaf.pane}
          aimed={grab?.target?.pane === leaf.pane}
          {alone}
          {ongrab}
          ontap={show}
          onsolo={solo}
          onpark={park} />
        {#if leaf.flow}
          <div
            class="handle"
            class:held={grab?.kind === "height" && grab.pane === leaf.pane}
            role="presentation"
            title="drag to size"
            onpointerdown={(event) => onhandle(event, leaf.pane)}>
            <i></i>
          </div>
        {/if}
      </div>
    {/each}

    {#each drawn.splits as seam (seam.path)}
      <div
        class="seam {seam.dir}"
        class:held={grab?.kind === "seam" && grab.seam.path === seam.path}
        style:left={seam.dir === "h" ? `calc(${seam.x}% - 5px)` : `${seam.x}%`}
        style:top={seam.dir === "v" ? `calc(${seam.y}% - 5px)` : `${seam.y}%`}
        style:width={seam.dir === "h" ? "10px" : `${seam.w}%`}
        style:height={seam.dir === "v" ? "10px" : `${seam.h}%`}
        role="presentation"
        onpointerdown={(event) => onseam(event, seam)}>
        <i></i>
      </div>
    {/each}

    {#if grab?.target}
      {@const lands = panes.landing(grab.target.rect, grab.target.edge)}
      <div class="landing" style:left="{lands.x}%" style:top="{lands.y}%" style:width="{lands.w}%" style:height="{lands.h}%">
        <div class="landing-fill"></div>
      </div>
    {/if}

    {#if grab?.kind === "pane"}
      <div class="rider" style:left="{grab.left}px" style:top="{grab.top}px">
        <span class="rider-pane">{LABELS[grab.pane] ?? grab.pane}</span>
        <span>{verdict(grab.target)}</span>
      </div>
    {/if}
  </div>

  <Strip {keys} folds={FOLDS} fold={$fold} place={$place} {width} bind:rail onpick={pick} onsolo={solo} onfold={refold} />
</div>

<style>
  .panel {
    --pane-gutter: 2px;
    --pane-head: calc(var(--pane-rest) - 2 * var(--pane-gutter));
    --pane-step: var(--pane-rest);
    position: fixed;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface);
    color: var(--text-strong);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
  .panel.rail {
    flex-direction: row;
  }
  @media (pointer: coarse) {
    .panel {
      --pane-head: var(--pane-bar);
      --pane-step: calc(var(--pane-bar) + 2 * var(--pane-gutter));
    }
  }
  .region {
    flex: 1;
    min-width: 0;
    min-height: 0;
    position: relative;
    overflow: hidden;
    background: var(--surface);
  }
  .region.stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .region.gripped {
    user-select: none;
  }
  .parked {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
  }
  .leaf {
    position: absolute;
    box-sizing: border-box;
    min-width: 0;
    padding: var(--pane-gutter);
  }
  .leaf.flow {
    position: relative;
    flex: 0 0 auto;
    padding: 0;
  }
  .handle {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    z-index: 2;
    height: 6px;
    display: grid;
    align-items: center;
    cursor: ns-resize;
    touch-action: none;
  }
  .seam {
    position: absolute;
    z-index: 2;
    display: grid;
    place-items: center;
    touch-action: none;
  }
  .seam.h {
    cursor: ew-resize;
  }
  .seam.v {
    cursor: ns-resize;
  }
  .handle:hover,
  .seam:hover {
    background: var(--signal-primary-tint);
  }
  .handle i,
  .seam.v i {
    width: 100%;
    height: 2px;
  }
  .seam.h i {
    width: 2px;
    height: 100%;
  }
  .handle.held i,
  .seam.held i {
    background: var(--signal-primary-ink);
  }
  .landing {
    position: absolute;
    z-index: 3;
    box-sizing: border-box;
    padding: 3px;
    pointer-events: none;
  }
  .landing-fill {
    height: 100%;
    background: var(--signal-primary-tint);
    box-shadow: inset 0 0 0 2px var(--signal-primary);
  }
  .rider {
    position: absolute;
    z-index: 4;
    height: 26px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    transform: translate(12px, 12px);
    pointer-events: none;
    white-space: nowrap;
    border-radius: var(--shape-radius-key);
    background: var(--surface-lift);
    color: var(--text-light);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), var(--shape-lift);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .rider-pane {
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--signal-primary-ink);
  }
</style>

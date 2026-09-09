<script>
  import { getContext } from "svelte";
  import { stores } from "@vivalence/kajuit";
  import { BRIDGE } from "$client";
  import PanelD from "../d/d.svelte";
  import PanelE from "../e/e.svelte";
  import PanelF from "../f/f.svelte";
  import Pane from "./widgets/Pane.svelte";
  import Twig from "./widgets/Twig.svelte";

  let { rect } = $props();

  const bridge = getContext(BRIDGE);
  const {
    PANE_BAR,
    PANE_FOLD_ZONE,
    PANE_DOCK_PULL,
    PANE_MIN,
    PANE_NAMES,
    layoutPanes,
    paneBoundary,
    pushPanes,
    settlePanes,
  } = stores.bridge;

  let open = $state(bridge.panes.open);
  let fold = $state(bridge.panes.fold);
  let weight = $state(bridge.panes.weight);
  bridge.panes.$open.subscribe((v) => (open = v));
  bridge.panes.$fold.subscribe((v) => (fold = v));
  bridge.panes.$weight.subscribe((v) => (weight = v));

  let instanceView = $state(bridge.view.d);
  let bufferView = $state(bridge.view.f);
  bridge.view.$d.subscribe((v) => (instanceView = v));
  bridge.view.$f.subscribe((v) => (bufferView = v));

  let drag = $state(null);
  let grab = $state(null);
  let hint = $state("");
  let hintTimer = 0;

  const place = $derived(layoutPanes(rect, { open, fold, weight, sizes: drag?.sizes ?? null }));
  const digests = $derived([instanceView, place.tall ? "stacked" : "across", bufferView]);

  function commit(next) {
    if (next.open) bridge.panes.open = next.open;
    if (next.fold) bridge.panes.fold = next.fold;
    if (next.weight) bridge.panes.weight = next.weight;
    bridge.save();
  }

  function say(text) {
    hint = text;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      if (!grab) hint = "";
    }, 1600);
  }

  function ongrip(event, index) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    hint = "";
    const current = layoutPanes(rect, { open, fold, weight });
    grab = {
      index,
      run: current.oi.indexOf(index),
      boundary: paneBoundary(current.oi, index),
      x: event.clientX,
      y: event.clientY,
      sizes: current.size.slice(),
      oi: current.oi,
      area: current.area,
      tall: current.tall,
      twig: current.twig,
      moved: false,
    };
  }

  function ongripmove(event) {
    if (!grab || grab.tab !== undefined) return;
    const along = grab.tall ? event.clientY - grab.y : event.clientX - grab.x;
    const across = event.clientY - grab.y;
    if (!grab.moved && Math.abs(along) < 5 && Math.abs(across) < 5) return;
    grab.moved = true;

    const sizes =
      grab.oi.length > 1
        ? pushPanes(grab.sizes, grab.oi, grab.boundary, along, grab.area)
        : grab.sizes.slice();

    const leading = grab.twig + grab.oi.slice(0, grab.run).reduce((total, i) => total + sizes[i], 0);
    const docking = grab.tall
      ? grab.run > 0
        ? leading <= grab.twig + 6
        : across <= -PANE_DOCK_PULL
      : across <= -PANE_DOCK_PULL;

    if (docking) {
      drag = { sizes: grab.sizes.slice(), dock: grab.index };
      return;
    }
    drag = { sizes, dock: null };
  }

  function ongripup() {
    const held = grab;
    grab = null;
    if (!held || held.tab !== undefined) return;
    const active = drag;
    drag = null;

    if (!held.moved) {
      toggleFold(held.index);
      return;
    }
    if (active?.dock !== null && active?.dock !== undefined) {
      dockPane(active.dock);
      return;
    }

    const sizes = settlePanes(active?.sizes ?? held.sizes, open);
    const nextFold = fold.slice();
    const nextWeight = weight.slice();
    for (const i of held.oi) {
      if (sizes[i] < PANE_FOLD_ZONE) nextFold[i] = true;
      else {
        nextFold[i] = false;
        nextWeight[i] = sizes[i];
      }
    }
    const folded = held.oi.filter((i) => nextFold[i] && !fold[i]);
    commit({ fold: nextFold, weight: nextWeight });
    say(
      folded.length
        ? `${folded.map((i) => PANE_NAMES[i]).join(" + ")} folded · tap to unfold`
        : "resized",
    );
  }

  function toggleFold(index) {
    const current = layoutPanes(rect, { open, fold, weight });
    const nextFold = fold.slice();
    const nextWeight = weight.slice();

    if (fold[index]) {
      nextFold[index] = false;
      const unfolded = current.oi.filter((i) => !fold[i]).length + 1;
      nextWeight[index] = Math.max(PANE_MIN, current.area / Math.max(1, unfolded));
      commit({ fold: nextFold, weight: nextWeight });
      say(`${PANE_NAMES[index]} unfolded`);
      return;
    }
    if (!current.oi.some((i) => i !== index && !fold[i])) {
      say(`${PANE_NAMES[index]} is the only open pane · ✕ folds it out to the twig`);
      return;
    }
    nextFold[index] = true;
    commit({ fold: nextFold });
    say(`${PANE_NAMES[index]} folded · tap to unfold`);
  }

  function maxPane(index) {
    const current = layoutPanes(rect, { open, fold, weight });
    const others = current.oi.filter((i) => i !== index);
    const maxed = others.length > 0 && others.every((i) => fold[i]);
    const nextFold = fold.slice();
    const nextWeight = weight.slice();

    if (maxed) {
      for (const i of current.oi) {
        nextFold[i] = false;
        nextWeight[i] = 1;
      }
      commit({ fold: nextFold, weight: nextWeight });
      say("panes equalised");
      return;
    }
    for (const i of others) nextFold[i] = true;
    nextFold[index] = false;
    nextWeight[index] = Math.max(PANE_MIN, current.area);
    commit({ fold: nextFold, weight: nextWeight });
    say(`${PANE_NAMES[index]} maximised · ⤡ equalises`);
  }

  function dockPane(index) {
    const nextOpen = open.slice();
    nextOpen[index] = false;
    const nextFold = fold.slice();
    nextFold[index] = false;
    const rest = nextOpen.map((_, i) => i).filter((i) => nextOpen[i]);
    if (rest.length && !rest.some((i) => !nextFold[i])) nextFold[rest[0]] = false;
    commit({ open: nextOpen, fold: nextFold });
    say(
      rest.length
        ? `${PANE_NAMES[index]} folded out · tap its tab to bring it back`
        : "every pane is folded out · tap a tab to bring one back",
    );
  }

  function ontab(event, index) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    hint = "";
    const current = layoutPanes(rect, { open, fold, weight });
    grab = { tab: index, x: event.clientX, y: event.clientY, tall: current.tall, moved: false };
  }

  function ontabmove(event) {
    if (!grab || grab.tab === undefined) return;
    const pulled = event.clientY - grab.y;
    if (!grab.moved && pulled < 8) return;
    grab.moved = true;
    grab.pull = Math.max(PANE_BAR, grab.tall ? pulled : pulled * 2.2);
  }

  function ontabup() {
    const held = grab;
    grab = null;
    if (!held || held.tab === undefined) return;
    openPane(held.tab, held.moved ? held.pull : null);
  }

  function openPane(index, pixels) {
    const nextOpen = open.slice();
    nextOpen[index] = true;
    const nextFold = fold.slice();
    nextFold[index] = pixels !== null && pixels < PANE_FOLD_ZONE;
    const nextWeight = weight.slice();

    if (pixels !== null) nextWeight[index] = Math.max(PANE_BAR, pixels);
    else {
      const run = nextOpen.map((_, i) => i).filter((i) => nextOpen[i] && !nextFold[i]);
      const share = run.reduce((total, i) => total + weight[i], 0) / Math.max(1, run.length);
      nextWeight[index] = Math.max(PANE_MIN, share);
    }
    commit({ open: nextOpen, fold: nextFold, weight: nextWeight });
    say(nextFold[index] ? `${PANE_NAMES[index]} opened folded · tap to unfold` : `${PANE_NAMES[index]} opened`);
  }

  function onpointermove(event) {
    if (!grab) return;
    if (grab.tab === undefined) ongripmove(event);
    else ontabmove(event);
  }

  function onpointerup() {
    if (!grab) return;
    if (grab.tab === undefined) ongripup();
    else ontabup();
  }
</script>

<div
  class="panel"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px"
  {onpointermove}
  {onpointerup}
  onpointercancel={onpointerup}>
  {#if place.docked.length}
    <Twig
      docked={place.docked}
      places={place.places}
      names={PANE_NAMES}
      {digests}
      width={rect.width}
      docking={drag?.dock !== null && drag?.dock !== undefined}
      {ontab} />
  {/if}

  {#if !place.oi.length}
    <div class="empty" style:top="{place.twig}px" style:height="{rect.height - place.twig}px">
      every pane is folded out · tap a tab to bring one back
    </div>
  {/if}

  {#each place.oi as index (index)}
    <Pane
      {index}
      name={PANE_NAMES[index]}
      digest={digests[index]}
      place={place.places[index]}
      tall={place.tall}
      folded={place.size[index] <= PANE_BAR + 0.5}
      maxed={!fold[index] && place.oi.length > 1 && place.oi.filter((i) => i !== index).every((i) => fold[i])}
      gripping={grab?.index === index}
      showDigest={rect.width >= 340}
      {ongrip}
      onhead={toggleFold}
      onmax={place.oi.length > 1 ? maxPane : null}
      onclose={dockPane}>
      {#if index === 0}<PanelD />{:else if index === 1}<PanelE />{:else}<PanelF />{/if}
    </Pane>
  {/each}

  {#if hint}
    <div class="hint">{hint}</div>
  {/if}
</div>

<style>
  .panel {
    position: fixed;
    overflow: hidden;
    background: var(--colors-skeleton-1-surface);
    color: var(--colors-skeleton-0-contrast);
  }
  .empty {
    position: absolute;
    left: 0;
    width: 100%;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    padding: 16px;
    text-align: center;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--colors-skeleton-1-contrast);
    opacity: 0.7;
  }
  .hint {
    position: absolute;
    left: 12px;
    bottom: 10px;
    right: 12px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-0-contrast);
    opacity: 0.75;
    pointer-events: none;
    text-align: right;
    z-index: 20;
  }
</style>

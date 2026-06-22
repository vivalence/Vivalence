<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";
  import PanelD from "../d/d.svelte";
  import PanelE from "../e/e.svelte";
  import PanelF from "../f/f.svelte";

  let { rect } = $props();

  const bridge = getContext(BRIDGE);

  const PANE_MIN_PX = 0;

  let panes = $state(bridge.paneSize.panes);
  let paneSize = $state({ d: bridge.paneSize.d, e: bridge.paneSize.e, f: bridge.paneSize.f });
  let twigDrag = $state({ which: null, startX: 0, startD: 0, startE: 0, startF: 0 });

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function ensurePixelSizes(rowWidth) {
    if (paneSize.d !== null) return;
    const def = document.querySelector(".def");
    if (!def) return;
    const d = def.querySelector(".def-d");
    const e = def.querySelector(".def-e");
    const f = def.querySelector(".def-f");
    paneSize.d = d ? d.getBoundingClientRect().width : rowWidth * 0.25;
    paneSize.e = e ? e.getBoundingClientRect().width : rowWidth * 0.50;
    paneSize.f = f ? f.getBoundingClientRect().width : rowWidth * 0.25;
  }

  function onTwigPointerDown(which, event) {
    event.preventDefault();
    event.stopPropagation();
    const row = event.currentTarget.closest(".def");
    const rowWidth = row ? row.getBoundingClientRect().width : 1000;
    ensurePixelSizes(rowWidth);
    twigDrag.which = which;
    twigDrag.startX = event.clientX;
    twigDrag.startD = paneSize.d;
    twigDrag.startE = paneSize.e;
    twigDrag.startF = paneSize.f;
    window.addEventListener("pointermove", onTwigPointerMove);
    window.addEventListener("pointerup", onTwigPointerUp);
    window.addEventListener("pointercancel", onTwigPointerUp);
  }

  function onTwigPointerMove(event) {
    if (twigDrag.which !== "d" && twigDrag.which !== "f") return;
    event.preventDefault();
    const deltaPx = event.clientX - twigDrag.startX;
    if (twigDrag.which === "d") {
      const newD = clamp(twigDrag.startD + deltaPx, PANE_MIN_PX, twigDrag.startD + twigDrag.startE - PANE_MIN_PX);
      paneSize.d = newD;
      paneSize.e = twigDrag.startE - (newD - twigDrag.startD);
    } else {
      const newF = clamp(twigDrag.startF - deltaPx, PANE_MIN_PX, twigDrag.startF + twigDrag.startE - PANE_MIN_PX);
      paneSize.f = newF;
      paneSize.e = twigDrag.startE - (newF - twigDrag.startF);
    }
  }

  function onTwigPointerUp() {
    twigDrag.which = null;
    window.removeEventListener("pointermove", onTwigPointerMove);
    window.removeEventListener("pointerup", onTwigPointerUp);
    window.removeEventListener("pointercancel", onTwigPointerUp);
    persistPanes();
  }

  function togglePane(key) {
    panes[key] = !panes[key];
    persistPanes();
  }


  function persistPanes() {
    bridge.paneSize.d = paneSize.d;
    bridge.paneSize.e = paneSize.e;
    bridge.paneSize.f = paneSize.f;
    bridge.paneSize.panes = { ...panes };
    bridge.save();
  }
</script>

{#if rect.width > 0 && rect.height > 0}
  <div
    class="panel"
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px"
  >
    <div class="def">
      {#if panes.d}
        <div class="def-slot def-d" style:flex={paneSize.d !== null ? `0 0 ${paneSize.d}px` : "1 1 0"}>
          <PanelD />
        </div>
      {/if}
      <div class="twig" class:closed={!panes.d}>
        <button class="twig-toggle" onclick={() => togglePane("d")} aria-label="toggle d">
          {panes.d ? "‹" : "›"}
        </button>
        <div
          class="twig-grip"
          class:dragging={twigDrag.which === "d"}
          aria-label="drag handle d"
          onpointerdown={(event) => onTwigPointerDown("d", event)}
        >
          <span class="dots"><i></i><i></i><i></i></span>
        </div>
      </div>

      <div class="def-slot def-e" style:flex={paneSize.e !== null ? `1 1 ${paneSize.e}px` : "2 1 0"}>
        <PanelE />
      </div>

      <div class="twig" class:closed={!panes.f}>
        <button class="twig-toggle" onclick={() => togglePane("f")} aria-label="toggle f">
          {panes.f ? "›" : "‹"}
        </button>
        <div
          class="twig-grip"
          class:dragging={twigDrag.which === "f"}
          aria-label="drag handle f"
          onpointerdown={(event) => onTwigPointerDown("f", event)}
        >
          <span class="dots"><i></i><i></i><i></i></span>
        </div>
      </div>
      {#if panes.f}
        <div class="def-slot def-f" style:flex={paneSize.f !== null ? `0 0 ${paneSize.f}px` : "1 1 0"}>
          <PanelF />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    overflow: hidden;
  }
  .def {
    width: 100%;
    height: 100%;
    display: flex;
    gap: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .def-slot {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: scroll;
  }
  .twig {
    flex: 0 0 16px;
    min-width: 16px;
    background: color-mix(in srgb, var(--colors-skeleton-3-boundary) 22%, var(--colors-skeleton-1-surface));
    border-left: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 45%, transparent);
    border-right: 1px solid color-mix(in srgb, var(--colors-skeleton-3-boundary) 45%, transparent);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 9px 0;
    user-select: none;
    position: relative;
    z-index: 2;
  }
  .twig-toggle {
    width: 100%;
    height: 16px;
    background: transparent;
    border: none;
    color: color-mix(in srgb, var(--colors-skeleton-0-contrast) 62%, transparent);
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    line-height: 1;
    padding: 0;
    cursor: pointer;
    position: relative;
  }
  .twig-toggle::before {
    content: "";
    position: absolute;
    inset: -6px -12px;
  }
  .twig-toggle:hover {
    color: var(--colors-skeleton-0-primary-base);
  }
  .twig-grip {
    flex: 1 0 0;
    min-height: 44px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ew-resize;
    touch-action: none;
    position: relative;
  }
  .twig-grip::before {
    content: "";
    position: absolute;
    inset: 0 -10px;
  }
  .dots {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 3px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--colors-skeleton-0-contrast) 7%, transparent);
  }
  .dots i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--colors-skeleton-0-contrast) 50%, transparent);
  }
  .twig-grip.dragging .dots {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 18%, transparent);
  }
  .twig-grip.dragging .dots i {
    background: var(--colors-skeleton-0-primary-base);
  }
  .twig-grip:active {
    cursor: grabbing;
  }
</style>

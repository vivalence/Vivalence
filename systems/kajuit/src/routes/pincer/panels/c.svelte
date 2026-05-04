<script>
  import { getContext } from "svelte";
  import { BRIDGE } from "$client";
  import PanelD from "./d.svelte";
  import PanelE from "./e.svelte";
  import PanelF from "./f.svelte";

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
          {panes.d ? "<" : ">"}
        </button>
        <div
          class="twig-handle"
          class:dragging={twigDrag.which === "d"}
          aria-label="drag handle d"
          onpointerdown={(event) => onTwigPointerDown("d", event)}
        ></div>
      </div>

      <div class="def-slot def-e" style:flex={paneSize.e !== null ? `1 1 ${paneSize.e}px` : "2 1 0"}>
        <PanelE />
      </div>

      <div class="twig" class:closed={!panes.f}>
        <button class="twig-toggle" onclick={() => togglePane("f")} aria-label="toggle f">
          {panes.f ? ">" : "<"}
        </button>
        <div
          class="twig-handle"
          class:dragging={twigDrag.which === "f"}
          aria-label="drag handle f"
          onpointerdown={(event) => onTwigPointerDown("f", event)}
        ></div>
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
    overflow: hidden;
  }
  .twig {
    flex: 0 0 13px;
    min-width: 13px;
    background: var(--colors-skeleton-1-surface);
    border: none;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0;
    user-select: none;
    position: relative;
    z-index: 2;
  }
  .twig.closed {
    background: var(--colors-skeleton-1-surface);
  }
  .twig-toggle {
    width: 100%;
    height: 16px;
    background: transparent;
    border: none;
    color: var(--colors-skeleton-0-contrast);
    font-family: var(--font-family-code);
    font-size: 11px;
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
    color: var(--colors-skeleton-0-boundary);
  }
  .twig-handle {
    flex: 1 0 0;
    min-height: 44px;
    width: 100%;
    margin: 0;
    background: transparent;
    border-radius: 0;
    cursor: ew-resize;
    align-self: stretch;
    touch-action: none;
    position: relative;
  }
  .twig-handle::before {
    content: "";
    position: absolute;
    inset: 0 -12px;
  }
  .twig-handle::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 24px;
    background: var(--colors-skeleton-0-boundary);
    border-radius: 2px;
    opacity: 0.4;
  }
  .twig-handle.dragging::after {
    opacity: 0.9;
    background: var(--colors-skeleton-0-primary-base);
  }
  .twig-handle:active {
    cursor: grabbing;
  }
  .twig-handle:active::after {
    opacity: 0.8;
  }
</style>

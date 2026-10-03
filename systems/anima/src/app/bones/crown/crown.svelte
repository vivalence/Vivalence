<script>
  import { stores } from "@vivalence/anima";
  import Widgets from "../Widgets.svelte";
  import { PAD } from "../flow.js";

  let { rect, names = [], open = null, ontoggle, onmeasure } = $props();

  const axis = $derived(stores.bridge.axisFor(rect));
  const side = $derived(axis === "column" ? "after" : "below");
</script>

<div
  data-zone="0"
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  <div class="population" data-bar="crown" style:flex-direction={axis} style:padding={axis === "column" ? `${PAD}px 0` : `0 ${PAD}px`}>
    <Widgets {names} {axis} {side} {open} {ontoggle} {onmeasure} />
  </div>
</div>

<style>
  .bone {
    position: fixed;
    background: var(--surface);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    z-index: 50;
    overflow: hidden;
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-strong);
    pointer-events: none;
    overflow: visible;
  }
</style>

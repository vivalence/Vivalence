<script>
  import { getContext } from "svelte";
  import { chain, stores } from "@vivalence/kajuit";
  import { TERMINALS } from "$client";
  import Phase from "./widgets/Phase.svelte";
  import Dock from "./widgets/Dock.svelte";

  let { rect } = $props();

  const axis = $derived(stores.bridge.axisFor(rect));

  const terminals = getContext(TERMINALS);
  const terminal = chain(terminals, "$active");
  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
</script>

<div
  class="bone"
  class:column={axis === "column"}
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  {#if $thread}
    <div
      class="population"
      style:flex-direction={axis}
      style:padding={axis === "column" ? "16px 0" : "0 16px"}>
      <Phase terminal={$terminal} />
      {#if $mode?.implements?.("HARNESSED")}<Dock />{/if}
    </div>
  {/if}
</div>

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    z-index: 50;
    overflow: visible;
  }
  .bone.column {
    border-top: none;
    border-bottom: none;
    border-left: 1px solid var(--colors-skeleton-1-boundary);
    border-right: 1px solid var(--colors-skeleton-1-boundary);
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    text-transform: lowercase;
    color: var(--colors-skeleton-1-contrast);
    pointer-events: none;
    overflow: visible;
  }
  .population > * {
    pointer-events: auto;
  }
</style>

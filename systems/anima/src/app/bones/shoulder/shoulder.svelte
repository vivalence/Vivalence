<script>
  import { getContext } from "svelte";
  import { chain, stores } from "@vivalence/anima";
  import { TERMINALS } from "$client";
  import Phase from "./widgets/Phase.svelte";
  import Harness from "./widgets/Harness.svelte";
  import Dock from "./widgets/Dock.svelte";

  let { rect } = $props();

  const axis = $derived(stores.bridge.axisFor(rect));
  const side = $derived(axis === "column" ? "after" : "below");

  const terminals = getContext(TERMINALS);
  const terminal = chain(terminals, "$active");
  const thread = chain(terminals, "$active", "$thread");
  const label = chain(terminals, "$active", "$thread", "$label");

  let open = $state(null);

  const toggle = (name) => () => (open = open === name ? null : name);
  const titled = (name) => [name, $label?.name].filter(Boolean).join(" · ");

  $effect(() => {
    if (!$thread) open = null;
  });
</script>

<div
  data-zone="0"
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  {#if $thread}
    <div
      class="population"
      style:flex-direction={axis}
      style:padding={axis === "column" ? "16px 0" : "0 16px"}>
      <Phase terminal={$terminal} {axis} {side} open={open === "buffers"} title={titled("buffers")} ontoggle={toggle("buffers")} />
      <Harness thread={$thread} {axis} {side} open={open === "harness"} title={titled("intelligence")} ontoggle={toggle("harness")} />
      <Dock thread={$thread} {axis} {side} open={open === "dock"} title={titled("dock")} ontoggle={toggle("dock")} />
    </div>
  {/if}
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
    gap: 8px;
    color: var(--text-strong);
    pointer-events: none;
    overflow: visible;
  }
</style>

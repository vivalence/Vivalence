<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/anima";
  import { TERMINALS } from "$client";
  import Terminals from "./widgets/Terminals.svelte";
  import Phase from "./widgets/Phase.svelte";
  import Harness from "./widgets/Harness.svelte";
  import Dock from "./widgets/Dock.svelte";

  let { names = [], axis = "row", side = "below", open = null, ontoggle, onmeasure } = $props();

  const terminals = getContext(TERMINALS);
  const terminal = chain(terminals, "$active");
  const thread = chain(terminals, "$active", "$thread");
  const label = chain(terminals, "$active", "$thread", "$label");

  const titled = (name) => [name, $label?.name].filter(Boolean).join(" · ");
  const toggle = (name) => () => ontoggle(name);

  const measured = (node, name) => {
    const read = () => onmeasure(name, axis === "column" ? node.offsetHeight : node.offsetWidth);
    const watch = new ResizeObserver(read);
    watch.observe(node);
    read();
    return { destroy: () => watch.disconnect() };
  };
</script>

{#each names as name (name)}
  <span class="widget" use:measured={name}>
    {#if name === "terminals"}
      <Terminals {axis} {side} open={open === "terminals"} ontoggle={toggle("terminals")} />
    {:else if name === "buffers" && $thread}
      <Phase terminal={$terminal} {axis} {side} open={open === "buffers"} title={titled("buffers")} ontoggle={toggle("buffers")} />
    {:else if name === "harness" && $thread}
      <Harness thread={$thread} {axis} {side} open={open === "harness"} title={titled("intelligence")} ontoggle={toggle("harness")} />
    {:else if name === "dock" && $thread}
      <Dock thread={$thread} {axis} {side} open={open === "dock"} title={titled("dock")} ontoggle={toggle("dock")} />
    {/if}
  </span>
{/each}

<style>
  .widget {
    flex: none;
    display: inline-flex;
    pointer-events: auto;
  }
</style>

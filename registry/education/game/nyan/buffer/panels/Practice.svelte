<script>
  // The typing phase — routes to the chosen layout. Both consume the same projected
  // view + glosses; the engine and the word/caret atoms are layout-agnostic.
  import Block from "./Block.svelte";
  import River from "./River.svelte";

  const { view, glosses, layout } = $props();
</script>

{#if layout === "river"}
  <River {view} {glosses} />
{:else}
  <Block {view} {glosses} />
{/if}

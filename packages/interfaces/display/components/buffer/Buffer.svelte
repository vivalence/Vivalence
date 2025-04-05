<script>
  // // @lj // // deepClone fails. causes reactivity issues. props not isolated. // // f.E. next updates state.active before previous game is unmounted // // => game.call(/eval) happens to the wrong game
  import { onMount } from "svelte";
  import { id } from "@vivalence/shared";
  import { Loader } from "@vivalence/interface";

  let { buffer } = $props();
  let Mode = $derived.by(() => buffer.active);

  function release() {
    buffer.next();
  }
  onMount(() => {
    buffer.pull();
  });
</script>

<div class="bsp-node">
  {#if buffer.active && Mode?.Component}
    {#key id(buffer.active)}
      <Mode.Component {release} {...$state.snapshot(Mode.props)} />
    {/key}
  {:else}
    <Loader load={() => buffer.pull()} />
  {/if}
</div>

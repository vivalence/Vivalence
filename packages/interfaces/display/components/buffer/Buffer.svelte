<script>
  import { onMount } from "svelte";
  // import { id } from "@vivalence/shared";

  // import BufferState from "./state.svelte.js";
  // import { createKeybindingsHandler } from "tinykeys";

  let { state, render, pull, onNext } = $props();
  // <!-- let keyhandler = $state(); -->

  // let bufferState = new BufferState({ pull, onNext });

  // let [Component, componentProps] = $derived.by(() => {
  //   if (bufferState.active) {
  //     const rendered = render(bufferState.active);
  //     let [Component, componentProps] = rendered;
  //     return [Component, componentProps];
  //     // @lj
  //     // deepClone fails. causes reactivity issues. props not isolated.
  //     // f.E. next updates state.active before previous game is unmounted
  //     // => game.call(/eval) happens to the wrong game
  //   } else {
  //     return [null, null];
  //   }
  // });

  function next() {
    state.next();
  }

  // function keybindings(map) {
  //   window.removeEventListener("keydown", keyhandler);
  //   keyhandler = createKeybindingsHandler(map);
  //   window.addEventListener("keydown", keyhandler);
  // }

  // <!-- onMount(() => { -->
  // <!--   bufferState.pull(); -->
  // <!--   return () => { -->
  // <!--     window.removeEventListener("keydown", keyhandler); -->
  // <!--   }; -->
  // <!-- }); --> 

</script>

<div class="bsp-node">
  {#if bufferState.active && Component}
    {#key id(bufferState.active)}
      <Component {...$state.snapshot(componentProps)} {next} />
    {/key}
  {:else}
    <Loader load={() => bufferState.pull()} />
  {/if}
</div>

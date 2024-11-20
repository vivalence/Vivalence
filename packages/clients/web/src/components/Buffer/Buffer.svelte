<script>
  import { Widget, Loader } from "@vivalence/ui";
  import { id } from "@vivalence/shared";

  import BufferState from "./state.svelte.js";

  const { runtime, instructions, SignalHandler } = $props();

  const state = new BufferState({ runtime, instructions });

  let payload = $derived({
    runtime,
    game: {
      ...state.active?.game,
      call: runtime.call.wrap(`/g/${state.active?.game?.slug}`),
    },
    next: state.next,
    instruction: state.active?.instruction,
  });

  /* $inspect("state", state); */
  /* $inspect("payload", payload); */
</script>

<div class="grid-chain-node">
  {#if state.active}
    {#key id(state.active)}
      {#if state.active.type === "SIGNAL"}
        <SignalHandler data={state.active} />
      {:else if state.active.type === "GAME"}
        <Widget bundle={state.active.game.bundle} {payload} />
      {/if}
    {/key}
  {:else if state.status === "PULLING"}
    <Loader />
  {:else}
    {state.next()}
  {/if}
</div>

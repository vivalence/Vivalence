<script>
  import { Text } from "@vivalence/ui";
  import { onMount } from "svelte";
  import { Loader } from "@vivalence/ui";
  import { id } from "@vivalence/shared";
  import BufferState from "./state.svelte.js";

  const { onMode, pull, onCompleted } = $props();

  let state = new BufferState({ pull, onCompleted });

  let [Component, componentProps] = $derived.by(() => {
    if (state.active) return onMode(state.active);
    else return [null, null];
  });

  onMount(() => {
    state.pull();
  });
</script>

<div class="bsp-node">
  {#if state.active && Component}
    {#key id(state.active)}
      <Component next={state.next} {...componentProps} />
    {/key}
  {:else if state.status === "PULLING"}
    <Loader />
  {:else}
    <Text>Buffer</Text>
  {/if}
</div>

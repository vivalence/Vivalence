<script>
  import { onMount } from "svelte";
  import { Widget, Loader } from "@vivalence/ui";
  import { id } from "@vivalence/shared";
  import { createStore } from "./store.js";

  import trajectory from "$trajectory";

  export let pull;
  export let done;
  export let locals;
  export let SignalHandler;

  const store = createStore({ pull, done });

  locals.onGameFinish = store.next;
  locals.next = store.next;
</script>

{#if !$store.error}
  {#if !!$store.active}
    {#key id($store.active)}
      {#if $store.active.type === "SIGNAL"}
        <SignalHandler data={$store.active} {locals} {trajectory} />
      {:else if $store.active.type === "GAME"}
        <Widget bundle={$store.active.game.bundle} data={$store.active} {locals} {trajectory} />
      {:else}{/if}
    {/key}
  {:else}
    <Loader load={store.load} />
  {/if}
{:else if $store.error}
  <div>Error: {JSON.stringify($store.error, null, 2)}</div>
{/if}

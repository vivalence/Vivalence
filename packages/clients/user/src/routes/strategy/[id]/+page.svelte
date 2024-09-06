<script>
  import { onMount } from "svelte";
  import Loader from "./components/Loader.svelte";
  import { Widget } from "@vivalence/ui";

  import { createStore } from "./store.js";
  import trajectory from "$trajectory";

  export let data;
  const { locals, strategy } = data;

  const store = createStore({
    strategy,
    locals: {
      ...locals,
      call: locals.call.wrap(`/r/${strategy.runtime.slug}`),
    },
  });
  $: console.log("store active", $store.active?.data.type);

  locals.onGameFinish = store.next;
</script>

{#if !$store.error && !!$store.active}
  {#key $store.active.id}
    <Widget bundle={$store.active?.data.bundle} data={$store.active?.data} {locals} {trajectory} />
  {/key}
{:else if !$store.error}
  <div class="flex justify-center items-center h-screen">
    <h1>Strategy</h1>
    <Loader />
  </div>
{:else if $store.error}
  <div>Error: {JSON.stringify($store.error, null, 2)}</div>
{/if}

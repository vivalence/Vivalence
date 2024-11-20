<script>
  import { onMount } from "svelte";
  import { Widget } from "@vivalence/ui";
  import Loader from "./components/Loader.svelte";
  import SessionBar from "./components/SessionBar.svelte";
  import SignalHandler from "./components/SignalHandler.svelte";

  import { createStore } from "./store.js";
  import trajectory from "$components/trajectory/index.js";

  export let data;
  const { locals, strategy } = data;

  locals.call = locals.call.wrap(`/r/${strategy.runtime.slug}`);
  const store = createStore({ strategy, locals });
  locals.onGameFinish = store.next;
</script>

{#if !$store.error}
  {#if !!$store.active}
    {#key $store.active.id}
      {#if $store.active.data.type === "SIGNAL"}
        <SignalHandler data="{$store.active.data}" {locals} {trajectory} />
      {:else}
        <SessionBar />

        <div class="pt-10">
          <Widget
            bundle="{$store.active.data.bundle}"
            data="{$store.active.data}"
            {locals}
            {trajectory} />
        </div>
      {/if}
    {/key}
  {:else}
    <Loader />
  {/if}
{:else if $store.error}
  <div>Error: {JSON.stringify($store.error, null, 2)}</div>
{/if}

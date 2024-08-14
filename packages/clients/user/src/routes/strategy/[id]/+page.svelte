<script>
    import Loader from "./components/Loader.svelte";
    import Widget from "$components/widget/Widget.svelte";
    import { createStore } from "./store.js";
    import matrix from '$matrix'

    export let data;
    const { locals, strategy } = data;

    locals.call  = locals.wrapCall(`/r/${strategy.runtime.slug}`)
    const store = createStore({ strategy, locals });
    locals.onGameFinish = store.next;

</script>

{#if !$store.error && !!$store.active}
    <div class="flex justify-center items-center h-screen ">
      {#key $store.active.id}
	<Widget
	    bundle={$store.active?.data.bundle}
	    data={$store.active?.data}
	    {locals} {matrix} />
	{/key}
    </div>
{:else if !$store.error}
    <div class="flex justify-center items-center h-screen ">
	<h1>Strategy</h1>
	<Loader />
    </div>
{:else if $store.error}
    <div>Error: {JSON.stringify($store.error, null, 2)}</div>
{/if}

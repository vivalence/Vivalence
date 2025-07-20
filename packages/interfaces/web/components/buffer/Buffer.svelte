<script>
  // // @lj // // deepClone fails. causes reactivity issues. props not isolated. // // f.E. next updates state.active before previous game is unmounted // // => game.call(/eval) happens to the wrong game
  import { onMount, onDestroy, unmount } from "svelte";
  import { id } from "@vivalence/shared";
  import { Loader } from "@vivalence/interface";

  let { buffer } = $props();

  let component = $state(null);
  let dom = $state(null);

  let Mode = $derived.by(() => buffer.active);

  const dismount = async () => {
    if (component) {
      const promise = unmount(component);
      component = null;
      component = await promise;
    }
  };

  const render = async (view, context) => {
    const url = view.bundle.url;
    const { default: Component } = await import(/* @vite-ignore */ url);
    component = await Component(dom, context);
  };

  $effect(() => {
    if (!Mode?.view.bundle) return;

    const view = Mode.view;
    const context = Mode.context; //{$state.snapshot(Mode.props)}


    render(view, context);
  });

  onMount(() => {
    buffer.pull();
  });
  onDestroy(() => {
    console.log("onDestroy");
    dismount();
  });

  // $inspect("[BUFFER COMPONENT]", component);
</script>

<!-- props={$state.snapshot(Mode.props)} -->

{#key id(Mode)}
  <div id="buffer-container" class="bsp-node" bind:this={dom} />
{/key}

{#if Mode?.view?.Component}
  <Mode.view.Component {...Mode.context} />
{:else if !component}
  <Loader load={() => buffer.pull()} />
{/if}

<!-- <div class="bsp-node"> -->
<!--   {#if buffer.active && Mode?.view?.bundle} -->
<!--     {#key id(buffer.active)} -->
<!--       <Mode.view.Component -->
<!--         {release} -->
<!--         bundle={$state.snapshot(Mode.view.bundle)} -->
<!--         props={$state.snapshot(Mode.props)} /> -->
<!--     {/key} -->
<!--   {:else} -->
<!--     <\!-- <Loader load={() => buffer.pull()} /> -\-> -->
<!--   {/if} -->
<!-- </div> -->

<!-- <script> -->
<!--   import { onMount, onDestroy } from "svelte"; -->

<!--   const { bundle, props } = $props(); -->

<!--   let dismount = $state(null); -->
<!--   let component = $state(null); -->
<!--   let dom = $state(null); -->

<!--   onMount(async () => { -->
<!--     const { default: Component } = await import(/* @vite-ignore */ bundle.url); -->
<!--     await Component(dom, props); -->
<!--     component = true; -->
<!--   }); -->

<!--   // @lj -->
<!--   // deepClone fails. causes reactivity issues. props not isolated. -->
<!--   // f.E. next updates state.active before previous game is unmounted -->
<!--   // => game.call(/eval) happens to the wrong game -->
<!--   onDestroy(() => { -->
<!--     // Component unmounting not working. -->
<!--     // @security lock. -->
<!--     component = false; -->
<!--   }); -->
<!-- </script> -->

<!-- <div class="bsp-node"> -->
<!--   <div id="widget-container" class="bsp-node" bind:this={dom} /> -->

<!--   {#if !component} -->
<!--     <div class="bsp-chain-end"> -->
<!--       <\!-- <span class="text-theme-text-1">unknown widget.svelte error...</span> -\-> -->
<!--       <span class="text-theme-text-1">loading widget.svelte</span> -->
<!--     </div> -->
<!--   {/if} -->
<!-- </div> -->

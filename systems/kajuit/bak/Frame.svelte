<script>
  import { onDestroy } from "svelte";
  import { computed } from "nanostores";

  let { buffer } = $props();

  let component = $state(null);
  let dom = $state(null);
  let bufferId = computed(buffer, (a) => a?.id);

  // $inspect("bufferId", $bufferId);

  $effect(() => {
    if (dom && $buffer?.view?.url) {
      // console.log("RENDERING NEW BUFFER", $bufferId, $buffer?.view?.url);
      (async (buffer) => {
        const module = await import(/* @vite-ignore */ buffer.view.url);
        component?.destroy();
        component = null;
        component = module.default(dom, buffer.context);
      })($buffer);
    }
  });

  onDestroy(() => {
    component?.destroy();
  });
</script>

{#key $bufferId}
  {#if $buffer?.view?.Component}
    <svelte:component this={$buffer.view.Component} {...$buffer.context} />
  {:else if $buffer?.view?.url}
    <div class="bsp-node" bind:this={dom}></div>
  {:else}
    <slot />
  {/if}
{/key}

<!-- <script> -->
<!--   import { computed } from "nanostores"; -->
<!--   import { onMount, onDestroy } from "svelte"; -->

<!--   import { Signal, fromm } from "@vivalence/typology"; -->
<!--   import { controller, Context, NotFound } from "@vivalence/vector"; -->
<!--   import { id } from "@vivalence/shared"; -->
<!--   import { Text, Loader } from "@vivalence/drapes"; -->
<!--   import { Shelve, Box } from "@vivalence/drapes"; -->
<!--   import { Terminal, Stall } from "@vivalence/html/typology"; -->
<!--   import { perspective } from "./perspective.js"; -->

<!--  @claude: here should be the buffer product, and the buffers job is to render it! -->
<!--   let { pathname } = $props(); -->

<!--   const stall = new Stall(); -->
<!--   const signal = new Signal(pathname); -->

<!--   const [take, apply, match] = controller.traverse(perspective, signal); -->

<!--   stall.withPull(async () => { -->
<!--     if (!take) return []; -->
<!--     const params = fromm.match(match).parameters; -->
<!--     const context = new Context({ stall, signal, match, params }); -->
<!--     await apply(context, async (ctx) => (ctx.take = (await take(ctx)) || [])); -->
<!--     return context.take; -->
<!--   }); -->

<!--   let component = $state(null); -->
<!--   let dom = $state(null); -->
<!--   let bufferId = computed(stall.$buffer, (buffer) => id.id(buffer?.id)); -->
<!--   let buffer = stall.$buffer; -->

<!--   $effect(() => { -->
<!--     if (dom && $buffer?.view?.url) { -->
<!--       (async (terminal) => { -->
<!--         const module = await import(/* @vite-ignore */ terminal.view.url); -->
<!--         component?.destroy(); -->
<!--         component = null; -->
<!--         component = module.default(dom, terminal.context); -->
<!--       })($buffer); -->
<!--     } -->
<!--   }); -->

<!--   onMount(() => { -->
<!--     stall.pull(); -->
<!--   }); -->

<!--   onDestroy(() => { -->
<!--     component?.destroy(); -->
<!--   }); -->
<!-- </script> -->

<!-- <Shelve> -->
<!--   <\!-- here we render one of many phases. -\-> -->
<!--   <Box> -->
<!--     {#key $bufferId} -->
<!--       {#if $buffer?.view?.Component} -->
<!--         <svelte:component this={$buffer.view.Component} {...$buffer.context} /> -->
<!--       {:else if $buffer?.view?.url} -->
<!--         <div id="terminal-container" class="bsp-node" bind:this={dom}></div> -->
<!--       {:else} -->
<!--         <\!-- <Loader time={{ minimum: 5000 }} load={() => stall.pull()} /> -\-> -->
<!--       <Text>{$bufferId}</Text> -->
<!--       <Text>no state</Text> -->
<!--       {/if} -->
<!--     {/key} -->
<!--   </Box> -->
<!--   <\!-- <Box class="t-modeline"> <Modeline> {#snippet left()} {#if $isIdentified} <Text>{$identity.slug}</Text> {:else} <Text>not identified</Text> {/if} {/snippet} </Modeline> </Box> -\-> -->

<!-- </Shelve> -->

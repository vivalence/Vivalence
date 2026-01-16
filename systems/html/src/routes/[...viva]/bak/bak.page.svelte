<script>
  import { computed } from "nanostores";
  import { onMount, onDestroy, mount, unmount } from "svelte";

  import { Signal, fromm } from "@vivalence/typology"; // Context
  import { controller, Context, NotFound } from "@vivalence/vector";
  import { id } from "@vivalence/shared";
  import { Text, Loader } from "@vivalence/drapes";
  import { Shelve, Box } from "@vivalence/drapes";
  import { Buffer, Stall } from "@vivalence/html/typology";
  import { page } from "$app/stores";
  import { perspective } from "./perspective.js";

  const stall = new Stall();
  const signal = new Signal($page.url.pathname);

  console.log("fuck svelte", $page.url.pathname, signal);

  const [take, apply, match] = controller.traverse(perspective, signal);

  stall.withPull(async () => {
    console.log("...viva @PULL", signal, { take });
    if (!take) return [];
    const params = fromm.match(match).parameters;
    const context = new Context({ event, stall, signal, match, params });
    await apply(context, async (ctx) => (ctx.take = await take(ctx)));
    return context.take || [];
  });

  let component = $state(null);
  let dom = $state(null);
  let activeId = computed(stall.$active, (active) => id.id(active?.id));
  let active = stall.$active;

  // $inspect("[$ACTIVEID]", $activeId);
  // $inspect("[ACTIVE]", $active);
  // $inspect("[$PAGE.PATHNAME]", $page.url.pathname);

  $effect(
    () =>
      dom &&
      $active?.view?.url &&
      (async ({ view, context }) => {
        // console.log("active.view.url", active.view.url);
        const module = await import(/* @vite-ignore */ view.url);
        // console.log("module", module);
        component?.destroy(), (component = null);
        component = module.default(dom, context);
      })($active),
  );

  onMount(() => {
    stall.pull();
  });

  onDestroy(() => {
    component?.destroy();
  });
</script>

<Shelve>
  <Box>
    {#key $activeId}
      <Text>{$activeId}</Text>
      {#if $active?.view?.Component}
        <active.view.Component {...$active.context} />
      {:else if $active?.view?.url}
        <div id="buffer-container" class="bsp-node" bind:this={dom} />
      {:else}
        <!-- {:else if !component} -->
        <!-- abyss -->
        <Loader time={{ minimum: 5000 }} load={() => stall.pull()} />
      {/if}
    {/key}
  </Box>
</Shelve>

<!-- <script> import { onMount, onDestroy } from "svelte"; import { id } from "@vivalence/shared"; import { Loader } from "@vivalence/drapes"; import { stall } from "$client"; let component = $state(null); let dom = $state(null); const activeStore = stall.$active; $effect(() => {const active = activeStore.get(); if (dom && active?.view?.url) {(async () => {const module = await import(/* @vite-ignore */ active.view.url); component?.destroy(); component = null; component = module.default(dom, active.context);})();}}); $effect(() => {return activeStore.subscribe(() => {});}); onMount(() => {stall.pull();}); onDestroy(() => {component?.destroy();}); </script> <div class="bsp-node"> {#key id.id($activeStore?.id)} {#if $activeStore?.view?.Component} <svelte:component this={$activeStore.view.Component} {...$activeStore.context} /> {:else if $activeStore?.view?.url} <div id="buffer-container" class="bsp-node" bind:this={dom} /> {:else} <Loader time={{ minimum: 5000 }} load={() => stall.pull()} /> {/if} {/key} </div> -->
<!-- <script> import { onMount, onDestroy } from "svelte"; import { id } from "@vivalence/shared"; import { Loader } from "@vivalence/drapes"; import { stall } from "$client"; let component = $state(null); let dom = $state(null); let active = $state(null); const activeStore = stall.$active; $effect(() => {return activeStore.subscribe((value) => {active = value;});}); $effect(() => {if (dom && active?.view?.url) {(async () => {const module = await import(/* @vite-ignore */ active.view.url); component?.destroy(); component = null; component = module.default(dom, active.context);})();}}); onMount(() => stall.pull()); onDestroy(() => component?.destroy()); </script> -->

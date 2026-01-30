<script>
  import { computed } from "nanostores";
  import { onMount, onDestroy } from "svelte";

  import { Signal, fromm } from "@vivalence/typology";
  import { controller, Context, NotFound } from "@vivalence/vector";
  import { id } from "@vivalence/shared";
  import { Text, Loader } from "@vivalence/drapes";
  import { Shelve, Box } from "@vivalence/drapes";
  import { Buffer, Stall } from "@vivalence/html/typology";
  import { perspective } from "./perspective.js";

  let { pathname } = $props();

  const stall = new Stall();
  const signal = new Signal(pathname);

  const [take, apply, match] = controller.traverse(perspective, signal);

  stall.withPull(async () => {
    if (!take) return [];
    const params = fromm.match(match).parameters;
    const context = new Context({ stall, signal, match, params });
    await apply(context, async (ctx) => (ctx.take = (await take(ctx)) || []));
    return context.take;
  });

  let component = $state(null);
  let dom = $state(null);
  let activeId = computed(stall.$active, (active) => id.id(active?.id));
  let active = stall.$active;

  $effect(() => {
    if (dom && $active?.view?.url) {
      (async (buffer) => {
        const module = await import(/* @vite-ignore */ buffer.view.url);
        component?.destroy();
        component = null;
        component = module.default(dom, buffer.context);
      })($active);
    }
  });

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
        <svelte:component this={$active.view.Component} {...$active.context} />
      {:else if $active?.view?.url}
        <div id="buffer-container" class="bsp-node" bind:this={dom}></div>
      {:else}
        <!-- <Loader time={{ minimum: 5000 }} load={() => stall.pull()} /> -->
      {/if}
    {/key}
  </Box>
</Shelve>

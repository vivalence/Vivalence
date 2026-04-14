<script>
  import { onDestroy } from "svelte";
  import { computed } from "nanostores";

  let { buffer } = $props();

  let component = $state(null);
  let dom = $state(null);
  let bufferId = computed(buffer, (a) => a?.id);

  $effect(() => {
    if (dom && $buffer?.view?.url) {
      (async (buffer) => {
        try {
          const module = await import(/* @vite-ignore */ buffer.view.url);
          if (!dom) return;
          component?.destroy();
          component = null;
          component = module.default(dom, buffer.context);
          buffer.mount();
        } catch (e) {
          console.error(`[Frame] failed loading module: ${buffer.view.url}`, e);
        }
      })($buffer);
    }
  });

  onDestroy(() => {
    $buffer?.destroy();
    component?.destroy();
  });
</script>

{#key $bufferId}
  {#if $buffer?.view?.Component}
    <svelte:component this={$buffer.view.Component} {...$buffer.context} />
  {:else if $buffer?.view?.url}
    <div style="width: 100%;height: 100%;max-width: 100vw;" bind:this={dom}></div>
  {:else}
    <slot />
  {/if}
{/key}

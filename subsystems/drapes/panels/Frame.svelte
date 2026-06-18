<script>
  import { onDestroy } from "svelte";
  import { computed } from "nanostores";

  let { buffer, terminal } = $props();

  let component = $state(null);
  let dom = $state(null);
  let bufferId = computed(buffer, (a) => a?.id);

  let live = null;

  function teardown() {
    if (!live) return;
    live.release();
    live.destroy();
    component?.destroy();
    live = null;
    component = null;
  }

  function activate(next) {
    next.mount();
    next.render();
  }

  $effect(() => {
    const next = $buffer;
    if (next === live) return;
    teardown();
    if (!next) return;

    live = next;
    if (next.mode?.view?.url) {
      (async () => {
        try {
          const module = await import(/* @vite-ignore */ next.mode.view.url);
          if (live !== next || !dom) return;
          component = module.default(dom, { buffer: next, terminal });
          activate(next);
        } catch (e) {
          console.error(`[Frame] failed loading module: ${next.mode.view.url}`, e);
        }
      })();
    } else {
      activate(next);
    }
  });

  onDestroy(teardown);
</script>

{#key $bufferId}
  {#if $buffer?.mode?.view?.Component}
    <svelte:component this={$buffer.mode.view.Component} buffer={$buffer} {terminal} />
  {:else if $buffer?.mode?.view?.url}
    <div style="width: 100%;height: 100%;max-width: 100vw;" bind:this={dom}></div>
  {:else}
    <slot />
  {/if}
{/key}

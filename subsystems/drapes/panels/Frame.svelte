<script>
  import { onDestroy } from "svelte";
  import { computed } from "nanostores";

  let { terminal } = $props();

  let buffer = terminal.$buffer;
  let component = $state(null);
  let dom = $state(null);
  let bufferId = computed(buffer, (a) => a?.id);

  let live = null;

  function teardown() {
    // if (!live) return; live.release();
    live?.unmount();
    component?.destroy();
    live = null;
    component = null;
  }

  // function activate(next) {
  //   next.mount();
  //   // next.render();
  // }

  $effect(() => {
    const next = $buffer;
    if (next === live) return;
    teardown();
    if (!next) return;
    // A not-yet-resolved buffer (e.g. a persisted id-string awaiting rehydrate) has no
    // entity methods — skip until it becomes a real Buffer, so live/teardown never see a string.
    if (typeof next.mount !== "function") return;

    live = next;
    if (next.mode?.metadata?.app?.url) {
      (async () => {
        try {
          const module = await import(/* @vite-ignore */ next.mode.metadata.app.url);
          if (live !== next || !dom) return;
          component = module.default(dom, { buffer: next, terminal });
          // activate(next);
          next.mount();
        } catch (e) {
          console.error(`[Frame] failed loading module: ${next.mode.metadata.app.url}`, e);
        }
      })();
    } else {
      next.mount();
      // activate(next);
    }
  });

  onDestroy(teardown);
</script>

{#key $bufferId}
  {#if $buffer?.mode?.metadata?.app?.Component}
    <svelte:component this={$buffer.mode.metadata.app.Component} buffer={$buffer} {terminal} />
  {:else if $buffer?.mode?.metadata?.app?.url}
    <div style="width: 100%;height: 100%;max-width: 100vw;" bind:this={dom}></div>
  {:else}
    <slot />
  {/if}
{/key}

<script>
  import { onDestroy } from "svelte";
  import { computed } from "nanostores";

  let { terminal, view = null } = $props();

  let buffer = terminal.$buffer;
  let bufferId = computed(buffer, (active) => active?.id);
  let component = $state(null);
  let dom = $state(null);
  let fault = $state(null);
  let live = null;
  let shown = null;

  function identity(record) {
    if (!record) return null;
    return record.hash ?? record.bundle.url + record.mount.nature;
  }

  function teardown() {
    live?.unmount();
    component?.destroy();
    live = null;
    shown = null;
    component = null;
    fault = null;
  }

  $effect(() => {
    const next = $buffer;
    const key = identity(view);
    if (next === live && key === shown) return;
    teardown();
    if (!next) return;
    // A not-yet-resolved buffer (e.g. a persisted id-string awaiting rehydrate) has no
    // entity methods — skip until it becomes a real Buffer, so live/teardown never see a string.
    if (typeof next.mount !== "function") return;
    live = next;
    shown = key;
    if (!view) {
      next.mount();
      return;
    }
    (async () => {
      try {
        const module = await view.load();
        if (live !== next || shown !== key || !dom) return;
        component = module.default(dom, { buffer: next, terminal });
        next.mount();
      } catch (error) {
        console.error(`[Frame] view refused for buffer ${next.id}`, error);
        if (live === next) fault = error.message;
      }
    })();
  });

  onDestroy(teardown);
</script>

{#key $bufferId}
  {#if fault}
    <div class="fault">view refused: {fault}</div>
  {:else if view}
    <div class="stage" bind:this={dom}></div>
  {:else}
    <slot />
  {/if}
{/key}

<style>
  .stage {
    width: 100%;
    height: 100%;
    max-width: 100vw;
  }
  .fault {
    margin: auto;
    padding: 1rem 1.5rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-0-danger-base, #c33);
    border: 1px solid currentColor;
    border-radius: 6px;
    opacity: 0.8;
  }
</style>

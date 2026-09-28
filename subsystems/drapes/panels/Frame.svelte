<script>
  import { onDestroy } from "svelte";
  import Empty from "../display/Empty.svelte";

  let { terminal, view = null, children } = $props();

  const buffer = $derived(terminal.$buffer);
  const bufferId = $derived($buffer?.id);
  const address = $derived(view ? `${view.bundle?.url ?? ""}${view.mount?.nature ?? ""}` : "");
  let component = $state(null);
  let dom = $state(null);
  let fault = $state(null);
  let live = null;
  let shown = null;
  let seated = null;

  function identity(record) {
    if (!record) return null;
    return record.hash ?? record.bundle.url + record.mount.nature;
  }

  let standing = $state(null);

  function teardown() {
    live?.unmount();
    component?.destroy();
    live = null;
    shown = null;
    seated = null;
    component = null;
    fault = null;
    standing = null;
  }

  $effect(() => {
    const next = $buffer;
    const key = identity(view);
    const target = dom;
    if (next === live && key === shown && terminal === seated) return;
    teardown();
    if (!next) return;
    // A not-yet-resolved buffer (e.g. a persisted id-string awaiting rehydrate) has no
    // entity methods — skip until it becomes a real Buffer, so live/teardown never see a string.
    if (typeof next.mount !== "function") {
      standing = "resolving";
      return;
    }
    if (!view) {
      live = next;
      shown = key;
      seated = terminal;
      next.mount();
      return;
    }
    standing = "loading";
    if (!target) return;
    live = next;
    shown = key;
    seated = terminal;
    (async () => {
      try {
        const module = await view.load();
        if (live !== next || shown !== key) return;
        component = module.default(target, {
          terminal,
          daemon: next.mode.daemon,
          mode: next.mode,
          thread: next.thread,
          buffer: next,
        });
        next.mount();
        standing = "ready";
      } catch (error) {
        console.error(`[Frame] view refused for buffer ${next.id}`, error);
        if (live === next) {
          fault = error.message;
          standing = null;
        }
      }
    })();
  });

  onDestroy(teardown);
</script>

{#key bufferId}
  <div class="viewport">
    {#if fault}
      <div class="fault">
        <Empty tone="negative" verb="view refused" trace={fault} />
        {#if view}<span class="fault-trace">{address}</span>{/if}
      </div>
    {:else if view}
      <div class="stage" bind:this={dom}></div>
      {#if standing === "loading"}
        <div class="standing">
          <Empty spinner verb="loading view" trace={address} />
        </div>
      {/if}
    {:else if standing === "resolving"}
      <div class="standing">
        <Empty spinner verb="resolving buffer" trace={typeof $buffer === "string" ? $buffer : ($buffer?.id ?? "")} />
      </div>
    {:else}
      {@render children?.()}
    {/if}
  </div>
{/key}

<style>
  .viewport {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
  }
  .stage {
    width: 100%;
    height: 100%;
    max-width: 100vw;
  }
  .standing {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
  }
  .fault {
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 1rem 1.5rem;
    max-width: 80%;
    border-radius: var(--shape-radius-key);
    box-shadow: inset 0 0 0 var(--size-ring) var(--signal-negative);
    font-family: var(--font-family-code);
    color: var(--signal-negative-ink);
  }
  .fault-trace {
    font-size: var(--size-type-2xs);
    word-break: break-all;
    text-align: center;
  }
</style>

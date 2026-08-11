<script>
  import { onDestroy } from "svelte";

  let { terminal, view = null } = $props();

  const buffer = $derived(terminal.$buffer);
  const bufferId = $derived($buffer?.id);
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
        component = module.default(target, { buffer: next, terminal });
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
        <span class="verb">view refused</span>
        <span class="trace">{fault}</span>
        {#if view}<span class="trace">{view.bundle?.url ?? ""}{view.mount?.nature ?? ""}</span>{/if}
      </div>
    {:else if view}
      <div class="stage" bind:this={dom}></div>
      {#if standing === "loading"}
        <div class="standing">
          <span class="pulse"></span>
          <span class="verb">loading view</span>
          <span class="trace">{view.bundle?.url ?? ""}{view.mount?.nature ?? ""}</span>
        </div>
      {/if}
    {:else if standing === "resolving"}
      <div class="standing">
        <span class="pulse"></span>
        <span class="verb">resolving buffer</span>
        <span class="trace">{typeof $buffer === "string" ? $buffer : ($buffer?.id ?? "")}</span>
      </div>
    {:else}
      <slot />
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    pointer-events: none;
    font-family: var(--font-family-code);
    user-select: none;
  }
  .verb {
    font-size: var(--font-size-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.55;
  }
  .trace {
    font-size: var(--font-size-2xs);
    letter-spacing: 0.04em;
    opacity: 0.35;
    max-width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.5;
    animation: frame-pulse 1.2s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .pulse {
      animation: none;
    }
  }
  @keyframes frame-pulse {
    0%,
    100% {
      opacity: 0.2;
      transform: scale(0.8);
    }
    50% {
      opacity: 0.7;
      transform: scale(1);
    }
  }
  .fault {
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 1rem 1.5rem;
    font-family: var(--font-family-code);
    color: var(--colors-skeleton-0-danger-base, #c33);
    border: 1px solid color-mix(in srgb, currentColor 45%, transparent);
    border-radius: 2px;
    max-width: 80%;
  }
  .fault .verb {
    opacity: 0.9;
  }
  .fault .trace {
    opacity: 0.7;
    white-space: normal;
    word-break: break-all;
  }
</style>

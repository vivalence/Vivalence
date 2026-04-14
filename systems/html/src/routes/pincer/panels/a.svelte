<script>
  import { getContext } from "svelte";
  import { THREAD } from "$client";
  import { Frame } from "@vivalence/drapes";

  let { rect } = $props();

  const threadInstance = getContext(THREAD);

  let thread = $state(null);
  let bufferAtom = $state(null);
  let buffer = $state(null);
  let status = $state(null);

  let teardownBuffer = null;
  let teardownStatus = null;

  threadInstance.$current.subscribe((current) => {
    thread = current;
    if (teardownBuffer) { teardownBuffer(); teardownBuffer = null; }
    if (teardownStatus) { teardownStatus(); teardownStatus = null; }
    if (!current?.queue) {
      bufferAtom = null;
      buffer = null;
      status = null;
      return;
    }
    bufferAtom = current.$buffer;
    teardownBuffer = current.$buffer.subscribe((b) => { buffer = b; });
    teardownStatus = current.queue.$status.subscribe((s) => { status = s; });
  });
</script>

{#if rect.width > 0 && rect.height > 0}
  <div
    class="panel"
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px"
  >
    {#if buffer && bufferAtom}
      <Frame buffer={bufferAtom} />
    {:else if thread}
      <div class="yield-state">
        {#if status === "EXHAUSTED"}
          <p class="yield-label">session complete</p>
        {:else if status === "ERROR"}
          <p class="yield-label yield-error">{thread.queue?.$error.get()?.message ?? "error"}</p>
        {:else}
          <span class="yield-dot"></span>
        {/if}
      </div>
    {:else}
      <span class="label">A</span>
    {/if}
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    display: grid;
    place-items: center;
    overflow: auto;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
  }
  .label {
    font-size: 64px;
    font-weight: 900;
    opacity: 0.35;
    user-select: none;
  }
  .yield-state {
    display: grid;
    place-items: center;
    min-height: 0;
    height: 100%;
  }
  .yield-label {
    font-family: var(--font-family-code);
    font-size: 0.75rem;
    color: var(--colors-skeleton-1-boundary);
  }
  .yield-error {
    color: var(--colors-system-error-contrast);
  }
  .yield-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-1-boundary);
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
</style>

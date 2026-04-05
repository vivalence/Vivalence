<script>
  import { getContext } from "svelte";
  import { effect } from "nanostores";
  import { Frame } from "@vivalence/drapes";

  const terminal = getContext("terminal");

  const status = terminal.stall.$status;
  const active = terminal.stall.$active;

  effect(
    [terminal.stall.$active, terminal.stall.$queue, terminal.stall.$status],
    (active, queue, status) => {
      if (!["IDLE"].includes(status)) return;
      if (!active) terminal.stall.pull();
      if (queue.length < (terminal.intent?.trait?.FEEDING?.queue ?? 1)) terminal.stall.pull();
    },
  );
</script>

{#if $active}
  {#if $active.view?.url}
    <Frame buffer={active} />
  {/if}
{:else}
  <div class="yield-state">
    {#if $status === "EXHAUSTED"}
      <p class="yield-label">session complete</p>
    {:else if $status === "ERROR"}
      <p class="yield-label yield-error">{terminal.stall.$error.get()?.message ?? "error"}</p>
    {:else}
      <span class="yield-dot"></span>
    {/if}
  </div>
{/if}

<style>
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

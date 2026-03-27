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
  <div class="flex items-center justify-center" style="height: 100%;">
    <p class="text-skeleton-2-contrast">{$status}</p>
  </div>
{/if}

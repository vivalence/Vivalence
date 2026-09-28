<script>
  import { loudest, roster } from "@vivalence/anima";
  import { Float, Key, Reading } from "@vivalence/drapes";
  import Glyph from "../../../widgets/Glyph.svelte";
  import Tune from "../../../widgets/Tune.svelte";
  import { sessionUsage, tokens } from "../../../panels/a/widgets/turns.js";

  let { thread, axis = "row", side = "below", open = false, title = "intelligence", ontoggle } = $props();

  const INKS = { RUNNING: "var(--signal-primary)", PAUSED: "var(--signal-caution)", STOPPING: "var(--signal-negative)" };

  let activities = $state([]);
  let traits = $state([]);
  let turns = $state([]);
  let anchor = $state(null);

  $effect(() => {
    if (!thread) return void (activities = []);
    return roster(thread).subscribe((held) => (activities = held));
  });

  $effect(() => {
    if (!thread) return;
    const offs = [
      thread.$traits.subscribe((value) => (traits = value ?? [])),
      thread.$turns?.subscribe?.((value) => (turns = value ?? [])),
    ].filter(Boolean);
    return () => offs.forEach((off) => off());
  });

  const code = $derived(loudest(activities));
  const running = $derived(code === "RUNNING");
  const intelligent = $derived(traits.includes("INTELLIGENT"));
  const spend = $derived(sessionUsage(turns));
  const columns = $derived.by(() => {
    const lines = activities.filter((row) => row.status !== "IDLE").slice(0, 15);
    return Array.from({ length: Math.ceil(lines.length / 5) }, (_, index) => lines.slice(index * 5, index * 5 + 5));
  });
</script>

<span class="anchor" bind:this={anchor}>
  <Key
    size="bone"
    stack={axis === "column"}
    latched={open}
    muted={!intelligent}
    title="activity · {code.toLowerCase()} · {activities.length} live"
    onclick={ontoggle}>
    <span class="tint" class:running={intelligent && running}><Glyph set="anima" name="brain" size={18} pulse={intelligent && running} /></span>
    {#if columns.length}
      <span class="lines">
        {#each columns as column, index (index)}
          <span class="column">
            {#each column as row (row.id)}
              <i class="line" class:running={row.status === "RUNNING"} style:background={INKS[row.status] ?? "var(--text-light)"}></i>
            {/each}
          </span>
        {/each}
      </span>
    {/if}
  </Key>
</span>

{#if open}
  <Float {anchor} zone="0" {title} {side} onclose={ontoggle}>
    {#if intelligent}
      <Tune {thread} />
      <Reading label="context">
        {#if spend.seen}{tokens(spend.input)} in · {tokens(spend.output)} out{:else}no usage on the wire{/if}
      </Reading>
    {:else}
      <span class="none">off · the mode answers without a model</span>
    {/if}
  </Float>
{/if}

<style>
  .anchor {
    display: inline-flex;
    padding-bottom: var(--size-depth);
    pointer-events: auto;
  }
  .tint {
    display: contents;
  }
  .tint.running {
    color: var(--signal-primary);
  }
  .lines {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    height: 21px;
  }
  .column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.5px;
  }
  .line {
    width: 7px;
    height: 3px;
    border-radius: 1px;
  }
  .line.running {
    animation: line-pulse 1.2s ease-in-out infinite;
  }
  @keyframes line-pulse {
    50% {
      opacity: 0.45;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .line.running {
      animation: none;
    }
  }
  .none {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
</style>

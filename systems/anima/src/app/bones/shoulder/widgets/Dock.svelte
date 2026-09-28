<script>
  import { getContext } from "svelte";
  import { chain, loudest, roster, stores } from "@vivalence/anima";
  import { Float, Key } from "@vivalence/drapes";
  import { TERMINALS } from "$client";
  import Glyph from "../../../widgets/Glyph.svelte";

  let { thread, axis = "row", side = "below", open = false, title = "dock", ontoggle } = $props();

  const SIDES = { top: "↑", right: "→", bottom: "↓", left: "←" };

  const terminals = getContext(TERMINALS);
  const dock = chain(terminals, "$active", "$dock");
  const mode = chain(terminals, "$active", "$thread", "$mode");

  let activities = $state([]);
  let anchor = $state(null);

  $effect(() => {
    if (!thread) return void (activities = []);
    return roster(thread).subscribe((held) => (activities = held));
  });

  const harnessed = $derived($mode?.implements?.("HARNESSED") ?? false);
  const running = $derived(loudest(activities) === "RUNNING");
  const live = $derived(harnessed && !$dock?.collapsed);
  const share = $derived(Math.round(($dock?.share ?? stores.bridge.SHARE_DEFAULT) * 100));
  const held = () => terminals.active?.$dock;
</script>

<span class="anchor" bind:this={anchor}>
  <Key size="bone" stack={axis === "column"} latched={open} muted={!live} title={harnessed ? "dock" : "mode is not harnessed · no dock"} onclick={ontoggle}>
    <span class="tint" class:running={harnessed && running}><Glyph set="anima" name="chat/lines" size={18} pulse={harnessed && running} /></span>
  </Key>
</span>

{#if open}
  <Float {anchor} zone="0" {title} {side} onclose={ontoggle}>
    {#if harnessed && $dock}
      <div class="sides">
        {#each stores.bridge.DOCK_SIDES as name (name)}
          <Key
            square
            size="row"
            latched={name === $dock.side}
            label={SIDES[name]}
            title="dock {name}"
            onclick={() => stores.bridge.setDockSide(held(), name)} />
        {/each}
      </div>
      <label class="share">
        <input
          class="share-range"
          type="range"
          min="18"
          max="100"
          step="1"
          value={share}
          oninput={(event) => stores.bridge.setDockShare(held(), Number(event.currentTarget.value) / 100)} />
        <span class="share-reading">{share}%</span>
      </label>
      <div class="verbs">
        <Key size="row" led latched={!$dock.collapsed} label="open" onclick={() => stores.bridge.setDockCollapsed(held())} />
        <Key size="row" led latched={$dock.full} label="full" onclick={() => stores.bridge.setDockFull(held())} />
      </div>
    {:else}
      <span class="none">mode is not harnessed · no dock</span>
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
  .sides,
  .verbs {
    display: flex;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .share {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .share-range {
    flex: 1;
    min-width: 0;
    accent-color: var(--signal-primary);
  }
  .share-reading {
    min-width: 36px;
    text-align: right;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-variant-numeric: tabular-nums;
    color: var(--text-light);
  }
  .none {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
</style>

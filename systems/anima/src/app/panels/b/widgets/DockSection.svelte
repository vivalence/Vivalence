<script>
  import { getContext } from "svelte";
  import { chain, stores } from "@vivalence/anima";
  import { Key, Section } from "@vivalence/drapes";
  import { TERMINALS } from "$client";

  let { open = true, ontoggle = null } = $props();

  const SIDES = { top: "↑", right: "→", bottom: "↓", left: "←" };
  const SHARES = [0.18, 0.28, 0.36, 0.44, 0.52, 0.64, 0.8, 1];

  const terminals = getContext(TERMINALS);
  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
  const dock = chain(terminals, "$active", "$dock");

  const harnessed = $derived($mode?.implements?.("HARNESSED") ?? false);
  const share = $derived($dock?.share ?? stores.bridge.SHARE_DEFAULT);
  const held = () => terminals.active?.$dock;
</script>

<Section label="dock" count={harnessed && $dock ? `${Math.round(share * 100)}%` : null} {open} {ontoggle} />
{#if open}
  {#if !$thread}
    <span class="none">no thread</span>
  {:else if !harnessed || !$dock}
    <span class="none">mode is not harnessed · no dock</span>
  {:else}
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
    <div class="shares">
      {#each SHARES as step (step)}
        <button
          class="share"
          class:filled={step <= share + 0.001}
          title="{Math.round(step * 100)}%"
          aria-label="dock share {Math.round(step * 100)}%"
          onclick={() => stores.bridge.setDockShare(held(), step)}></button>
      {/each}
    </div>
    <div class="verbs">
      <Key size="row" led latched={!$dock.collapsed} label="show" onclick={() => stores.bridge.setDockCollapsed(held())} />
      <Key size="row" led latched={$dock.full} label="full" onclick={() => stores.bridge.setDockFull(held())} />
    </div>
  {/if}
{/if}

<style>
  .none {
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .sides,
  .verbs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-bottom: var(--size-depth);
  }
  .shares {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 3px;
  }
  .share {
    height: 20px;
    padding: 0;
    border: none;
    border-radius: var(--shape-radius-xs);
    background: var(--control-contrast);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
    cursor: pointer;
  }
  .share.filled {
    background: var(--signal-primary);
    box-shadow: none;
  }
</style>

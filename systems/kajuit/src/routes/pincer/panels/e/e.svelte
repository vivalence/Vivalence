<script>
  import { LIGHTHOUSE, QUARTERS, BRIDGE, MAIN } from "$client";
  import { getContext } from "svelte";

  import Masked from "./widgets/Masked.svelte";
  import AimedRoutes from "./widgets/AimedRoutes.svelte";
  import QueueingConsole from "./widgets/QueueingConsole.svelte";
  import QueueingRibbon from "./widgets/QueueingRibbon.svelte";
  import Conversational from "./widgets/Conversational.svelte";
  import LabeledEditor from "./widgets/LabeledEditor.svelte";

  const allTraits = ["MASKED", "AIMED", "QUEUEING", "CONVERSATIONAL", "LABELED"];
  let activeOrder = $state([]);
  const isActive = (trait) => activeOrder.includes(trait);
  const toggle = (trait) => {
    activeOrder = isActive(trait)
      ? activeOrder.filter((t) => t !== trait)
      : [...activeOrder, trait];
  };

  const lighthouse = getContext(LIGHTHOUSE);
  const quarters = getContext(QUARTERS);
  const main = getContext(MAIN);

  let thread = $state(main.current);
  main.$current.subscribe((value) => (thread = value));

  let terminal = $state(main.terminal);
  main.$terminal.subscribe((value) => (terminal = value));

  const traitGate = {
    CONVERSATIONAL: (thread) => thread?.mode?.traits?.includes?.("CONVERSATIONAL") ?? false,
  };

  let availableTraits = $derived(
    allTraits.filter((trait) => (traitGate[trait] ? traitGate[trait](thread) : true)),
  );

  let renderOrder = $derived(activeOrder.filter((trait) => availableTraits.includes(trait)));
</script>

<div class="panel">
  <div class="tag-group">
    {#each availableTraits as trait}
      <button class="tag" class:active={isActive(trait)} onclick={() => toggle(trait)}
        >{trait}</button>
    {/each}
  </div>

  <div class="body">
    {#if !thread}
      <div class="empty">no active thread</div>
    {:else}
      {#each renderOrder as trait (trait)}
        {#if trait === "MASKED"}
          <Masked {thread} />
        {:else if trait === "AIMED"}
          <AimedRoutes {thread} />
        {:else if trait === "QUEUEING"}
          <QueueingConsole {thread} />
          <QueueingRibbon {thread} />
        {:else if trait === "CONVERSATIONAL"}
          <Conversational {thread} />
        {:else if trait === "LABELED"}
          <LabeledEditor {thread} />
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .panel {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 10px;
    letter-spacing: 0.04em;
  }
  .tag-group {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
    flex-shrink: 0;
  }
  .tag {
    flex: 1;
    padding: 5px 0;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--colors-skeleton-2-contrast);
    font-family: var(--font-family-code);
    font-size: 8px;
    text-transform: lowercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    opacity: 0.4;
  }
  .tag:hover {
    opacity: 0.7;
  }
  .tag.active {
    opacity: 1;
    border-bottom-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    overflow: auto;
  }
  .empty {
    padding: 12px 14px;
    opacity: 0.25;
    text-transform: lowercase;
    font-size: 10px;
  }
</style>

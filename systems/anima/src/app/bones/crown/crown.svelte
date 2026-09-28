<script>
  import { getContext } from "svelte";
  import { stores } from "@vivalence/anima";
  import { Float, Key } from "@vivalence/drapes";
  import { TERMINALS } from "$client";
  import Glyph from "../../widgets/Glyph.svelte";
  import Terminal from "./widgets/Terminal.svelte";

  let { rect } = $props();

  const axis = $derived(stores.bridge.axisFor(rect));

  const terminals = getContext(TERMINALS);

  let held = $state([...terminals.entities]);
  let active = $state(terminals.active?.id);
  let open = $state(false);
  let anchor = $state(null);

  terminals.$entities.subscribe((entities) => {
    held = [...entities];
  });
  terminals.$active.subscribe((terminal) => (active = terminal?.id));
</script>

<div
  data-zone="0"
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  <div
    class="population"
    style:flex-direction={axis}
    style:padding={axis === "column" ? "12px 0" : "0 12px"}>
    <span class="anchor" bind:this={anchor}>
      <Key
        size="bone"
        stack={axis === "column"}
        latched={open}
        title="terminals · {held.length}"
        onclick={() => (open = !open)}>
        <Glyph set="anima" name="chat/prompt" size={17} />
        <span class="count">{held.length}</span>
      </Key>
    </span>
  </div>
</div>

{#if open}
  <Float
    {anchor}
    zone="0"
    title="terminals"
    side={axis === "column" ? "after" : "below"}
    onclose={() => (open = false)}>
    <div class="roster">
      {#each held as terminal (terminal.id)}
        <Terminal
          {terminal}
          selected={terminal.id === active}
          onactivate={() => terminals.activate(terminal.id)}
          onremove={() => terminals.remove(terminal.id)} />
      {:else}
        <span class="none">no terminals</span>
      {/each}
    </div>
    <div class="verbs">
      <Key tone="primary" size="row" wide label="+ new terminal" onclick={() => terminals.create()} />
    </div>
  </Float>
{/if}

<style>
  .bone {
    position: fixed;
    background: var(--surface);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    pointer-events: none;
    z-index: 50;
    overflow: hidden;
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    pointer-events: none;
    overflow: hidden;
  }
  .population > * {
    pointer-events: auto;
  }
  .anchor {
    display: inline-flex;
    padding-bottom: var(--size-depth);
  }
  .count {
    font-variant-numeric: tabular-nums;
  }
  .roster {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .none {
    padding: 6px 8px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .verbs {
    padding-bottom: var(--size-depth);
  }
</style>

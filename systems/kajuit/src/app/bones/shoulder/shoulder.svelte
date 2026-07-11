<script>
  import { getContext } from "svelte";
  import { chain } from "@vivalence/kajuit";
  import { TERMINALS, BRIDGE } from "$client";
  import Phase from "./widgets/Phase.svelte";
  import Dock from "./widgets/Dock.svelte";

  let { rect } = $props();

  const terminals = getContext(TERMINALS);
  const bridge = getContext(BRIDGE);
  const terminal = chain(terminals, "$active");
  const thread = chain(terminals, "$active", "$thread");
  const mode = chain(terminals, "$active", "$thread", "$mode");
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  {#if $thread}
    <div class="population">
      <Phase terminal={$terminal} />
      {#if $mode?.implements?.("HARNESSED")}<Dock {bridge} />{/if}
    </div>
  {/if}
</div>

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    z-index: 50;
    overflow: visible;
  }
  .population {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 16px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    text-transform: lowercase;
    color: var(--colors-skeleton-1-contrast);
    pointer-events: none;
    overflow: visible;
    container-type: inline-size;
    container-name: shoulder;
  }
  @container shoulder (max-width: 190px) {
    .sep {
      display: none;
    }
  }
  .population > * {
    pointer-events: auto;
  }
  .sep {
    color: var(--colors-skeleton-0-boundary);
    opacity: 0.6;
  }
</style>

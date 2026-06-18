<script>
  // import { getContext } from "svelte";
  // import { TERMINALS } from "$client";
  // import Activity from "./widgets/Activity.svelte";
  // import ConversationalWidget from "./widgets/ConversationalWidget.svelte";

  let { rect } = $props();

  // const terminals = getContext(TERMINALS);

  // let currentThread = $state(terminals.active?.thread);

  // terminals.$thread.subscribe((current) => {
  //   currentThread = current;
  // });
</script>

<div
  class="bone"
  style:left="{rect.left}px"
  style:top="{rect.top}px"
  style:width="{rect.width}px"
  style:height="{rect.height}px">
  <!-- <div class="population"> -->
  <!--   <Activity thread={currentThread} /> -->
  <!--   {#if currentThread} -->
  <!--     <span class="sep">·</span> -->
  <!--     <ConversationalWidget thread={currentThread} /> -->
  <!--   {/if} -->
  <!-- </div> -->
</div>

<style>
  .bone {
    position: fixed;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    z-index: 50;
    overflow: hidden;
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
    overflow: hidden;
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

<script>
  import { getContext } from "svelte";
  import { TERMINALS } from "$client";
  import { Frame } from "@vivalence/drapes";

  let { rect } = $props();

  const terminals = getContext(TERMINALS);
  let terminal = terminals.$active;
</script>

{#if rect.width > 0 && rect.height > 0}
  <div
    class="panel"
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px">
    {#if $terminal}
      <Frame buffer={$terminal.$buffer} terminal={$terminal}>
        <span class="label">A</span>
      </Frame>
    {:else}
      <span class="label">A</span>
    {/if}
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    display: flex;
    overflow: hidden;
    background: var(--colors-skeleton-0-surface);
    color: var(--colors-skeleton-0-contrast);
  }
  .label {
    margin: auto;
    font-size: var(--font-size-7xl);
    font-weight: 900;
    opacity: 0.35;
    user-select: none;
  }
</style>

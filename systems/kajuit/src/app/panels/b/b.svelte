<script>
  import LighthouseSection from "./widgets/LighthouseSection.svelte";
  import TerminalsSection from "./widgets/TerminalsSection.svelte";
  import BridgeSection from "./widgets/BridgeSection.svelte";
  // import MainSection from "./widgets/MainSection.svelte";
  // import BoxSection from "./widgets/BoxSection.svelte";

  let { rect } = $props();
</script>

{#if rect.width > 0 && rect.height > 0}
  <div
    class="panel"
    style:left="{rect.left}px"
    style:top="{rect.top}px"
    style:width="{rect.width}px"
    style:height="{rect.height}px">
    <div class="stack">
      <BridgeSection />
      <LighthouseSection />
      <TerminalsSection />
      <!-- <MainSection /> -->
    </div>
  </div>
{/if}

<style>
  .panel {
    position: fixed;
    overflow: hidden;
    background: var(--colors-skeleton-2-surface);
    color: var(--colors-skeleton-2-contrast);
  }
  .stack {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
</style>

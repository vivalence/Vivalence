<script>
  let { surface, controls, maxWidth = "480px", class: className = "" } = $props();
</script>

<div class="desk {className}">
  <div class="desk-surface">
    <div class="desk-stage" style:max-width={maxWidth}>
      {@render surface()}
    </div>
  </div>

  {#if controls}
    <div class="desk-controls">
      <div class="desk-tray" style:max-width={maxWidth}>
        {@render controls()}
      </div>
    </div>
  {/if}
</div>

<style>
  .desk {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .desk-surface {
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .desk-stage {
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    box-sizing: border-box;
  }

  .desk-controls {
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 0.75rem 1.25rem;
  }

  .desk-tray {
    width: 100%;
    margin: 0 auto;
    display: flex;
    gap: 0.625rem;
    align-items: center;
  }
</style>

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
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .desk-surface {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .desk-stage {
    width: 100%;
    min-width: 0;
    margin: 0 auto;
    padding: 2rem 1.25rem;
    box-sizing: border-box;
    overflow: hidden;
  }

  .desk-controls {
    flex-shrink: 0;
    border-top: 1px solid var(--colors-skeleton-1-boundary);
    padding: 0.75rem 1.25rem;
    overflow: hidden;
  }

  .desk-tray {
    width: 100%;
    margin: 0 auto;
    display: flex;
    gap: 0.625rem;
    align-items: center;
  }
</style>

<script>
  let { sunk = false, onclick, disabled = false, children } = $props();

  const onkeydown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onclick(event);
  };
</script>

{#if onclick}
  <div class="card click" class:sunk class:disabled role="button" tabindex="0" {onclick} {onkeydown}>{@render children?.()}</div>
{:else}
  <div class="card" class:sunk class:disabled>{@render children?.()}</div>
{/if}

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px 12px;
    background: var(--surface-lift);
    color: var(--text-strong);
    border-radius: var(--shape-radius-card);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
  .card.sunk {
    background: var(--surface-sunk);
  }
  .card.click {
    cursor: pointer;
  }
  .card.disabled {
    opacity: var(--text-disabled);
    pointer-events: none;
  }
</style>

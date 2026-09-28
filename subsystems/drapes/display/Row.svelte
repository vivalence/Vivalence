<script>
  let { selected = false, title = null, onclick, children } = $props();

  const onkeydown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onclick(event);
  };
</script>

{#if onclick}
  <div class="row click" class:selected role="button" tabindex="0" {title} {onclick} {onkeydown}>{@render children()}</div>
{:else}
  <div class="row" class:selected {title}>{@render children()}</div>
{/if}

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    height: var(--size-row);
    padding: 0 8px;
    border-radius: var(--shape-radius-key);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .row.click {
    cursor: pointer;
  }
  .row.click:hover,
  .row.selected {
    background: var(--control-selected);
  }
</style>

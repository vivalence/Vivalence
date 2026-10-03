<script>
  let { selected = false, title = null, onclick, children } = $props();

  const onkeydown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onclick(event);
  };
</script>

<div class="card-row" class:selected role="button" tabindex="0" {title} {onclick} {onkeydown}>{@render children()}</div>

<style>
  .card-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    min-height: var(--size-row);
    padding: 0 8px;
    border-radius: var(--shape-radius-key);
    background: var(--control-contrast);
    color: var(--control-on);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), 0 var(--size-depth) 0 var(--boundary);
    font-family: var(--font-family-code);
    font-size: 11px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.07s;
  }
  .card-row:active {
    transform: translateY(var(--size-depth));
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--boundary);
  }
  .card-row.selected {
    background: var(--control-contrast-pressed);
    color: var(--control-on-pressed);
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--boundary);
    transform: translateY(var(--size-depth));
  }
  .card-row :global(.card-dim) {
    color: var(--control-on-muted);
  }
</style>

<script>
  let { children } = $props();
</script>

<div class="pressed">{@render children()}</div>

<style>
  .pressed {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: var(--shape-radius-key);
    background: var(--control-contrast-pressed);
    color: var(--control-on-pressed);
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--boundary);
    transform: translateY(var(--size-depth));
  }
</style>

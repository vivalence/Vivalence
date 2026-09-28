<script>
  let { size = 12 } = $props();
</script>

<span class="spinner" style:--spinner-size="{size}px"></span>

<style>
  .spinner {
    display: inline-block;
    width: var(--spinner-size);
    height: var(--spinner-size);
    box-sizing: border-box;
    border-radius: var(--shape-radius-full);
    border: 2px solid var(--signal-primary);
    border-right-color: transparent;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

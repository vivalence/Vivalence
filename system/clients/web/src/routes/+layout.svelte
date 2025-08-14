<script>
  import "../app.css";
  import "../style/layout/bsp.css";

  let { children } = $props();
</script>

<div class="bsp-chain-root bg-skeleton-app-surface">
  {@render children()}
</div>

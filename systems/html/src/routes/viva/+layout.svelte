<script>
  import Modeline from "./Modeline.svelte";

  let { children } = $props();
</script>

<div class="shell">
  <div class="surface">
    {@render children()}
  </div>
  <Modeline />
</div>

<style>
  .shell {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100svh;
    overflow: hidden;
  }

  @media (display-mode: standalone) {
    .shell {
      padding-top: env(safe-area-inset-top, 0px);
    }
  }

  .surface {
    display: grid;
    min-height: 0;
    overflow: hidden;
  }
</style>

<script>
  import "../style/app.css";
  import "../style/bsp/bsp.css";
  import "./+layout.css";
  import { onMount } from "svelte";

  let { children, data } = $props();
  const { ctx } = data;

  function keyhandler(event) {
      // TODO build key controller for trajectory (vecotor)
    // console.log("layout ctx", ctx.trajectory);
    // console.log("event", event);
  }

  onMount(() => {
    window.addEventListener("keydown", keyhandler, { passive: true });
    return () => {
      window.removeEventListener("keydown", keyhandler);
    };
  });
</script>

<div class="bsp-chain-root bg-skeleton-app-surface">
  {@render children()}
</div>

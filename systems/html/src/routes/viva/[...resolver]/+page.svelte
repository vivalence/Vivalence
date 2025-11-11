<script>
  import { BufferSurface } from "@vivalence/drapes";
  const { data } = $props();
</script>

<div class="bsp-chain-root">
  <BufferSurface stall={data.stall} />
</div>

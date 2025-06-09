<script>
  import { Buffer } from "@vivalence/interface";
  const { data } = $props();
</script>

<div class="bsp-chain-root">
  <Buffer buffer={data.buffer} />
</div>

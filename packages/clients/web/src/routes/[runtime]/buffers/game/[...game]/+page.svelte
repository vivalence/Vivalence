<script>
  import { Buffer } from "@vivalence/interface";

  const { data } = $props();
  const buffer = data.buffer
</script>

<div class="bsp-chain-root">
  <Buffer {buffer} />
</div>

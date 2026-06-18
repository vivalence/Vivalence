<script>
  import { chain } from "@vivalence/kajuit";

  let { thread } = $props();

  const label = chain(thread, "$label");
</script>

{$label?.name ?? $label ?? thread.mode?.slug ?? thread.id?.slice(0, 8)}

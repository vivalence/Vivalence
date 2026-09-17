<script>
  import { chain } from "@vivalence/anima";

  let { thread } = $props();

  const label = chain(thread, "$label");
</script>

{$label?.name ??  thread.mode?.slug ?? thread.id?.slice(0, 8)}

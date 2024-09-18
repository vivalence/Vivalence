<script>
  import { Widget } from "@vivalence/ui";
  import trajectory from "$trajectory";

  export let data;
  const { locals, data: instruction } = data;

  locals.call = locals.call.wrap(`/r/l-ud-eng2esp`);
  locals.onGameFinish = console.log;
</script>

<Widget bundle={instruction.bundle} data={instruction} {locals} {trajectory} />

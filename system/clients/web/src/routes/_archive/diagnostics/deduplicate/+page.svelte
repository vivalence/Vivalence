<script>
  import { goto } from "$app/navigation";
  import { Button, Text } from "@vivalence/interface";

  const BATCHSIZE = 1000;
  const { data } = $props();
  const { runtime, aperture, locals } = data;

  let index = $state(0);

  let remedying = $state([]);
  let finding = $state([]);

  let duplicates = $state([]);
  let remedies = $state([]);

  /* $inspect({ duplicates, remedies }); */

  async function findDuplicates() {
    finding.push(true);
    const batch = { batch: { size: BATCHSIZE, index } };
    const result = aperture.call(`/runtime/${runtime.slug}/diagnostics/duplicates/find`, batch);
    index = index + 1;
    const { data, error } = await result;
    duplicates = duplicates.concat(data.issues);
    finding.pop();
  }
  async function remedyDuplicates() {
    while (duplicates.length > 0) {
      remedying.push(true);
      const input = { issue: duplicates.shift() };
      const result = await aperture.call(
        `/runtime/${runtime.slug}/diagnostics/duplicates/remedy`,
        input,
      );
      remedies.push(result.data);
      remedying.pop();
    }
  }
</script>

<div class="">
  <div>
    <Text>index: {index * BATCHSIZE}</Text>
    <Button onclick={() => (index += 1)}>Bump Index</Button>
    <Button onclick={() => (index -= 1)}>Slurp Index</Button>
    <br />

    <Button onclick={findDuplicates}>
      <Text>Find Duplicates batch {index}; active: {finding.length}</Text>
    </Button>

    <Button onclick={remedyDuplicates}>
      <Text>Start Remedy on {duplicates.length} duplicates; active: {remedying.length}</Text>
    </Button>
  </div>
  <div>
    <div>
      <Text>DUPLICATES: {duplicates.length}</Text>
      {#each duplicates as duplicate}
        <Text>{JSON.stringify(duplicate.context.annotation)}</Text>
      {/each}
    </div>
    <div>
      <Text>REMDIES: {remedies.length}</Text>
      {#each remedies as remedy}
        <Text>{remedy.resolved}, {remedy.action}</Text>
      {/each}
    </div>
  </div>
</div>

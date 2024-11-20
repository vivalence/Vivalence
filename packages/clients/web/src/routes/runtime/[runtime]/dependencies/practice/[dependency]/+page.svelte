<script>
  import Buffer from "$components/Buffer/Buffer.svelte";
  import SignalHandler from "./components/SignalHandler.svelte";

  const { data } = $props();
  const { locals, dependency } = data;

  const runtime = {
    ...data.runtime,
    call: locals.call.wrap(`/r/${data.runtime.slug}`),
  };

  async function pull({ take, blacklist }) {
    const tactic = dependency.itinerary?.tactic;

    const input = {
      relations: tactic?.relations,
      masks: tactic?.masks,
      blacklist,
      scope: {
        tactic: { slug: tactic.slug },
        dependency: { slug: dependency.slug },
      },
    };

    const { data: instructions, error } = await runtime.call(`/t/${tactic.slug}/provision`, input);
    if (error) throw error;

    return instructions;
  }

  async function completed(instruction) {
    console.log("finished with instruction", instruction);
  }

  const instructions = { pull, completed };
</script>

<div class="grid-chain-start">
  <Buffer {runtime} {instructions} {SignalHandler} />
</div>

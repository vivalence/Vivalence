<script>
  import { onMount } from "svelte";

  import Instructions from "$instructions";
  import SignalHandler from "./components/SignalHandler.svelte";

  export let data;
  const { locals, dependency } = data;
  locals.call = locals.call.wrap(`/r/${dependency.runtime.slug}`);

  async function pull({ take, blacklist }) {
    const tactic = dependency.itinerary.tactic;

    console.log("pulling new instructions", tactic);

    const input = {
      relations: tactic.relations,
      masks: tactic.masks,
      blacklist,
      scope: {
        tactic: { slug: tactic.slug },
        dependency: { slug: dependency.slug },
      },
    };

    const { data: instructions, error } = await locals.call(`/t/${tactic.slug}/provision`, input);
    if (error) throw error;
    console.log("pulled new instructions", instructions);

    return instructions;
  }

  async function done(instruction) {
    console.log("finished with instruction", instruction);
  }
</script>

<Instructions {pull} {done} {locals} {SignalHandler} />

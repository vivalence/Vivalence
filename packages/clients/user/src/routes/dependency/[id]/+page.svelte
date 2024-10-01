<script>
  import { onMount } from "svelte";

  import Instructions from "$instructions";
  import SignalHandler from "./components/SignalHandler.svelte";

  export let data;
  const { locals, tag } = data;
  locals.call = locals.call.wrap(`/r/${tag.runtime.slug}`);

  async function pull({ take, blacklist }) {
    const tactic = tag.data.DEPENDENCY.tactic;

    const input = {
      relations: tactic.relations,
      masks: tactic.masks,
      blacklist,
      scope: { dependency: { tag: { id: tag.id } } },
    };

    const { data: instructions, error } = await locals.call(`/t/${tactic.slug}`, input);
    if (error) throw error;
    console.log("pulled new instructions", instructions);

    return instructions;
  }

  async function done(instruction) {
    console.log("finished with instruction", instruction);
  }
</script>

<Instructions {pull} {done} {locals} {SignalHandler} />

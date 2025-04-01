<script>
  import { onMount } from "svelte";

  import Buffer from "@vivalence/components/Buffer/Buffer.svelte";
  import SignalHandler from "./components/SignalHandler.svelte";

  export let data;
  const { locals, game } = data;
  locals.call = locals.call.wrap(`/r/${game.runtime.slug}`);

  async function pull({ take, blacklist }) {
    console.log("creating new instructions", game);

    const input = {
      // whatever instructions the game takes
      scope: {
        tactic: { slug: tactic.slug },
        dependency: { slug: dependency.slug },
      },
      blacklist,
    };

    const { data: instructions, error } = await locals.call(`/g/${game.slug}/provision`, input);
    if (error) throw error;
    console.log("pulled new instructions", instructions);

    return instructions;
  }

  async function done(instruction) {
    console.log("finished with instruction", instruction);
  }
</script>

<Buffer {pull} {done} {locals} {SignalHandler} />

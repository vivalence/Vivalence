<script>
  import { onMount } from "svelte";
  import { Desk, Textarea, Text, Button, Input } from "@vivalence/interface";

  const { buffee, instruction, ctx } = $props();

  let prompt = $state("");
  let input = $state("");
  let loading = $state(false);

  let learnables = $state(instruction.data.learnables);
  let evaluation = $state({});
  let session = $state(instruction.data.session);
  let history = $state([]);
  let step = $state("");

  async function initializeSession() {
    loading = true;
    await doGenerator("", input);
    loading = false;
  }

  async function doDiscriminator(stepCache, inputCache) {
    const { evaluations, terminateSession } = await ctx.game.call(
      "/discriminator",
      {
        learnables,
        history,
        step: stepCache,
        input: inputCache,
      },
    );
    evaluation = { ...evaluations, ...evaluation };
    console.log("terminateSession", terminateSession);

    if (terminateSession === true) {
      console.log("termination signal received");
      buffer.release();
    }
  }

  async function doGenerator(stepCache, inputCache) {
    const { activePrompt, activeStep } = await ctx.game.call("/generator", {
      session,
      history,
      learnables,
      step: stepCache,
      input: inputCache,
    });
    prompt = activePrompt;
    step = activeStep;
    history.push({ role: "assistant", content: prompt });
  }

  async function onSubmit() {
    loading = true;
    const inputCache = input;
    const stepCache = step;
    input = "";
    history.push({ role: "user", content: inputCache });
    const discriminatorPromise = doDiscriminator(stepCache, inputCache);
    await doGenerator(stepCache, inputCache);
    loading = false;
    await discriminatorPromise;
  }

  onMount(initializeSession);
</script>

<Desk {onSubmit} bind:input>
  <div class="bsp-node prompt p-24 pt-32">
    {#if loading}
      <Text size="lg">Thinking...</Text>
    {:else}
      <Text size="xl">{@html prompt}</Text>
    {/if}
  </div>
</Desk>


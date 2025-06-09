<script>
  import { onMount } from "svelte";
  import { Desk, Textarea, Text, Button, Input } from "@vivalence/interface";

  const { release, intent, instruction, ctx } = $props();

  // console.log("@ GAN.svelte");
  // console.log(ctx);
  let prompt = $state("");
  let input = $state("");
  let loading = $state(false);

  // ctx.client.trajectory.branch((p) => p.key("p"));
  let learnables = $state(instruction.data.learnables);
  let evaluation = $state({});
  let session = $state(instruction.data.session);
  let history = $state([]);
  let step = $state("");

  $inspect("learnables", learnables);
  $inspect("evaluation", evaluation);

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
      release();
    }
    // learnables = learnables.map((learnable) => {
    //   if (evaluations[learnable.slug])
    //     learnable.status = evaluations[learnable.slug];
    //   return learnable;
    // });

    // console.log("learnables", learnables);
    // console.log("evaluation", evaluation);
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

  // function setupListener() {const handler = (e) => {if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onSubmit();}; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);}
  // onMount(setupListener);
  onMount(initializeSession);
</script>

<Desk {onSubmit} bind:input>
  <!--     bind:value={input} -->
  <div class="bsp-node prompt p-24 pt-32">
    {#if loading}
      <Text size="lg">Thinking...</Text>
    {:else}
      <Text size="xl">{@html prompt}</Text>
    {/if}
  </div>
</Desk>

<!-- <div class="bsp-node response p-24"> -->
<!--   <Textarea -->
<!--     mode="centered" -->
<!--     size="xl" -->
<!--     autofocus -->
<!--     bind:value={input} -->
<!--     disabled={loading}></Textarea> -->
<!-- </div> -->
<!-- </div> <div class="bsp-node v2"> -->

<style>
  * {
  }
  .prompt {
  }
  .response {
  }
</style>

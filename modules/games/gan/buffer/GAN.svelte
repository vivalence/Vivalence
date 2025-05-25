<script>
  import { onMount } from "svelte";
  import { Textarea, Text, Button, Input } from "@vivalence/interface";

  const { intent, instruction, ctx } = $props();

  console.log(ctx);
  let prompt = $state("");
  let input = $state("");
  let loading = $state(false);

  // ctx.client.trajectory.branch((p) => p.key("p"));
  let learnables = $state({});
  let session = $state([]);
  let history = $state([]);
  let step = $state("");

  async function initializeSession() {
    loading = true;
    const response = await ctx.game.call("/provision", {});
    session = response.session;
    step = session.sort((a, b) => a.index - b.index)[0].slug;
    learnables = response.learnables;

    await doGenerator(step, input);
    loading = false;
  }

  async function doDiscriminator(stepCache, inputCache) {
    const result = await ctx.game.call("/discriminator", {
      learnables,
      history,
      step: stepCache,
      input: inputCache,
    });
    console.log("discriminator result ", result);
  }
  async function doGenerator(stepCache, inputCache) {
    const { activePrompt, activeStep } = await ctx.game.call("/generator", {
      session,
      learnables,
      history,
      step: stepCache,
      input: inputCache,
    });
    prompt = activePrompt;
    step = activeStep;
    history.push({ role: "assistant", content: prompt });
  }

  async function submitResponse() {
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

  function setupListener() {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitResponse();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }
  onMount(setupListener);
  onMount(initializeSession);
</script>

<div class="bsp-node v2">
  <div class="bsp-node prompt p-24 pt-32">
    {#if loading}
      <Text size="lg">Thinking...</Text>
    {:else}
      <Text size="xl">{@html prompt}</Text>
    {/if}
  </div>
  <div class="bsp-node response p-24">
    <Textarea
      mode="centered"
      size="xl"
      autofocus
      bind:value={input}
      disabled={loading}></Textarea>
  </div>
</div>

<style>
  * {
  }
  .prompt {
  }
  .response {
  }
</style>

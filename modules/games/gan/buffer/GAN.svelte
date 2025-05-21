<script>
  import { onMount } from "svelte";
  import { Text, Button, Input } from "@vivalence/interface";

  // const props = $props(); console.log("props", props);
  const { instruction, ctx, client } = $props();

  let loading = $state(false);
  let currentStep = $state("");
  let prompt = $state("");
  let userInput = $state("");

  let learnables = $state(
    new Map(
      instruction.learnables.map((l) => [l.slug, { state: "todo", ...l }]),
    ),
  );

  async function initializeSession() {
    loading = true;
    const response = await ctx.game("/generator", {
      userInput,
      currentStep: instruction.process.find(({ step }) => slug === currentStep),
      process: instruction.process,
      learnables: Object.fromEntries(learnables),
    });

    console.log("response", response);

    // prompt = response.prompt;
    // currentStep = response.nextStep;

    // loading = false;
  }

  // async function submitResponse() {loading = true; const discResponse = await game.call("/agents/discriminator", {step: currentStep, process: instruction.process, learnables: Object.fromEntries(learnablesState), prompt, userInput,}); Object.entries(discResponse.learnables).forEach(([slug, state]) => {if (learnablesState.has(slug)) {learnablesState.set(slug, {...learnablesState.get(slug), state,});}}); const genResponse = await game.call("/agents/generator", {currentStep, learnables: Object.fromEntries(learnablesState), process: instruction.process, lastUserMessage: userInput,}); prompt = genResponse.prompt; currentStep = genResponse.nextStep; userInput = ""; loading = false;}
  onMount(initializeSession);
</script>

<div class="bsp-node v2">
  <div class="bsp-node prompt">
    prompt
    <!--   {#if loading} -->
    <!--     <div class="loading">Loading...</div> -->
    <!--   {:else} -->
    <!--     {prompt} -->
    <!--   {/if} -->
  </div>

  <div class="bsp-node response">
    <textarea bind:value={userInput} placeholder="|" disabled={loading}
    ></textarea>

    <!--   <button on:click={submitResponse} disabled={loading || !userInput.trim()}> -->
    <!--     Submit -->
    <!--   </button> -->
  </div>
</div>

<style>
  .prompt {
    background-color: red;
  }
  .response {
    background-color: blue;
  }
  /* .binary-space-partition {display: flex; flex-direction: column; height: 100vh;} .bsp {padding: 1rem;} .prompt {flex: 1; background-color: #f5f5f5; overflow-y: auto; white-space: pre-wrap;} .response {flex: 1; display: flex; flex-direction: column;} textarea {flex: 1; resize: none; padding: 0.5rem; font-size: 1rem;} button {margin-top: 0.5rem; padding: 0.5rem;} */
</style>

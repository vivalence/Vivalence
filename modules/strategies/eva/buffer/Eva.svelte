<script>
  import { onMount, onDestroy } from "svelte";
  import { BufferMode, BufferState } from "@vivalence/interface";
  import { Loader, Desk, Text } from "@vivalence/interface";

  const { buffer, ctx, pushGame } = $props();

  let agent = $state("Hello Finn, what can I do for you?");
  let input = $state("");
  let loading = $state(false);
  let history = $state([]);

  async function doAgent(message) {
    const response = await ctx.strategy //
      .call("/agent", { history, message });

    agent = response.agent.text;

    history.push({ role: "user", content: [{ type: "text", text: message }] });
    response.agent.messages.map((m) => history.push(m));

    if (response.instructions.length > 0) {
      for (const instruction of response.instructions) {
        await pushGame(instruction, async (previous, next, promise) => {
          console.log("eva buffer hook", previous, next, promise);
          console.log("eva buffer hook awaited promise", await promise);
        });
      }

      buffer.release();
    }
  }

  async function onSubmit() {
    if (loading) return;
    loading = true;
    const agentPromise = doAgent(input);
    input = "";
    await agentPromise;
    loading = false;
  }

</script>

<Desk {onSubmit} bind:input>
  <div class="bsp-node p-24 pt-32">
    {#if loading}
      <Text size="lg">Thinking...</Text>
      <Loader />
    {:else}
      <Text size="xl">{@html agent}</Text>
    {/if}
  </div>
</Desk>

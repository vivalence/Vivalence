<script>
  import { Loader, Desk, Text } from "@vivalence/surface";

  let { product, buffer } = $props();

  let agent = $state(product?.agent || "Hello, how can i help?");
  let input = $state("");
  let loading = $state(false);

  // let history = $state([]);

  // async function doAgent(message) {
  //   const response = await ctx.module.strategy //
  //     .call("/agent", { session, message });

  //   agent = response.agent.text;

  // history.push({ role: "user", content: [{ type: "text", text: message }] });
  //   response.agent.messages.map((m) => history.push(m));

  //   // if (response.instructions.length > 0) {
  //   //   for (const instruction of response.instructions) {
  //   //     await pushGame(instruction, async (previous, next, promise) => {
  //   //       console.log("eva buffer hook", previous, next, promise);
  //   //       console.log("eva buffer hook awaited promise", await promise);
  //   //     });
  //   //   }

  //   ctx.buffer.release();
  //   // }
  // }

  async function onSubmit() {
  //   if (loading) return;
  //   loading = true;
  //   const agentPromise = doAgent(input);
  //   input = "";
  //   await agentPromise;
  //   loading = false;
  }
</script>

<Desk {onSubmit} bind:input>
  <div class="bsp-node">
    <div class="bsp-node p-24 pt-32">
      {#if loading}
        <Text size="lg">Thinking...</Text>
      {:else}
        <Text size="xl">{@html agent}</Text>
      {/if}
    </div>
  </div>
</Desk>

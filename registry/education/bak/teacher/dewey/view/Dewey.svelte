<script>
  import { Loader, Desk, Text } from "@vivalence/drapes";

  let { product, buffer, mode, ctx } = $props();

  console.log("XTX dewy", { ctx, mode });

  let agent = $state(product?.agent || "what");

  let input = $state("");
  let loading = $state(false);

  // let history = $state([]);

  // async function doAgent(message) {
  //   const response = await ctx.mode //
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
    if (loading || !input.trim()) return;
    loading = true;
    const message = input;
    input = "";

    const response = await mode.connection.call("/conversation", { message });
    agent = response.agent;
    loading = false;
  }
</script>

<Desk {onSubmit} bind:input>
  <div class="bsp-node">
    <div class="bsp-node p-24 pt-32">
      {#if loading}
        <Text>Thinking...</Text>
      {:else}
        <Text>{@html agent}</Text>
      {/if}
    </div>
  </div>
</Desk>

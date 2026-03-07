<script>
  import { getContext } from "svelte";
  import { effect } from "nanostores";
  import { Text } from "@vivalence/drapes";
  import { Buffer } from "@vivalence/html/typology";
  import Frame from "../Frame.svelte";

  const terminal = getContext("terminal");

  const status = terminal.stall.$status;
  const active = terminal.stall.$active;
  // $inspect("active",  $active);

  effect([terminal.$mode, terminal.$valence], (mode, valence) => {
    if (!mode || !valence) return;

    terminal.stall.withPull(async () => {
      const production = await terminal.valence.produce({
        scope: { session: terminal.session.id },
      });

      if (production.isClosed) terminal.stall.$status.set("CLOSED");

      return production.products.map(
        (product) => new Buffer({ terminal, product }, product.mode.view),
      );
    });

    terminal.stall.$status.set("IDLE");
  });

  effect(
    [terminal.stall.$active, terminal.stall.$queue, terminal.stall.$status],
    (active, queue, status) => {
      if (!["IDLE"].includes(status)) return;
      if (!active) terminal.stall.pull();
      if (queue.length < terminal.valence.queue) terminal.stall.pull();
    },
  );
</script>

{#if $active}
  <!-- <Text size="xs">{JSON.stringify($active.context.product, null, 2)}</Text> -->
  {#if $active.context?.product?.type === "MODAL"}
    <Frame buffer={active}>
      <!-- <Text size="xs">{JSON.stringify($active.context.product, null, 2)}</Text> -->
    </Frame>
  {/if}
{:else}
  <div class="bsp-node flex items-center justify-center">
    <p class="text-skeleton-2-contrast">—</p>
    <br />
    <p class="text-skeleton-2-contrast">{$status}</p>
  </div>
{/if}
<!-- <script> -->
<!--   import { getContext } from "svelte"; -->
<!--   import { effect } from "nanostores"; -->

<!--   const terminal = getContext("terminal"); -->

<!--   const active = terminal.stall.$active; -->
<!--   const products = terminal.stall.$queue; -->

<!--   $inspect("active", $active); -->

<!--   effect( -->
<!--     [terminal.$mode, terminal.$valence, terminal.stall.$active, terminal.stall.$queue], -->
<!--     (mode, valence, active, queue) => { -->
<!--       console.log({ mode, valence, active, queue, queueDepth: queue.length }); -->

<!--       if (!valence || !mode) return; -->
<!--       if (["STOP", "PULLING"].includes(terminal.stall.$status.get())) return; -->
<!--       if (queue.length > 2) return; -->

<!--       console.log("producing valence"); -->

<!--       terminal.valence.produce({ scope: { session: terminal.session.id } }).then((products) => { -->
<!--         console.log({ products }); -->
<!--         terminal.stall.push(products); -->
<!--       }); -->

<!--       // terminal.stall.withPull(async () => {}); -->
<!--     }, -->
<!--   ); -->

<!--   effect([], (active, queue) => {}); -->

<!--   // return products .map((product) => new Terminal(product.mode.view, { ...ctx, product })); -->
<!-- </script> -->

<!-- {#if $active} -->
<!--   {#if $active.type === "MODAL"} -->
<!--     <div class="bsp-node p-8"> -->
<!--       <pre class="text-xs">{JSON.stringify($active.data?.MODAL, null, 2)}</pre> -->
<!--       <button -->
<!--         class="mt-4 px-3 py-1 bg-skeleton-2-surface border border-skeleton-1-boundary rounded text-sm" -->
<!--         onclick={() => terminal.stall.next()}> -->
<!--         next -->
<!--       </button> -->
<!--     </div> -->
<!--     <\!-- {:else if $active.type === "MESSAGE"} <div class="bsp-node p-8"> <p class="text-sm text-skeleton-2-contrast"> {$active.traits?.includes("USER") ? "you" : "agent"} </p> <p>{$active.data?.[$active.traits?.includes("USER") ? "USER" : "AGENT"]?.content}</p> </div> -\-> -->
<!--   {/if} -->
<!-- {:else} -->
<!--   <div class="bsp-node flex items-center justify-center"> -->
<!--     <p class="text-skeleton-2-contrast">—</p> -->
<!--   </div> -->
<!-- {/if} -->

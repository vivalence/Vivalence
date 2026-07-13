<script>
  import { Text, Button } from "@vivalence/drapes";
  import { Scope } from "@vivalence/typology";

  const { terminal, product } = $props();
  // console.log({ daemon, mode, stall, buffer, product })

  const { front, back } = product.data;

  let revealed = $state(false);

  const onReview = async (signal) => {
    const input = { signal, scope: { product: product.id } };
    const promise = terminal.daemon.call("/review/product", input);
    terminal.stall.next(
      promise.then((result) => {
        const { play, memory, change } = result[0].literal;
        // console.log("change", change);
        // console.log("lastAt", play.lastAt);
        // console.log("nextAt:", play.nextAt);
      }),
    );
  };

  const reveal = () => (revealed = true);
</script>

{#snippet card(card, color, classes)}
  <div
    class={`card h-1/2 lg:h-auto lg:max-h-full lg:w-1/2 p-4 rounded-lg shadow-md border border-skeleton-boundary-1 ${classes} `}>
    <Text size="2xl" {color}>
      {@html card.header}
    </Text>
    <Text size="md" {color}>
      {@html card.content}
    </Text>
    <Text size="sm" class="mt-4" {color}>
      {@html card.footer}
    </Text>
  </div>
{/snippet}

<div class="bsp-node root">
  <div class="bsp-node content grid-cols-6 grid-rows-6" onclick={reveal}>
    <div
      class={`bsp-chain-end flashcard p-8 gap-4
      col-span-4 col-start-2 row-span-4 row-start-3 lg:col-span-4 lg:col-start-2 lg:row-span-2 lg:row-start-3
      flex flex-col justify-end lg:flex-row lg:justify-start`}>
      {@render card(front, "1", "front bg-skeleton-surface-1 ")}

      {#if revealed}
        {@render card(back, "2", "back bg-skeleton-surface-2 ")}
      {/if}
    </div>
  </div>

  <div
    class={`bsp-chain-end menu p-4 shadow-md border-t border-skeleton-boundary-1 flex justify-center gap-2`}>
    {#if revealed}
      <Button size="xl" variant="warning" onclick={() => onReview("MISTAKE")}>Unknown</Button>
      <Button size="xl" variant="success" onclick={() => onReview("SUCCESS")}>Known</Button>
      <Button size="xl" variant="accent" onclick={() => onReview("MASTERY")}>Graduate</Button>
    {:else}
      <Button size="xl" onclick={reveal}>Reveal</Button>
    {/if}
  </div>
</div>

<style>
  .root {
    grid-template-rows: 1fr auto;
  }

  .content {
    .flashcard {
    }
    .card {
      .header {
      }
      .content {
      }
      .footer {
      }

      .front {
      }
      .back {
      }
    }
  }
  .menu {
  }
</style>

<script module>
  export class GameState {
    instruction = $state(null);

    runtime;
    game;
    next;

    revealed = $state(true);

    constructor({ instruction }) {
      /* constructor({ runtime, game, next, instruction }) {this.runtime = runtime; this.game = game; this.next = next; */
      this.instruction = instruction;
    }

    reveal() {
      this.revealed = true;
    }

    async review(response) {
      await this.game.call("/evaluate", {
        // scope: this.scope,
        // response,
      });
    }

    reset() {
      this.instruction = null;
      this.scope = null;
      this.revealed = false;
      this.loading = true;
    }
  }
</script>

<script>
  import { Text, Button } from "@vivalence/ui";
  const { gameState } = $props();

  const onReview = (status) => async () => await gameState.review(status);
  const onTabRoot = () => gameState.reveal();
</script>

{#snippet card(card, color, classes)}
  <div
    class={`card h-1/2 lg:max-h-full lg:w-1/2 p-4 rounded-lg shadow-md border border-theme-border-1 ${classes} `}>
    <Text size="2xl" {color}>
      {@html card.header}
    </Text>
    <Text size="md" {color}>
      {@html card.content}
    </Text>
    <Text size="md" {color}>
      {@html card.footer}
    </Text>
  </div>
{/snippet}

<div class="grid-chain-node root">
  <div class="grid-chain-node content grid-cols-6 grid-rows-6" onclick={onTabRoot}>
    <div
      class={`grid-chain-end flashcard p-8 gap-4
      col-span-4 col-start-2 row-span-4 row-start-3 lg:col-span-4 lg:col-start-2 lg:row-span-2 lg:row-start-3
      flex flex-col justify-end lg:flex-row lg:justify-start`}>
      {@render card(gameState.instruction.front, "1", "front bg-theme-ui-1 ")}

      {#if gameState.revealed}
        {@render card(gameState.instruction.back, "2", "back bg-theme-ui-2 ")}
      {/if}
    </div>
  </div>

  <div
    class={`grid-chain-end menu p-4 shadow-md border-t  border-theme-border-1 flex justify-center gap-2`}>
    {#if gameState.revealed}
      <Button size="xl" variant="warning" onclick={onReview("UNKNOWN")}>Unknown</Button>
      <Button size="xl" variant="success" onclick={onReview("KNOWN")}>Known</Button>
      <Button size="xl" variant="accent" onclick={onReview("GRADUATE")}>Graduate</Button>
    {:else}
      <Button size="xl" onclick={() => gameState.reveal()}>Reveal</Button>
    {/if}
  </div>
</div>

<style>
  .root {
    grid-template-rows: 1fr auto;
  }

  .content {
    .flashcard {
      /* background-color: white; */

      .card {
        /* .header {
             font-size: var(--font-size-xl);
             line-height: var(--line-height-xl);
             }
             .content {
             font-size: var(--font-size-md);
             line-height: var(--line-height-md);
             }
             .footer {
             font-size: var(--font-size-sm);
             line-height: var(--line-height-sm);
             } */
      }
      .front {
      }

      .back {
      }
    }
  }
  .menu {
    /* background-color: white; */
  }
</style>

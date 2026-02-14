<script>
  import { object } from "@vivalence/shared";
  import { Text, Button, Input, Card } from "@vivalence/drapes";
  import { Header, Tag, Shelve, Box } from "@vivalence/drapes";

  const { daemon, mode, stall, buffer, product } = $props();
  const { infinitive, tense, mood } = product.data;
  const conjugations = product.data.conjugations //
    .sort((a, b) => a.meta.index - b.meta.index);


  let revealed = $state(false);
  let inputs = $state(conjugations.map(() => ""));
  let results = $state(conjugations.map(() => null));

  const score = $derived(results.filter((r) => r?.result === "SUCCESS").length);
  const total = conjugations.length;

  const normalize = (s) => (s || "").trim().toLowerCase().normalize("NFC");

  const check = () => {
    revealed = true;

    results = conjugations.map((c, i) => {
      const isCorrect = normalize(inputs[i]) === normalize(c.learning);
      const scope = object.omit(
        { ...product.data.scope, ...c.scope, product: product.id },
        ["literals", "symbols"],
      );
      return {
        scope,
        result: isCorrect ? "SUCCESS" : "MISTAKE",
      };
    });

    const allSuccess = results.every((r) => r.result === "SUCCESS");
    const allMistake = results.every((r) => r.result === "MISTAKE");

    const input = {
      results: results.map((r) => ({
        scope: r.scope,
        signal: allSuccess ? "MASTERY" : allMistake ? "FAILURE" : r.result,
      })),
    };

    const promise = mode.call("/evaluate", input);
    promise.then((result) => console.log({ evaluted: result }));
  };

  const onNext = async () => {
    stall.next();
  };

  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      if (!revealed) check();
      else onNext();
    }
  };
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="bsp-chain-end stage">
      <Card padding="lg" class="prompt">
        <Shelve down class="gap-3">
          <Shelve across class="items-baseline gap-2">
            <Text as="h1" size="2xl" weight="bold">{infinitive.known}</Text>
            {#if revealed}
              <Text size="2xl" color="skeleton-2-contrast">—</Text>
              <Text as="h1" size="2xl" weight="bold" color="theme-primary">
                {infinitive.learning}
              </Text>
            {/if}
          </Shelve>

          <Shelve across class="gap-2">
            <Tag variant="secondary">{tense}</Tag>
            <Tag variant="secondary">{mood}</Tag>
          </Shelve>
        </Shelve>
      </Card>

      <Card padding="none" class="conjugation-table">
        <table>
          <thead>
            <tr>
              <th class="col-index">
                <Text size="xs" weight="medium" color="skeleton-2-contrast"
                  >#</Text>
              </th>
              <th class="col-prompt">
                <Text size="xs" weight="medium" color="skeleton-2-contrast"
                  >Prompt</Text>
              </th>
              <th class="col-input">
                <Text size="xs" weight="medium" color="skeleton-2-contrast"
                  >Your answer</Text>
              </th>
              <th class="col-answer" class:invisible={!revealed}>
                <Text size="xs" weight="medium" color="skeleton-2-contrast"
                  >Correct</Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each conjugations as conjugation, index}
              {@const result = results[index]}
              <tr
                class:row-success={result?.result === "SUCCESS"}
                class:row-mistake={result?.result === "MISTAKE"}>
                <td class="col-index">
                  <Text size="sm" color="skeleton-2-contrast">{index + 1}</Text>
                </td>
                <td class="col-prompt">
                  <Text size="md">{conjugation.known}</Text>
                </td>
                <td class="col-input">
                  <Input
                    size="md"
                    placeholder="..."
                    autofocus={index === 0}
                    bind:value={inputs[index]}
                    disabled={revealed} />
                </td>
                <td class="col-answer" class:invisible={!revealed}>
                  <Shelve across class="items-center gap-2">
                    <Text size="md" weight="medium" color="theme-primary">
                      {conjugation.learning}
                    </Text>
                    {#if result?.result === "SUCCESS"}
                      <Tag variant="success">✓</Tag>
                    {:else if result?.result === "MISTAKE"}
                      <Tag variant="error">✗</Tag>
                    {/if}
                  </Shelve>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </Card>

      {#if revealed}
        <Card padding="md" class="score-card">
          <Shelve across class="items-center justify-center gap-3">
            <Text
              size="lg"
              weight="bold"
              color={score === total ? "theme-success" : "theme-warning"}>
              {score} / {total}
            </Text>
            <Text size="sm" color="skeleton-2-contrast">
              {#if score === total}
                Perfect!
              {:else if score >= Math.ceil(total / 2)}
                Almost there
              {:else}
                Keep practicing
              {/if}
            </Text>
          </Shelve>
        </Card>
      {/if}
    </div>
  </div>

  <div
    class="bsp-chain-end menu p-4 shadow-md border-t border-skeleton-boundary-1 flex justify-center gap-2">
    {#if !revealed}
      <Button size="xl" variant="primary" onclick={check}>Check</Button>
    {:else}
      <Button size="xl" onclick={onNext}>Next</Button>
    {/if}
  </div>
</div>

<style>
  .root {
    grid-template-rows: 1fr auto;
  }

  .content {
    overflow-y: auto;
  }

  .stage {
    max-width: 40rem;
    margin: 0 auto;
    padding: 8vh 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead th {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--skeleton-boundary-1);
  }

  tbody td {
    padding: 0.5rem 0.75rem;
    vertical-align: middle;
  }

  tbody tr + tr td {
    border-top: 1px solid var(--skeleton-boundary-1);
  }

  .col-index {
    width: 2rem;
    text-align: center;
  }

  .col-prompt {
    width: 8rem;
  }

  .col-input {
    min-width: 8rem;
  }

  .col-answer {
    min-width: 8rem;
  }

  .invisible {
    visibility: hidden;
  }

  .row-success td {
    background: color-mix(
      in srgb,
      var(--theme-success-surface, #d1fae5) 20%,
      transparent
    );
  }

  .row-mistake td {
    background: color-mix(
      in srgb,
      var(--theme-error-surface, #fee2e2) 20%,
      transparent
    );
  }

  .score-card {
    text-align: center;
  }
</style>

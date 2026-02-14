<script>
  import { Text, Button, Input, Card, Tag, Shelve } from "@vivalence/drapes";

  const { daemon, mode, stall, buffer, product } = $props();
  const { sentence, tokens } = product.data;

  let input = $state("");
  let revealed = $state(false);
  let loading = $state(false);
  let evaluation = $state(null);

  const submit = async () => {
    if (!input.trim()) return;
    revealed = true;
    loading = true;

    const params = {
      translation: input,
      sentence,
      tokens: tokens || [],
      scope: { product: { id: product.id } },
    };

    try {
      evaluation = await mode.call("/evaluate", params);
    } finally {
      loading = false;
    }
  };

  const next = () => stall.next();

  const handleKeydown = (e) => {
    if (e.key === "Enter") {
      if (!revealed) submit();
      else if (!loading) next();
    }
  };

  const variantOf = (signal) =>
    ({ SUCCESS: "success", NEUTRAL: "accent", MISTAKE: "error" })[signal] ||
    "secondary";

  const labelOf = (signal) =>
    ({ SUCCESS: "Correct", NEUTRAL: "Acceptable", MISTAKE: "Incorrect" })[
      signal
    ] || signal;

  const tokenClass = (signal) =>
    ({ SUCCESS: "tok-ok", NEUTRAL: "tok-alt", MISTAKE: "tok-err" })[signal] ||
    "";

  const overallVariant = $derived(
    evaluation ? variantOf(evaluation.overall.signal) : null,
  );
  const overallLabel = $derived(
    evaluation ? labelOf(evaluation.overall.signal) : null,
  );
  const mistakes = $derived(
    evaluation?.tokens?.filter((t) => t.signal === "MISTAKE") || [],
  );
  const score = $derived(() => {
    if (!evaluation?.tokens) return null;
    const content = evaluation.tokens.filter(
      (t) => t.pos && !["PUNCT"].includes(t.pos.toUpperCase()),
    );
    if (content.length === 0) return null;
    const correct = content.filter((t) => t.signal !== "MISTAKE").length;
    return { correct, total: content.length };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="bsp-node root">
  <div class="bsp-node content">
    <div class="bsp-chain-end stage">
      <!-- Prompt -->
      <Card padding="lg">
        <Text size="xs" weight="medium" color="skeleton-2-contrast">
          Translate into the target language:
        </Text>
        <Text as="h1" size="2xl" weight="bold" class="mt-2">
          {sentence.known}
        </Text>
      </Card>

      {#if revealed}
        <Card padding="md">
          <Shelve down class="gap-4">
            <!-- Overall verdict -->
            {#if loading}
              <Shelve across class="items-center gap-2">
                <Text size="sm" color="skeleton-2-contrast">Evaluating…</Text>
              </Shelve>
            {/if}

            {#if evaluation}
              <Shelve across class="items-center gap-2">
                <Tag variant={overallVariant}>{overallLabel}</Tag>
                {#if evaluation.overall.feedback}
                  <Text size="sm" color="skeleton-2-contrast">
                    {evaluation.overall.feedback}
                  </Text>
                {/if}
              </Shelve>

              <!-- Token-highlighted expected sentence -->
              <div>
                <Text size="xs" weight="medium" color="skeleton-2-contrast">
                  Expected:
                </Text>
                <div class="token-line">
                  {#each evaluation.tokens as t}
                    <span
                      class={`tok ${tokenClass(t.signal)}`}
                      title={t.feedback || t.token}>
                      {t.token}
                    </span>
                  {/each}
                </div>
              </div>

              <!-- User's answer -->
              <div>
                <Text size="xs" weight="medium" color="skeleton-2-contrast">
                  Yours:
                </Text>
                <Text size="lg">{input}</Text>
              </div>

              <!-- Score -->
              {#if score()}
                <Shelve across class="items-center gap-2">
                  <Text
                    size="md"
                    weight="bold"
                    color={score().correct === score().total
                      ? "theme-success"
                      : "theme-warning"}>
                    {score().correct}/{score().total}
                  </Text>
                  <Text size="xs" color="skeleton-2-contrast">words</Text>
                </Shelve>
              {/if}

              <!-- Per-token mistake details -->
              {#if mistakes.length > 0}
                <div class="details">
                  <Text size="xs" weight="medium" color="skeleton-2-contrast">
                    Details:
                  </Text>
                  <div class="detail-list">
                    {#each mistakes as t}
                      <div class="detail-item">
                        <Shelve across class="items-center gap-2">
                          <Tag variant="error" size="sm">{t.token}</Tag>
                          {#if t.correction}
                            <Text size="sm" weight="medium">
                              → {t.correction}
                            </Text>
                          {/if}
                        </Shelve>
                        {#if t.feedback}
                          <Text size="xs" color="skeleton-2-contrast">
                            {t.feedback}
                          </Text>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            {/if}
          </Shelve>
        </Card>
      {/if}
    </div>
  </div>

  <div
    class="bsp-chain-end menu p-4 shadow-md border-t border-skeleton-boundary-1">
    <div class="controls">
      {#if !revealed}
        <Input
          size="xl"
          placeholder="Type your translation…"
          autofocus
          bind:value={input}
          class="flex-1" />
        <Button size="xl" variant="primary" onclick={submit}>Submit</Button>
      {:else}
        <Button size="xl" onclick={next} disabled={loading}>Next</Button>
      {/if}
    </div>
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
    padding: 10vh 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .controls {
    max-width: 40rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .menu {
    grid-template-columns: 1fr;
    align-items: center;
  }

  /* Token-level highlighting */
  .token-line {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;
    align-items: baseline;
    font-size: 1.125rem;
    line-height: 1.85;
    margin-top: 0.25rem;
  }

  .tok {
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s ease;
  }

  .tok-ok {
    background: color-mix(
      in srgb,
      var(--theme-success-surface, #d1fae5) 30%,
      transparent
    );
  }

  .tok-alt {
    background: color-mix(
      in srgb,
      var(--theme-accent-surface, #e0e7ff) 35%,
      transparent
    );
  }

  .tok-err {
    background: color-mix(
      in srgb,
      var(--theme-error-surface, #fee2e2) 45%,
      transparent
    );
    text-decoration: underline wavy;
    text-decoration-color: var(--theme-error, #ef4444);
    text-underline-offset: 3px;
    cursor: help;
  }

  /* Mistake detail cards */
  .details {
    border-top: 1px solid var(--skeleton-boundary-1);
    padding-top: 0.75rem;
  }

  .detail-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.5rem 0.625rem;
    border-radius: 0.375rem;
    background: color-mix(
      in srgb,
      var(--theme-error-surface, #fee2e2) 15%,
      transparent
    );
  }
</style>

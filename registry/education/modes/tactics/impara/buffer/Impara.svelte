<script>
  import { onMount } from "svelte";
  import { Section } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  const ACCENTS = {
    "/emit/vocabolario": "#5b8c5a",
    "/emit/grammatica": "#d0a24c",
    "/emit/frasi": "#5b9bd5",
  };

  let buckets = $state([]);
  let note = $state("");
  let entering = $state("");

  const daemon = () => terminal.daemon ?? terminal.thread?.daemon;

  const course = () =>
    daemon().entities.mode.$entities.get().find((mode) => mode.id === buffer.mode.id) ??
    buffer.mode;

  async function load(attempt = 0) {
    try {
      const opened = await course().connection.call("/course/open", {});
      const threads = await daemon().entities.thread.find({}, { populate: ["mode"] });
      buckets = opened.map((entry) => {
        const thread = threads.find((candidate) => candidate.id === entry.id);
        return { ...entry, thread, queued: thread?.$buffers?.get?.().length ?? 0 };
      });
      note = "";
    } catch (error) {
      if (attempt < 2) {
        await new Promise((settle) => setTimeout(settle, 250));
        return load(attempt + 1);
      }
      note = String(error?.message ?? error);
    }
  }

  onMount(load);

  async function enter(bucket) {
    if (!bucket.thread || entering) return;
    entering = bucket.mount;
    try {
      daemon().entities.thread.resolve?.(bucket.thread);
      terminal.thread = bucket.thread;
    } catch (error) {
      note = String(error?.message ?? error);
    } finally {
      entering = "";
    }
  }
</script>

<div class="impara">
  <header>
    <h1>Impara</h1>
    <p>Tre secchi. Ognuno si nutre da solo.</p>
  </header>

  <Section label="Corso" />

  {#if note}<p class="note">{note}</p>{/if}

  <div class="buckets">
    {#each buckets as bucket (bucket.mount)}
      <button
        class="bucket"
        style:--accent={ACCENTS[bucket.mount] ?? "#5b8c5a"}
        disabled={!bucket.thread || entering === bucket.mount}
        onclick={() => enter(bucket)}
      >
        <span class="pip"></span>
        <span class="name">{bucket.name}</span>
        <span class="mount">{bucket.mount}</span>
        <span class="queued">{bucket.queued} in coda</span>
        <span class="go">{entering === bucket.mount ? "…" : "→"}</span>
      </button>
    {:else}
      <p class="note">Nessun secchio.</p>
    {/each}
  </div>
</div>

<style>
  .impara {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    height: 100%;
    padding: 1.6rem 1.8rem;
    overflow-y: auto;
  }
  header h1 {
    margin: 0;
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-3xl);
    color: var(--colors-skeleton-1-foreground);
  }
  header p {
    margin: 0.25rem 0 0;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
  }
  .buckets {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .bucket {
    display: grid;
    grid-template-columns: auto 1fr auto auto auto;
    align-items: center;
    gap: 0.9rem;
    padding: 0.95rem 1.1rem;
    border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
    border-left: 3px solid var(--accent);
    border-radius: 0.7rem;
    background: color-mix(in srgb, var(--accent) 6%, transparent);
    cursor: pointer;
    text-align: left;
    transition: background 0.18s, transform 0.12s;
  }
  .bucket:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    transform: translateY(-1px);
  }
  .bucket:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .pip {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 60%, transparent);
  }
  .name {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--accent);
  }
  .mount,
  .queued {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
  .go {
    font-size: var(--font-size-lg);
    color: var(--accent);
  }
  .note {
    margin: 0;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    color: #d0a24c;
  }
</style>

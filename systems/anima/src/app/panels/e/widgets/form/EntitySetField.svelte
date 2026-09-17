<script>
  import { fn } from "@vivalence/typology";
  import { catalog, filterCatalog, searchLiterals } from "./picker.js";
  import EntityRow from "./EntityRow.svelte";
  import SymbolFacets from "./SymbolFacets.svelte";

  let { daemon, entity, value = [], onchange } = $props();

  let lane = $state("search"); // search | symbols (literals only)
  let term = $state("");
  let results = $state([]);
  let chosen = $state([]);
  let facetSlugs = $state([]);
  let preview = $state([]);

  let ids = $derived(value ?? []);

  $effect(() => {
    if (!daemon || !ids.length) {
      chosen = [];
      return;
    }
    Promise.all(
      ids.map((id) =>
        entity === "symbol"
          ? catalog(daemon).then((it) => it.all.find((s) => s.id === id || s.slug === id))
          : daemon.entities.literal.findOne({ id }),
      ),
    ).then((items) => (chosen = items.filter(Boolean)));
  });

  const run = fn.debounce(async (text) => {
    if (!daemon || !text) {
      results = [];
      return;
    }
    results =
      entity === "symbol"
        ? filterCatalog((await catalog(daemon)).all, text)
        : await searchLiterals(daemon, { term: text });
  }, 160);

  async function onFacets(slugs) {
    facetSlugs = slugs;
    preview = slugs.length ? await searchLiterals(daemon, { symbols: slugs, limit: 50 }) : [];
  }

  function add(item) {
    const id = item.id ?? item.slug;
    if (!ids.includes(id)) onchange?.([...ids, id]);
  }

  function addAll(items) {
    const have = new Set(ids);
    const next = [...ids];
    for (const item of items) {
      const id = item.id ?? item.slug;
      if (!have.has(id)) {
        have.add(id);
        next.push(id);
      }
    }
    onchange?.(next);
  }

  function remove(id) {
    onchange?.(ids.filter((each) => each !== id));
  }
</script>

<div class="set">
  {#if chosen.length}
    <div class="chips">
      {#each chosen as item (item.id ?? item.slug)}
        <span class="chip">
          <EntityRow kind={entity} item={item} />
          <button class="x" onclick={() => remove(item.id ?? item.slug)} title="remove">✕</button>
        </span>
      {/each}
    </div>
  {/if}

  <div class="builder">
    {#if entity === "literal"}
      <div class="lanes">
        <button class:on={lane === "search"} onclick={() => (lane = "search")}>search</button>
        <button class:on={lane === "symbols"} onclick={() => (lane = "symbols")}>symbols ∩</button>
        <span class="count">{ids.length} selected</span>
      </div>
    {/if}

    <div class="body">
      {#if entity === "symbol" || lane === "search"}
        <input
          class="control"
          value={term}
          placeholder={`search ${entity}…`}
          oninput={(event) => {
            term = event.currentTarget.value;
            run(term);
          }} />
        {#if results.length}
          <div class="results">
            {#each results as item (item.id ?? item.slug)}
              <button class="result" class:on={ids.includes(item.id ?? item.slug)} onclick={() => add(item)}>
                <EntityRow kind={entity} item={item} />
              </button>
            {/each}
          </div>
        {/if}
      {:else}
        <SymbolFacets {daemon} selected={facetSlugs} onchange={onFacets} />
        {#if facetSlugs.length}
          <div class="preview-head">
            <span>{preview.length} in ∩</span>
            <button class="add-all" disabled={!preview.length} onclick={() => addAll(preview)}>add all</button>
          </div>
          <div class="results">
            {#each preview as item (item.id)}
              <button class="result" class:on={ids.includes(item.id)} onclick={() => add(item)}>
                <EntityRow kind="literal" item={item} />
              </button>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .set {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }
  .chip {
    display: flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    padding: 1px 4px 1px 6px;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    font-size: var(--font-size-2xs);
  }
  .builder {
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-2-boundary) 70%, transparent);
    border-radius: 3px;
    background: color-mix(in srgb, var(--colors-skeleton-2-surface) 30%, transparent);
  }
  .lanes {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 6px;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-2-boundary) 50%, transparent);
  }
  .lanes button {
    padding: 1px 8px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    cursor: pointer;
    opacity: 0.55;
  }
  .lanes button.on {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .count {
    margin-left: auto;
    font-size: var(--font-size-2xs);
    opacity: 0.4;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    max-height: 260px;
    overflow: auto;
  }
  .control {
    background: transparent;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    padding: 2px 5px;
  }
  .control:focus {
    outline: none;
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .results {
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-2-boundary) 60%, transparent);
    border-radius: 2px;
  }
  .result {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 3px 6px;
    background: transparent;
    border: none;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    text-align: left;
    cursor: pointer;
  }
  .result:hover {
    background: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 12%, transparent);
  }
  .result.on {
    color: var(--colors-skeleton-0-primary-base);
    opacity: 0.65;
  }
  .preview-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-2xs);
    opacity: 0.6;
  }
  .add-all {
    margin-left: auto;
    padding: 1px 8px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-0-primary-base);
    border-radius: 2px;
    color: var(--colors-skeleton-0-primary-base);
    font: inherit;
    font-size: var(--font-size-2xs);
    cursor: pointer;
  }
  .add-all:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  .x {
    background: none;
    border: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
    opacity: 0.4;
  }
  .x:hover {
    opacity: 1;
    color: var(--colors-skeleton-0-danger-base);
  }
</style>

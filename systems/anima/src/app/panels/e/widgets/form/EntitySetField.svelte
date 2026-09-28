<script>
  import { fn } from "@vivalence/typology";
  import { Input, Key, Row, Segmented, Tag } from "@vivalence/drapes";
  import { catalog, filterCatalog, searchLiterals } from "./picker.js";
  import EntityRow from "./EntityRow.svelte";
  import SymbolFacets from "./SymbolFacets.svelte";

  let { daemon, entity, value = [], onchange } = $props();

  const LANES = [
    { value: "search", label: "search" },
    { value: "symbols", label: "symbols ∩" },
  ];

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

<div class="entity-set">
  {#if chosen.length}
    <div class="entity-chosen">
      {#each chosen as item (item.id ?? item.slug)}
        <Tag>
          <EntityRow kind={entity} item={item} />
          <Key tone="ghost" size="mini" square label="✕" title="remove" onclick={() => remove(item.id ?? item.slug)} />
        </Tag>
      {/each}
    </div>
  {/if}

  <div class="entity-builder">
    {#if entity === "literal"}
      <div class="entity-lanes">
        <Segmented options={LANES} value={lane} cell={84} onpick={(name) => (lane = name)} />
        <span class="entity-count">{ids.length} selected</span>
      </div>
    {/if}

    <div class="entity-body">
      {#if entity === "symbol" || lane === "search"}
        <Input
          value={term}
          placeholder={`search ${entity}…`}
          oninput={(event) => {
            term = event.currentTarget.value;
            run(term);
          }} />
        {#if results.length}
          <div class="entity-found">
            {#each results as item (item.id ?? item.slug)}
              <Row selected={ids.includes(item.id ?? item.slug)} onclick={() => add(item)}>
                <EntityRow kind={entity} item={item} />
              </Row>
            {/each}
          </div>
        {/if}
      {:else}
        <SymbolFacets {daemon} selected={facetSlugs} onchange={onFacets} />
        {#if facetSlugs.length}
          <div class="entity-preview">
            <span>{preview.length} in ∩</span>
            <Key size="mini" disabled={!preview.length} label="add all" onclick={() => addAll(preview)} />
          </div>
          <div class="entity-found">
            {#each preview as item (item.id)}
              <Row selected={ids.includes(item.id)} onclick={() => add(item)}>
                <EntityRow kind="literal" item={item} />
              </Row>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .entity-set {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .entity-chosen {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .entity-builder {
    border-radius: var(--shape-radius-card);
    background: var(--surface-sunk);
    box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
  }
  .entity-lanes {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-bottom: var(--size-ring) solid var(--boundary);
  }
  .entity-count {
    margin-left: auto;
    color: var(--text-light);
    white-space: nowrap;
  }
  .entity-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 260px;
    overflow: auto;
    padding: 8px;
  }
  .entity-found {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .entity-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-bottom: var(--size-depth);
    color: var(--text-light);
  }
</style>

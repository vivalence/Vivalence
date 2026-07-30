<script>
  import { fn } from "@vivalence/typology";
  import { catalog, filterCatalog, searchLiterals } from "./picker.js";
  import EntityRow from "./EntityRow.svelte";

  let { daemon, entity, value, onchange, description = "" } = $props();

  let term = $state("");
  let results = $state([]);
  let open = $state(false);
  let selected = $state(null);

  $effect(() => {
    if (!value || !daemon) {
      selected = null;
      return;
    }
    if (entity === "symbol") {
      catalog(daemon).then((it) => (selected = it.all.find((s) => s.id === value || s.slug === value) ?? null));
    } else {
      daemon.entities.literal.findOne({ id: value }).then((found) => (selected = found));
    }
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

  function input(text) {
    term = text;
    open = true;
    run(text);
  }

  function pick(item) {
    selected = item;
    open = false;
    term = "";
    results = [];
    onchange?.(item.id ?? item.slug);
  }

  function clear() {
    selected = null;
    onchange?.(undefined);
  }
</script>

<div class="entity-field">
  {#if selected}
    <div class="selected">
      <EntityRow kind={entity} item={selected} />
      <button class="x" onclick={clear} title="clear">✕</button>
    </div>
  {:else}
    <input
      class="control"
      value={term}
      placeholder={description || `search ${entity}…`}
      oninput={(event) => input(event.currentTarget.value)}
      onfocus={() => (open = true)} />
  {/if}

  {#if open && results.length}
    <div class="results">
      {#each results as item (item.id ?? item.slug)}
        <button class="result" onclick={() => pick(item)}>
          <EntityRow kind={entity} item={item} />
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .entity-field {
    flex: 1;
    min-width: 0;
    position: relative;
  }
  .selected {
    display: flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    padding: 2px 5px;
    font-size: var(--font-size-2xs);
  }
  .control {
    width: 100%;
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
    position: absolute;
    z-index: 10;
    left: 0;
    right: 0;
    margin-top: 2px;
    max-height: 180px;
    overflow: auto;
    background: var(--colors-skeleton-2-surface);
    border: 1px solid var(--colors-skeleton-2-boundary);
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
  .x {
    margin-left: auto;
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

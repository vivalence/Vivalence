<script>
  import { fn } from "@vivalence/typology";
  import { Input, Key, Row } from "@vivalence/drapes";
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
    <Row selected>
      <EntityRow kind={entity} item={selected} />
      <Key tone="ghost" size="mini" square label="✕" title="clear" onclick={clear} />
    </Row>
  {:else}
    <div role="presentation" onfocusin={() => (open = true)}>
      <Input value={term} placeholder={description || `search ${entity}…`} oninput={(event) => input(event.currentTarget.value)} />
    </div>
  {/if}

  {#if open && results.length}
    <div class="entity-results">
      {#each results as item (item.id ?? item.slug)}
        <Row onclick={() => pick(item)}>
          <EntityRow kind={entity} item={item} />
        </Row>
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
  .entity-results {
    position: absolute;
    z-index: 10;
    left: 0;
    right: 0;
    margin-top: 4px;
    max-height: 180px;
    overflow: auto;
    padding: 2px;
    border-radius: var(--shape-radius-card);
    background: var(--surface-lift);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), var(--shape-lift);
  }
</style>

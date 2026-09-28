<script>
  import { Input, Key, Row, Tag } from "@vivalence/drapes";
  import { catalog } from "./picker.js";

  let { daemon, selected = [], onchange } = $props();

  let facets = $state([]);
  let expanded = $state(new Set());
  let filter = $state("");

  $effect(() => {
    if (!daemon) return;
    catalog(daemon).then((it) => (facets = it.facets));
  });

  let shown = $derived(
    !filter
      ? facets
      : facets
          .map((facet) => ({
            ...facet,
            values: facet.values.filter((value) =>
              `${facet.label} ${value.label}`.toLowerCase().includes(filter.toLowerCase()),
            ),
          }))
          .filter((facet) => facet.values.length),
  );

  const isOpen = (facet) => !!filter || expanded.has(facet.key);
  const chosen = (facet) => facet.values.filter((value) => selected.includes(value.slug)).length;

  function toggleCat(key) {
    const next = new Set(expanded);
    next.has(key) ? next.delete(key) : next.add(key);
    expanded = next;
  }

  function toggleValue(slug) {
    onchange?.(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);
  }
</script>

<div class="facets">
  <Input value={filter} placeholder="filter facets…" oninput={(event) => (filter = event.currentTarget.value)} />
  <div class="facets-list">
    {#each shown as facet (facet.key)}
      <div class="facet">
        <Row selected={isOpen(facet)} onclick={() => toggleCat(facet.key)}>
          <span class="facet-caret">{isOpen(facet) ? "▾" : "▸"}</span>
          <span class="facet-name">{facet.label}</span>
          {#if chosen(facet)}<Tag tone="primary">{chosen(facet)}</Tag>{/if}
        </Row>
        {#if isOpen(facet)}
          <div class="facet-values">
            {#each facet.values as value (value.slug)}
              <Key size="mini" latched={selected.includes(value.slug)} label={value.label} onclick={() => toggleValue(value.slug)} />
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <span class="facets-note">no facets</span>
    {/each}
  </div>
</div>

<style>
  .facets {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .facets-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 200px;
    overflow: auto;
  }
  .facet-caret {
    flex: none;
    width: 8px;
    color: var(--text-light);
  }
  .facet-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
  }
  .facet-values {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px 0 calc(6px + var(--size-depth)) 14px;
  }
  .facets-note {
    padding: 4px 0;
    color: var(--text-light);
  }
</style>

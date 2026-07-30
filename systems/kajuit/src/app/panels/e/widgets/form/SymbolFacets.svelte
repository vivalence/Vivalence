<script>
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
  <input
    class="filter"
    value={filter}
    placeholder="filter facets…"
    oninput={(event) => (filter = event.currentTarget.value)} />
  <div class="cats">
    {#each shown as facet (facet.key)}
      <div class="cat">
        <button class="head" class:open={isOpen(facet)} onclick={() => toggleCat(facet.key)}>
          <span class="chev">{isOpen(facet) ? "▾" : "▸"}</span>
          <span class="name">{facet.label}</span>
          {#if chosen(facet)}<span class="badge">{chosen(facet)}</span>{/if}
        </button>
        {#if isOpen(facet)}
          <div class="values">
            {#each facet.values as value (value.slug)}
              <button class="value" class:on={selected.includes(value.slug)} onclick={() => toggleValue(value.slug)}>
                {value.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <span class="muted">no facets</span>
    {/each}
  </div>
</div>

<style>
  .facets {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .filter {
    background: transparent;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    padding: 2px 5px;
  }
  .filter:focus {
    outline: none;
    border-color: var(--colors-skeleton-0-primary-base);
  }
  .cats {
    display: flex;
    flex-direction: column;
    max-height: 200px;
    overflow: auto;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 2px 2px;
    background: transparent;
    border: none;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-2-boundary) 40%, transparent);
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    text-align: left;
    cursor: pointer;
    opacity: 0.6;
  }
  .head:hover,
  .head.open {
    opacity: 1;
  }
  .chev {
    width: 8px;
    opacity: 0.6;
  }
  .name {
    flex: 1;
  }
  .badge {
    padding: 0 4px;
    border-radius: 6px;
    background: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-3-surface);
    font-size: var(--font-size-2xs);
  }
  .values {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    padding: 4px 0 6px 14px;
  }
  .value {
    padding: 1px 6px;
    background: transparent;
    border: 1px solid var(--colors-skeleton-2-boundary);
    border-radius: 2px;
    color: inherit;
    font: inherit;
    font-size: var(--font-size-2xs);
    cursor: pointer;
    opacity: 0.6;
  }
  .value:hover {
    opacity: 0.9;
  }
  .value.on {
    opacity: 1;
    border-color: var(--colors-skeleton-0-primary-base);
    color: var(--colors-skeleton-0-primary-base);
  }
  .muted {
    opacity: 0.35;
    font-size: var(--font-size-2xs);
    padding: 4px 0;
  }
</style>

<script>
  import { Section, Chip, skins, Canvas, stage, Json } from "@vivalence/drapes";
  const { Filter } = skins;

  stage.use(stage.tree, stage.tooltip, stage.renderer);

  const { terminal } = $props();
  const daemon = terminal.daemon;

  const NODE_COLOR = {
    string: "#87B56A",
    number: "#1EBCB5",
    bigint: "#1EBCB5",
    boolean: "#D4A054",
    branch: "#7E8DC8",
    empty: "#5b6b77",
  };

  function hierarchy(value, name) {
    if (value !== null && typeof value === "object") {
      const pairs = Array.isArray(value)
        ? value.map((item, index) => [String(index), item])
        : Object.entries(value);
      const label = Array.isArray(value) ? `${name} [${pairs.length}]` : name;
      return {
        name: label,
        itemStyle: { color: NODE_COLOR.branch, borderColor: NODE_COLOR.branch },
        children: pairs.map(([key, child]) => hierarchy(child, key)),
      };
    }
    const color = NODE_COLOR[typeof value] ?? NODE_COLOR.empty;
    return { name: `${name}: ${value}`, itemStyle: { color, borderColor: color } };
  }

  function treeOptions(root, layout, depth) {
    const orthogonal = layout !== "radial";
    return {
      tooltip: { trigger: "item", triggerOn: "mousemove", formatter: (params) => params.name },
      series: [{
        type: "tree",
        data: [root],
        layout: orthogonal ? "orthogonal" : "radial",
        orient: orthogonal ? "LR" : undefined,
        top: orthogonal ? "1%" : "10%",
        bottom: orthogonal ? "1%" : "10%",
        left: orthogonal ? "16%" : "10%",
        right: orthogonal ? "24%" : "10%",
        symbol: "circle",
        symbolSize: 6,
        roam: true,
        expandAndCollapse: true,
        initialTreeDepth: depth,
        label: orthogonal
          ? {
              position: "left",
              align: "right",
              verticalAlign: "middle",
              fontSize: 10,
              fontFamily: "monospace",
              color: "#dbe7ee",
              distance: 6,
            }
          : { fontSize: 9, fontFamily: "monospace", color: "#dbe7ee" },
        leaves: orthogonal ? { label: { position: "right", align: "left", distance: 6 } } : {},
        lineStyle: { color: "#3a4a58", width: 1, curveness: orthogonal ? 0.4 : 0.2 },
        emphasis: { focus: "descendant", lineStyle: { width: 1.5 } },
        animationDuration: 300,
        animationDurationUpdate: 300,
      }],
    };
  }

  function initGraph(container) {
    const chart = stage.chart(container);
    chart.setOption(treeOptions(hierarchy(detail, activeKey), graphLayout, graphExpanded ? 99 : 2));
    return { resize: () => chart.resize(), dispose: () => chart.dispose() };
  }

  const shortId = (id) => String(id).slice(0, 8);

  const field = (path) => {
    const keys = path.split(".");
    return (row) => keys.reduce((value, key) => (value == null ? value : value[key]), row);
  };

  const column = (label, get, width = 180) => ({ label, get, pill: false, width });
  const chip = (label, get, width = 130) => ({ label, get, pill: true, width });

  const IDENTIFY = {
    mode: (row) => row.slug,
    thread: (row) => row.phase ?? shortId(row.id),
    buffer: (row) => `${row.status ?? "?"}#${row.index ?? "?"}`,
  };
  const identify = (target, name) => (IDENTIFY[name] ?? ((row) => shortId(row.id)))(target);
  const relation = (name, width = 170) =>
    column(name, (row) => {
      const target = row[name];
      if (target == null) return null;
      return typeof target === "object" ? identify(target, name) : shortId(target);
    }, width);

  const ENTITIES = [
    {
      key: "literal",
      options: { orderBy: { rank: "asc" } },
      populate: [],
      columns: [
        column("slug", field("slug"), 230),
        chip("ontology", field("ontology"), 140),
        column("known", field("trait.TRANSLATED.known"), 260),
        column("learning", field("trait.TRANSLATED.learning"), 260),
        column("rank", field("rank"), 70),
        column("traits", field("traits"), 360),
        column("symbol", field("symbol"), 320),
      ],
    },
    {
      key: "symbol",
      options: { orderBy: { slug: "asc" } },
      populate: [],
      columns: [
        column("slug", field("slug"), 260),
        column("label", field("trait.LABELED.name"), 240),
        column("traits", field("traits"), 340),
      ],
    },
    {
      key: "mode",
      options: { orderBy: { type: "asc", slug: "asc" } },
      populate: [],
      columns: [
        chip("type", field("type"), 150),
        column("slug", field("slug"), 220),
        chip("installed", field("installed"), 100),
        column("traits", field("traits"), 520),
      ],
    },
    {
      key: "intent",
      options: {},
      populate: [],
      columns: [relation("mode", 220)],
    },
    {
      key: "thread",
      options: {},
      populate: ["mode"],
      columns: [
        chip("phase", field("phase"), 150),
        column("counter", field("counter"), 90),
        column("cursor", field("cursor"), 90),
        relation("mode"),
        column("traits", field("traits"), 260),
      ],
    },
    {
      key: "buffer",
      options: { orderBy: { index: "asc" } },
      populate: ["mode", "thread"],
      columns: [
        chip("status", field("status"), 140),
        column("index", field("index"), 70),
        relation("mode"),
        relation("thread"),
      ],
    },
    {
      key: "turn",
      options: {},
      populate: ["mode", "thread"],
      columns: [
        chip("role", field("role"), 120),
        column("parts", (row) => (row.parts ?? []).length, 80),
        relation("thread"),
        relation("mode"),
      ],
    },
  ];

  const PAGE_SIZES = [100, 250, 500, 1000];
  const ROW_HEIGHT = 28;
  const OVERSCAN = 8;
  const SORTABLE = new Set([
    "slug", "rank", "ontology", "type", "installed",
    "status", "index", "phase", "counter", "cursor", "role",
  ]);

  let activeKey = $state("literal");
  let request = $state({ status: "loading", rows: [], total: 0 });
  let query = $state("");
  let selected = $state(null);
  let detailView = $state("fields");
  let openFields = $state(new Set());
  let graphLayout = $state("LR");
  let graphExpanded = $state(false);
  let limit = $state(250);
  let offset = $state(0);
  let sortKey = $state("rank");
  let sortDir = $state("asc");

  let scrollEl = $state(null);
  let scrollTop = $state(0);
  let viewportHeight = $state(600);

  function applyDefaultSort(entityKey) {
    const order = ENTITIES.find((entity) => entity.key === entityKey)?.options.orderBy;
    const first = order ? Object.keys(order)[0] : null;
    sortKey = first;
    sortDir = first ? order[first] : "asc";
  }

  function sortBy(label) {
    if (!SORTABLE.has(label)) return;
    if (sortKey === label) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortKey = label;
      sortDir = "asc";
    }
    offset = 0;
  }

  function pickEntity(key) {
    activeKey = key;
    offset = 0;
    query = "";
    applyDefaultSort(key);
  }

  function setLimit(next) {
    limit = next;
    offset = 0;
  }

  function page(direction) {
    offset = Math.max(0, offset + direction * limit);
  }

  function select(row) {
    if (selected?.id === row.id) {
      selected = null;
      return;
    }
    selected = row;
    openFields = new Set();
    detailView = "fields";
    console.log(`[dataspace] ${activeKey}`, {
      entity: row,
      ownKeys: Object.keys(row),
      readable: [...readableKeys(row)],
      plain: plain(row),
    });
  }

  function toggleField(name) {
    const next = new Set(openFields);
    next.has(name) ? next.delete(name) : next.add(name);
    openFields = next;
  }

  function scalarText(value) {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  }

  const isStore = (value) =>
    value && typeof value === "object" &&
    typeof value.subscribe === "function" && typeof value.get === "function";

  const isEntityRef = (value) =>
    value && typeof value === "object" && !Array.isArray(value) &&
    !(value instanceof Date) && value.constructor !== Object && "id" in value;

  const reference = (value) => (value.slug ? { id: value.id, slug: value.slug } : { id: value.id });

  function readableKeys(object) {
    const keys = new Set();
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(object))) {
      if (key === "constructor") continue;
      if (typeof descriptor.value === "function") continue;
      keys.add(key);
    }
    let proto = Object.getPrototypeOf(object);
    while (proto && proto !== Object.prototype) {
      for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
        if (descriptor.get) keys.add(key);
      }
      proto = Object.getPrototypeOf(proto);
    }
    return keys;
  }

  function plain(value, seen = new WeakSet(), depth = 0) {
    if (value === null || value === undefined) return value;
    if (value instanceof Date) return value.toISOString();
    const type = typeof value;
    if (type === "function" || isStore(value)) return undefined;
    if (type !== "object") return value;
    if (value instanceof Set || value instanceof Map) return undefined;
    if (seen.has(value)) return "[circular]";
    if (depth > 24) return undefined;
    seen.add(value);
    if (Array.isArray(value)) {
      const mapped = value.map((item) => (isEntityRef(item) ? reference(item) : plain(item, seen, depth + 1)));
      seen.delete(value);
      return mapped;
    }
    const out = {};
    for (const key of readableKeys(value)) {
      if (key.startsWith("$")) continue;
      let raw;
      try {
        raw = value[key];
      } catch {
        continue;
      }
      if (typeof raw === "function" || isStore(raw)) continue;
      if (isEntityRef(raw)) {
        out[key] = reference(raw);
        continue;
      }
      const rendered = plain(raw, seen, depth + 1);
      if (rendered !== undefined) out[key] = rendered;
    }
    seen.delete(value);
    return out;
  }

  const active = $derived(ENTITIES.find((entity) => entity.key === activeKey));

  const indexed = $derived(
    request.rows.map((row) => ({ row, hay: JSON.stringify(row).toLowerCase() })),
  );
  const shown = $derived.by(() => {
    if (query.length === 0) return request.rows;
    const needle = query.toLowerCase();
    return indexed.filter((entry) => entry.hay.includes(needle)).map((entry) => entry.row);
  });

  const rowCount = $derived(shown.length);
  const visibleCount = $derived(Math.ceil(viewportHeight / ROW_HEIGHT));
  const maxStart = $derived(Math.max(0, rowCount - visibleCount));
  const startIndex = $derived(
    Math.min(maxStart, Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)),
  );
  const endIndex = $derived(Math.min(rowCount, startIndex + visibleCount + OVERSCAN * 2));
  const windowed = $derived(shown.slice(startIndex, endIndex));
  const padTop = $derived(startIndex * ROW_HEIGHT);
  const padBottom = $derived(Math.max(0, (rowCount - endIndex) * ROW_HEIGHT));
  const lastPage = $derived(offset + limit >= request.total);
  const template = $derived(active.columns.map((column) => `${column.width}px`).join(" "));
  const gridWidth = $derived(active.columns.reduce((sum, column) => sum + column.width, 0));
  const detail = $derived(selected ? plain(selected) : null);

  function leaves(value) {
    const parts = [];
    const walk = (node) => {
      for (const [key, inner] of Object.entries(node)) {
        if (inner !== null && typeof inner === "object") walk(inner);
        else parts.push(`${key}=${inner}`);
      }
    };
    walk(value);
    return parts.join("  ");
  }

  function tooltip(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  }

  $effect(() => {
    const key = active.key;
    const pageLimit = limit;
    const pageOffset = offset;
    selected = null;
    scrollTop = 0;
    if (scrollEl) scrollEl.scrollTop = 0;
    request = { status: "loading", rows: [], total: 0 };
    daemon.entities[key]
      .findAndCount({}, {
        populate: active.populate,
        orderBy: sortKey ? { [sortKey]: sortDir } : undefined,
        limit: pageLimit,
        offset: pageOffset,
      })
      .then(([rows, total]) => activeKey === key && (request = { status: "ready", rows, total }))
      .catch((error) =>
        activeKey === key &&
        (request = { status: "error", message: String(error?.message ?? error), rows: [], total: 0 }),
      );
  });
</script>

{#snippet valueCell(value, isPill)}
  {#if value === null || value === undefined || value === ""}
    <span class="muted">—</span>
  {:else if Array.isArray(value)}
    {#if value.length === 0}
      <span class="muted">—</span>
    {:else}
      <span class="pills">{#each value as item}<span class="pill">{item}</span>{/each}</span>
    {/if}
  {:else if typeof value === "object"}
    <span class="leaves">{leaves(value)}</span>
  {:else if isPill}
    <span class="pill solo">{value}</span>
  {:else}
    <span class="text">{value}</span>
  {/if}
{/snippet}

{#snippet fieldRow(name, value)}
  {#if value !== null && typeof value === "object"}
    <div class="field">
      <button class="field-head" type="button" onclick={() => toggleField(name)}>
        <span class="field-arrow" class:open={openFields.has(name)}>▸</span>
        <span class="field-name">{name}</span>
        <span class="field-kind">
          {Array.isArray(value) ? `[ ${value.length} ]` : `{ ${Object.keys(value).length} }`}
        </span>
      </button>
      {#if openFields.has(name)}
        <div class="field-json"><Json {value} /></div>
      {/if}
    </div>
  {:else}
    <div class="field scalar">
      <span class="field-name">{name}</span>
      <span class="field-value">{scalarText(value)}</span>
    </div>
  {/if}
{/snippet}

<div class="dataspace">
  <div class="tabs">
    {#each ENTITIES as entity}
      <Chip
        label={entity.key}
        active={entity.key === activeKey}
        onclick={() => pickEntity(entity.key)}
      />
    {/each}
  </div>

  <div class="body">
    <div class="toolbar">
      <Section label={activeKey} count={request.total} rule={false} />
      <div class="toolbar-right">
        <Filter bind:query />
        <div class="pager">
          <div class="page-sizes">
            {#each PAGE_SIZES as size}
              <button class="page-size" class:on={limit === size} onclick={() => setLimit(size)}>{size}</button>
            {/each}
          </div>
          <button class="page-nav" disabled={offset === 0} onclick={() => page(-1)}>‹</button>
          <span class="page-info">
            {request.total === 0 ? 0 : offset + 1}–{Math.min(offset + limit, request.total)} / {request.total}
          </span>
          <button class="page-nav" disabled={lastPage} onclick={() => page(1)}>›</button>
        </div>
      </div>
    </div>

    <div
      class="table-scroll"
      bind:this={scrollEl}
      bind:clientHeight={viewportHeight}
      onscroll={() => (scrollTop = scrollEl.scrollTop)}
    >
      {#if request.status === "loading"}
        <div class="notice">loading…</div>
      {:else if request.status === "error"}
        <div class="notice error">{request.message}</div>
      {:else if shown.length === 0}
        <div class="notice">no rows</div>
      {:else}
        <div class="grid" style="width: {gridWidth}px">
          <div class="grid-head" style="grid-template-columns: {template}">
            {#each active.columns as heading}
              <div
                class="grid-hcell"
                class:sortable={SORTABLE.has(heading.label)}
                onclick={() => sortBy(heading.label)}
              >
                <span class="hcell-label">{heading.label}</span>
                {#if SORTABLE.has(heading.label)}
                  <span
                    class="chevron"
                    class:active={sortKey === heading.label}
                    class:desc={sortKey === heading.label && sortDir === "desc"}
                  >▾</span>
                {/if}
              </div>
            {/each}
          </div>
          {#if padTop > 0}
            <div class="grid-spacer" style="height: {padTop}px"></div>
          {/if}
          {#each windowed as row (row.id)}
            <div
              class="grid-row"
              class:selected={selected?.id === row.id}
              style="grid-template-columns: {template}"
              onclick={() => select(row)}
            >
              {#each active.columns as datum}
                {@const value = datum.get(row)}
                <div class="grid-cell" title={tooltip(value)}>{@render valueCell(value, datum.pill)}</div>
              {/each}
            </div>
          {/each}
          {#if padBottom > 0}
            <div class="grid-spacer" style="height: {padBottom}px"></div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  {#if selected}
    <div class="detail">
      <div class="detail-head">
        <span class="detail-title">{activeKey} · {selected.slug ?? shortId(selected.id)}</span>
        <div class="detail-views">
          {#each ["fields", "graph"] as mode}
            <button class="detail-view" class:on={detailView === mode} onclick={() => (detailView = mode)}>
              {mode}
            </button>
          {/each}
        </div>
        <button class="detail-close" onclick={() => (selected = null)}>×</button>
      </div>
      <div class="detail-body">
        {#if detailView === "fields"}
          <div class="detail-fields">
            {#each Object.entries(detail) as [name, value] (name)}
              {@render fieldRow(name, value)}
            {/each}
          </div>
        {:else}
          <div class="graph-view">
            <div class="graph-bar">
              <div class="graph-layouts">
                {#each ["LR", "radial"] as layout}
                  <button class="graph-btn" class:on={graphLayout === layout} onclick={() => (graphLayout = layout)}>
                    {layout}
                  </button>
                {/each}
              </div>
              <button class="graph-btn" class:on={graphExpanded} onclick={() => (graphExpanded = !graphExpanded)}>
                expand all
              </button>
            </div>
            <div class="graph-canvas">
              {#key `${selected.id}:${graphLayout}:${graphExpanded}`}
                <Canvas init={initGraph} />
              {/key}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .dataspace {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    position: relative;
    overflow: hidden;
  }
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 0.5rem 1rem;
    flex-shrink: 0;
  }
  .body {
    flex: 1;
    min-height: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 0 1rem 1rem;
  }
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    padding: 0.25rem 0 0.5rem;
    flex-shrink: 0;
  }
  .toolbar-right {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .pager {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .page-sizes {
    display: flex;
    gap: 2px;
  }
  .page-size {
    border: none;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .page-size:hover {
    color: var(--colors-skeleton-1-contrast);
  }
  .page-size.on {
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-1-surface);
  }
  .page-nav {
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 40%, transparent);
    background: transparent;
    color: var(--colors-skeleton-1-contrast);
    font-size: var(--font-size-sm);
    line-height: 1;
    cursor: pointer;
    padding: 2px 9px;
    border-radius: 3px;
  }
  .page-nav:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .page-nav:not(:disabled):hover {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
  }
  .page-info {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--colors-skeleton-1-boundary);
    white-space: nowrap;
    min-width: 96px;
    text-align: center;
  }
  .table-scroll {
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: auto;
    contain: layout paint;
  }
  .notice {
    padding: 1rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
  .notice.error {
    color: var(--colors-skeleton-0-danger-base);
    white-space: pre-wrap;
  }
  .grid {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
  }
  .grid-head {
    display: grid;
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--colors-skeleton-app-surface);
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
  }
  .grid-hcell {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    color: var(--colors-skeleton-1-boundary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: var(--font-size-2xs);
  }
  .hcell-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .grid-hcell.sortable {
    cursor: pointer;
  }
  .grid-hcell.sortable:hover {
    color: var(--colors-skeleton-1-contrast);
  }
  .chevron {
    flex-shrink: 0;
    font-size: 0.85em;
    opacity: 0.25;
    transition: transform 0.1s;
  }
  .grid-hcell.sortable:hover .chevron {
    opacity: 0.5;
  }
  .chevron.active {
    opacity: 1;
    color: var(--colors-theme-primary-contrast);
  }
  .chevron.desc {
    transform: rotate(180deg);
  }
  .grid-spacer {
    width: 100%;
  }
  .grid-row {
    display: grid;
    align-items: center;
    height: 28px;
    cursor: pointer;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 22%, transparent);
  }
  .grid-row:hover {
    background: var(--colors-skeleton-1-surface);
  }
  .grid-row.selected {
    background: color-mix(in srgb, var(--colors-theme-primary-contrast) 18%, transparent);
  }
  .grid-cell {
    min-width: 0;
    padding: 4px 12px;
    color: var(--colors-skeleton-1-contrast);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .grid-row .grid-cell:first-child {
    color: var(--colors-skeleton-0-primary-base);
    font-weight: 600;
  }
  .pills {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 3px;
    max-width: 100%;
  }
  .pill {
    padding: 0 6px;
    border-radius: 3px;
    background: var(--colors-skeleton-1-surface);
    border: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 40%, transparent);
    color: var(--colors-skeleton-1-boundary);
    font-size: var(--font-size-2xs);
    line-height: 1.7;
    letter-spacing: 0.03em;
    white-space: nowrap;
  }
  .pill.solo {
    color: var(--colors-skeleton-0-primary-base);
    border-color: color-mix(in srgb, var(--colors-skeleton-0-primary-base) 35%, transparent);
  }
  .leaves,
  .text {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }
  .leaves {
    color: var(--colors-skeleton-1-boundary);
    font-size: var(--font-size-2xs);
  }
  .muted {
    color: color-mix(in srgb, var(--colors-skeleton-1-boundary) 55%, transparent);
  }
  .detail {
    position: absolute;
    right: 0.75rem;
    top: 3rem;
    bottom: 0.75rem;
    width: 460px;
    max-width: calc(100% - 1.5rem);
    display: flex;
    flex-direction: column;
    background: color-mix(in srgb, var(--colors-skeleton-app-surface) 96%, transparent);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.5rem;
    backdrop-filter: blur(8px);
    overflow: hidden;
  }
  .detail-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
  }
  .detail-title {
    flex: 1;
    min-width: 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-0-primary-base);
    letter-spacing: 0.03em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .detail-views {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }
  .detail-view {
    border: none;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 3px;
  }
  .detail-view:hover {
    color: var(--colors-skeleton-1-contrast);
  }
  .detail-view.on {
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-1-surface);
  }
  .detail-close {
    border: none;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-size: var(--font-size-base);
    cursor: pointer;
    line-height: 1;
    flex-shrink: 0;
    padding: 0;
  }
  .detail-body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .graph-view {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .graph-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.35rem 0.6rem;
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 25%, transparent);
    flex-shrink: 0;
  }
  .graph-layouts {
    display: flex;
    gap: 2px;
  }
  .graph-btn {
    border: none;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
  }
  .graph-btn:hover {
    color: var(--colors-skeleton-1-contrast);
  }
  .graph-btn.on {
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-1-surface);
  }
  .graph-canvas {
    flex: 1;
    min-height: 0;
  }
  .detail-fields {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 0.4rem 0.5rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
  }
  .field {
    border-bottom: 1px solid color-mix(in srgb, var(--colors-skeleton-1-boundary) 15%, transparent);
  }
  .field.scalar {
    display: flex;
    gap: 0.75rem;
    align-items: baseline;
    padding: 3px 6px;
  }
  .field-name {
    color: var(--colors-skeleton-1-contrast);
  }
  .field.scalar .field-name {
    min-width: 96px;
    flex-shrink: 0;
    color: var(--colors-skeleton-1-boundary);
  }
  .field-value {
    color: var(--colors-skeleton-1-contrast);
    overflow-wrap: anywhere;
  }
  .field-head {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 3px 6px;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    text-align: left;
  }
  .field-head:hover {
    background: color-mix(in srgb, var(--colors-skeleton-1-surface) 50%, transparent);
  }
  .field-arrow {
    display: inline-block;
    width: 9px;
    flex-shrink: 0;
    opacity: 0.55;
    transition: transform 0.1s;
  }
  .field-arrow.open {
    transform: rotate(90deg);
  }
  .field-kind {
    margin-left: auto;
    color: var(--colors-skeleton-1-boundary);
    opacity: 0.7;
  }
  .field-json {
    padding: 2px 0 6px 12px;
  }
</style>

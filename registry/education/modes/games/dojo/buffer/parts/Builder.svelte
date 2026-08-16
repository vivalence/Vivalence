<script>
  import * as types from "../../types.js";
  import { label as pickLabel } from "../../set/describe.js";
  import Segment from "./Segment.svelte";
  import Stepper from "./Stepper.svelte";

  const {
    narrow = false,
    editing = null,
    traits = [],
    symbols,
    resolve,
    count,
    onclause,
    oncancel,
    onremove,
    split = null,
    onsplit = null,
  } = $props();

  const RESULTS_MIN = 96;
  const FORM_MIN = 120;
  let builderHeight = $state(0);
  let resultsElement = $state(null);
  let splitting = null;

  function grabSplit(event) {
    if (!onsplit) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    splitting = { from: event.clientY, base: split ?? resultsHeight() };
  }
  function resultsHeight() {
    return resultsElement?.getBoundingClientRect().height ?? RESULTS_MIN;
  }
  function dragSplit(event) {
    if (!splitting) return;
    const delta = splitting.from - event.clientY;
    const max = Math.max(RESULTS_MIN, builderHeight - FORM_MIN);
    onsplit(Math.round(Math.max(RESULTS_MIN, Math.min(max, splitting.base + delta))), false);
  }
  function releaseSplit() {
    if (!splitting) return;
    splitting = null;
    onsplit(split, true);
  }

  const SYMBOL_LIMIT = 24;
  const LITERAL_LIMIT = 20;
  const VIEW = 50;
  const CAP_DEFAULT = 10;
  const DEBOUNCE = 200;
  const KINDS = [
    { id: null, label: "any" },
    { id: "ONTOLOGICAL", label: "ontological" },
    { id: "STRUCTURAL", label: "structural" },
    { id: "TOPOGRAPHICAL", label: "topographical" },
    { id: "trait", label: "traits" },
  ];
  const KIND_DOT = {
    ONTOLOGICAL: "var(--colors-theme-primary-contrast)",
    STRUCTURAL: "var(--colors-system-warning-contrast)",
    TOPOGRAPHICAL: "var(--colors-theme-secondary-contrast)",
    trait: "var(--colors-system-success-contrast)",
  };
  const BINS = [
    { id: "all", glyph: "∧", title: "must have all of", operator: "symbols.$all · traits.$contains", tone: "primary" },
    { id: "any", glyph: "∨", title: "any one of", operator: "symbols.$in · traits.$overlap", tone: "secondary" },
    { id: "none", glyph: "∅", title: "never", operator: "symbols.$none · traits.$none", tone: "danger" },
  ];
  const PICKS = ["all", "feed", "due", "novel", "byStrength", "byLastSignal", "sample"];
  const PICK_NOTE = {
    all: "everything that matched, in course order",
    feed: "due, topped up with novel",
    due: "scheduled for review now",
    novel: "never studied, course order",
    byStrength: "weakest retention first",
    byLastSignal: "last review signal among the lit ones",
    sample: "random — optionally only these statuses",
  };
  const STATUS_TONE = {
    UNTOUCHED: "var(--colors-skeleton-2-boundary)",
    UNKNOWN: "var(--colors-system-error-contrast)",
    LEARNING: "var(--colors-system-warning-contrast)",
    KNOWN: "var(--colors-system-success-contrast)",
    GRADUATED: "var(--colors-theme-primary-contrast)",
  };

  const blank = () => ({
    pick: "all",
    bins: { all: [], any: [], none: [] },
    signals: [...types.MISSED],
    status: [],
    limit: CAP_DEFAULT,
    rank: { $gte: null, $lte: null },
    search: "",
  });

  let tab = $state("symbol");
  let draft = $state(blank());
  let aimed = $state("all");
  let symQ = $state("");
  let kind = $state(null);
  let found = $state.raw([]);
  let rows = $state.raw([]);
  let filterCount = $state(null);
  let binCounts = $state.raw({});
  let resolving = $state(false);
  let litQ = $state("");
  let litRows = $state.raw([]);
  let pinned = $state.raw([]);
  let view = $state(VIEW);
  let dragged = null;
  let over = $state(null);

  const bySymbol = $derived(tab === "symbol");
  const placed = $derived(new Set(Object.values(draft.bins).flat().map((entry) => entry.key)));

  const bucket = (bin, kindOf) => draft.bins[bin].filter((entry) => entry.kind === kindOf).map((entry) => entry.key);

  const compact = (spec) => {
    const out = {};
    for (const [key, value] of Object.entries(spec)) if (value?.length) out[key] = value;
    return Object.keys(out).length ? out : undefined;
  };

  const whereOf = (bins) => {
    const at = (bin, kindOf) => bins[bin].filter((entry) => entry.kind === kindOf).map((entry) => entry.key);
    const where = {
      symbols: compact({ $all: at("all", "symbol"), $in: at("any", "symbol"), $none: at("none", "symbol") }),
      traits: compact({ $contains: at("all", "trait"), $overlap: at("any", "trait"), $none: at("none", "trait") }),
      search: draft.search.trim() || undefined,
      rank: draft.rank.$gte || draft.rank.$lte ? { ...(draft.rank.$gte ? { $gte: draft.rank.$gte } : {}), ...(draft.rank.$lte ? { $lte: draft.rank.$lte } : {}) } : undefined,
    };
    for (const key of Object.keys(where)) if (where[key] === undefined) delete where[key];
    return where;
  };

  const clause = $derived.by(() => {
    const where = whereOf(draft.bins);
    return {
      pick: draft.pick,
      ...(Object.keys(where).length ? { where } : {}),
      ...(draft.limit ? { limit: draft.limit } : {}),
      ...(draft.pick === "byLastSignal" ? { signals: [...draft.signals] } : {}),
      ...(draft.pick === "sample" && draft.status.length ? { status: [...draft.status] } : {}),
    };
  });

  const ruleLabel = $derived.by(() => {
    const parts = [];
    const names = (bin) => draft.bins[bin].map((entry) => (entry.kind === "trait" ? entry.key.toLowerCase() : entry.key));
    if (draft.bins.all.length) parts.push(names("all").join(" ∧ "));
    if (draft.bins.any.length) parts.push("(" + names("any").join(" ∨ ") + ")");
    if (draft.bins.none.length) parts.push("∅ " + names("none").join(" ∅ "));
    return parts.length ? parts.join(" · ") : "everything";
  });

  const chips = $derived.by(() => {
    const needle = symQ.trim().toLowerCase();
    const wantTraits = kind === "trait" || (kind == null && needle.length > 0);
    const traitChips = wantTraits
      ? traits
          .filter((trait) => !placed.has(trait.name))
          .filter((trait) => !needle || trait.name.toLowerCase().includes(needle))
          .map((trait) => ({ kind: "trait", key: trait.name, label: trait.name.toLowerCase(), count: trait.literals, title: `trait · ${trait.name.toLowerCase()}`, dot: KIND_DOT.trait }))
      : [];
    const symbolChips =
      kind === "trait"
        ? []
        : found
            .filter((symbol) => symbol.literals > 0 && !placed.has(symbol.slug))
            .map((symbol) => ({
              kind: "symbol",
              key: symbol.slug,
              label: symbol.slug,
              count: symbol.literals,
              title: `${(symbol.traits?.[0] ?? "symbol").toLowerCase()}${symbol.name ? " · " + symbol.name : ""}`,
              dot: KIND_DOT[symbol.traits?.[0]] ?? "var(--text-support)",
            }));
    return [...symbolChips, ...traitChips];
  });

  const aimedTitle = $derived(BINS.find((bin) => bin.id === aimed)?.title ?? "must have all of");

  function place(entry, bin) {
    const bins = {
      all: draft.bins.all.filter((member) => member.key !== entry.key),
      any: draft.bins.any.filter((member) => member.key !== entry.key),
      none: draft.bins.none.filter((member) => member.key !== entry.key),
    };
    if (bin) bins[bin] = [...bins[bin], { kind: entry.kind, key: entry.key }];
    draft.bins = bins;
    symQ = "";
    over = null;
  }

  function reset() {
    draft = blank();
    pinned = [];
    aimed = "all";
  }

  function load(entry) {
    if (!entry) return;
    const source = entry.clause;
    if (source.pick === "literals") {
      tab = "literal";
      pinned = entry.rows ?? [];
      draft = blank();
      return;
    }
    tab = "symbol";
    const where = source.where ?? {};
    const symbolSpec = Array.isArray(where.symbols) ? { $all: where.symbols } : (where.symbols ?? {});
    const traitSpec = Array.isArray(where.traits) ? { $contains: where.traits } : (where.traits ?? {});
    const entries = (list, kindOf) => (list ?? []).map((key) => ({ kind: kindOf, key }));
    draft = {
      pick: source.pick,
      bins: {
        all: [...entries(symbolSpec.$all, "symbol"), ...entries(traitSpec.$contains, "trait")],
        any: [...entries(symbolSpec.$in, "symbol"), ...entries(traitSpec.$overlap, "trait")],
        none: [...entries(symbolSpec.$none, "symbol"), ...entries(traitSpec.$none, "trait")],
      },
      signals: source.signals?.length ? [...source.signals] : [...types.MISSED],
      status: source.status ? [...source.status] : [],
      limit: source.limit ?? null,
      rank: { $gte: where.rank?.$gte ?? null, $lte: where.rank?.$lte ?? null },
      search: where.search ?? "",
    };
  }

  $effect(() => {
    load(editing);
  });

  let symbolTimer = null;
  $effect(() => {
    const search = symQ.trim();
    const traitsWanted = kind && kind !== "trait" ? [kind] : undefined;
    if (kind === "trait") {
      found = [];
      return;
    }
    clearTimeout(symbolTimer);
    symbolTimer = setTimeout(async () => {
      try {
        found = (await symbols({ search: search || undefined, traits: traitsWanted, limit: SYMBOL_LIMIT })) ?? [];
      } catch (error) {
        console.warn("[dojo] /symbols failed", error);
      }
    }, DEBOUNCE);
    return () => clearTimeout(symbolTimer);
  });

  let ticket = 0;
  let previewTimer = null;
  $effect(() => {
    if (!bySymbol) return;
    const wanted = JSON.parse(JSON.stringify(clause));
    const bins = JSON.parse(JSON.stringify(draft.bins));
    clearTimeout(previewTimer);
    const mine = ++ticket;
    resolving = true;
    previewTimer = setTimeout(async () => {
      try {
        const variants = BINS.filter((bin) => bins[bin.id].length).map((bin) => ({ ...bins, [bin.id]: [] }));
        const [preview, counted] = await Promise.all([
          resolve([wanted]),
          count([whereOf(bins), ...variants.map((variant) => whereOf(variant))]),
        ]);
        if (mine !== ticket) return;
        const entry = preview?.clauses?.[0];
        rows = [...(entry?.literals ?? []), ...(entry?.knowables ?? [])];
        filterCount = counted?.counts?.[0] ?? null;
        const nextBinCounts = {};
        BINS.filter((bin) => bins[bin.id].length).forEach((bin, index) => {
          nextBinCounts[bin.id] = { with: counted?.counts?.[0], without: counted?.counts?.[index + 1] };
        });
        binCounts = nextBinCounts;
      } catch (error) {
        console.warn("[dojo] preview failed", error);
        if (mine === ticket) rows = [];
      } finally {
        if (mine === ticket) resolving = false;
      }
    }, DEBOUNCE);
    return () => clearTimeout(previewTimer);
  });

  let literalTimer = null;
  $effect(() => {
    if (bySymbol) return;
    const needle = litQ.trim();
    clearTimeout(literalTimer);
    literalTimer = setTimeout(async () => {
      try {
        const out = await resolve([
          needle ? { pick: "all", where: { search: needle }, limit: LITERAL_LIMIT } : { pick: "feed", limit: LITERAL_LIMIT },
        ]);
        litRows = out?.clauses?.[0]?.literals ?? [];
      } catch (error) {
        console.warn("[dojo] literal search failed", error);
      }
    }, DEBOUNCE);
    return () => clearTimeout(literalTimer);
  });

  const pinnedIds = $derived(new Set(pinned.map((row) => row.literal)));

  function togglePin(row) {
    pinned = pinnedIds.has(row.literal) ? pinned.filter((entry) => entry.literal !== row.literal) : [...pinned, row];
  }

  const matched = $derived(bySymbol ? rows : litRows);
  const shown = $derived(matched.slice(0, view));
  const addable = $derived(bySymbol ? rows.length > 0 : pinned.length > 0);
  const addLabel = $derived(editing ? "update clause" : bySymbol ? "add clause" : `pin ${pinned.length}`);

  function add() {
    if (!addable) return;
    const built = bySymbol ? clause : { pick: "literals", literals: pinned.map((row) => row.literal) };
    onclause(JSON.parse(JSON.stringify(built)), editing?.index ?? null);
    reset();
  }

  function cancel() {
    reset();
    oncancel?.();
  }

  const statusLabel = (row) => (row.status ? (row.status === "UNTOUCHED" ? "new" : row.status.toLowerCase()) : row.ontology === "conjugation" ? "form" : "");

  const capValue = $derived(draft.limit ?? types.CAP);
  const setCap = (next) => (draft.limit = Math.max(1, Math.min(types.CAP, next)));
  const numeric = (event) => {
    const value = parseInt(String(event.target.value).replace(/[^0-9]/g, ""), 10);
    return isNaN(value) ? null : value;
  };

  const toggle = (list, value) => (list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]);
</script>

<div class="builder" bind:clientHeight={builderHeight}>
  <div class="tabs">
    <Segment label="by symbol" on={bySymbol} onclick={() => (tab = "symbol")} />
    <Segment label="by literal" on={!bySymbol} onclick={() => (tab = "literal")} />
    <span class="note">{bySymbol ? "a rule that keeps resolving" : "exact things, frozen in the set"}</span>
    {#if editing}
      <span class="editing">
        <span>editing {editing.clause.pick === "literals" ? "pinned clause" : `clause ${editing.index + 1}`}</span>
        <button class="ghost" onclick={cancel}>cancel</button>
        <button class="ghost danger" onclick={() => onremove(editing.index)}>remove</button>
      </span>
    {/if}
  </div>

  <div class="form">
    {#if bySymbol}
      <section class="block">
        <div class="head">
          <span class="num">01</span>
          <span class="title">symbols</span>
          <span class="hint">{narrow ? "tap" : "click"} to drop into {aimedTitle}{narrow ? "" : " — or drag onto a bin"}</span>
        </div>
        <input
          class="field"
          value={symQ}
          oninput={(event) => (symQ = event.target.value)}
          onkeydown={(event) => {
            if (event.key === "Enter" && chips[0]) place(chips[0], aimed);
          }}
          placeholder="find a symbol or trait — cibo, present, unit 3, verb, vocalized…" />
        <div class="kinds">
          {#each KINDS as entry (entry.label)}
            <button class="kind" class:on={kind === entry.id} onclick={() => (kind = entry.id)}>{entry.label}</button>
          {/each}
        </div>
        <div class="chips">
          {#each chips as chip (chip.kind + chip.key)}
            <button
              class="chip"
              draggable="true"
              title="{chip.title} — adds to {aimedTitle}"
              ondragstart={() => (dragged = chip)}
              ondragend={() => {
                dragged = null;
                over = null;
              }}
              onclick={() => place(chip, aimed)}>
              <span class="dot" style:background={chip.dot}></span>
              <span>{chip.label}</span>
              <span class="count">{chip.count}</span>
            </button>
          {/each}
          {#if !chips.length}<span class="hint">no symbol matches that.</span>{/if}
        </div>
      </section>

      <section class="block">
        <div class="head">
          <span class="num">02</span>
          <span class="title">the rule</span>
          <span class="hint">{narrow ? "tap" : "click"} a bin to aim it</span>
        </div>
        <div class="bins">
          {#each BINS as bin (bin.id)}
            {@const list = draft.bins[bin.id]}
            {@const counted = binCounts[bin.id]}
            <div
              class="bin"
              class:aimed={aimed === bin.id}
              class:over={over === bin.id}
              data-tone={bin.tone}
              role="group"
              onclick={() => (aimed = bin.id)}
              ondragover={(event) => {
                event.preventDefault();
                over = bin.id;
              }}
              ondragleave={() => {
                if (over === bin.id) over = null;
              }}
              ondrop={(event) => {
                event.preventDefault();
                if (dragged) place(dragged, bin.id);
                dragged = null;
              }}>
              <div class="bin-head">
                <span class="glyph">{bin.glyph}</span>
                <span class="bin-title" class:lit={aimed === bin.id || list.length}>{bin.title}</span>
                <span class="operator">{bin.operator}</span>
                <span class="state" class:aim={!list.length && aimed === bin.id}>
                  {#if list.length && counted}{counted.with} of {counted.without}{:else if aimed === bin.id && !list.length}aimed{/if}
                </span>
              </div>
              <div class="bin-chips">
                {#each list as entry (entry.key)}
                  <span
                    class="placed"
                    draggable="true"
                    role="button"
                    tabindex="-1"
                    ondragstart={() => (dragged = entry)}
                    ondragend={() => {
                      dragged = null;
                      over = null;
                    }}>
                    <span class="placed-key">{entry.kind === "trait" ? entry.key.toLowerCase() : entry.key}</span>
                    <button class="x" onclick={(event) => {
                      event.stopPropagation();
                      place(entry, null);
                    }}>×</button>
                  </span>
                {/each}
                {#if !list.length}
                  <span class="hint" class:lit={aimed === bin.id}>{aimed === bin.id ? "taps land here" : "drop a symbol here"}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </section>

      <section class="block row">
        <span class="num">03</span>
        <span class="title">take</span>
        {#each PICKS as pick (pick)}
          <Segment label={pickLabel(pick)} on={draft.pick === pick} title={PICK_NOTE[pick]} onclick={() => (draft.pick = pick)} />
        {/each}
        {#if draft.pick === "byLastSignal"}
          <span class="sub">
            {#each types.SIGNALS as signal (signal)}
              <Segment label={signal.toLowerCase()} tone="warning" on={draft.signals.includes(signal)} onclick={() => (draft.signals = toggle(draft.signals, signal))} />
            {/each}
          </span>
        {/if}
        {#if draft.pick === "sample"}
          <span class="sub">
            {#each types.STATUSES as status (status)}
              <Segment label={status.toLowerCase()} tone="warning" on={draft.status.includes(status)} onclick={() => (draft.status = toggle(draft.status, status))} />
            {/each}
          </span>
        {/if}
        <span class="sep"></span>
        <span class="cap">
          <span class="title">cap</span>
          <Stepper value={capValue} min={1} max={types.CAP} title="how many this clause pulls into the set — max {types.CAP} (shift ±10)" onchange={setCap} />
          <span class="hint">pulls {capValue} into the set</span>
        </span>
      </section>

      <section class="block row">
        <span class="num">04</span>
        <span class="title">window</span>
        <span class="range">
          <span class="key">rank ≥</span>
          <input class="mini" value={draft.rank.$gte ?? ""} onchange={(event) => (draft.rank = { ...draft.rank, $gte: numeric(event) })} placeholder="—" />
          <span class="key">≤</span>
          <input class="mini" value={draft.rank.$lte ?? ""} onchange={(event) => (draft.rank = { ...draft.rank, $lte: numeric(event) })} placeholder="—" />
        </span>
        <span class="sep"></span>
        <span class="range grow">
          <span class="key">text contains</span>
          <input class="mini wide" value={draft.search} oninput={(event) => (draft.search = event.target.value)} placeholder="slug or either translation…" />
        </span>
      </section>
    {:else}
      <section class="block">
        <input
          class="field"
          value={litQ}
          oninput={(event) => (litQ = event.target.value)}
          onkeydown={(event) => {
            if (event.key === "Enter" && litRows[0]) togglePin(litRows[0]);
          }}
          placeholder="search either language — {narrow ? 'tap' : 'click'} a row to pin it" />
      </section>
    {/if}
  </div>

  <div class="split" role="separator" aria-orientation="horizontal" onpointerdown={grabSplit} onpointermove={dragSplit} onpointerup={releaseSplit} onpointercancel={releaseSplit}></div>
  <div class="results" bind:this={resultsElement} style:flex={split ? `0 0 ${split}px` : null}>
    <div class="results-head">
      <span class="big" class:none={!matched.length}>{resolving && bySymbol ? "…" : matched.length}</span>
      <span class="results-note">
        <span class="title">{bySymbol ? "resolves to" : litQ.trim() ? "matches" : "feed"}</span>
        <span class="hint">
          {#if bySymbol}
            {matched.length > shown.length ? `showing ${shown.length} · ` : ""}{filterCount != null ? `of ${filterCount} matched` : ""} · {pickLabel(draft.pick)} · cap {capValue} · {ruleLabel}
          {:else}
            {narrow ? "tap" : "click"} a row to pin it
          {/if}
        </span>
      </span>
      <span class="view">
        <span class="title">show</span>
        <Stepper value={view} min={1} max={types.CAP * 6} leap={10} zero="1" title="rows shown below — display only (shift ±10)" onchange={(next) => (view = Math.max(1, next))} />
      </span>
      <button class="add" class:ready={addable} class:amber={editing} disabled={!addable} onclick={add}>{addLabel}</button>
    </div>
    <div class="rows">
      {#each shown as row (row.literal ?? row.learning + row.known)}
        <button class="line" class:pinnable={!bySymbol} onclick={() => (bySymbol ? null : togglePin(row))}>
          <span class="bar" style:background={STATUS_TONE[row.status] ?? "var(--colors-skeleton-2-boundary)"}></span>
          <span class="faces">
            <span class="learning">{row.learning}</span>
            <span class="known">{row.known}{row.context ? ` · ${Object.values(row.context).join(" · ")}` : ""}</span>
          </span>
          <span class="meta">{statusLabel(row)}</span>
          {#if !bySymbol}<span class="plus" class:on={pinnedIds.has(row.literal)}>{pinnedIds.has(row.literal) ? "●" : "+"}</span>{/if}
        </button>
      {/each}
      {#if matched.length > shown.length}
        <span class="more">+{matched.length - shown.length} more — raise “show” to see them</span>
      {/if}
      {#if !matched.length && !resolving}
        <span class="empty">
          {bySymbol
            ? "Nothing survives this. The counts on each bin show which rule emptied it — usually a second ∧ that never co-occurs."
            : "No literal matches that."}
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  .builder {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    height: 100%;
  }
  .tabs {
    flex: none;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem 0.5rem;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    flex-wrap: wrap;
  }
  .note,
  .hint {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hint.lit {
    color: var(--text-body);
  }
  .editing {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.15rem 0.25rem 0.15rem 0.6rem;
    border: 1px solid var(--colors-system-warning-contrast);
    border-radius: 0.2rem;
    background: var(--colors-skeleton-2-surface);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--colors-system-warning-contrast);
    white-space: nowrap;
  }
  .ghost {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 0.2rem 0.5rem;
    border-radius: 0.15rem;
    border: 1px solid var(--colors-skeleton-2-boundary);
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
  }
  .ghost.danger {
    border-color: var(--colors-system-error-contrast);
    color: var(--colors-system-error-contrast);
  }
  .form {
    flex: 0 1 auto;
    min-height: 7rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  .block {
    flex: none;
    padding: 0.7rem 1rem 0;
  }
  .block.row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding-bottom: 0.2rem;
  }
  .form > .block:last-child {
    padding-bottom: 0.75rem;
  }
  .head {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
    min-width: 0;
  }
  .num {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    opacity: 0.6;
  }
  .title {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-support);
    white-space: nowrap;
  }
  .field {
    width: 100%;
    box-sizing: border-box;
    background: var(--colors-skeleton-0-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.25rem;
    padding: 0.55rem 0.7rem;
    color: var(--text-primary);
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    outline: none;
  }
  .field:focus {
    border-color: var(--colors-theme-primary-contrast);
  }
  .kinds {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    margin-top: 0.35rem;
  }
  .kind {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 0.1rem 0.4rem;
    border: none;
    border-bottom: 1px solid transparent;
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
    opacity: 0.8;
  }
  .kind.on {
    color: var(--colors-theme-primary-contrast);
    border-bottom-color: var(--colors-theme-primary-contrast);
    opacity: 1;
  }
  .chips {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    margin-top: 0.4rem;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 0.3rem 0.55rem;
    border-radius: 0.2rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: var(--colors-skeleton-0-surface);
    color: var(--text-body);
    cursor: grab;
    min-height: 1.75rem;
  }
  .chip:hover {
    border-color: var(--text-support);
    color: var(--text-primary);
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 1px;
    flex: none;
  }
  .count {
    opacity: 0.45;
  }
  .bins {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .bin {
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-left: 3px solid var(--tone);
    border-radius: 0.2rem;
    background: transparent;
    padding: 0.45rem 0.65rem;
    cursor: pointer;
    transition:
      background 120ms,
      border-color 120ms;
    --tone: var(--colors-theme-primary-contrast);
  }
  .bin[data-tone="secondary"] {
    --tone: var(--colors-theme-secondary-contrast);
  }
  .bin[data-tone="danger"] {
    --tone: var(--colors-system-error-contrast);
  }
  .bin.aimed {
    border-color: var(--text-support);
    border-left-color: var(--tone);
    background: var(--colors-skeleton-2-surface);
  }
  .bin.over {
    border-color: var(--tone);
    background: var(--colors-skeleton-2-surface);
  }
  .bin-head {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    min-width: 0;
  }
  .glyph {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--tone);
    width: 0.9rem;
  }
  .bin-title {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-support);
    white-space: nowrap;
  }
  .bin-title.lit {
    color: var(--text-primary);
  }
  .operator {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .state {
    margin-left: auto;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    white-space: nowrap;
  }
  .state.aim {
    color: var(--colors-system-warning-contrast);
  }
  .bin-chips {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    margin-top: 0.35rem;
    min-height: 1.4rem;
    align-items: center;
  }
  .placed {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border: 1px solid var(--tone);
    border-radius: 0.2rem;
    background: var(--colors-skeleton-2-surface);
    padding: 0.2rem 0.3rem 0.2rem 0.55rem;
    cursor: grab;
  }
  .placed-key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--tone);
    white-space: nowrap;
  }
  .x {
    border: none;
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
    font-size: var(--font-size-xs);
    padding: 0 0.2rem;
    line-height: 1;
  }
  .x:hover {
    color: var(--colors-system-error-contrast);
  }
  .sub {
    display: inline-flex;
    gap: 0.2rem;
    flex-wrap: wrap;
    padding-left: 0.3rem;
    border-left: 1px solid var(--colors-skeleton-1-boundary);
  }
  .sep {
    width: 1px;
    height: 0.9rem;
    background: var(--colors-skeleton-1-boundary);
  }
  .cap {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .view {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-left: auto;
  }
  .more {
    display: block;
    padding: 0.5rem 0 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    opacity: 0.7;
  }
  .range {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }
  .range.grow {
    flex: 1 1 10rem;
  }
  .key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    white-space: nowrap;
  }
  .mini {
    width: 3.2rem;
    background: var(--colors-skeleton-0-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.2rem;
    padding: 0.2rem 0.4rem;
    color: var(--text-primary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    outline: none;
  }
  .mini.wide {
    flex: 1 1 8rem;
    width: auto;
    min-width: 0;
    font-family: var(--font-family-sans-text);
  }
  .mini:focus {
    border-color: var(--colors-theme-primary-contrast);
  }
  .split {
    flex: none;
    height: 7px;
    margin: -3px 0;
    z-index: 3;
    cursor: row-resize;
    touch-action: none;
    position: relative;
  }
  .split::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 3px;
    height: 1px;
    background: var(--colors-skeleton-2-boundary);
  }
  .split:hover::after,
  .split:active::after {
    background: var(--colors-theme-primary-contrast);
    height: 2px;
  }
  .results {
    flex: 1 4 6rem;
    min-height: 6rem;
    display: flex;
    flex-direction: column;
    background: var(--colors-skeleton-2-surface);
  }
  .results-head {
    flex: none;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 1rem 0.4rem;
    min-width: 0;
  }
  .big {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-2xl);
    line-height: 1;
    color: var(--text-primary);
  }
  .big.none {
    color: var(--colors-system-error-contrast);
  }
  .results-note {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .add {
    flex: none;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    padding: 0.5rem 0.8rem;
    border-radius: 0.2rem;
    border: 1px solid var(--colors-skeleton-2-boundary);
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
    white-space: nowrap;
  }
  .add.ready {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-1-surface);
  }
  .add.ready.amber {
    border-color: var(--colors-system-warning-contrast);
    color: var(--colors-system-warning-contrast);
  }
  .add:disabled {
    cursor: default;
  }
  .rows {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0 1rem 0.75rem;
  }
  .line {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0;
    border: none;
    border-bottom: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    cursor: default;
    text-align: left;
    color: inherit;
  }
  .line.pinnable {
    cursor: pointer;
  }
  .line:hover {
    background: var(--colors-skeleton-1-surface);
  }
  .bar {
    flex: none;
    width: 3px;
    height: 1.5rem;
  }
  .faces {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .learning {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .known {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .meta {
    flex: none;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    opacity: 0.7;
    white-space: nowrap;
  }
  .plus {
    flex: none;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--text-support);
    opacity: 0.6;
    width: 0.9rem;
    text-align: right;
  }
  .plus.on {
    color: var(--colors-theme-primary-contrast);
    opacity: 1;
  }
  .empty {
    display: block;
    padding-top: 0.5rem;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-2xs);
    color: var(--colors-system-error-contrast);
    line-height: 1.5;
  }
</style>

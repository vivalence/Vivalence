<script>
  import { drag, preferences, visible } from "@vivalence/drapes";
  import * as types from "../../types.js";
  import { label as pickLabel } from "../../set/describe.js";
  import { blank, CAP_DEFAULT } from "../workbench.js";
  import Segment from "./Segment.svelte";
  import Stepper from "./Stepper.svelte";

  let {
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
    workbench = $bindable(),
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

  const DEBOUNCE = 200;
  const RECENTS = 12;
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

  let found = $state.raw([]);
  let page = $state(types.SYMBOL_PAGE);
  let rows = $state.raw([]);
  let filterCount = $state(null);
  let binCounts = $state.raw({});
  let resolving = $state(false);
  let pinned = $state.raw([]);
  let over = $state(null);

  const hover = (target) => {
    over = target?.dataset.drop ?? null;
  };
  const dropped = (target, entry) => {
    const bin = target?.dataset.drop;
    if (bin) place(entry, bin);
    over = null;
  };
  const carry = (entry) => ({ payload: entry, onmove: hover, ondrop: dropped, onend: () => (over = null) });

  const stored = preferences("dojo");
  let touched = $state.raw(stored.read().symbols ?? {});

  function touch(key) {
    const next = Object.fromEntries(
      Object.entries({ ...touched, [key]: Date.now() })
        .sort((left, right) => right[1] - left[1])
        .slice(0, RECENTS),
    );
    touched = next;
    stored.write({ symbols: next });
  }
  const placed = $derived(new Set(Object.values(workbench.draft.bins).flat().map((entry) => entry.key)));

  const bucket = (bin, kindOf) => workbench.draft.bins[bin].filter((entry) => entry.kind === kindOf).map((entry) => entry.key);

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
      search: workbench.draft.search.trim() || undefined,
      rank: workbench.draft.rank.$gte || workbench.draft.rank.$lte ? { ...(workbench.draft.rank.$gte ? { $gte: workbench.draft.rank.$gte } : {}), ...(workbench.draft.rank.$lte ? { $lte: workbench.draft.rank.$lte } : {}) } : undefined,
    };
    for (const key of Object.keys(where)) if (where[key] === undefined) delete where[key];
    return where;
  };

  const clause = $derived.by(() => {
    const where = whereOf(workbench.draft.bins);
    return {
      pick: workbench.draft.pick,
      ...(Object.keys(where).length ? { where } : {}),
      ...(workbench.draft.limit ? { limit: workbench.draft.limit } : {}),
      ...(workbench.draft.pick === "byLastSignal" ? { signals: [...draft.signals] } : {}),
      ...(workbench.draft.pick === "sample" && workbench.draft.status.length ? { status: [...draft.status] } : {}),
    };
  });

  const ruleLabel = $derived.by(() => {
    const parts = [];
    const names = (bin) => workbench.draft.bins[bin].map((entry) => (entry.kind === "trait" ? entry.key.toLowerCase() : entry.key));
    if (workbench.draft.bins.all.length) parts.push(names("all").join(" ∧ "));
    if (workbench.draft.bins.any.length) parts.push("(" + names("any").join(" ∨ ") + ")");
    if (workbench.draft.bins.none.length) parts.push("∅ " + names("none").join(" ∅ "));
    return parts.length ? parts.join(" · ") : "everything";
  });

  const chips = $derived.by(() => {
    const needle = workbench.symQ.trim().toLowerCase();
    const wantTraits = workbench.kind === "trait" || (workbench.kind == null && needle.length > 0);
    const traitChips = wantTraits
      ? traits
          .filter((trait) => !placed.has(trait.name))
          .filter((trait) => !needle || trait.name.toLowerCase().includes(needle))
          .map((trait) => ({ kind: "trait", key: trait.name, label: trait.name.toLowerCase(), count: trait.literals, title: `trait · ${trait.name.toLowerCase()}`, dot: KIND_DOT.trait }))
      : [];
    const symbolChips =
      workbench.kind === "trait"
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
    const all = [...symbolChips, ...traitChips];
    const recent = all.filter((chip) => touched[chip.key]).sort((left, right) => touched[right.key] - touched[left.key]);
    const rest = all.filter((chip) => !touched[chip.key]);
    return [...recent, ...rest];
  });

  const aimedTitle = $derived(BINS.find((bin) => bin.id === workbench.aimed)?.title ?? "must have all of");

  function place(entry, bin) {
    const bins = {
      all: workbench.draft.bins.all.filter((member) => member.key !== entry.key),
      any: workbench.draft.bins.any.filter((member) => member.key !== entry.key),
      none: workbench.draft.bins.none.filter((member) => member.key !== entry.key),
    };
    if (bin) {
      bins[bin] = [...bins[bin], { kind: entry.kind, key: entry.key }];
      touch(entry.key);
    }
    workbench.draft.bins = bins;
    workbench.symQ = "";
    over = null;
  }

  function reset() {
    workbench.draft = blank();
    pinned = [];
    workbench.aimed = "all";
  }

  function load(entry) {
    if (!entry) return;
    const source = entry.clause;
    if (source.pick === "literals") {
      pinned = entry.rows ?? [];
      workbench.draft = blank();
      return;
    }
    pinned = [];
    const where = source.where ?? {};
    const symbolSpec = Array.isArray(where.symbols) ? { $all: where.symbols } : (where.symbols ?? {});
    const traitSpec = Array.isArray(where.traits) ? { $contains: where.traits } : (where.traits ?? {});
    const entries = (list, kindOf) => (list ?? []).map((key) => ({ kind: kindOf, key }));
    workbench.draft = {
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
    workbench.symQ;
    workbench.kind;
    page = types.SYMBOL_PAGE;
  });
  $effect(() => {
    const search = workbench.symQ.trim();
    const traitsWanted = workbench.kind && workbench.kind !== "trait" ? [workbench.kind] : undefined;
    const limit = page;
    if (workbench.kind === "trait") {
      found = [];
      return;
    }
    clearTimeout(symbolTimer);
    symbolTimer = setTimeout(async () => {
      try {
        found = (await symbols({ search: search || undefined, traits: traitsWanted, limit })) ?? [];
      } catch (error) {
        console.warn("[dojo] /symbols failed", error);
      }
    }, DEBOUNCE);
    return () => clearTimeout(symbolTimer);
  });
  const more = $derived(workbench.kind !== "trait" && found.length >= page);

  let ticket = 0;
  let previewTimer = null;
  $effect(() => {
    const wanted = JSON.parse(JSON.stringify(clause));
    const bins = JSON.parse(JSON.stringify(workbench.draft.bins));
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

  const pinnedIds = $derived(new Set(pinned.map((row) => row.literal)));

  const shown = $derived([...pinned, ...rows.filter((row) => !pinnedIds.has(row.literal))]);

  function togglePin(row) {
    pinned = pinnedIds.has(row.literal) ? pinned.filter((entry) => entry.literal !== row.literal) : [...pinned, row];
  }

  const pinning = $derived(pinned.length > 0);
  const editingPins = $derived(editing?.clause?.pick === "literals");
  const addable = $derived(pinning || (!editingPins && rows.length > 0));
  const addLabel = $derived(
    pinning
      ? `${editing ? "update" : "add"} ${pinned.length} pinned`
      : editing
        ? "update clause"
        : "add clause",
  );

  function add() {
    if (!addable) return;
    const built = pinning ? { pick: "literals", literals: pinned.map((row) => row.literal) } : clause;
    onclause(JSON.parse(JSON.stringify(built)), editing?.index ?? null);
    reset();
  }

  function cancel() {
    reset();
    oncancel?.();
  }

  const statusLabel = (row) =>
    row.status
      ? row.status === "UNTOUCHED"
        ? "new"
        : row.status.toLowerCase()
      : row.ontology === "conjugation"
        ? `table · ${row.tokens?.length ?? 0} forms`
        : row.context
          ? "form"
          : "";

  const capValue = $derived(workbench.draft.limit ?? types.CAP);
  const setCap = (next) => (workbench.draft.limit = Math.max(1, Math.min(types.CAP, next)));
  const numeric = (event) => {
    const value = parseInt(String(event.target.value).replace(/[^0-9]/g, ""), 10);
    return isNaN(value) ? null : value;
  };

  const toggle = (list, value) => (list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]);
</script>

<div class="builder" bind:clientHeight={builderHeight}>
  <div class="tabs">
    <span class="note">{pinning ? `${pinned.length} pinned · exact things, frozen in the set` : "a rule that keeps resolving"}</span>
    {#if pinning}
      <button class="ghost" onclick={() => (pinned = [])}>clear pins</button>
    {/if}
    {#if editing}
      <span class="editing">
        <span>editing {editing.clause.pick === "literals" ? "pinned clause" : `clause ${editing.index + 1}`}</span>
        <button class="ghost" onclick={cancel}>cancel</button>
        <button class="ghost danger" onclick={() => onremove(editing.index)}>remove</button>
      </span>
    {/if}
  </div>

  <div class="form">
    <section class="block row">
      <span class="num">01</span>
      <span class="title">take</span>
      {#each PICKS as pick (pick)}
        <Segment label={pickLabel(pick)} on={workbench.draft.pick === pick} title={PICK_NOTE[pick]} onclick={() => (workbench.draft.pick = pick)} />
      {/each}
      {#if workbench.draft.pick === "byLastSignal"}
        <span class="sub">
          {#each types.SIGNALS as signal (signal)}
            <Segment label={signal.toLowerCase()} tone="warning" on={workbench.draft.signals.includes(signal)} onclick={() => (workbench.draft.signals = toggle(workbench.draft.signals, signal))} />
          {/each}
        </span>
      {/if}
      {#if workbench.draft.pick === "sample"}
        <span class="sub">
          {#each types.STATUSES as status (status)}
            <Segment label={status.toLowerCase()} tone="warning" on={workbench.draft.status.includes(status)} onclick={() => (workbench.draft.status = toggle(workbench.draft.status, status))} />
          {/each}
        </span>
      {/if}
      <span class="sep"></span>
      <span class="cap">
        <span class="title">cap</span>
        <Stepper value={capValue} min={1} max={types.CAP} title="how many this clause pulls into the set — max {types.CAP} (shift ±10)" onchange={setCap} />
        <span class="hint">into the set</span>
      </span>
    </section>

    <section class="block">
      <div class="head">
        <span class="num">02</span>
        <span class="title">the rule</span>
        <span class="hint">{narrow ? "tap" : "click"} a bin to aim it</span>
      </div>
      <div class="bins">
        {#each BINS as bin (bin.id)}
          {@const list = workbench.draft.bins[bin.id]}
          {@const counted = binCounts[bin.id]}
          <div
            class="bin"
            class:aimed={workbench.aimed === bin.id}
            class:over={over === bin.id}
            data-tone={bin.tone}
            role="group"
            data-drop={bin.id}
            onclick={() => (workbench.aimed = bin.id)}>
            <div class="bin-head">
              <span class="glyph">{bin.glyph}</span>
              <span class="bin-title" class:lit={workbench.aimed === bin.id || list.length}>{bin.title}</span>
              <span class="operator">{bin.operator}</span>
              <span class="state" class:aim={!list.length && workbench.aimed === bin.id}>
                {#if list.length && counted}{counted.with} of {counted.without}{:else if workbench.aimed === bin.id && !list.length}workbench.aimed{/if}
              </span>
            </div>
            <div class="bin-chips">
              {#each list as entry (entry.key)}
                <span class="placed" role="button" tabindex="-1" use:drag={carry(entry)}>
                  <span class="placed-key">{entry.kind === "trait" ? entry.key.toLowerCase() : entry.key}</span>
                  <button class="x" onclick={(event) => {
                    event.stopPropagation();
                    place(entry, null);
                  }}>×</button>
                </span>
              {/each}
              {#if !list.length}
                <span class="hint" class:lit={workbench.aimed === bin.id}>{workbench.aimed === bin.id ? "taps land here" : "drop a symbol here"}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <section class="block">
      <div class="head">
        <span class="num">03</span>
        <span class="title">symbols</span>
        <span class="hint">{narrow ? "tap" : "click"} to drop into {aimedTitle}{narrow ? "" : " — or drag onto a bin"}</span>
      </div>
      <input
        class="field"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        writingsuggestions="false"
        use:visible={{ block: "center" }}
        value={workbench.symQ}
        oninput={(event) => (workbench.symQ = event.target.value)}
        onkeydown={(event) => {
          if (event.key === "Enter" && chips[0]) place(chips[0], workbench.aimed);
        }}
        placeholder="find a symbol or trait — cibo, present, unit 3, verb, vocalized…" />
      <div class="kinds">
        {#each KINDS as entry (entry.label)}
          <button class="kind" class:on={workbench.kind === entry.id} onclick={() => (workbench.kind = entry.id)}>{entry.label}</button>
        {/each}
      </div>
      <div class="chips">
        {#each chips as chip (chip.kind + chip.key)}
          <button
            class="chip"
            title="{chip.title} — adds to {aimedTitle}"
            use:drag={carry(chip)}
            onclick={() => place(chip, workbench.aimed)}>
            <span class="dot" style:background={chip.dot}></span>
            <span>{chip.label}</span>
            <span class="count">{chip.count}</span>
          </button>
        {/each}
        {#if more}
          <button class="chip more" title="load the next {types.SYMBOL_PAGE} symbols by literal count — or type to narrow" onclick={() => (page += types.SYMBOL_PAGE)}>
            <span>more</span>
            <span class="count">+{types.SYMBOL_PAGE}</span>
          </button>
        {/if}
        {#if !chips.length}<span class="hint">no symbol matches that.</span>{/if}
      </div>
    </section>
  </div>

  <div class="split" class:narrow role="separator" aria-orientation="horizontal" title="drag to resize the results" onpointerdown={grabSplit} onpointermove={dragSplit} onpointerup={releaseSplit} onpointercancel={releaseSplit}></div>
  <div class="results" bind:this={resultsElement} style:flex={split ? `0 0 ${split}px` : null}>
    <div class="results-head">
      <span class="big" class:none={!rows.length}>{resolving ? "…" : rows.length}</span>
      <span class="results-note">
        <span class="title">resolves to</span>
        <span class="hint">
          {filterCount != null ? `of ${filterCount} matched` : ""} · {pickLabel(workbench.draft.pick)} · cap {capValue} · {ruleLabel} · {narrow ? "tap" : "click"} a row to pin it
        </span>
      </span>
      <button class="add" class:ready={addable} class:amber={editing} disabled={!addable} onclick={add}>{addLabel}</button>
    </div>
    <div class="rows">
      {#each shown as row (row.literal ?? row.learning + row.known)}
        <button class="line" class:pinnable={Boolean(row.literal)} class:pinned={pinnedIds.has(row.literal)} onclick={() => (row.literal ? togglePin(row) : null)}>
          <span class="bar" style:background={STATUS_TONE[row.status] ?? "var(--colors-skeleton-2-boundary)"}></span>
          <span class="faces">
            <span class="learning">{row.learning}</span>
            <span class="known">{row.known}{row.context ? ` · ${Object.values(row.context).join(" · ")}` : ""}</span>
          </span>
          <span class="meta">{statusLabel(row)}</span>
          {#if row.literal}<span class="plus" class:on={pinnedIds.has(row.literal)}>{pinnedIds.has(row.literal) ? "●" : "+"}</span>{/if}
        </button>
      {/each}
      {#if !shown.length && !resolving}
        <span class="empty">
          Nothing survives this. The counts on each bin show which rule emptied it — usually a second ∧ that never co-occurs.
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
  .chip.more {
    cursor: pointer;
    border-style: dashed;
    color: var(--text-support);
  }
  .chip:global(.lifted),
  .placed:global(.lifted) {
    opacity: 0.35;
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
    flex: none;
    white-space: nowrap;
    overflow-anchor: none;
    align-items: center;
    gap: 0.5rem;
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
    font-size: var(--font-size-xs);
    color: var(--text-support);
    white-space: nowrap;
  }
  .mini {
    width: 4rem;
    height: 1.75rem;
    box-sizing: border-box;
    background: var(--colors-skeleton-0-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 0.2rem;
    padding: 0 0.5rem;
    color: var(--text-primary);
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    outline: none;
  }
  .mini.wide {
    flex: 1 1 10rem;
    width: auto;
    min-width: 0;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
  }
  .mini:focus {
    border-color: var(--colors-theme-primary-contrast);
  }
  .split {
    flex: none;
    height: 14px;
    z-index: 3;
    cursor: row-resize;
    touch-action: none;
    position: relative;
    background: var(--colors-skeleton-1-surface);
    border-top: 1px solid var(--colors-skeleton-2-boundary);
    border-bottom: 1px solid var(--colors-skeleton-2-boundary);
  }
  .split.narrow {
    height: 22px;
  }
  .split::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 40px;
    height: 4px;
    border-radius: 2px;
    transform: translate(-50%, -50%);
    background: var(--colors-skeleton-2-boundary);
  }
  .split:hover::after,
  .split:active::after {
    background: var(--colors-theme-primary-contrast);
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
    margin-left: auto;
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
  .line.pinned {
    background: var(--colors-skeleton-2-surface);
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

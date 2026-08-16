<script>
  import { array, object } from "@vivalence/typology";
  import { ViewportLock, preferences } from "@vivalence/drapes";
  import * as types from "../types.js";
  import * as knowables from "./knowables.js";
  import * as streak from "./streak.js";
  import { describe } from "../set/describe.js";
  import Rep from "./parts/Rep.svelte";
  import Standby from "./parts/Standby.svelte";
  import Handle from "./parts/Handle.svelte";
  import Drawer from "./parts/Drawer.svelte";

  const { terminal, buffer } = $props();

  const PICK_OPTIONS = 3;
  const TICK = 1000;
  const NARROW = 700;
  const MEDIUM = 1040;
  const SHORT = 520;
  const RECENTS = 6;
  const PREVIEW_DEBOUNCE = 320;
  const PRESET_FEED = 8;
  const RESET = Object.fromEntries(types.SETUP.map((key) => [key, undefined]));

  const language = terminal.daemon.statics?.language ?? {};
  const labels = { known: language.known?.name, learning: language.learning?.name };

  const clone = (value) => JSON.parse(JSON.stringify(value ?? null));

  let axes = $state({ ...types.DEFAULTS, ...object.pluck(buffer.data ?? {}, types.AXIS_KEYS) });
  let set = $state(clone(buffer.data?.set ?? []));

  const prepare = (list) =>
    list.map((knowable) => ({
      ...knowable,
      recall: knowables.recallFor(axes.recall),
      gameplay: knowables.gameplayFor(axes.gameplay),
      prompt: knowables.promptFor(terminal, axes.prompt, knowable),
    }));

  let carriers = $state.raw(knowables.carriers(buffer));
  let queue = $state.raw(prepare(knowables.admit(terminal, carriers, axes)));
  let session = $state.raw(streak.begin(queue, axes.streak));
  let phase = $state("idle");
  let dirty = $state(!carriers.length && set.length > 0);
  let preview = $state.raw(null);
  let resolving = $state(false);
  let committing = $state(false);
  let played = $state.raw([]);
  let outcome = $state(null);
  let reps = $state(0);
  let sets = $state(1);
  let reviews = $state(0);
  let elapsed = $state(0);
  let drawing = null;

  const locked = $derived(phase === "playing" || phase === "drawing");

  let drawer = $state(!carriers.length);
  let space = $state("build");
  let side = $state("set");
  let libraryOpen = $state(false);
  let width = $state(0);
  let height = $state(0);
  let editing = $state(null);
  let traits = $state.raw([]);
  let repPhase = $state("recall");

  const tier = $derived(width > 0 && width < NARROW ? "narrow" : width > 0 && width < MEDIUM ? "medium" : "wide");
  const short = $derived(height > 0 && height < SHORT);

  const stored = preferences("dojo");
  const remembered = stored.read();
  let recents = $state(remembered.recent ?? []);
  let saved = $state(remembered.saved ?? []);
  let panes = $state({
    library: 260,
    set: 280,
    gameplay: 250,
    side: 300,
    drawer: 76,
    results: null,
    ...(remembered.panes ?? {}),
  });

  function repane(patch, persist) {
    panes = { ...panes, ...patch };
    if (persist) stored.write({ panes: $state.snapshot(panes) });
  }

  const entry = $derived(streak.current(session));
  const knowable = $derived(entry ? queue[entry.index] : null);
  const position = $derived(queue.length - session.pending.length + 1);
  const satisfied = $derived(queue.length - session.pending.length);
  const options = $derived.by(() => {
    if (!entry || !knowable || knowable.gameplay !== "PICK") return [];
    const seen = new Set([knowable.known, knowable.learning]);
    const distractors = queue
      .filter((candidate) => {
        if (candidate === knowable || seen.has(candidate.known) || seen.has(candidate.learning))
          return false;
        seen.add(candidate.known);
        seen.add(candidate.learning);
        return true;
      })
      .slice(0, PICK_OPTIONS);
    return array.shuffle([knowable, ...distractors]);
  });

  const status = $derived({
    runs: entry?.runs ?? 0,
    set: sets,
    reps,
    seconds: axes.limit?.seconds ? Math.max(0, axes.limit.seconds - elapsed) : null,
  });

  const declared = $derived(set.length > 0);
  const previewTotal = $derived(preview?.total ?? 0);
  const aboardTotal = $derived(queue.length);
  const subjects = $derived(dirty || !aboardTotal ? previewTotal : aboardTotal);
  const startable = $derived(dirty ? previewTotal > 0 && !resolving : aboardTotal > 0 || previewTotal > 0);
  const startLabel = $derived(subjects ? `start · ${subjects} subject${subjects === 1 ? "" : "s"}` : "add something first");
  const progress = $derived(queue.length ? Math.round((satisfied / queue.length) * 100) : 0);

  const axesSummary = $derived(
    [
      [].concat(axes.gameplay ?? types.GAMEPLAYS).join("/"),
      axes.streak ? `×${axes.streak}` : null,
      [].concat(axes.prompt ?? "TEXT").includes("AUDIO") ? "audio" : null,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const handleSummary = $derived(
    subjects ? `${subjects} in the set · ${axesSummary}` : declared ? "resolving the set…" : "no set yet · pull the drawer down",
  );

  const summarize = (entry) =>
    [
      `${[].concat(entry.gameplay ?? "TYPE").join("/")} · ${[].concat(entry.prompt ?? "TEXT").join("/")}`,
      entry.recall && `recall ${[].concat(entry.recall).join("/")}`,
      entry.streak && `streak ${entry.streak}`,
      entry.continuous && "continuous",
      entry.limit?.reps && `${entry.limit.reps} reps`,
      entry.limit?.seconds && `${entry.limit.seconds}s`,
    ].filter(Boolean);

  const summary = (entry) => [...(entry.set ?? []).map(describe), ...summarize(entry.axes ?? {})].join(" · ");

  const clauseCards = $derived(
    set.map((clause, index) => {
      const resolved = preview?.clauses?.[index];
      return {
        clause,
        count: resolved?.count ?? null,
        rows: resolved ? [...resolved.literals, ...resolved.knowables] : [],
      };
    }),
  );

  const riding = () => object.pluck(axes, types.SETUP);

  function readmit() {
    queue = prepare(knowables.admit(terminal, carriers, axes));
    session = streak.begin(queue, axes.streak);
  }

  async function absorb(raw) {
    const fresh = await terminal.daemon.entities.buffer.cast(raw);
    return fresh ?? raw;
  }

  async function setup() {
    try {
      await absorb(
        await buffer.mode.connection.call("/setup", {
          buffer: buffer.id,
          set: $state.snapshot(set),
          ...riding(),
        }),
      );
    } catch (error) {
      console.warn("[dojo] /setup failed", error);
    }
  }

  function apply(patch) {
    const admitted = locked ? object.pluck(patch, types.LIVE) : patch;
    const keys = Object.keys(admitted);
    if (!keys.length) return;
    const next = { ...axes, ...admitted };
    for (const key of keys) if (admitted[key] === undefined) delete next[key];
    const promptChanged = "prompt" in admitted && JSON.stringify(admitted.prompt ?? null) !== JSON.stringify(axes.prompt ?? null);
    axes = next;
    setup();
    if (locked) {
      if ("recall" in admitted || "gameplay" in admitted || "prompt" in admitted) queue = prepare(queue);
      return;
    }
    if (promptChanged && !dirty) dirty = declared;
    readmit();
  }

  function declare(next) {
    set = next;
    dirty = true;
    setup();
  }

  function addClause(clause, index) {
    const next = clone(set);
    if (index == null) next.push(clause);
    else next[index] = clause;
    editing = null;
    declare(next);
  }

  function removeClause(index) {
    if (editing?.index === index) editing = null;
    declare(set.filter((clause, position) => position !== index));
  }

  function clearSet() {
    editing = null;
    declare([]);
  }

  function edit(index) {
    const card = clauseCards[index];
    if (!card) return;
    editing = { index, clause: clone(card.clause), rows: card.rows };
    space = "build";
    if (tier === "medium") side = "set";
  }

  function preset(name) {
    const entry = types.PRESETS[name];
    apply({ ...RESET, ...types.DEFAULTS, ...entry.axes });
    if (!set.length) declare([{ pick: "feed", limit: entry.count ?? PRESET_FEED }]);
  }

  function remember() {
    const entry = { set: $state.snapshot(set), axes: riding(), at: Date.now() };
    const key = JSON.stringify({ set: entry.set, axes: entry.axes });
    recents = [
      entry,
      ...recents.filter((other) => JSON.stringify({ set: other.set, axes: other.axes }) !== key),
    ].slice(0, RECENTS);
    stored.write({ recent: $state.snapshot(recents) });
  }

  function reuse(entry) {
    editing = null;
    apply({ ...RESET, ...types.DEFAULTS, ...(entry.axes ?? {}) });
    declare(clone(entry.set ?? []));
    if (tier === "narrow") space = "set";
  }

  function save(name) {
    const entry = { name, set: $state.snapshot(set), axes: riding(), at: Date.now() };
    saved = [entry, ...saved.filter((other) => other.name !== name)];
    stored.write({ saved: $state.snapshot(saved) });
  }

  function forget(name) {
    saved = saved.filter((other) => other.name !== name);
    stored.write({ saved: $state.snapshot(saved) });
  }

  const resolveSet = (clauses) =>
    buffer.mode.connection.call("/resolve", { set: clauses, prompt: axes.prompt });

  const countWheres = (wheres) => buffer.mode.connection.call("/count", { wheres });

  const loadSymbols = (input) => buffer.mode.connection.call("/symbols", input);

  let previewing = 0;
  let previewTimer = null;
  async function refreshPreview() {
    if (!set.length) {
      preview = null;
      resolving = false;
      return;
    }
    const mine = ++previewing;
    resolving = true;
    try {
      const out = await resolveSet($state.snapshot(set));
      if (mine !== previewing) return;
      preview = out;
    } catch (error) {
      console.warn("[dojo] /resolve failed", error);
    } finally {
      if (mine === previewing) resolving = false;
    }
  }

  async function commission() {
    if (committing) return false;
    committing = true;
    try {
      const raw = await buffer.mode.connection.call("/commission", { buffer: buffer.id });
      const fresh = await absorb(raw);
      carriers = knowables.carriers(fresh);
      readmit();
      dirty = false;
      if (!queue.length) return false;
      remember();
      return true;
    } catch (error) {
      console.warn("[dojo] /commission failed", error);
      return false;
    } finally {
      committing = false;
    }
  }

  async function begin() {
    if (committing) return;
    if (dirty || !queue.length) {
      const ready = await commission();
      if (!ready) {
        drawer = true;
        return;
      }
    } else {
      readmit();
    }
    reps = 0;
    elapsed = 0;
    sets = 1;
    outcome = null;
    played = carriers.map((knowable) => knowable.literal).filter(Boolean);
    phase = "playing";
    drawer = false;
  }

  function again() {
    dirty = declared;
    begin();
  }

  function stop() {
    if (phase !== "playing" && phase !== "drawing") return;
    outcome = null;
    phase = "idle";
    readmit();
  }

  async function refill() {
    if (drawing) return drawing;
    phase = "drawing";
    drawing = knowables
      .refetch(buffer, { set: $state.snapshot(set), prompt: axes.prompt, blacklist: played })
      .catch((error) => {
        console.warn("[dojo] refill failed", error);
        return [];
      });
    const fresh = await drawing;
    drawing = null;
    const admitted = knowables.admit(terminal, fresh, axes);
    if (!admitted.length) return finish("complete");
    carriers = fresh;
    played = [...played, ...fresh.map((knowable) => knowable.literal).filter(Boolean)];
    queue = prepare(admitted);
    session = streak.begin(queue, axes.streak);
    phase = "playing";
  }

  function finish(kind) {
    outcome = kind;
    phase = "done";
    dirty = declared;
  }

  function openDrawer() {
    drawer = true;
  }

  function closeDrawer() {
    drawer = false;
  }

  function toggleDrawer() {
    drawer = !drawer;
  }

  $effect(() => {
    if (phase !== "drawing") return;
    refill();
  });

  $effect(() => {
    if (phase !== "playing" || !axes.limit?.seconds) return;
    const timer = setInterval(() => {
      elapsed += 1;
      if (elapsed >= axes.limit.seconds) finish("limit");
    }, TICK);
    return () => clearInterval(timer);
  });

  $effect(() => {
    JSON.stringify([set, axes.prompt]);
    clearTimeout(previewTimer);
    previewTimer = setTimeout(refreshPreview, PREVIEW_DEBOUNCE);
    return () => clearTimeout(previewTimer);
  });

  $effect(() => {
    if (traits.length) return;
    buffer.mode.connection
      .call("/traits", {})
      .then((rows) => (traits = rows ?? []))
      .catch((error) => console.warn("[dojo] /traits failed", error));
  });

  $effect(() => {
    if (drawer || phase !== "playing") return;
    const field = document.querySelector("[data-rep-input]");
    if (field && document.activeElement !== field) field.focus();
  });

  function review(signal, literal) {
    if (!literal || !signal) return;
    reviews += 1;
    terminal.daemon.connection.call("/review/literal", { signal, scope: { literal } });
  }

  function land(result) {
    review(result.signal, knowable.literal);
    for (const token of result.tokens ?? []) review(token.signal, token.literal);
    if (result.picked && result.signal !== "SUCCESS") review("MISTAKE", result.picked.literal);
  }

  function judge(typed) {
    return buffer.mode.connection.call("/judge", { typed, knowable, recall: knowable.recall });
  }

  function advance(success) {
    session = streak.record(session, success);
    reps += 1;
    if (axes.limit?.reps && reps >= axes.limit.reps) return finish("limit");
    if (!streak.complete(session)) return;
    if (!axes.continuous || !declared) return finish("complete");
    sets += 1;
    refill();
  }

  function onkeydown(event) {
    const target = event.target;
    const repping = target?.hasAttribute?.("data-rep-input");
    const typing =
      !repping && (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable);
    if (event.key === "Escape") {
      if (typing && !drawer) return;
      event.preventDefault();
      if (typing) target.blur();
      toggleDrawer();
      return;
    }
    if (typing) return;
    if (event.key === "\\") {
      event.preventDefault();
      toggleDrawer();
      return;
    }
    if (event.key === "Enter" && !repping && phase !== "playing" && startable && !committing) {
      event.preventDefault();
      begin();
    }
  }
</script>

<ViewportLock />

<svelte:window {onkeydown} />

<div class="shell" bind:clientWidth={width} bind:clientHeight={height}>
  <main class="player">
    <Handle summary={handleSummary} right={phase === "playing" ? "esc toggles" : "esc"} onopen={openDrawer} />

    {#if phase === "playing" && knowable}
      <div class="strip"><div class="fill" style:width="{progress}%"></div></div>
      <div class="play">
        <Rep
          {knowable}
          {axes}
          recall={knowable.recall}
          gameplay={knowable.gameplay}
          {options}
          {labels}
          {status}
          asset={terminal.daemon.getAsset(knowable.asset)}
          {position}
          total={queue.length}
          first={streak.first(session)}
          prompt={knowable.prompt}
          rep={entry}
          onresult={land}
          onadvance={advance}
          onjudge={judge}
          onphase={(value) => (repPhase = value)}
          onchrome={toggleDrawer} />
      </div>
    {:else if phase === "drawing"}
      <div class="stage"><span class="dot"></span></div>
    {:else if phase === "done"}
      <div class="stage">
        <Standby
          kicker={outcome === "limit" ? "limit reached" : "set complete"}
          title={outcome === "limit" ? "Released mid-flight." : session.attempts && session.attempts === reviews ? "Clean run." : "Every subject satisfied."}
          stats={[
            { key: "attempts", value: session.attempts },
            { key: "subjects", value: queue.length },
            { key: "sets", value: sets },
            { key: "reviews sent", value: reviews },
          ]}
          label="run it again"
          onact={again}
          secondary={{ label: "open the drawer ▼", onact: openDrawer }} />
      </div>
    {:else if aboardTotal && !dirty}
      <div class="stage">
        <Standby
          kicker="aboard"
          title="{aboardTotal} subject{aboardTotal === 1 ? '' : 's'} aboard."
          facts={summarize(axes)}
          label="start ⏎"
          onact={begin}
          secondary={{ label: "open the drawer ▼", onact: openDrawer }} />
      </div>
    {:else}
      <div class="stage">
        <Standby
          kicker="nothing running"
          title="The drawer is up there."
          note="Pull it down, declare a set, press start. Start is what sends the drawer away again."
          label="open the drawer ▼"
          onact={openDrawer} />
      </div>
    {/if}
  </main>

  <Drawer
    open={drawer}
    {tier}
    {short}
    {width}
    {height}
    {space}
    {side}
    {libraryOpen}
    {panes}
    total={subjects}
    {axesSummary}
    {startable}
    {startLabel}
    {committing}
    playing={locked}
    library={{ saved, recents, summary, onload: reuse, onforget: forget }}
    builder={{
      editing,
      traits,
      symbols: loadSymbols,
      resolve: resolveSet,
      count: countWheres,
      onclause: addClause,
      oncancel: () => (editing = null),
      onremove: removeClause,
    }}
    clauses={{
      clauses: clauseCards,
      total: subjects,
      resolving,
      editingIndex: editing?.index ?? null,
      onedit: edit,
      onremove: removeClause,
      onclear: clearSet,
      onsave: save,
    }}
    gameplay={{ axes, labels, locked, startable, startLabel, committing, playing: locked, onstart: begin, onstop: stop, onpreset: preset, onaxes: apply }}
    onspace={(id) => (space = id)}
    onside={(id) => (side = id)}
    onlibrary={() => (libraryOpen = !libraryOpen)}
    onclose={closeDrawer}
    onstart={begin}
    onstop={stop}
    onpanes={repane} />
</div>

<style>
  .shell {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: var(--viva-h, 100%);
    min-height: 0;
    overflow: hidden;
    background: var(--colors-skeleton-0-surface);
  }
  .player {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
  }
  .strip {
    flex: none;
    height: 2px;
    background: var(--colors-skeleton-1-surface);
  }
  .fill {
    height: 100%;
    background: var(--colors-theme-primary-contrast);
    transition: width 200ms;
  }
  .play {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .stage {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 2rem 1.25rem;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--colors-skeleton-1-boundary);
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
</style>

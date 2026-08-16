<script>
  import { array, object } from "@vivalence/typology";
  import { Keyboard, ViewportLock, preferences } from "@vivalence/drapes";
  import * as types from "../types.js";
  import * as knowables from "./knowables.js";
import * as workbenchState from "./workbench.js";
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
  const POLL = 30000;
  const KEEP_DEBOUNCE = 1500;
  const LIVE_PHASES = ["playing", "drawing", "done"];
  const POSITIVE = ["MASTERY", "SUCCESS", "NEUTRAL"];
  const RESET = Object.fromEntries(types.SETUP.map((key) => [key, undefined]));

  let language = $state.raw(terminal.daemon.statics?.language ?? {});
  const labels = $derived({ known: language.known?.name, learning: language.learning?.name });

  const clone = (value) => JSON.parse(JSON.stringify(value ?? null));

  let axes = $state({ ...types.DEFAULTS, ...object.pluck(buffer.data ?? {}, types.AXIS_KEYS) });
  let set = $state(clone(buffer.data?.set ?? []));

  const drawn = () => types.drawing(axes.random);

  const dresser = (list) => (index, worn) =>
    knowables.dressFor(terminal, axes, list[index], { index, random: drawn(), worn });

  const prepare = (list) =>
    knowables.order(
      list.flatMap((knowable, index) =>
        knowables.surface(knowable, knowables.gameplayFor(axes.gameplay, knowable, index, drawn())),
      ),
      axes.random,
    );

  const board = (list) => streak.begin(list, axes.streak, dresser(list));

  const kept = buffer.data?.session ?? null;
  const resuming = Boolean(kept && LIVE_PHASES.includes(kept.phase) && kept.queue?.length);

  let carriers = $state.raw(knowables.carriers(buffer));
  let queue = $state.raw(resuming ? clone(kept.queue) : prepare(knowables.admit(terminal, carriers, axes)));
  let session = $state.raw(resuming ? clone(kept.session) : board(queue));
  let phase = $state(resuming ? kept.phase : "idle");
  let dirty = $state(!resuming && !carriers.length && set.length > 0);
  let preview = $state.raw(null);
  let resolving = $state(false);
  let committing = $state(false);
  let played = $state.raw(resuming ? clone(kept.played ?? []) : []);
  let outcome = $state(resuming ? (kept.outcome ?? null) : null);
  let reps = $state(resuming ? (kept.reps ?? 0) : 0);
  let sets = $state(resuming ? (kept.sets ?? 1) : 1);
  let reviews = $state(resuming ? (kept.reviews ?? 0) : 0);
  let elapsed = $state(resuming ? (kept.elapsed ?? 0) : 0);
  let drawing = null;
  let inflight = new Set();

  const locked = $derived(phase === "playing" || phase === "drawing");

  let drawer = $state(!resuming && !carriers.length);
  let space = $state("build");
  let side = $state("set");
  let libraryOpen = $state(false);
  let width = $state(0);
  let height = $state(0);
  let editing = $state(null);
  let workbench = $state(workbenchState.fresh());
  let traits = $state.raw([]);
  let repPhase = $state("recall");
  let holder = $state(null);

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
  const aboard = $derived(entry ? queue[entry.index] : null);
  const knowable = $derived(aboard ? { ...aboard, ...streak.wearing(entry) } : null);
  let held = $state.raw(null);
  $effect(() => {
    if (knowable) held = knowable;
  });
  const staged = $derived(knowable ?? (phase === "drawing" ? held : null));
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
      [].concat(axes.prompt ?? "TEXT").includes("AUDIO") ? (axes.greedy ? "audio·greedy" : "audio") : null,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const handleSummary = $derived(
    LIVE_PHASES.includes(phase) && queue.length
      ? [
          `${satisfied}/${queue.length}/${reps}/${sets}`,
          axes.continuous ? "continuous" : null,
          axesSummary,
        ]
          .filter(Boolean)
          .join(" · ")
      : subjects
        ? `${subjects} in the set · ${axesSummary}`
        : declared
          ? "resolving the set…"
          : "no set yet · pull the drawer down",
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

  const material = $derived(
    array.unique(
      (dirty || !queue.length ? clauseCards.flatMap((card) => card.rows) : queue).map((knowable) => knowable.ontology),
    ),
  );

  const riding = () => object.pluck(axes, types.SETUP);

  function readmit() {
    queue = prepare(knowables.admit(terminal, carriers, axes));
    session = board(queue);
  }

  const record = () =>
    LIVE_PHASES.includes(phase) ? { queue, session, phase, reps, sets, elapsed, played, outcome, reviews } : null;

  function retain(snapshot) {
    const { session: previous, ...rest } = buffer.data ?? {};
    buffer.data = snapshot ? { ...rest, session: snapshot } : rest;
  }

  let keeping = null;
  let latest = null;
  let sentQueue = resuming ? queue : null;
  const send = () => {
    keeping = null;
    const { queue: carried, ...light } = latest ?? {};
    const session = latest ? (carried === sentQueue ? light : { ...light, queue: carried }) : null;
    sentQueue = session ? carried : null;
    buffer.mode.connection
      .call("/session", { buffer: buffer.id, ...(session ? { session } : {}) })
      .catch((error) => console.warn("[dojo] /session failed", error));
  };
  function keep(snapshot) {
    retain(snapshot);
    latest = snapshot;
    if (keeping) return;
    keeping = setTimeout(send, KEEP_DEBOUNCE);
  }

  async function absorb(raw) {
    const fresh = await terminal.daemon.entities.buffer.cast(raw);
    retain(record());
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
    const admitted = locked
      ? Object.fromEntries(Object.entries(patch).filter(([key]) => types.LIVE.includes(key)))
      : patch;
    const keys = Object.keys(admitted);
    if (!keys.length) return;
    const next = { ...axes, ...admitted };
    for (const key of keys) if (admitted[key] === undefined) delete next[key];
    const promptChanged = "prompt" in admitted && JSON.stringify(admitted.prompt ?? null) !== JSON.stringify(axes.prompt ?? null);
    axes = next;
    setup();
    if (locked) {
      if ("recall" in admitted || "gameplay" in admitted || "prompt" in admitted || "greedy" in admitted || "random" in admitted)
        session = streak.redress(session, dresser(queue));
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
    if (!set.length) declare([{ pick: "feed", ...(entry.where ? { where: clone(entry.where) } : {}), limit: entry.count ?? PRESET_FEED }]);
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
    holder?.focus();
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

  const settled = () => Promise.allSettled([...inflight]).then(refreshPreview);

  function stop() {
    if (phase !== "playing" && phase !== "drawing") return;
    outcome = null;
    phase = "idle";
    readmit();
    dirty = declared;
    settled();
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
    session = board(queue);
    phase = "playing";
  }

  function finish(kind) {
    outcome = kind;
    phase = "done";
    dirty = declared;
    settled();
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
    terminal.daemon.connection
      .call("/language", {})
      .then((pair) => {
        if (pair?.known || pair?.learning) language = pair;
      })
      .catch((error) => console.warn("[dojo] /language failed", error));
  });

  $effect(() => {
    keep(record());
  });

  $effect(() => () => {
    if (!keeping) return;
    clearTimeout(keeping);
    send();
  });

  $effect(() => {
    if (locked || !declared) return;
    const timer = setInterval(refreshPreview, POLL);
    return () => clearInterval(timer);
  });

  const holding = $derived(!drawer && (phase === "playing" || phase === "drawing"));

  function review(signal, literal) {
    if (!literal || !signal) return;
    reviews += 1;
    const sent = terminal.daemon.connection
      .call("/review/literal", { signal, scope: { literal } })
      .catch((error) => console.warn("[dojo] /review/literal failed", error))
      .finally(() => inflight.delete(sent));
    inflight.add(sent);
  }

  const soften = (signal, peeked) => {
    if (!peeked) return signal;
    if (signal?.ratio)
      return POSITIVE.includes(signal.enum)
        ? { enum: "NEUTRAL", ratio: { success: signal.ratio.success * 0.5, total: signal.ratio.total } }
        : signal;
    return POSITIVE.includes(signal) ? "NEUTRAL" : signal;
  };

  function land(result) {
    review(soften(result.review ?? result.signal, result.peeked), result.literal ?? knowable.literal);
    for (const token of result.tokens ?? []) review(soften(token.signal, result.peeked), token.literal);
    if (result.picked && result.signal !== "SUCCESS") review("MISTAKE", result.picked.literal);
  }

  function judge(typed) {
    return buffer.mode.connection.call("/judge", { typed, knowable, recall: knowable.recall });
  }

  function advance(success) {
    if (phase !== "playing") return;
    const recorded = streak.record(session, success, axes.anhieb ?? 0);
    const requeued = recorded.pending.length === session.pending.length;
    const dressed = requeued && success && drawn() ? streak.wear(recorded, dresser(queue)) : recorded;
    session = types.shuffling(axes.random) ? streak.scramble(dressed) : dressed;
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
<Keyboard bind:this={holder} retain={!drawer && LIVE_PHASES.includes(phase) && !staged} data-rep-input data-holder />

<svelte:window {onkeydown} />

<div class="shell" bind:clientWidth={width} bind:clientHeight={height}>
  <main class="player">
    <Handle
      summary={handleSummary}
      hint={LIVE_PHASES.includes(phase) && queue.length ? "completed / set size / reps / set count" : null}
      right={phase === "playing" ? "esc toggles" : "esc"}
      onopen={openDrawer} />

    {#if (phase === "playing" || phase === "drawing") && staged}
      <div class="strip"><div class="fill" style:width="{progress}%"></div></div>
      <div class="play" class:drawing={phase === "drawing"}>
        {#if phase === "drawing"}<div class="veil"><span class="dot"></span></div>{/if}
        <Rep
          retain={holding}
          knowable={staged}
          {axes}
          recall={staged.recall}
          gameplay={staged.gameplay}
          {options}
          {labels}
          {language}
          {status}
          asset={terminal.daemon.getAsset(staged.asset)}
          assetOf={(reference) => terminal.daemon.getAsset(reference)}
          {position}
          total={queue.length}
          first={streak.first(session)}
          missed={streak.current(session)?.missed ?? false}
          compact={tier === "narrow"}
          prompt={staged.prompt}
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
    bind:workbench
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
    gameplay={{ axes, material, labels, locked, startable, startLabel, committing, playing: locked, onstart: begin, onstop: stop, onpreset: preset, onaxes: apply }}
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
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .veil {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--colors-skeleton-0-surface) 70%, transparent);
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

<script>
  import { array, object } from "@vivalence/typology";
  import { ViewportLock } from "@vivalence/drapes";
  import * as types from "../types.js";
  import * as fold from "../fold.js";
  import * as knowables from "./knowables.js";
  import * as streak from "./streak.js";
  import { journal, say, dispatched, spoke } from "./shell.svelte.js";
  import Rep from "./parts/Rep.svelte";
  import Standby from "./parts/Standby.svelte";
  import Header from "./parts/Header.svelte";
  import Console from "./parts/Console.svelte";
  import Inspector from "./parts/Inspector.svelte";
  import Keymap from "./parts/Keymap.svelte";

  const { terminal, buffer } = $props();

  const PICK_OPTIONS = 3;
  const TICK = 1000;
  const EMIT_COUNT = 6;
  const NARROW = 900;
  const RIDE_KEYS = types.AXIS_KEYS.filter((key) => key !== "knowables" && key !== "target");

  const language = terminal.daemon.statics?.language ?? {};
  const labels = { known: language.known?.name, learning: language.learning?.name };

  let axes = $state({ ...types.DEFAULTS, ...(buffer.data ?? {}) });

  const prepare = (set) =>
    set.map((knowable, index) => ({
      ...knowable,
      recall: knowables.recallFor(axes.recall, index),
    }));

  let carriers = $state.raw(knowables.carriers(buffer));
  let queue = $state.raw(prepare(knowables.admit(terminal, carriers, axes)));
  let session = $state.raw(streak.begin(queue, axes.streak));
  let phase = $state(queue.length ? "playing" : "drawing");
  let outcome = $state(null);
  let reps = $state(0);
  let sets = $state(1);
  let reviews = $state(0);
  let elapsed = $state(0);
  let drawing = null;

  const provisioned = Boolean(
    Object.keys(buffer.data ?? {}).length || (buffer.literals ?? []).length,
  );

  let chrome = $state(journal.shell ?? !provisioned);
  let consoleOpen = $state(true);
  let inspectorOpen = $state(true);
  let width = $state(0);
  let view = $state("play");

  const narrow = $derived(width > 0 && width < NARROW);
  const showStage = $derived(!chrome || !narrow || view === "play");
  const showConsole = $derived(chrome && (narrow ? view === "console" : consoleOpen));
  const showInspector = $derived(chrome && (narrow ? view === "inspector" : inspectorOpen));

  function toggleChrome() {
    chrome = !chrome;
    journal.shell = chrome;
  }

  function pane(id) {
    if (narrow) view = id;
    else if (id === "console") consoleOpen = !consoleOpen;
    else inspectorOpen = !inspectorOpen;
  }
  let repPhase = $state("recall");
  let provisioning = $state(false);
  let symbols = $state.raw([]);
  let scope = $state([]);

  const entry = $derived(streak.current(session));
  const knowable = $derived(entry ? queue[entry.index] : null);
  const position = $derived(queue.length - session.pending.length + 1);
  const satisfied = $derived(queue.length - session.pending.length);
  const options = $derived.by(() => {
    if (!entry || !knowable || axes.gameplay !== "PICK") return [];
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

  const keys = $derived.by(() => {
    const playing =
      phase !== "playing"
        ? []
        : repPhase === "preview"
          ? [["⏎", "I'm ready — skip to recall"], ["h", "hint"]]
          : repPhase === "feedback"
            ? [["⏎", "next rep"], ["click chip", "retype to fix"], ["esc", "cancel edit"]]
            : axes.gameplay === "PICK"
              ? [["1-9", "pick option"], ["h", "hint"]]
              : axes.gameplay === "FLIP"
                ? [["space", "reveal"], ["1", "unknown"], ["2", "known"], ["3", "easy"], ["h", "hint"]]
                : [["⏎", "check answer"], ["h", "hint"]];
    return [...playing, ["\\", "chrome"]];
  });

  const bufferJson = $derived(
    JSON.stringify(
      {
        data: {
          ...object.pluck(axes, RIDE_KEYS),
          ...(axes.knowables?.length
            ? {
                knowables: axes.knowables.map((direct) => ({
                  ontology: direct.ontology,
                  known: direct.known,
                  learning: direct.learning,
                })),
              }
            : {}),
        },
        literals: (buffer.literals ?? []).map((literal) => literal.id ?? literal),
        symbols: (buffer.symbols ?? []).map((symbol) => symbol.slug ?? symbol.id ?? symbol),
      },
      null,
      1,
    ),
  );

  function restart() {
    queue = prepare(knowables.admit(terminal, carriers, axes));
    session = streak.begin(queue, axes.streak);
    reps = 0;
    elapsed = 0;
    outcome = null;
    phase = queue.length ? "playing" : "drawing";
  }

  function persist() {
    const data = { ...axes };
    buffer.data = data;
    terminal.daemon.entities.buffer
      .updateOne({ id: buffer.id }, { data })
      .catch((error) => console.warn("[rep-o-gram] axes persist failed", error));
  }

  function apply(patch) {
    const next = { ...axes, ...patch };
    for (const key of Object.keys(patch)) if (patch[key] === undefined) delete next[key];
    axes = next;
    persist();
    say(
      "axes changed",
      Object.keys(patch)
        .map((key) => `${key} = ${JSON.stringify(next[key] ?? null)}`)
        .join(" · ") + " → session restarted.",
      "secondary",
    );
    restart();
  }

  const riding = () => object.pluck(axes, RIDE_KEYS);

  async function reemit(route, input, note) {
    try {
      const result = await buffer.mode.connection.call(route, {
        ...input,
        ...(terminal.thread?.id ? { thread: terminal.thread.id } : {}),
      });
      const [emitted] = result?.output?.buffer ?? [];
      if (!emitted) {
        say(`emit ${route}`, "nothing came back — the draw was exhausted.", "warning");
        return null;
      }
      say(`emit ${route}`, note, "primary");
      const entity = await terminal.daemon.entities.buffer.findOne({ id: emitted.id });
      terminal.buffer = entity ?? emitted;
      return emitted;
    } catch (error) {
      console.warn(`[rep-o-gram] ${route} failed`, error);
      say(`emit ${route}`, String(error?.message ?? error), "error");
      return null;
    }
  }

  function preset(name) {
    reemit(
      `/emit/${name}/feed`,
      { count: EMIT_COUNT },
      `object.merge(PRESET_AXES, input) at the emitter edge — nothing below the merge knows "${name}".`,
    );
  }

  function emitScope() {
    if (!scope.length) return;
    reemit(
      "/emit/symbols",
      { symbols: scope, count: EMIT_COUNT, ...riding() },
      `constrain() folds ${scope.length} slug${scope.length > 1 ? "s" : ""} into one $and per symbol — buffer.symbols stamped for the continuous re-pull.`,
    );
  }

  function emitAdhoc(set) {
    reemit(
      "/emit/knowables",
      { ...riding(), knowables: set },
      `${set.length} caller-authored knowables — no literal ids, reviews skipped, retention untouched.`,
    );
  }

  async function provision(text) {
    spoke("you", text);
    provisioning = true;
    try {
      const out = await buffer.mode.connection.call("/provision", { text });
      spoke("mode", out?.reply ?? "Provisioned.");
      if (out?.axes && Object.keys(out.axes).length) {
        const patch = { ...out.axes };
        for (const key of Object.keys(patch)) if (patch[key] === null) patch[key] = undefined;
        apply(patch);
      }
      if (out?.knowables?.length) {
        emitAdhoc(out.knowables.map(fold.authored));
      } else if (out?.symbols?.length) {
        scope = out.symbols;
        emitScope();
      }
    } catch (error) {
      console.warn("[rep-o-gram] provision failed", error);
      spoke("mode", "Couldn't reach the cortex — drive the axis controls instead.");
    }
    provisioning = false;
  }

  async function loadSymbols() {
    try {
      symbols = (await buffer.mode.connection.call("/symbols", {})) ?? [];
    } catch (error) {
      console.warn("[rep-o-gram] /symbols failed", error);
    }
  }

  async function refill() {
    if (drawing) return drawing;
    phase = "drawing";
    drawing = knowables.refetch(terminal, buffer, axes).catch((error) => {
      console.warn("[rep-o-gram] draw failed", error);
      return [];
    });
    const set = await drawing;
    drawing = null;
    const admitted = knowables.admit(terminal, set, axes);
    if (!admitted.length) return (phase = "empty");
    carriers = set;
    queue = prepare(admitted);
    session = streak.begin(queue, axes.streak);
    phase = "playing";
    say(
      "self-feed",
      `/draw pulled ${admitted.length} knowables — ontology guard merged${axes.prompt === "AUDIO" ? ", listenable filter applied" : ""}.`,
      "primary",
    );
  }

  function finish(kind) {
    outcome = kind;
    phase = "done";
    say(
      kind === "limit" ? "limit reached" : "set complete",
      kind === "limit"
        ? "released mid-flight — the cutoff wins over the streak."
        : `every knowable satisfied in ${session.attempts} attempts.`,
      kind === "limit" ? "warning" : "success",
    );
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
    if (showConsole && !symbols.length) loadSymbols();
  });

  function review(signal, literal, label) {
    if (!literal || !signal) return;
    reviews += 1;
    dispatched(label ?? literal, signal);
    terminal.daemon.connection.call("/review/literal", { signal, scope: { literal } });
  }

  function land(result) {
    review(result.signal, knowable.literal, knowable.learning);
    for (const token of result.tokens ?? []) review(token.signal, token.literal, token.form);
    if (result.picked && result.signal !== "SUCCESS")
      review("MISTAKE", result.picked.literal, result.picked.learning);
  }

  function judge(typed) {
    return buffer.mode.connection.call("/judge", { typed, knowable, recall: knowable.recall });
  }

  function advance(success) {
    const label = knowable?.learning ?? "—";
    const before = session.pending.length;
    session = streak.record(session, success);
    reps += 1;
    const after = session.pending.length;
    if (after < before) say("knowable satisfied", `${label} left the queue — ${after} pending.`, "success");
    else if (!success && axes.streak) say("streak reset", `${label} requeued — runs back to 0.`, "warning");
    if (axes.limit?.reps && reps >= axes.limit.reps) return finish("limit");
    if (!streak.complete(session)) return;
    if (!axes.continuous) return finish("complete");
    sets += 1;
    say("continuous", `set ${sets} — the buffer refetches its own feed.`, "primary");
    refill();
  }

  function onkeydown(event) {
    if (event.key !== "\\") return;
    const target = event.target;
    const repping = target?.hasAttribute?.("data-rep-input");
    if (!repping && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    event.preventDefault();
    toggleChrome();
  }
</script>

<ViewportLock />

<svelte:window {onkeydown} />

<div class="shell" class:narrow bind:clientWidth={width}>
  {#if chrome}
    <Header
      {axes}
      {satisfied}
      total={queue.length}
      seconds={status.seconds}
      {narrow}
      {view}
      {consoleOpen}
      {inspectorOpen}
      onpane={pane} />
  {/if}

  <div class="deck">
    {#if showConsole}
      <Console
        {narrow}
        {axes}
        presets={Object.keys(types.PRESETS)}
        {symbols}
        {scope}
        busy={provisioning}
        {bufferJson}
        onpreset={preset}
        onaxes={apply}
        ontogglesymbol={(slug) =>
          (scope = scope.includes(slug) ? scope.filter((chosen) => chosen !== slug) : [...scope, slug])}
        onemitsymbols={emitScope}
        onadhoc={emitAdhoc}
        onprovision={provision} />
    {/if}

    <main class="player" class:hidden={!showStage}>
      {#if phase === "playing" && knowable}
        <div class="play">
          <Rep
            {knowable}
            {axes}
            recall={knowable.recall}
            {options}
            {labels}
            {status}
            asset={terminal.daemon.getAsset(knowable.asset)}
            {position}
            total={queue.length}
            first={streak.first(session)}
            rep={entry}
            onresult={land}
            onadvance={advance}
            onjudge={judge}
            onphase={(value) => (repPhase = value)}
            onchrome={toggleChrome} />
        </div>
      {:else if phase === "done"}
        <div class="stage">
          <Standby
            kicker={outcome === "limit" ? "limit reached" : "set complete"}
            title={outcome === "limit" ? "Released mid-flight." : "Every knowable satisfied."}
            stats={[
              { key: "attempts", value: session.attempts },
              { key: "knowables", value: queue.length },
              { key: "sets", value: sets },
              { key: "reviews sent", value: reviews },
            ]}
            label="Release →"
            onact={() => buffer.release()} />
        </div>
      {:else if phase === "empty"}
        <div class="stage">
          <Standby
            kicker="standalone · masked buffer"
            title="No knowables in the buffer."
            note="The buffer self-feeds through the mode's own draw — ontology guard merged, listenable filter applied under an AUDIO prompt."
            call={`/draw ${JSON.stringify(knowables.draw(buffer, axes), null, 2)}`}
            label="Self-feed the set"
            onact={refill} />
        </div>
      {:else}
        <div class="idle"><span class="dot"></span></div>
      {/if}

      {#if phase !== "playing"}
        <button class="stray" class:off={!chrome} title="chrome (\)" onclick={toggleChrome}>◨</button>
      {/if}
    </main>

    {#if showInspector}
      <Inspector {narrow} {session} {sets} {queue} />
    {/if}
  </div>

  {#if chrome && !narrow}
    <Keymap {keys} />
  {/if}
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--colors-skeleton-0-surface);
  }
  .shell.narrow {
    max-height: var(--viva-h, 100%);
  }
  .deck {
    flex: 1;
    display: flex;
    align-items: stretch;
    min-height: 0;
    overflow-x: auto;
  }
  .player {
    flex: 1;
    min-width: 480px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .player.hidden {
    display: none;
  }
  .narrow .player {
    min-width: 0;
  }
  .stray {
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 5;
    width: 28px;
    height: 28px;
    border-radius: 0.25rem;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    line-height: 1;
    padding: 0;
  }
  .stray:hover,
  .stray.off {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
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
  }
  .idle {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 2rem;
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

<script>
  import { Section } from "@vivalence/drapes";

  const { terminal, buffer } = $props();

  const GAMES = [
    { key: "flashcard", label: "Flashcard", accent: "#5b8c5a" },
    { key: "write", label: "Translation", accent: "#5b9bd5" },
  ];

  const ONTOLOGIES = [
    { key: "word", label: "Word", on: true },
    { key: "sentence", label: "Sentence", on: true },
    { key: "conjugation", label: "Conjugation", on: false },
  ];

  const SYMBOLS = {
    word: [
      { slug: "proficiency.cefr.a1", label: "a1" },
      { slug: "proficiency.cefr.a2", label: "a2" },
      { slug: "word.part-of-speech.verb", label: "verb" },
      { slug: "word.part-of-speech.noun", label: "noun" },
      { slug: "word.part-of-speech.adjective", label: "adjective" },
    ],
    sentence: [
      { slug: "sentence.mood.indicative", label: "indicative" },
      { slug: "sentence.force.declarative", label: "declarative" },
      { slug: "sentence.force.interrogative", label: "interrogative" },
      { slug: "sentence.tense.present", label: "present" },
      { slug: "sentence.tense.past", label: "past" },
    ],
  };

  const NYAN_MODES = [
    { key: "PLAIN", label: "Plain" },
    { key: "SUDDENDEATH", label: "Sudden Death" },
  ];

  const NYAN_LAYOUTS = [
    { key: "block", label: "Block" },
    { key: "river", label: "River" },
  ];

  const RIDDLE_SUBJECTS = [
    { slug: "domain.weekday", label: "Days" },
    { slug: "domain.month", label: "Months" },
    { slug: "word.part-of-speech.numeral", label: "Numbers" },
  ];

  let count = $state(20);
  let ontology = $state("word");
  let gamePick = $state({ flashcard: true, write: false });
  let symbolPick = $state({});

  const roster = $derived(GAMES.filter((game) => gamePick[game.key]).map((game) => game.key));
  const options = $derived(SYMBOLS[ontology] ?? []);
  const accent = $derived(GAMES.find((game) => gamePick[game.key])?.accent ?? "#5b8c5a");

  let launching = $state(false);
  let note = $state("");

  let nyanCount = $state(20);
  let nyanOntology = $state("word");
  let gameplay = $state("PLAIN");
  let layout = $state("block");
  let nyanLaunching = $state(false);
  let nyanNote = $state("");

  let riddleCount = $state(3);
  let subjectPick = $state({ "domain.weekday": true });
  let riddleLaunching = $state(false);
  let riddleNote = $state("");

  const subjects = $derived(RIDDLE_SUBJECTS.filter((subject) => subjectPick[subject.slug]).map((subject) => subject.slug));

  function bump(delta) {
    count = Math.max(1, Math.min(50, count + delta));
    note = "";
  }

  function bumpNyan(delta) {
    nyanCount = Math.max(5, Math.min(50, nyanCount + delta));
    nyanNote = "";
  }

  function bumpRiddle(delta) {
    riddleCount = Math.max(1, Math.min(5, riddleCount + delta));
    riddleNote = "";
  }

  function setOntology(key) {
    ontology = key;
    note = "";
  }

  function setNyan(field, key) {
    if (field === "ontology") nyanOntology = key;
    if (field === "gameplay") gameplay = key;
    if (field === "layout") layout = key;
    nyanNote = "";
  }

  function toggleGame(key) {
    gamePick = { ...gamePick, [key]: !gamePick[key] };
    note = "";
  }

  function toggleSymbol(slug) {
    symbolPick = { ...symbolPick, [slug]: !symbolPick[slug] };
    note = "";
  }

  function toggleSubject(slug) {
    subjectPick = { ...subjectPick, [slug]: !subjectPick[slug] };
    riddleNote = "";
  }

  async function fire(route, input) {
    const before = new Set(terminal.thread.$buffers.get().map((entry) => entry.id));
    await buffer.mode.emit[route]({ ...input, thread: terminal.thread.id });
    const fresh = terminal.thread.$buffers.get().find((entry) => !before.has(entry.id));
    if (fresh) terminal.buffer = fresh;
    return !!fresh;
  }

  async function launch() {
    if (!roster.length || launching) return;
    launching = true;
    note = "";
    const symbols = options.filter((symbol) => symbolPick[symbol.slug]).map((symbol) => symbol.slug);
    try {
      const landed = await fire("deck", { count, ontology, games: roster, symbols });
      if (!landed) note = "Nothing matched that mix.";
    } finally {
      launching = false;
    }
  }

  async function launchNyan() {
    if (nyanLaunching) return;
    nyanLaunching = true;
    nyanNote = "";
    try {
      const landed = await fire("nyan", { count: nyanCount, ontology: nyanOntology, gameplay, layout });
      if (!landed) nyanNote = "Nothing matched.";
    } finally {
      nyanLaunching = false;
    }
  }

  async function launchRiddle() {
    if (!subjects.length || riddleLaunching) return;
    riddleLaunching = true;
    riddleNote = "";
    try {
      const landed = await fire("riddle", { count: riddleCount, symbols: subjects });
      if (!landed) riddleNote = "No riddles came back.";
    } finally {
      riddleLaunching = false;
    }
  }
</script>

<section class="act" style:--accent={accent}>
  <Section label="Actions" />

  <div class="panel">
    <div class="head">
      <i class="pip"></i>
      <span class="pname">Deck</span>
    </div>

    <div class="row">
      <span class="tag">Reps</span>
      <div class="stepper">
        <button class="step" onclick={() => bump(-5)}>−</button>
        <span class="count">{count}</span>
        <button class="step" onclick={() => bump(5)}>+</button>
      </div>
    </div>

    <div class="row">
      <span class="tag">Ontology</span>
      <div class="seg">
        {#each ONTOLOGIES as choice}
          <button
            class="pill"
            class:on={ontology === choice.key}
            disabled={!choice.on}
            onclick={() => setOntology(choice.key)}
          >
            {choice.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="row">
      <span class="tag">Games</span>
      <div class="seg">
        {#each GAMES as game}
          <button
            class="pill"
            class:on={gamePick[game.key]}
            style:--pin={game.accent}
            onclick={() => toggleGame(game.key)}
          >
            {game.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="row">
      <span class="tag">Symbols</span>
      <div class="seg wrap">
        {#each options as symbol}
          <button
            class="pill code"
            class:on={symbolPick[symbol.slug]}
            onclick={() => toggleSymbol(symbol.slug)}
          >
            {symbol.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="foot">
      {#if note}<span class="note">{note}</span>{/if}
      <button class="launch" disabled={!roster.length || launching} onclick={launch}>
        {launching ? "Launching…" : "Launch"}
        <span class="arrow">→</span>
      </button>
    </div>
  </div>

  <div class="panel" style:--accent="#c77dbb">
    <div class="head">
      <i class="pip"></i>
      <span class="pname">Nyan</span>
      <span class="phint">typing trainer · type the words back</span>
    </div>

    <div class="row">
      <span class="tag">Reps</span>
      <div class="stepper">
        <button class="step" onclick={() => bumpNyan(-5)}>−</button>
        <span class="count">{nyanCount}</span>
        <button class="step" onclick={() => bumpNyan(5)}>+</button>
      </div>
    </div>

    <div class="row">
      <span class="tag">Ontology</span>
      <div class="seg">
        {#each ONTOLOGIES as choice}
          <button
            class="pill"
            class:on={nyanOntology === choice.key}
            disabled={!choice.on}
            onclick={() => setNyan("ontology", choice.key)}
          >
            {choice.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="row">
      <span class="tag">Mode</span>
      <div class="seg">
        {#each NYAN_MODES as choice}
          <button class="pill" class:on={gameplay === choice.key} onclick={() => setNyan("gameplay", choice.key)}>
            {choice.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="row">
      <span class="tag">Layout</span>
      <div class="seg">
        {#each NYAN_LAYOUTS as choice}
          <button class="pill" class:on={layout === choice.key} onclick={() => setNyan("layout", choice.key)}>
            {choice.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="foot">
      {#if nyanNote}<span class="note">{nyanNote}</span>{/if}
      <button class="launch" disabled={nyanLaunching} onclick={launchNyan}>
        {nyanLaunching ? "Launching…" : "Launch"}
        <span class="arrow">→</span>
      </button>
    </div>
  </div>

  <div class="panel" style:--accent="#d0a24c">
    <div class="head">
      <i class="pip"></i>
      <span class="pname">Riddle</span>
      <span class="phint">the riddler duels you · one guess at a time</span>
    </div>

    <div class="row">
      <span class="tag">Subjects</span>
      <div class="seg">
        {#each RIDDLE_SUBJECTS as subject}
          <button
            class="pill"
            class:on={subjectPick[subject.slug]}
            onclick={() => toggleSubject(subject.slug)}
          >
            {subject.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="row">
      <span class="tag">Riddles</span>
      <div class="stepper">
        <button class="step" onclick={() => bumpRiddle(-1)}>−</button>
        <span class="count">{riddleCount}</span>
        <button class="step" onclick={() => bumpRiddle(1)}>+</button>
      </div>
    </div>

    <div class="foot">
      {#if riddleNote}<span class="note">{riddleNote}</span>{/if}
      <button class="launch" disabled={!subjects.length || riddleLaunching} onclick={launchRiddle}>
        {riddleLaunching ? "Summoning…" : "Launch"}
        <span class="arrow">→</span>
      </button>
    </div>
  </div>
</section>

<style>
  .panel {
    margin-top: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    padding: 0.9rem 1rem;
    border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
    border-left: 3px solid var(--accent);
    border-radius: 0.7rem;
    background: color-mix(in srgb, var(--accent) 6%, transparent);
  }
  .head {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }
  .pip {
    align-self: center;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 7px color-mix(in srgb, var(--accent) 60%, transparent);
  }
  .pname {
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-md);
    font-weight: 700;
    color: var(--accent);
  }
  .phint {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    color: var(--colors-skeleton-1-boundary);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
  .tag {
    flex: 0 0 5.2rem;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--colors-skeleton-1-boundary);
  }
  .seg {
    display: flex;
    gap: 0.4rem;
    min-width: 0;
  }
  .seg.wrap {
    flex-wrap: wrap;
  }
  .pill {
    padding: 0.28rem 0.7rem;
    border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
    border-radius: 0.4rem;
    background: transparent;
    color: var(--colors-skeleton-1-boundary);
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s,
      color 0.15s;
  }
  .pill.code {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
  }
  .pill:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
  }
  .pill.on {
    background: color-mix(in srgb, var(--pin, var(--accent)) 20%, transparent);
    border-color: var(--pin, var(--accent));
    color: color-mix(in srgb, var(--pin, var(--accent)) 85%, white 15%);
  }
  .pill:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .stepper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .step {
    width: 1.7rem;
    height: 1.7rem;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: 0.4rem;
    background: transparent;
    color: var(--accent);
    font-size: var(--font-size-md);
    line-height: 1;
    cursor: pointer;
  }
  .step:hover {
    background: color-mix(in srgb, var(--accent) 14%, transparent);
  }
  .count {
    min-width: 2ch;
    text-align: center;
    font-family: var(--font-family-code);
    font-size: var(--font-size-md);
    font-weight: 700;
    color: var(--accent);
  }
  .foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
    margin-top: 0.2rem;
  }
  .note {
    margin-right: auto;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    color: color-mix(in srgb, #d0a24c 88%, white 12%);
  }
  .launch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 1.2rem;
    border: 1px solid var(--accent);
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    color: color-mix(in srgb, var(--accent) 90%, white 10%);
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-md);
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 0.12s,
      background 0.2s;
  }
  .launch:hover:not(:disabled) {
    transform: translateY(-1px);
    background: color-mix(in srgb, var(--accent) 26%, transparent);
  }
  .launch:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .arrow {
    font-size: var(--font-size-sm);
  }
</style>

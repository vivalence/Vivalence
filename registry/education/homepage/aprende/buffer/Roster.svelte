<script>
  import { atom } from "@vivalence/typology";

  // the games currently in play on this thread — a reactive reader over the thread's
  // buffer pool. Each emitted exercise (activation → nyan, drill → write/judge/…, riddle
  // → riddler) lands here as a buffer; click one to jump straight back into it.
  //
  // `current` is the hub buffer this strip lives in — excluded from its own roster.
  const { terminal, current } = $props();

  // three reactive chains through the terminal:
  //  · $buffers — the thread's live pool (computed off the daemon buffer store)
  //  · $active  — the render cursor, for the "you are here" highlight
  //  · $modes   — the fully-resolved mode entities. buffer.mode arrives as a bare id
  //    string (the boot never populates it), so labels/accents are resolved by id
  //    against this store — and fill in reactively once modes finish loading.
  const buffers = atom.chain(terminal, "$thread", "$buffers");
  const active = atom.chain(terminal, "$buffer");
  const modes = atom.chain(terminal, "$thread", "daemon", "entities", "mode", "$entities");

  const modeIndex = $derived(new Map(($modes ?? []).map((mode) => [mode.id, mode])));

  // buffer.mode is a union: full Mode entity | { id } | bare id string. Extract the id,
  // then prefer the canonical resolved entity; fall back to an already-shaped ref.
  function resolveMode(buffer) {
    const reference = buffer?.mode;
    const id = reference && typeof reference === "object" ? reference.id : reference;
    return modeIndex.get(id) ?? (reference?.slug != null ? reference : null);
  }

  // game-family accents, echoing the action tiles; unknown slugs get a stable hashed hue.
  const ACCENTS = {
    nyan: "#1EBCB5",
    riddler: "#8b95d6",
    write: "#5b9bd5",
    shadow: "#5b9bd5",
    judge: "#5b8c5a",
    listen: "#5b8c5a",
    pick: "#5b8c5a",
    match: "#5b8c5a",
    flashcard: "#5b8c5a",
    conjugation: "#c4a35a",
    paradigm: "#c4a35a",
    cloze: "#c4715a",
    exhibit: "#c4715a",
  };
  function accentOf(slug = "") {
    if (ACCENTS[slug]) return ACCENTS[slug];
    let hash = 0;
    for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) | 0;
    return `hsl(${((hash % 360) + 360) % 360} 52% 62%)`;
  }

  // status → a dot tint (the only per-state signal on the tile).
  const DOT = {
    PENDING: "#1EBCB5",
    ACTIVE: "#e7c271",
    DONE: "#5b8c5a",
    ERROR: "#c4715a",
    STALE: "#8b8b93",
  };

  // the roster: every game buffer on the thread except this hub, newest emit last.
  const roster = $derived(
    [...($buffers ?? [])]
      .filter((buffer) => buffer.id !== current?.id)
      .map((buffer) => ({ buffer, mode: resolveMode(buffer) }))
      .filter((row) => row.mode?.type === "game")
      .map(({ buffer, mode }) => ({
        buffer,
        name: mode.name ?? mode.slug,
        accent: accentOf(mode.slug),
        dot: DOT[buffer.status] ?? "#8b8b93",
      }))
      .sort((a, b) => (a.buffer.index ?? 0) - (b.buffer.index ?? 0)),
  );

  // load = the transparent terminal setter; the stall reacts and renders the buffer.
  const load = (buffer) => (terminal.buffer = buffer);
</script>

{#if roster.length}
  <div class="roster">
    <span class="roster-label">In play <b>{roster.length}</b></span>
    <div class="tray">
      {#each roster as row (row.buffer.id)}
        <button
          class="game"
          class:active={$active?.id === row.buffer.id}
          style:--accent={row.accent}
          onclick={() => load(row.buffer)}
          title={row.name}>
          <i class="game-dot" style:background={row.dot}></i>
          <span class="game-name">{row.name}</span>
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .roster {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .roster-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs, 0.65rem);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--colors-skeleton-1-boundary);
  }
  .roster-label b {
    color: color-mix(in srgb, var(--colors-skeleton-1-contrast) 85%, transparent);
    font-weight: 700;
  }
  /* the tray — a horizontal deck of the pending games; scrolls when a drill fills it. */
  .tray {
    display: flex;
    gap: 0.55rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    scrollbar-width: thin;
    scroll-snap-type: x proximity;
  }
  /* squarish game card — same border language as the action tiles: 1px accent border,
     3px accent bar on the left, flat tinted fill, lift + brighten on hover. */
  .game {
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 0 0 auto;
    min-width: 4.3rem;
    height: 3.95rem;
    padding: 0.5rem 0.55rem;
    border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
    border-left: 3px solid var(--accent);
    border-radius: 0.55rem;
    background: color-mix(in srgb, var(--accent) 7%, transparent);
    cursor: pointer;
    text-align: left;
    transition:
      transform 0.12s,
      border-color 0.2s,
      background 0.2s;
  }
  .game:hover {
    transform: translateY(-2px);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    border-color: color-mix(in srgb, var(--accent) 70%, transparent);
  }
  .game.active {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
  }
  .game-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex: 0 0 auto;
    box-shadow: 0 0 5px color-mix(in srgb, currentColor 45%, transparent);
  }
  .game-name {
    font-family: var(--font-family-serif-heading);
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--accent);
    white-space: nowrap;
  }
</style>

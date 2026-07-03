<script>
  import { Section } from "@vivalence/drapes";
  import { TEAL } from "./palette.js";

  const { terminal, buffer } = $props();

  // direct navigation (spawner pattern): fire one of this mode's emitters, which
  // pools one-or-more game buffers into this thread, then render the first. quitting
  // the exercise releases its buffer and drops back through the deck to this hub view.
  async function runAction(route, input) {
    // thread binds the emitted buffers to this thread (daemon emitter trait sets
    // buffer.thread only when ctx.input.thread is present) → they join $buffers.
    // capture the prior set so we can jump to the first freshly-emitted buffer,
    // whatever game mode produced it (drill emits a mixed deck; riddle emits one).
    const before = new Set(terminal.thread.$buffers.get().map((b) => b.id));
    await buffer.mode.emit[route]({ ...input, thread: terminal.thread.id });
    const fresh = terminal.thread.$buffers.get().find((b) => !before.has(b.id));
    if (fresh) terminal.buffer = fresh;
  }

  const actions = [
    {
      name: "Activation",
      cmd: "/activation",
      accent: TEAL,
      blurb: "Type your weakest words — graded to memory.",
      run: () => runAction("activation", { ontology: "word", count: 20 }),
    },
    {
      name: "Drill",
      cmd: "/drill",
      accent: "#5b9bd5",
      blurb: "Due review — each word its own exercise, picked by how you know it.",
      run: () => runAction("drill", { count: 20 }),
    },
    {
      name: "Riddler",
      cmd: "/riddle",
      accent: "#8b95d6",
      blurb: "Solve a riddle the tutor spins from your weakest words.",
      run: () => runAction("riddle", { count: 1 }),
    },
  ];
</script>

<section class="act">
  <Section label="Actions" />
  <div class="tiles">
    {#each actions as action}
      <button class="tile" style:--accent={action.accent} onclick={action.run}>
        <i class="tile-pip"></i>
        <span class="tile-name">{action.name}</span>
        <span class="tile-blurb">{action.blurb}</span>
        <span class="tile-cmd">{action.cmd}</span>
        <span class="tile-arrow">→</span>
      </button>
    {/each}
  </div>
</section>

<style>
  /* actions — wide tinted tiles, command chip + arrow */
  .tiles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;
    margin-top: 0.6rem;
  }
  @container (max-width: 720px) {
    .tiles {
      grid-template-columns: 1fr;
    }
  }
  .tile {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-width: 0;
    padding: 0.8rem 1rem;
    border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
    border-left: 3px solid var(--accent);
    border-radius: 0.7rem;
    background: color-mix(in srgb, var(--accent) 7%, transparent);
    cursor: pointer;
    text-align: left;
    transition:
      transform 0.12s,
      border-color 0.2s,
      background 0.2s;
  }
  .tile:hover {
    transform: translateY(-2px);
    background: color-mix(in srgb, var(--accent) 14%, transparent);
    border-color: color-mix(in srgb, var(--accent) 70%, transparent);
  }
  .tile-pip {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    flex: 0 0 auto;
    box-shadow: 0 0 7px color-mix(in srgb, var(--accent) 60%, transparent);
  }
  .tile-name {
    flex: 0 0 auto;
    font-family: var(--font-family-serif-heading);
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--accent);
  }
  .tile-blurb {
    flex: 1 1 auto;
    min-width: 0;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-sm);
    color: var(--colors-skeleton-1-boundary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile-cmd {
    flex: 0 0 auto;
    padding: 0.15rem 0.5rem;
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: 0.35rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: color-mix(in srgb, var(--accent) 85%, white 15%);
  }
  .tile-arrow {
    flex: 0 0 auto;
    font-size: var(--font-size-md, 0.875rem);
    color: var(--accent);
  }
</style>

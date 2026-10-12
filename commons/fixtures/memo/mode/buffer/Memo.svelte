<script>
  const { terminal, buffer } = $props();

  let deck = $state(null);
  let index = $state(0);
  let revealed = $state(false);
  let done = $state({ AGAIN: 0, HARD: 0, GOOD: 0, EASY: 0 });
  let finished = $state(false);

  const dealt = buffer.data.deck;
  if (dealt === undefined) buffer.mode.call.deck({ limit: 10 }).then((held) => (deck = held));
  else deck = { language: buffer.data.language, cards: dealt };

  const literal = $derived(deck === null ? null : (deck.cards[index] ?? null));
  const language = $derived(deck === null ? null : deck.language);
  const total = $derived(deck === null ? 0 : deck.cards.length);
  const reviewed = $derived(done.AGAIN + done.HARD + done.GOOD + done.EASY);

  const NUMERALS = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  const roman = (n) =>
    NUMERALS.reduce(([s, r], [v, sym]) => {
      while (r >= v) { s += sym; r -= v; }
      return [s, r];
    }, ["", n])[0] || "0";

  const horizon = (hours) =>
    hours < 1 ? `${Math.max(1, Math.round(hours * 60))}m` : hours < 48 ? `${Math.round(hours)}h` : `${Math.round(hours / 24)}d`;

  function grade(signal) {
    buffer.mode.call.grade({ card: literal.slug, signal, thread: terminal.thread.id });
    done[signal]++;
    if (index + 1 < total) {
      index++;
      revealed = false;
    } else {
      finished = true;
    }
  }

  const buttons = [
    { signal: "AGAIN", label: "Iterum", gloss: "again", color: "#8c2d19" },
    { signal: "HARD", label: "Durum", gloss: "hard", color: "#a4681f" },
    { signal: "GOOD", label: "Bene", gloss: "good", color: "#5a6b3b" },
    { signal: "EASY", label: "Facile", gloss: "easy", color: "#5b4a7a" },
  ];
</script>

<div class="memo">
  {#if deck === null}
    <div class="empty">Paramus — dealing.</div>
  {:else if !literal && !finished}
    <div class="empty">Nihil recolendum. Redi postea — nothing to review, return later.</div>
  {:else if finished}
    <div class="summary">
      <div class="laurel">— ⚘ —</div>
      <h2>Sessio Peracta</h2>
      <p>{roman(reviewed)} cards reviewed</p>
      <button class="show" onclick={() => buffer.release()}>Vale — close</button>
      <div class="tallies">
        {#each buttons as b}
          <span style="color: {b.color}">{b.label} · {done[b.signal]}</span>
        {/each}
      </div>
    </div>
  {:else}
    <div class="meta">
      <span class="counter">{roman(index + 1)} · {roman(total)}</span>
      <span class="status">{literal.status}</span>
      <span class="kind">{literal.ontology === "word" ? "verbum" : "sententia"}</span>
    </div>

    <div class="tablet" class:revealed>
      <div class="front">
        <div class="label">{language.known}</div>
        <div class="text">{literal.known}</div>
      </div>

      {#if revealed}
        <div class="back">
          <div class="label">{language.learning}</div>
          <div class="text answer">{literal.learning}</div>
          {#if literal.example !== null}
            <div class="example">{literal.example.learning} — {literal.example.known}</div>
          {/if}
          {#if literal.picture !== null}
            <img class="picture" src={literal.picture} alt={literal.learning} />
          {/if}
          {#if literal.voice !== null}
            <audio controls src={literal.voice}></audio>
          {/if}
        </div>
      {/if}
    </div>

    {#if !revealed}
      <button class="show" onclick={() => (revealed = true)}>Revela — show answer</button>
    {:else}
      <div class="grades">
        {#each buttons as b}
          <button style="background: {b.color}" onclick={() => grade(b.signal)}>
            <span class="grade-label">{b.label}</span>
            <span class="gloss">{b.gloss}</span>
            <span class="eta">{horizon(literal.preview[b.signal])}</span>
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .memo {
    max-width: 34rem;
    margin: 0 auto;
    padding: 1.25rem;
    font-family: Georgia, "Times New Roman", serif;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: linear-gradient(180deg, #ede3cf 0%, #e4d6bc 100%);
    border: 1px solid #c9b892;
    border-radius: 0.25rem;
    color: #3b3226;
  }
  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #8a7a5e;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-variant: small-caps;
  }
  .tablet {
    border: 1px solid #c9b892;
    border-top: 3px double #a4681f;
    border-bottom: 3px double #a4681f;
    padding: 2.25rem 1.75rem;
    min-height: 11rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: linear-gradient(180deg, #f6efdd 0%, #efe5cd 100%);
    box-shadow: inset 0 0 24px rgba(140, 110, 60, 0.12);
  }
  .label {
    font-size: 0.65rem;
    color: #a4681f;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    margin-bottom: 0.35rem;
  }
  .text {
    font-size: 1.6rem;
    line-height: 1.3;
  }
  .answer {
    color: #6d1f12;
  }
  .back {
    border-top: 1px solid #d8c7a2;
    padding-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .example {
    font-size: 0.95rem;
    color: #6f6250;
    font-style: italic;
  }
  .picture {
    width: 6rem;
    height: 6rem;
    border-radius: 0.2rem;
    border: 1px solid #c9b892;
    object-fit: cover;
  }
  .show {
    padding: 0.95rem;
    font-size: 1rem;
    font-family: inherit;
    letter-spacing: 0.08em;
    border: 1px solid #6d5a3a;
    border-radius: 0.2rem;
    background: #4a3f2e;
    color: #f0e6d0;
    cursor: pointer;
  }
  .grades {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  .grades button {
    padding: 0.7rem 0.25rem;
    border: none;
    border-radius: 0.2rem;
    color: #f4ecd9;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
  }
  .grade-label {
    font-size: 0.95rem;
    letter-spacing: 0.05em;
  }
  .gloss {
    font-size: 0.6rem;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }
  .eta {
    font-size: 0.7rem;
    opacity: 0.9;
  }
  .empty,
  .summary {
    text-align: center;
    padding: 3rem 1rem;
    color: #5c4f3c;
  }
  .laurel {
    color: #5a6b3b;
    letter-spacing: 0.5em;
    margin-bottom: 0.5rem;
  }
  .summary h2 {
    font-variant: small-caps;
    letter-spacing: 0.15em;
    font-weight: normal;
  }
  .tallies {
    display: flex;
    justify-content: center;
    gap: 1.25rem;
    margin-top: 0.75rem;
  }
</style>

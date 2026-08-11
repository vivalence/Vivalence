<script>
  import { string } from "@vivalence/typology";
  import * as fold from "../../fold.js";
  import { journal } from "../shell.svelte.js";

  const {
    narrow = false,
    axes,
    presets,
    symbols = [],
    scope = [],
    busy = false,
    bufferJson,
    onpreset,
    onaxes,
    ontogglesymbol,
    onemitsymbols,
    onadhoc,
    onprovision,
  } = $props();

  let query = $state("");
  let adhoc = $state("");
  let request = $state("");

  const seg = (label, active, patch) => ({ label, active, patch });

  const limitPatch = (part) => {
    const merged = { ...(axes.limit ?? {}), ...part };
    for (const key of Object.keys(merged)) if (merged[key] == null) delete merged[key];
    return { limit: Object.keys(merged).length ? merged : undefined };
  };

  const rows = $derived([
    {
      key: "gameplay",
      note: "TYPE · PICK · FLIP",
      segments: ["TYPE", "PICK", "FLIP"].map((value) =>
        seg(value, axes.gameplay === value, { gameplay: value }),
      ),
    },
    {
      key: "prompt",
      note: "AUDIO filters listenable",
      segments: ["TEXT", "AUDIO"].map((value) => seg(value, axes.prompt === value, { prompt: value })),
    },
    {
      key: "recall",
      note: "omit = random per knowable",
      segments: [
        seg("random", !axes.recall, { recall: undefined }),
        seg("KNOWN", axes.recall === "KNOWN", { recall: "KNOWN" }),
        seg("LEARNING", axes.recall === "LEARNING", { recall: "LEARNING" }),
      ],
    },
    {
      key: "streak",
      note: axes.streak ? `${axes.streak} consecutive per knowable` : "absent = single pass",
      segments: [
        seg("off", !axes.streak, { streak: undefined }),
        seg("−", false, { streak: Math.max(1, (axes.streak || 1) - 1) }),
        seg(String(axes.streak || 1), Boolean(axes.streak), { streak: axes.streak || 1 }),
        seg("+", false, { streak: Math.min(9, (axes.streak || 0) + 1) }),
      ],
    },
    {
      key: "preview",
      note: "TYPE only · first rep",
      segments: [
        seg("off", !axes.preview, { preview: undefined }),
        ...["FAST", "NORMAL", "SLOW"].map((rate) =>
          seg(rate, axes.preview?.speed?.rate === rate, { preview: { speed: { rate } } }),
        ),
      ],
    },
    {
      key: "forgiving",
      note: "string.fold on match",
      segments: [
        seg("true", axes.forgiving !== false, { forgiving: true }),
        seg("false", axes.forgiving === false, { forgiving: false }),
      ],
    },
    {
      key: "continuous",
      note: "refetch on completion",
      segments: [
        seg("off", !axes.continuous, { continuous: undefined }),
        seg("on", Boolean(axes.continuous), { continuous: true }),
      ],
    },
    {
      key: "limit.reps",
      note: axes.limit?.reps ? `max ${axes.limit.reps} attempts` : "no rep cutoff",
      segments: [
        seg("off", !axes.limit?.reps, limitPatch({ reps: undefined })),
        seg("−", false, limitPatch({ reps: Math.max(1, (axes.limit?.reps || 6) - 2) })),
        seg(String(axes.limit?.reps || 6), Boolean(axes.limit?.reps), limitPatch({ reps: axes.limit?.reps || 6 })),
        seg("+", false, limitPatch({ reps: axes.limit?.reps ? axes.limit.reps + 2 : 6 })),
      ],
    },
    {
      key: "limit.seconds",
      note: axes.limit?.seconds ? "releases even mid-streak" : "no time cutoff",
      segments: [
        seg("off", !axes.limit?.seconds, limitPatch({ seconds: undefined })),
        seg("−", false, limitPatch({ seconds: Math.max(30, (axes.limit?.seconds || 60) - 30) })),
        seg(`${axes.limit?.seconds || 60}s`, Boolean(axes.limit?.seconds), limitPatch({ seconds: axes.limit?.seconds || 60 })),
        seg("+", false, limitPatch({ seconds: axes.limit?.seconds ? axes.limit.seconds + 30 : 60 })),
      ],
    },
  ]);

  const chips = $derived(
    symbols.filter((symbol) => !query || string.fold(symbol.slug).includes(string.fold(query))),
  );

  const parsed = $derived(
    adhoc
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [learning, known] = line.split(/\s*=\s*/);
        if (!learning?.trim() || !known?.trim()) return null;
        return fold.authored({ learning: learning.trim(), known: known.trim() });
      })
      .filter(Boolean),
  );

  function provision() {
    const text = request.trim();
    if (!text || busy) return;
    request = "";
    onprovision(text);
  }
</script>

<aside class="console" class:full={narrow}>
  <div class="rule">
    <span class="rule-label">axis console</span>
    <span class="rule-line"></span>
  </div>

  <div class="section-label">presets · emitter-side bundles</div>
  <div class="chips">
    {#each presets as preset (preset)}
      <button class="chip" onclick={() => onpreset(preset)}>{preset}</button>
    {/each}
  </div>

  <div class="controls">
    {#each rows as row (row.key)}
      <div class="control">
        <div class="control-head">
          <span class="control-key">{row.key}</span>
          <span class="control-note">{row.note}</span>
        </div>
        <div class="segments">
          {#each row.segments as segment, index (row.key + index)}
            <button class="segment" class:active={segment.active} onclick={() => onaxes(segment.patch)}>
              {segment.label}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="rule">
    <span class="rule-label">daemon · symbols</span>
    <span class="rule-line"></span>
  </div>
  <input class="field" bind:value={query} placeholder="filter symbol slugs…" />
  <div class="chips scrollable">
    {#each chips as symbol (symbol.slug)}
      <button
        class="chip mono"
        class:active={scope.includes(symbol.slug)}
        onclick={() => ontogglesymbol(symbol.slug)}>
        <span>{symbol.slug}</span>
        <span class="chip-count">{symbol.literals}</span>
      </button>
    {/each}
  </div>
  <div class="footnote">
    {scope.length
      ? `${scope.length} symbol${scope.length > 1 ? "s" : ""} — AND per symbol`
      : "no scope — pick symbols to constrain the draw"}
  </div>
  <button class="wide" class:armed={scope.length} disabled={!scope.length} onclick={onemitsymbols}>
    emit /symbols
  </button>

  <div class="rule">
    <span class="rule-label">ad hoc knowables</span>
    <span class="rule-line"></span>
  </div>
  <textarea
    class="field area"
    rows="4"
    bind:value={adhoc}
    placeholder={"una parola = a word\nIl treno parte alle otto. = The train leaves at eight."}></textarea>
  <button class="wide adhoc" disabled={!parsed.length} onclick={() => onadhoc(parsed)}>
    emit /knowables · retention untouched
  </button>

  <div class="rule">
    <span class="rule-label">provision · inline</span>
    <span class="rule-line"></span>
  </div>
  <div class="chat">
    {#each journal.chat as message, index (index)}
      <div class="message" class:you={message.who === "you"}>{message.text}</div>
    {/each}
  </div>
  <input
    class="field"
    bind:value={request}
    placeholder="audio sentences about the kitchen, streak 3, 10 min"
    onkeydown={(event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        provision();
      }
      event.stopPropagation();
    }} />
  <div class="provision-row">
    <button class="provision" disabled={busy} onclick={provision}>provision ⏎</button>
    <span class="footnote">
      {busy ? "provisioning…" : "the schema descriptions are the documentation the model reads"}
    </span>
  </div>

  <div class="rule">
    <span class="rule-label">emitted buffer</span>
    <span class="rule-line"></span>
  </div>
  <pre class="json">{bufferJson}</pre>
</aside>

<style>
  .console {
    flex: none;
    width: 304px;
    box-sizing: border-box;
    background: var(--colors-skeleton-0-surface);
    border-right: 1px solid var(--colors-skeleton-1-boundary);
    padding: 1.125rem 1.125rem 3.75rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .console.full {
    flex: 1;
    width: 100%;
    border-right: none;
  }
  .rule {
    display: flex;
    align-items: center;
    gap: 0.5625rem;
    margin: 1.5rem 0 0.625rem;
  }
  .rule:first-child {
    margin-top: 0;
  }
  .rule-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-support);
    white-space: nowrap;
  }
  .rule-line {
    flex: 1;
    height: 1px;
    background: var(--colors-skeleton-1-boundary);
  }
  .section-label {
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-support);
    margin-bottom: 0.5rem;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3125rem;
    margin-bottom: 0.75rem;
  }
  .scrollable {
    max-height: 150px;
    overflow-y: auto;
    margin-top: 0.5625rem;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    padding: 5px 10px;
    border-radius: 3px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
  }
  .chip:hover {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
  }
  .chip.active {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
  }
  .mono {
    font-family: var(--font-family-code);
  }
  .chip-count {
    opacity: 0.55;
  }
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.8125rem;
  }
  .control-head {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.3125rem;
    overflow: hidden;
  }
  .control-key {
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-primary);
  }
  .control-note {
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .segments {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .segment {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    padding: 5px 9px;
    border-radius: 3px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
  }
  .segment.active {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
    background: var(--colors-skeleton-2-surface);
  }
  .field {
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.625rem;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    color: var(--text-primary);
    background: var(--colors-skeleton-1-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 4px;
    outline: none;
  }
  .field:focus {
    border-color: var(--colors-theme-primary-contrast);
  }
  .area {
    font-family: var(--font-family-code);
    line-height: 1.5;
    resize: vertical;
  }
  .footnote {
    font-size: var(--font-size-2xs);
    color: var(--text-support);
    margin-top: 0.5625rem;
    line-height: 1.45;
  }
  .wide {
    margin-top: 0.5625rem;
    width: 100%;
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    padding: 0.5625rem;
    border-radius: 4px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--text-support);
    cursor: pointer;
  }
  .wide:disabled {
    cursor: default;
    opacity: 0.6;
  }
  .wide.armed {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
  }
  .adhoc:not(:disabled):hover {
    border-color: var(--colors-theme-secondary-contrast);
    color: var(--colors-theme-secondary-contrast);
  }
  .chat {
    display: flex;
    flex-direction: column;
    gap: 0.4375rem;
    max-height: 210px;
    overflow-y: auto;
    margin-bottom: 0.5625rem;
  }
  .message {
    align-self: flex-start;
    max-width: 92%;
    padding: 0.5rem 0.625rem;
    border-radius: 5px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--text-body);
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }
  .message.you {
    align-self: flex-end;
    background: var(--colors-skeleton-2-surface);
    color: var(--text-primary);
  }
  .provision-row {
    display: flex;
    align-items: center;
    gap: 0.5625rem;
    margin-top: 0.5rem;
  }
  .provision-row .footnote {
    margin-top: 0;
  }
  .provision {
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-xs);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 1px solid var(--colors-theme-secondary-contrast);
    background: transparent;
    color: var(--colors-theme-secondary-contrast);
    cursor: pointer;
    white-space: nowrap;
  }
  .provision:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .json {
    background: var(--colors-skeleton-1-surface);
    border: 1px solid var(--colors-skeleton-1-boundary);
    border-radius: 5px;
    padding: 0.75rem;
    margin: 0;
    font-family: var(--font-family-code);
    font-size: var(--font-size-2xs);
    line-height: 1.55;
    color: var(--text-body);
    white-space: pre-wrap;
    word-break: break-word;
    overflow-x: auto;
  }
</style>

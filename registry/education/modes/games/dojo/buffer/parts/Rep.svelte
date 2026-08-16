<script>
  import { Desk, Pip } from "@vivalence/drapes";
  import * as fold from "../../fold.js";
  import * as judge from "../judge.js";
  import * as knowables from "../knowables.js";
  import * as streak from "../streak.js";
  import Prompt from "./Prompt.svelte";
  import Table from "./Table.svelte";
  import TypeInput from "./TypeInput.svelte";
  import PickOptions from "./PickOptions.svelte";
  import FlipReveal from "./FlipReveal.svelte";
  import TokenFeedback from "./TokenFeedback.svelte";

  const {
    knowable,
    axes,
    prompt = axes.prompt,
    recall,
    gameplay,
    options = [],
    labels,
    language = {},
    status,
    asset = null,
    assetOf = () => null,
    position,
    total,
    first,
    missed = false,
    compact = false,
    rep,
    onresult,
    onadvance,
    onjudge,
    onphase,
    onchrome,
    retain = false,
  } = $props();

  const SPEED = { FAST: 1200, NORMAL: 2400, SLOW: 3600 };
  const HOLD = 600;
  const MULTIPLIER = 40;
  const PICK_PAUSE = { SUCCESS: 800, MISTAKE: 1500 };
  const POSITIVE = ["MASTERY", "SUCCESS", "NEUTRAL"];

  const table = $derived(fold.table(knowable) && gameplay === "CONJUGATE");
  const tokens = $derived(table ? (knowable.tokens ?? []) : []);
  const answer = $derived(judge.expected(knowable, recall));
  const answerLabel = $derived(recall === "KNOWN" ? labels.known : labels.learning);
  const side = (which) => (which === "KNOWN" ? language.known : language.learning) ?? null;
  const method = $derived(judge.method(knowable, gameplay));
  const answerExample = $derived(
    knowable.example && (recall === "KNOWN" ? knowable.example.known : knowable.example.learning),
  );

  const previewing = $derived(
    (gameplay === "TYPE" || gameplay === "CONJUGATE") &&
      knowables.previews(axes.preview, { first, missed, signal: knowable.signal ?? null, status: knowable.status ?? null }),
  );
  const speed = $derived.by(() => {
    const configured = axes.preview?.speed ?? {};
    return {
      base: configured.base ?? SPEED[configured.rate] ?? SPEED.NORMAL,
      multiplier: configured.multiplier ?? MULTIPLIER,
    };
  });
  const answerLength = $derived(
    table ? tokens.reduce((sum, token) => sum + (token.form?.length ?? 0), 0) : (answer?.length ?? 0),
  );
  const span = $derived(previewing ? speed.base + answerLength * speed.multiplier : 0);

  const cellsFor = (list) => list.map(() => ({ typed: "", signal: null, first: null, committed: false, corrected: false }));
  const recallsFor = (list) => list.map(() => knowables.recallFor(axes.recall));

  let phase = $state(previewing ? "preview" : "recall");
  let typed = $state("");
  let picked = $state(null);
  let revealed = $state(false);
  let pending = $state(false);
  let released = $state(false);
  let result = $state(null);
  let hinted = $state(false);
  let cells = $state(cellsFor(tokens));
  let cellSession = $state(streak.begin(tokens, 0));
  let recalls = $state(recallsFor(tokens));
  let editing = $state(null);
  let peeked = $state(previewing);
  let countdown = null;
  let pressing = null;
  let current = rep;

  const activeCell = $derived(table ? streak.current(cellSession) : null);
  const activeToken = $derived(activeCell ? tokens[activeCell.index] : null);
  const cellExpected = (index) => (recalls[index] === "KNOWN" ? tokens[index].gloss : tokens[index].form);
  const cellLabel = $derived(
    editing != null
      ? `correct · ${[tokens[editing]?.person, tokens[editing]?.number].filter(Boolean).join(" ")}`
      : activeToken
        ? `${[activeToken.person, activeToken.number].filter(Boolean).join(" ")} · ${answerLabel}`
        : answerLabel,
  );

  $effect.pre(() => {
    if (rep === current) return;
    current = rep;
    clearTimeout(countdown);
    clearTimeout(pressing);
    pressing = null;
    typed = "";
    picked = null;
    revealed = false;
    pending = false;
    released = false;
    result = null;
    hinted = false;
    cells = cellsFor(tokens);
    cellSession = streak.begin(tokens, 0);
    recalls = recallsFor(tokens);
    editing = null;
    peeked = previewing;
    phase = previewing ? "preview" : "recall";
  });

  const note = $derived(
    result && (result.feedback || judge.describe(knowable, result.signal)),
  );

  const retyping = $derived(phase === "feedback" && !table && !pending && knowable.judge !== "LLM" && Boolean(result) && !POSITIVE.includes(result.signal));
  const correction = $derived(
    retyping && typed.trim()
      ? judge.evaluate({ typed, knowable, recall, forgiving: axes.forgiving, language: side(recall) })
      : null,
  );
  const corrected = $derived(Boolean(correction && POSITIVE.includes(correction.signal)));
  const shown = $derived(corrected ? { ...correction, corrected: true } : result);
  const feedbackAsset = $derived(recall === "KNOWN" ? null : asset);

  $effect(() => {
    if (phase !== "preview") return;
    const timer = setTimeout(() => (phase = "recall"), span);
    return () => clearTimeout(timer);
  });

  $effect(() => () => {
    clearTimeout(countdown);
    clearTimeout(pressing);
  });

  $effect(() => {
    onphase?.(phase);
  });

  const evaluation = (verdict) => ({
    signal: verdict?.overall?.grade ?? "MISTAKE",
    feedback: verdict?.overall?.feedback,
    tokens: verdict?.tokens?.map((token) => ({ ...token, signal: token.grade })) ?? null,
  });

  function advance() {
    if (released) return;
    released = true;
    onadvance(POSITIVE.includes(result?.signal));
  }

  function commitCell() {
    if (!activeCell || !typed.trim()) return;
    const index = activeCell.index;
    const token = tokens[index];
    const verdict = judge.evaluate({
      typed,
      knowable: { ontology: "word", known: token.gloss, learning: token.form },
      recall: recalls[index],
      forgiving: axes.forgiving,
      language: side(recalls[index]),
    });
    const success = POSITIVE.includes(verdict.signal);
    const cell = cells[index];
    cells[index] = { ...cell, typed: typed.trim(), signal: verdict.signal, first: cell.first ?? verdict.signal, committed: true };
    onresult({ signal: verdict.signal, literal: token.literal, tokens: null, peeked });
    cellSession = streak.record(cellSession, success, axes.anhieb ?? 0);
    typed = "";
    if (streak.complete(cellSession)) finishTable();
  }

  function finishTable() {
    const firsts = cells.map((cell) => cell.first);
    const landed = firsts.filter((signal) => POSITIVE.includes(signal)).length;
    const ratio = firsts.length ? landed / firsts.length : 0;
    const signal = landed === firsts.length ? "SUCCESS" : landed ? "MISTAKE" : "FAILURE";
    const label =
      firsts.length && firsts.every((first) => first === "MASTERY")
        ? "MASTERY"
        : ratio === 1
          ? "SUCCESS"
          : ratio >= 2 / 3
            ? "NEUTRAL"
            : landed
              ? "MISTAKE"
              : "FAILURE";
    const review = { enum: label, ratio: { success: landed, total: firsts.length } };
    result = { signal, tokens: null };
    onresult({ ...result, review, peeked });
    phase = "feedback";
  }

  function skipCell() {
    if (!activeCell || editing != null) return;
    cellSession = streak.defer(cellSession);
    typed = "";
  }

  function select(index) {
    if (!table || phase === "preview") return;
    if (editing != null && editing !== index) {
      editing = null;
      typed = "";
    }
    if (cellSession.pending.some((entry) => entry.index === index)) {
      if (activeCell?.index === index) return;
      cellSession = streak.focus(cellSession, index);
      typed = "";
      return;
    }
    const cell = cells[index];
    if (cell?.committed && !POSITIVE.includes(cell.signal) && !cell.corrected) correct(index);
  }

  function correct(index) {
    if (editing === index) {
      editing = null;
      typed = "";
      return;
    }
    editing = index;
    typed = "";
  }

  function commitCorrection() {
    const index = editing;
    if (index == null || !typed.trim()) return;
    const token = tokens[index];
    const verdict = judge.evaluate({
      typed,
      knowable: { ontology: "word", known: token.gloss, learning: token.form },
      recall: recalls[index],
      forgiving: axes.forgiving,
      language: side(recalls[index]),
    });
    if (POSITIVE.includes(verdict.signal)) {
      cells[index] = { ...cells[index], corrected: true };
      editing = null;
    }
    typed = "";
  }

  async function submit({ force = false } = {}) {
    if (table && editing != null) return commitCorrection();
    if (table && phase === "recall") return commitCell();
    if (phase !== "recall" || (!typed.trim() && !force) || pending) return;
    if (knowable.judge === "LLM" && typed.trim()) {
      pending = true;
      phase = "feedback";
      result = evaluation(await onjudge(typed));
      pending = false;
      onresult({ ...result, peeked });
      return;
    }
    result = judge.evaluate({ typed, knowable, recall, forgiving: axes.forgiving, language: side(recall) });
    onresult({ ...result, peeked });
    phase = "feedback";
  }

  function pick(option) {
    if (picked) return;
    picked = option;
    const correct = judge.expected(option, recall) === answer;
    result = { signal: correct ? "SUCCESS" : "MISTAKE", tokens: null };
    onresult({ ...result, picked: option, peeked });
    phase = "feedback";
    countdown = setTimeout(advance, PICK_PAUSE[result.signal]);
  }

  function reveal() {
    revealed = true;
  }

  function grade(signal) {
    if (result) return;
    result = { signal, tokens: null };
    onresult({ ...result, peeked });
    countdown = setTimeout(advance, 260);
  }

  const RECALL_KEYS = {
    TYPE: { Enter: () => submit() },
    FLIP: { Enter: reveal, " ": reveal },
    PICK: {},
  };
  const CELL_KEYS = { Enter: () => submit(), Tab: skipCell };

  const DIGITS = {
    PICK: (key) => options[Number(key) - 1] && (() => pick(options[Number(key) - 1])),
    FLIP: (key) =>
      revealed && { 1: () => grade("MISTAKE"), 2: () => grade("SUCCESS"), 3: () => grade("MASTERY") }[key],
  };

  const keymap = $derived({
    preview: { Enter: () => (phase = "recall"), " ": () => (phase = "recall") },
    recall: table ? CELL_KEYS : (RECALL_KEYS[gameplay] ?? RECALL_KEYS.TYPE),
    feedback: table && editing != null ? { Enter: () => submit() } : { Enter: advance },
  });

  function elsewhere(target) {
    if (!target?.tagName) return false;
    if (target.hasAttribute?.("data-rep-input")) return false;
    return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
  }

  function onkeydown(event) {
    if (pending || elsewhere(event.target)) return;
    if (event.key === "Enter" && phase === "recall" && gameplay === "TYPE" && !table && !typed.trim()) {
      event.preventDefault();
      if (event.repeat || pressing) return;
      pressing = setTimeout(() => {
        pressing = null;
        submit({ force: true });
      }, HOLD);
      return;
    }
    if (event.key === "h" && phase === "recall" && event.target.tagName !== "INPUT") {
      event.preventDefault();
      return (hinted = !hinted);
    }
    const digit = phase === "recall" && DIGITS[gameplay]?.(event.key);
    const action = digit || keymap[phase]?.[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  function onkeyup(event) {
    if (event.key !== "Enter" || !pressing) return;
    clearTimeout(pressing);
    pressing = null;
  }
</script>

<svelte:window {onkeydown} {onkeyup} />

<Desk maxWidth="720px" class={compact ? "dense" : ""}>
  {#snippet surface()}
    <Prompt
      {knowable}
      {axes}
      {prompt}
      {recall}
      {gameplay}
      {phase}
      {method}
      {status}
      {asset}
      turn={rep}
      {labels}
      {span}
      {speed}
      {hinted}
      {compact}
      onhint={() => (hinted = !hinted)}
      {onchrome} />

    {#if table}
      <Table
        {knowable}
        {cells}
        session={cellSession}
        {recalls}
        {axes}
        {prompt}
        {editing}
        revealed={phase === "preview"}
        {assetOf}
        oncorrect={correct}
        onselect={select} />
    {:else if gameplay === "FLIP"}
      {#if revealed}
        <FlipReveal {answer} example={answerExample} {asset} label={answerLabel} />
      {/if}
    {:else if phase === "feedback"}
      {#if pending}
        <p class="judging"><Pip tone="primary" pulse />/judge · cortex grading typed input…</p>
      {:else if result}
        <TokenFeedback
          result={shown}
          {typed}
          {answer}
          {note}
          example={answerExample}
          forgiving={axes.forgiving}
          asset={feedbackAsset}
          dense={compact} />
      {/if}
    {/if}
  {/snippet}

  {#snippet controls()}
    {@const typing = gameplay === "TYPE" || table}
    <div class="stack">
      <div class="entry" class:quiet={!typing}>
        <TypeInput
          value={typed}
          submitted={phase === "feedback" && editing == null}
          editable={retyping}
          passive={!typing}
          {retain}
          hold={HOLD}
          ready={phase === "preview"}
          signal={shown?.signal}
          placeholder={phase === "preview"
            ? "memorize it — type to begin…"
            : table
              ? `${cellLabel}…`
              : gameplay === "PICK"
                ? "tap a choice · or type 1 2 3 4"
                : gameplay === "FLIP"
                  ? (revealed ? "grade it · 1 2 3" : "⏎ reveal")
                  : `${answerLabel}…`}
          onchange={(value) => {
            if (phase === "preview") phase = "recall";
            typed = value;
          }}
          onsubmit={submit}
          onready={() => (phase = "recall")}
          onnext={advance} />
      </div>
      {#if !typing && phase !== "preview"}
        {#if gameplay === "PICK"}
          <PickOptions {options} answer={knowable} {picked} {recall} onpick={pick} />
        {:else if revealed}
          <div class="row">
            <button class="btn unknown" onclick={() => grade("MISTAKE")}>1 · Unknown</button>
            <button class="btn known" onclick={() => grade("SUCCESS")}>2 · Known</button>
            <button class="btn easy" onclick={() => grade("MASTERY")}>3 · Easy</button>
          </div>
        {:else}
          <button class="btn reveal" onclick={reveal}>Reveal · Space</button>
        {/if}
      {/if}
    </div>
  {/snippet}
</Desk>

<style>
  .stack {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .stack .entry {
    display: flex;
    gap: 0.625rem;
    align-items: center;
  }
  .stack .entry.quiet {
    opacity: 0.55;
  }
  .stack .row {
    display: flex;
    gap: 0.625rem;
  }
  :global(.desk.dense .desk-stage) {
    padding: 0.875rem 1rem;
  }
  :global(.desk.dense .desk-controls) {
    padding: 0.5rem 1rem;
  }
  .judging {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-theme-secondary-contrast);
    margin-top: 1.5rem;
  }
  .btn {
    flex: 1;
    min-height: 64px;
    padding: 0.75rem 0.5rem;
    border-radius: 0.5rem;
    border: none;
    font-size: var(--font-size-md);
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family-sans-text);
  }
  .unknown {
    background: var(--colors-system-error-surface);
    color: var(--colors-system-error-contrast);
  }
  .known {
    background: var(--colors-system-success-surface);
    color: var(--colors-system-success-contrast);
  }
  .easy {
    background: var(--colors-theme-primary-surface);
    color: var(--colors-theme-primary-contrast);
  }
  .reveal {
    background: transparent;
    border: 1px solid var(--colors-skeleton-1-boundary);
    color: var(--text-body);
    font-weight: 500;
  }
</style>

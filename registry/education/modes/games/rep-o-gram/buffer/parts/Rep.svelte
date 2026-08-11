<script>
  import { Desk, Pip } from "@vivalence/drapes";
  import * as judge from "../judge.js";
  import Prompt from "./Prompt.svelte";
  import TypeInput from "./TypeInput.svelte";
  import PickOptions from "./PickOptions.svelte";
  import FlipReveal from "./FlipReveal.svelte";
  import TokenFeedback from "./TokenFeedback.svelte";

  const {
    knowable,
    axes,
    recall,
    options = [],
    labels,
    status,
    asset = null,
    position,
    total,
    first,
    rep,
    onresult,
    onadvance,
    onjudge,
    onphase,
    onchrome,
  } = $props();

  const SPEED = { FAST: 1200, NORMAL: 2400, SLOW: 3600 };
  const MULTIPLIER = 40;
  const PICK_PAUSE = { SUCCESS: 800, MISTAKE: 1500 };
  const POSITIVE = ["MASTERY", "SUCCESS", "NEUTRAL"];
  const TICK = 50;

  const answer = $derived(judge.expected(knowable, recall));
  const answerLabel = $derived(recall === "KNOWN" ? labels.known : labels.learning);
  const method = $derived(judge.method(knowable, axes.gameplay));
  const answerExample = $derived(
    knowable.example && (recall === "KNOWN" ? knowable.example.known : knowable.example.learning),
  );

  const previewing = $derived(Boolean(axes.preview) && axes.gameplay === "TYPE" && first);
  const speed = $derived.by(() => {
    const configured = axes.preview?.speed ?? {};
    return {
      base: configured.base ?? SPEED[configured.rate] ?? SPEED.NORMAL,
      multiplier: configured.multiplier ?? MULTIPLIER,
    };
  });
  const span = $derived(
    previewing ? speed.base + (answer?.length ?? 0) * speed.multiplier : 0,
  );

  let phase = $state(previewing ? "preview" : "recall");
  let elapsed = $state(0);
  let typed = $state("");
  let picked = $state(null);
  let revealed = $state(false);
  let pending = $state(false);
  let released = $state(false);
  let result = $state(null);
  let hinted = $state(false);
  let countdown = null;
  let current = rep;

  $effect.pre(() => {
    if (rep === current) return;
    current = rep;
    clearTimeout(countdown);
    elapsed = 0;
    typed = "";
    picked = null;
    revealed = false;
    pending = false;
    released = false;
    result = null;
    hinted = false;
    phase = previewing ? "preview" : "recall";
  });

  const note = $derived(
    result && (result.feedback || judge.describe(knowable, result.signal, axes.forgiving)),
  );

  $effect(() => {
    if (phase !== "preview") return;
    const timer = setInterval(() => {
      elapsed += TICK;
      if (elapsed >= span) phase = "recall";
    }, TICK);
    return () => clearInterval(timer);
  });

  $effect(() => () => clearTimeout(countdown));

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

  async function submit() {
    if (phase !== "recall" || !typed.trim() || pending) return;
    if (knowable.judge === "LLM") {
      pending = true;
      phase = "feedback";
      result = evaluation(await onjudge(typed));
      pending = false;
      onresult(result);
      return;
    }
    result = judge.evaluate({ typed, knowable, recall, forgiving: axes.forgiving });
    onresult(result);
    phase = "feedback";
  }

  function pick(option) {
    if (picked) return;
    picked = option;
    const correct = judge.expected(option, recall) === answer;
    result = { signal: correct ? "SUCCESS" : "MISTAKE", tokens: null };
    onresult({ ...result, picked: option });
    phase = "feedback";
    countdown = setTimeout(advance, PICK_PAUSE[result.signal]);
  }

  function reveal() {
    revealed = true;
  }

  function grade(signal) {
    if (result) return;
    result = { signal, tokens: null };
    onresult(result);
    countdown = setTimeout(advance, 260);
  }

  const RECALL_KEYS = {
    TYPE: { Enter: submit },
    FLIP: { Enter: reveal, " ": reveal },
    PICK: {},
  };

  const DIGITS = {
    PICK: (key) => options[Number(key) - 1] && (() => pick(options[Number(key) - 1])),
    FLIP: (key) =>
      revealed && { 1: () => grade("MISTAKE"), 2: () => grade("SUCCESS"), 3: () => grade("MASTERY") }[key],
  };

  const keymap = $derived({
    preview: { Enter: () => (phase = "recall"), " ": () => (phase = "recall") },
    recall: RECALL_KEYS[axes.gameplay] ?? RECALL_KEYS.TYPE,
    feedback: { Enter: advance },
  });

  function elsewhere(target) {
    if (!target?.tagName) return false;
    if (target.hasAttribute?.("data-rep-input")) return false;
    return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
  }

  function onkeydown(event) {
    if (pending || elsewhere(event.target)) return;
    if (event.key === "h" && phase === "recall" && event.target.tagName !== "INPUT") {
      event.preventDefault();
      return (hinted = !hinted);
    }
    const digit = phase === "recall" && DIGITS[axes.gameplay]?.(event.key);
    const action = digit || keymap[phase]?.[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }
</script>

<svelte:window {onkeydown} />

<Desk maxWidth="720px">
  {#snippet surface()}
    <Prompt
      {knowable}
      {axes}
      {recall}
      {phase}
      {method}
      {status}
      {asset}
      {labels}
      {position}
      {total}
      {elapsed}
      {span}
      {speed}
      {hinted}
      onhint={() => (hinted = !hinted)}
      {onchrome} />

    {#if axes.gameplay === "FLIP"}
      {#if revealed}
        <FlipReveal {answer} example={answerExample} {asset} label={answerLabel} />
      {/if}
    {:else if phase === "feedback"}
      {#if pending}
        <p class="judging"><Pip tone="primary" pulse />/judge · cortex grading typed input…</p>
      {:else if result}
        <TokenFeedback
          {result}
          {typed}
          {answer}
          {note}
          example={answerExample}
          forgiving={axes.forgiving}
          {asset} />
      {/if}
    {/if}
  {/snippet}

  {#snippet controls()}
    {#if phase === "preview"}
      <span class="locked">recall locked while the preview runs</span>
      <button class="ready" onclick={() => (phase = "recall")}>I'm ready ⏎</button>
    {:else if axes.gameplay === "TYPE"}
      <TypeInput
        value={typed}
        submitted={phase === "feedback"}
        signal={result?.signal}
        placeholder={`${answerLabel}…`}
        {rep}
        onchange={(value) => (typed = value)}
        onsubmit={submit}
        onnext={advance} />
    {:else if axes.gameplay === "PICK"}
      <PickOptions {options} answer={knowable} {picked} {recall} onpick={pick} />
    {:else if revealed}
      <button class="btn unknown" onclick={() => grade("MISTAKE")}>1 · Unknown</button>
      <button class="btn known" onclick={() => grade("SUCCESS")}>2 · Known</button>
      <button class="btn easy" onclick={() => grade("MASTERY")}>3 · Easy</button>
    {:else}
      <button class="btn reveal" onclick={reveal}>Reveal · Space</button>
    {/if}
  {/snippet}
</Desk>

<style>
  .judging {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-family-code);
    font-size: var(--font-size-sm);
    color: var(--colors-theme-secondary-contrast);
    margin-top: 1.5rem;
  }
  .locked {
    flex: 1;
    align-self: center;
    font-family: var(--font-family-code);
    font-size: var(--font-size-xs);
    color: var(--text-support);
  }
  .ready {
    min-height: 64px;
    padding: 0.75rem 1.625rem;
    border-radius: 999px;
    border: 1px solid var(--colors-skeleton-1-boundary);
    background: transparent;
    color: var(--text-body);
    font-family: var(--font-family-sans-text);
    font-size: var(--font-size-md);
    cursor: pointer;
  }
  .ready:hover {
    border-color: var(--colors-theme-primary-contrast);
    color: var(--colors-theme-primary-contrast);
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

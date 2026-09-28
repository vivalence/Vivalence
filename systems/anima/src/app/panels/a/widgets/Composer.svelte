<script>
  import { Float, Key, Status } from "@vivalence/drapes";
  import Tune from "../../../widgets/Tune.svelte";
  import Dictaphone from "./Dictaphone.svelte";

  let {
    draft = $bindable(""),
    field = $bindable(null),
    thread = null,
    harnessed = false,
    hint = "",
    ceiling = 112,
    error = null,
    pinned = true,
    unread = 0,
    stoppable = false,
    sending = false,
    control,
    tunable = false,
    tune = null,
    verbatim = false,
    recorder,
    level,
    coarse = false,
    onkeydown,
    onsend,
    onpin,
    ondictate,
    onsettle,
  } = $props();

  const dictating = $derived(recorder.$active);
  const committed = $derived(recorder.$committed);
  const tail = $derived(recorder.$tail);
  const fault = $derived(recorder.$error);

  const listening = $derived($dictating !== "idle");
  const sealed = $derived(!harnessed || listening);
  const stopping = $derived(control.armed === "SIGTERM");
  const stopTitle = $derived(
    stopping ? "stopping · hold 2s to kill" : coarse ? "stop · hold 2s to kill" : "stop (esc) · hold 2s to kill",
  );

  let tuneAnchor = $state(null);
  let tuneOpen = $state(false);

  const keepFocus = (event) => event.preventDefault();

  function write(event) {
    if (sealed) return void (event.currentTarget.value = draft);
    draft = event.currentTarget.value;
  }
</script>

<div class="composer">
  {#if error}
    <div class="composer-fault" title={error}>error: {error}</div>
  {/if}
  {#if !pinned}
    <span class="composer-pill">
      <Key
        size="mini"
        tone={unread > 0 ? "primary" : "plain"}
        title="scroll to bottom"
        onpress={keepFocus}
        onclick={onpin}>
        ↓{#if unread > 0}&nbsp;{unread} new{/if}
      </Key>
    </span>
  {/if}
  <div class="composer-well">
    {#if listening}
      <div class="composer-dictation">
        <Status tone="negative" size={8} pulse />
        <span>{$committed}</span>
        {#if $tail}<span class="composer-tail">{$tail}</span>{/if}
      </div>
    {/if}
    <textarea
      bind:this={field}
      class="composer-field"
      class:unharnessed={!harnessed}
      value={draft}
      oninput={write}
      {onkeydown}
      placeholder={harnessed ? hint : "—"}
      rows="2"
      style:max-height="{ceiling}px"></textarea>
    <div class="composer-keys">
      {#if tunable}
        <span class="composer-tune" bind:this={tuneAnchor}>
          <Key
            size="row"
            led
            latched={tuneOpen}
            label={Array.isArray(tune) ? "custom" : (tune ?? "mode decides")}
            title="intelligent · click to tune"
            onpress={keepFocus}
            onclick={() => (tuneOpen = !tuneOpen)} />
        </span>
      {/if}
      <span class="composer-spacer"></span>
      {#if verbatim}
        <Dictaphone active={dictating} {level} fault={$fault} disabled={sending} onstart={ondictate} onstop={onsettle} />
      {/if}
      {#if stoppable}
        <Key
          size="row"
          tone="negative"
          hold={2000}
          muted={stopping}
          onpress={(event) => (keepFocus(event), control.press())}
          onrelease={control.release}
          onclick={(event) => event.detail === 0 && control.stop()}
          label={control.armed === "SIGKILL" ? "killing" : "stop"}
          title={stopTitle} />
      {:else}
        <Key
          tone="primary"
          size="row"
          disabled={!harnessed || !draft.trim()}
          title={coarse ? "send" : "send (enter)"}
          onpress={keepFocus}
          onclick={onsend}>
          <span class="composer-plane"></span>
        </Key>
      {/if}
    </div>
  </div>
</div>

{#if tuneOpen}
  <Float anchor={tuneAnchor} zone="1" side="above" title="intelligent" onclose={() => (tuneOpen = false)}>
    <Tune {thread} />
  </Float>
{/if}

<style>
  .composer {
    position: relative;
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 4px var(--dock-gutter, 14px) 10px;
  }
  .composer-fault {
    margin: 0 10px;
    padding: 6px 10px;
    border-radius: var(--shape-radius-key);
    background: var(--surface);
    box-shadow: inset 0 0 0 var(--size-ring) var(--signal-negative);
    color: var(--signal-negative-ink);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    overflow-wrap: anywhere;
  }
  .composer-pill {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    z-index: 5;
    display: inline-flex;
    transform: translateX(-50%);
  }
  .composer-well {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 9px 8px 9px 12px;
    border-radius: var(--shape-radius-card);
    background: var(--surface-sunk);
    color: var(--text-strong);
    box-shadow: var(--shape-sunk);
  }
  .composer-well:focus-within {
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--control-focus);
  }
  .composer-dictation {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-ink);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .composer-tail {
    font-style: italic;
    color: var(--text-light);
  }
  .composer-field {
    min-height: 40px;
    max-height: 112px;
    padding: 0;
    border: none;
    outline: none;
    resize: none;
    overflow-y: auto;
    field-sizing: content;
    background: transparent;
    color: var(--text-strong);
    caret-color: var(--control-field-caret);
    font-family: var(--font-family-sans-text);
    font-size: var(--size-type-sm);
    line-height: 20px;
  }
  .composer-field::placeholder {
    color: var(--control-field-placeholder);
  }
  .composer-field.unharnessed {
    opacity: var(--text-disabled);
  }
  .composer-keys {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 7px;
    padding-bottom: var(--size-depth);
  }
  .composer-tune {
    display: inline-flex;
  }
  .composer-spacer {
    flex: 1;
  }
  .composer-plane {
    width: 13px;
    height: 13px;
    background: currentColor;
    -webkit-mask: url(/icons/heroicons/20/solid/paper-airplane.svg) center / contain no-repeat;
    mask: url(/icons/heroicons/20/solid/paper-airplane.svg) center / contain no-repeat;
  }
</style>

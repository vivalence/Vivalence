<script>
  import { Float, Key, Row, Status } from "@vivalence/drapes";

  let {
    label,
    tone = "none",
    word = null,
    pulse = false,
    side = "right",
    sides = [],
    full = false,
    meta = false,
    consoles = [],
    picked = null,
    onmeta,
    onconsole,
    onside,
    onfull,
    oncollapse,
  } = $props();

  const GLYPHS = { top: "↑", right: "→", bottom: "↓", left: "←" };

  let anchor = $state(null);
  let picking = $state(false);

  function pick(name) {
    picking = false;
    onside?.(name);
  }
</script>

<header class="dock-head">
  <Status {tone} {word} {pulse} live={pulse} />
  <span class="dock-label">{label}</span>
  <Key size="row" tone="ghost" latched={meta} label="⋮⋮ meta" title="toggle meta bar" onclick={onmeta} />
  <span class="dock-picker" bind:this={anchor}>
    <Key
      size="row"
      tone="ghost"
      square
      latched={picking}
      label={GLYPHS[side]}
      title="dock side · {side}"
      onclick={() => (picking = !picking)} />
  </span>
  <Key size="row" tone="ghost" square label={full ? "⤡" : "⤢"} title={full ? "restore" : "full"} onclick={onfull} />
  <Key size="row" tone="ghost" square label="×" title="collapse" onclick={oncollapse} />
</header>

{#if meta}
  <div class="dock-meta">
    {#each consoles as name (name)}
      <Key size="row" latched={picked === name} label={name} onclick={() => onconsole?.(name)} />
    {/each}
  </div>
{/if}

{#if picking}
  <Float {anchor} zone="1" snug onclose={() => (picking = false)}>
    {#each sides as name (name)}
      <Row selected={name === side} title="dock {name}" onclick={() => pick(name)}>
        <span class="dock-glyph">{GLYPHS[name]}</span>
        <span class="dock-side">{name}</span>
      </Row>
    {/each}
  </Float>
{/if}

<style>
  .dock-head {
    flex: 0 0 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 0 var(--dock-head-gutter, 6px) 0 var(--dock-gutter, 14px);
    border-bottom: var(--size-ring) solid var(--boundary);
  }
  .dock-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    color: var(--text-strong);
  }
  .dock-picker {
    display: inline-flex;
  }
  .dock-meta {
    flex: none;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px var(--dock-gutter, 14px) calc(8px + var(--size-depth));
    border-bottom: var(--size-ring) solid var(--boundary);
  }
  .dock-glyph {
    width: 14px;
    text-align: center;
    color: var(--text-light);
  }
  .dock-side {
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-ink);
  }
  @media (pointer: coarse) {
    .dock-head {
      flex-basis: 52px;
    }
  }
</style>

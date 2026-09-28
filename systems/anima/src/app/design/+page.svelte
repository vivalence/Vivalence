<script>
  import { onMount } from "svelte";
  import { stores } from "@vivalence/anima";
  import { Card, Chip, Empty, Float, Input, Key, Meter, Pip, Pressed, Reading, Row, Section, Segmented, Spinner, Status, Stepper, Strip, Tag, ToolRow, Well } from "@vivalence/drapes";
  import { audit, verdict } from "./audit.js";
  import { colour, css, read } from "./sheet.js";
  import { AXES, PLACES, PROSE, SIGNALS, STEPS, ZONES } from "./reference.js";

  const THEMES = stores.bridge.THEMES;

  let theme = $state(THEMES[0]);
  let sheet = $state({});
  let latched = $state("row");
  let rounds = $state(4);
  let tune = $state("balanced");
  let draft = $state("");
  let opened = $state(true);
  let fold = $state("page");
  let pane = $state("thread");
  let width = $state(0);
  let floating = $state(null);
  let anchors = $state({});

  const held = $derived(sheet[theme] ?? {});
  const names = $derived(Object.keys(held["1"]?.values ?? {}));
  const verdicts = $derived(
    THEMES.map((name) => ({ name, zones: ZONES.map(({ zone }) => (sheet[name]?.[zone] ? verdict(audit(sheet[name][zone].values)) : null)) })),
  );
  const keys = $derived(["terminal", "navigation", "thread", "mode", "buffer", "harness"].map((name) => ({ name, label: name === "terminal" ? "terminals" : name, latched: name === pane, led: name === "buffer" || name === "harness" })));

  const scale = (family, step) => held["1"]?.values[`--${family}-${step}`] ?? null;

  const pick = (name) => {
    theme = name;
    document.documentElement.dataset.theme = name;
  };

  onMount(() => {
    theme = document.documentElement.dataset.theme ?? THEMES[0];
    sheet = read(document.styleSheets);
  });
</script>

{#snippet territory({ zone, name, what })}
      <div class="zone-head"><span class="zone-index">{zone}</span><span class="zone-name">{name}</span></div>
      <p class="zone-what">{what}</p>
      <div class="depths">
        <span class="depth sunk">sunk</span>
        <span class="depth surface">surface</span>
        <span class="depth lift">lift</span>
      </div>
      <div class="prose">{#each PROSE as step (step)}<span class="step {step}">{step}</span>{/each}</div>
      <div class="keys"><Key size="row" label="key" /><Key size="row" led latched label="latched" /><Key size="row" tone="primary" label="go" /></div>
      <div class="inverse">inverse</div>
{/snippet}

{#snippet kit({ zone, name })}
      <div class="zone-head"><span class="zone-index">{zone}</span><span class="zone-name">{name}</span></div>
      <div class="keys">
        <Key label="key" />
        <Key led latched label="latched" />
        <Key muted label="muted" />
        <Key tone="primary" label="primary" />
        <Key tone="negative" hold={2000} label="hold" />
        <Key tone="ghost" label="ghost" />
        <Key disabled label="disabled" />
      </div>
      <div class="keys">
        <Key size="row" label="row" />
        <Key size="row" square label="+" />
        <Key size="mini" label="mini" />
        <span bind:this={anchors[zone]}><Key size="row" led latched={floating === zone} label="float" onclick={() => (floating = floating === zone ? null : zone)} /></span>
        <Chip label="chip" active mark="▸" />
        <Chip label="chip" mark="×" />
      </div>
      <Segmented options={["fast", "balanced", "deep"]} value={tune} onpick={(value) => (tune = value)} />
      <div class="line"><Stepper value={rounds} min={1} max={50} onchange={(value) => (rounds = value)} /><span class="gauge"><Meter value={rounds / 50} /></span><Spinner /></div>
      <Input bind:value={draft} placeholder="a field" />
      <Pressed><Input bind:value={draft} placeholder="a field in an open form" /></Pressed>
      <Card>
        <Section label="card" count={3} />
        <Reading label="change">pqxuzpnm</Reading>
        <Reading label="viewport">1440 × 900</Reading>
        <Row selected><Pip size={6} tone="success" /><span>a selected row</span></Row>
        <Row onclick={() => (latched = latched === "row" ? null : "row")}><Pip size={6} tone="muted" /><span>a row that answers</span></Row>
      </Card>
      <Well>
        <ToolRow name="read_manual" digest="drone-x.pdf · pages 12–14" status="ok" tone="positive" open={opened} ontoggle={() => (opened = !opened)}>
          <span>2 sizes found · M3×8 · M3×12</span>
        </ToolRow>
        <ToolRow name="find_parts" digest="arms · fasteners" status="running" tone="primary" live />
        <ToolRow name="queue_step" digest="guide.steps" status="failed" tone="negative" />
      </Well>
      <div class="line">
        <Status tone="primary" word="running" live pulse />
        <Status tone="caution" word="paused" />
        <Status tone="positive" word="done" />
        <Status tone="negative" word="failed" />
        <Status tone="idle" word="idle" />
      </div>
      <div class="line">
        <Tag>application</Tag>
        <Tag tone="primary">primary</Tag>
        <Tag led lit>mount</Tag>
        <Tag led>release</Tag>
      </div>
      <div class="signals">{#each SIGNALS as signal (signal)}<span class="signal {signal}">{signal}</span><span class="tint {signal}">{signal}</span>{/each}</div>
      <Empty verb="no thread" trace="pick a mode in navigation · or a thread" />
      <Empty verb="settling" trace="thread t3" spinner dashed />
{/snippet}

<main data-zone="1" class="design">
  <header class="head">
    <h1>design system</h1>
    <div class="picker"><Segmented options={THEMES} value={theme} cell={96} onpick={pick} /></div>
  </header>

  <article>
    <Section label="zones" count={ZONES.length} />
    <div class="grid four">
      <section data-zone="0" class="zone">{@render territory(ZONES[0])}</section>
      <section data-zone="1" class="zone">{@render territory(ZONES[1])}</section>
      <section data-zone="2" class="zone">{@render territory(ZONES[2])}</section>
      <section data-zone="3" class="zone">{@render territory(ZONES[3])}</section>
    </div>
  </article>

  <article>
    <Section label="places" count={PLACES.length} />
    <table>
      <thead><tr><th>place</th><th>zone</th><th>steps</th></tr></thead>
      <tbody>{#each PLACES as [place, zone, steps] (place)}<tr><td>{place}</td><td>{zone}</td><td>{steps}</td></tr>{/each}</tbody>
    </table>
  </article>

  <article>
    <Section label="token space" count={names.length} />
    <div class="scroll">
      <table class="tokens">
        <thead><tr><th>name</th>{#each ZONES as { zone, name } (zone)}<th>{zone} · {name}</th>{/each}</tr></thead>
        <tbody>
          {#each names as name (name)}
            <tr>
              <td class="token-name">{name}</td>
              {#each ZONES as { zone } (zone)}
                {@const value = held[zone]?.values[name] ?? ""}
                <td>{#if colour(value)}<i class="swatch" style:background={value}></i>{/if}{value}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </article>

  <article>
    <Section label="words" count={AXES.length} />
    <table>
      <thead><tr><th>axis</th><th>words</th><th>says</th></tr></thead>
      <tbody>{#each AXES as [axis, words, says] (axis)}<tr><td>{axis}</td><td>{words}</td><td>{says}</td></tr>{/each}</tbody>
    </table>
  </article>

  <article>
    <Section label="the sheet" count={theme} />
    <Well><pre>{held.root ? css(held.root) : ""}</pre></Well>
  </article>

  <article>
    <Section label="the kit" count="four zones" />
    <div class="grid two">
      <section data-zone="0" class="zone kit">{@render kit(ZONES[0])}</section>
      <section data-zone="1" class="zone kit">{@render kit(ZONES[1])}</section>
      <section data-zone="2" class="zone kit">{@render kit(ZONES[2])}</section>
      <section data-zone="3" class="zone kit">{@render kit(ZONES[3])}</section>
    </div>
    <div class="host" bind:clientWidth={width}>
      <div class="host-body"><Empty verb={pane} trace="fold · {fold}" /></div>
      <Strip {keys} folds={["page", "stack", "accordion", "free"]} {fold} {width} onpick={(name) => (pane = name)} onsolo={(name) => (pane = name)} onfold={(name) => (fold = name)} />
    </div>
  </article>

  <article>
    <Section label="themes" count={THEMES.length} />
    <div class="grid two">
      {#each verdicts as { name, zones } (name)}
        <Card>
          <div class="line"><Key size="row" led latched={name === theme} label={name} onclick={() => pick(name)} /></div>
          <table>
            <thead><tr><th>zone</th><th>pairs</th><th>misses</th><th>worst</th></tr></thead>
            <tbody>
              {#each zones as held, index (index)}
                <tr>
                  <td>{index} · {ZONES[index].name}</td>
                  <td>{held?.pairs ?? "—"}</td>
                  <td class:miss={held?.misses.length}>{held ? held.misses.length : "—"}</td>
                  <td>{held ? `${held.worst.toFixed(2)} ×` : "—"}</td>
                </tr>
                {#each held?.misses ?? [] as row (row.label)}<tr><td colspan="4" class="miss">{row.label} · {row.ratio.toFixed(2)} under {row.floor}</td></tr>{/each}
              {/each}
            </tbody>
          </table>
        </Card>
      {/each}
    </div>
  </article>

  <article>
    <Section label="size" count={STEPS.length} />
    <div class="sizes">
      {#each STEPS as step (step)}
        <div class="size">
          <span class="size-name">{step}</span>
          <i class="space" style:width={scale("size-space", step)}></i>
          <span class="type" style:font-size={scale("size-type", step)}>Ag</span>
          <i class="corner" style:border-radius={scale("shape-radius", step)}></i>
        </div>
      {/each}
    </div>
  </article>
</main>

{#if floating !== null}
  <Float anchor={anchors[floating]} zone={floating} title="a float" onclose={() => (floating = null)}>
    <Reading label="zone">{floating} · {ZONES[Number(floating)].name}</Reading>
    <Row selected><Pip size={6} tone="primary" /><span>it declares its opener's zone</span></Row>
    <div class="keys"><Key size="row" label="close" onclick={() => (floating = null)} /></div>
  </Float>
{/if}

<style>
  .design {
    box-sizing: border-box;
    height: 100svh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: calc(24px + var(--safe-area-top, 0px)) 24px 64px;
    background: var(--surface);
    color: var(--text-strong);
    font-family: var(--font-family-sans-text);
    font-size: var(--size-type-sm);
    line-height: var(--size-leading-loose);
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }
  .picker {
    width: min(100%, 440px);
  }
  h1 {
    margin: 0 auto 0 0;
    font-family: var(--font-family-sans-heading);
    font-size: var(--size-type-2xl);
    font-weight: 600;
    color: var(--text-header);
  }
  article {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }
  .grid {
    display: grid;
    gap: 12px;
  }
  .grid.four {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  .grid.two {
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  }
  .zone {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding: 12px;
    background: var(--surface);
    color: var(--text-strong);
    border-radius: var(--shape-radius-card);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
  .zone-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .zone-index {
    font-family: var(--font-family-code);
    font-size: var(--size-type-lg);
    color: var(--signal-primary-ink);
  }
  .zone-name {
    font-family: var(--font-family-sans-heading);
    font-weight: 600;
    color: var(--text-header);
  }
  .zone-what {
    margin: 0;
    font-size: var(--size-type-xs);
    color: var(--text-light);
  }
  .depths {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .depth {
    padding: 10px 8px;
    border-radius: var(--shape-radius-key);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-ink);
  }
  .depth.sunk {
    background: var(--surface-sunk);
    box-shadow: var(--shape-sunk), 0 0 0 var(--size-ring) var(--boundary);
  }
  .depth.surface {
    background: var(--surface);
  }
  .depth.lift {
    background: var(--surface-lift);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary), var(--shape-lift);
  }
  .prose {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: var(--size-type-xs);
  }
  .step.header { color: var(--text-header); }
  .step.strong { color: var(--text-strong); }
  .step.ink { color: var(--text-ink); }
  .step.light { color: var(--text-light); }
  .step.muted { color: var(--text-muted); }
  .keys,
  .line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding-bottom: var(--size-depth);
  }
  .gauge {
    flex: 1;
    min-width: 60px;
  }
  .inverse {
    padding: 6px 10px;
    border-radius: var(--shape-radius-key);
    background: var(--inverse);
    color: var(--inverse-on);
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .signals {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  .signal,
  .tint {
    padding: 4px 8px;
    border-radius: var(--shape-radius-key);
    text-align: center;
  }
  .signal.primary { background: var(--signal-primary); color: var(--signal-primary-on); }
  .signal.positive { background: var(--signal-positive); color: var(--signal-positive-on); }
  .signal.caution { background: var(--signal-caution); color: var(--signal-caution-on); }
  .signal.negative { background: var(--signal-negative); color: var(--signal-negative-on); }
  .tint.primary { background: var(--signal-primary-tint); color: var(--signal-primary-ink); }
  .tint.positive { background: var(--signal-positive-tint); color: var(--signal-positive-ink); }
  .tint.caution { background: var(--signal-caution-tint); color: var(--signal-caution-ink); }
  .tint.negative { background: var(--signal-negative-tint); color: var(--signal-negative-ink); }
  .host {
    display: flex;
    flex-direction: column;
    height: 180px;
    max-width: 100%;
    resize: horizontal;
    overflow: hidden;
    border-radius: var(--shape-radius-card);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
  .host-body {
    flex: 1;
    min-height: 0;
    display: grid;
    place-items: center;
    background: var(--surface-lift);
  }
  .scroll {
    max-height: 420px;
    overflow: auto;
    border-radius: var(--shape-radius-card);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
  }
  th,
  td {
    padding: 5px 10px;
    text-align: left;
    border-bottom: var(--size-ring) solid var(--divider);
    color: var(--text-ink);
    white-space: nowrap;
  }
  th {
    position: sticky;
    top: 0;
    background: var(--surface-sunk);
    color: var(--text-light);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
  }
  .token-name {
    color: var(--text-strong);
  }
  .miss {
    color: var(--signal-negative-ink);
  }
  .swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 6px;
    vertical-align: -1px;
    border-radius: var(--shape-radius-xs);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
  pre {
    margin: 0;
    max-height: 320px;
    overflow: auto;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-ink);
  }
  .sizes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }
  .size {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
  }
  .space {
    height: 8px;
    background: var(--signal-primary);
  }
  .type {
    color: var(--text-strong);
    line-height: 1;
  }
  .corner {
    width: 22px;
    height: 22px;
    background: var(--control-contrast);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
</style>

<script>
  import { Json, Key, Markdown, Meter, Row, Section, Tag, ToolRow, Well } from "@vivalence/drapes";
  import { clockTime, scalarPairs, tokens } from "./turns.js";

  let {
    item,
    agent = "agent",
    thinking = null,
    usage = null,
    launches = [],
    copied = false,
    status = null,
    onlaunch,
    oncopy,
    onretry,
    onfold,
  } = $props();

  const ROWS = 8;
  const TONES = { ok: "positive", error: "negative", running: "primary" };
  const BANDS = { strong: "positive", weak: "caution", runnable: "primary" };

  let opened = $state({});
  const isOpen = (key, fallback = false) => opened[key] ?? fallback;

  function toggle(key, fallback = false) {
    opened = { ...opened, [key]: !isOpen(key, fallback) };
    onfold?.();
  }

  const mine = $derived(item.turn?.role === "user");
  const runnable = $derived(new Set(launches.filter((launch) => launch.runnable).map((launch) => launch.id)));
  const at = $derived(clockTime(item.date));
  const manifest = $derived(
    [
      item.think && thinking !== false ? "thinking" : null,
      item.tools?.length ? `${item.tools.length} ${item.tools.length === 1 ? "call" : "calls"}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  );
</script>

{#snippet call(tool, key)}
  {@const failed = tool.status === "error"}
  {@const running = tool.status === "running"}
  <ToolRow
    name={tool.name}
    digest={tool.digest}
    status={tool.status}
    tone={TONES[tool.status] ?? "idle"}
    live={running}
    open={!running && isOpen(key, failed)}
    ontoggle={running ? null : () => toggle(key, failed)}>
    {#if tool.output !== null && tool.output !== undefined}
      {#if typeof tool.output === "string"}
        <pre class="turn-output">{tool.output}</pre>
      {:else}
        <div class="turn-scroll"><Json value={tool.output} openDepth={1} /></div>
      {/if}
    {/if}
    {#each tool.channels as channel (channel.key)}
      {@const fold = `${key}/${channel.key}`}
      {@const all = `${fold}/all`}
      {@const pairs = channel.rows ? null : scalarPairs(channel.value)}
      <Section label={channel.key} count={channel.summary} open={isOpen(fold)} ontoggle={() => toggle(fold)} />
      {#if isOpen(fold)}
        {#if channel.rows}
          {#each isOpen(all) ? channel.rows : channel.rows.slice(0, ROWS) as entity, index (entity.id ?? index)}
            <Row
              title={entity.launchable ? "open" : entity.band}
              onclick={entity.launchable && runnable.has(entity.id) ? () => onlaunch?.(entity) : undefined}>
              <span class="turn-term">{entity.term}</span>
              <Tag>{entity.kind}</Tag>
              <span class="turn-gloss">{entity.gloss}</span>
              {#if entity.band}
                <span class="turn-meter"><Meter value={entity.fill ?? 0} tone={BANDS[entity.band]} /></span>
              {/if}
            </Row>
          {/each}
          {#if channel.rows.length > ROWS}
            <Key
              size="mini"
              tone="ghost"
              label={isOpen(all) ? "less" : `${channel.rows.length - ROWS} more…`}
              onclick={() => toggle(all)} />
          {/if}
        {:else if pairs}
          <div class="turn-pairs">
            {#each pairs as pair (pair.key)}
              <span class="turn-pair-key">{pair.key}</span><span class="turn-pair-value">{pair.value}</span>
            {/each}
          </div>
        {:else}
          <div class="turn-scroll"><Json value={channel.value} openDepth={1} /></div>
        {/if}
      {/if}
    {/each}
  </ToolRow>
{/snippet}

{#snippet copy()}
  <Key
    size="mini"
    tone="ghost"
    label={copied ? "copied" : "⧉"}
    title="copy turn as record"
    onclick={() => oncopy?.(item.turn, item.tools)} />
{/snippet}

{#snippet artifacts()}
  {#if item.artifacts.length}
    <div class="turn-artifacts">
      {#each item.artifacts as artifact, index (index)}
        {#if artifact.type === "image" && artifact.source?.data}
          <img class="turn-image" src={artifact.source.data} alt={artifact.alt ?? "image"} />
        {:else if artifact.type === "audio" && artifact.url}
          <audio class="turn-audio" controls src={artifact.url}></audio>
        {:else}
          <a class="turn-artifact" href={artifact.url ?? "#"} target="_blank" rel="noreferrer noopener">
            <Tag>
              <span class="turn-glyph">◈</span>
              {artifact.name ?? artifact.url ?? artifact.type}
              <span>{artifact.type}</span>
            </Tag>
          </a>
        {/if}
      {/each}
    </div>
  {/if}
{/snippet}

{#if item.kind === "divider"}
  <div class="turn-day"><span>{item.label}</span></div>
{:else}
  <div class="turn" class:mine>
    {#if !mine}
      <div class="turn-head">
        <span class="turn-mark"></span>
        <span class="turn-who">{agent}</span>
        {#if status}
          {@render status()}
        {:else}
          {#if at}<span title={item.date.toLocaleString()}>{at}</span>{/if}
          <span class="turn-spacer"></span>
          {#if manifest}<span class="turn-manifest">{manifest}</span>{/if}
          {#if item.failures}<Tag tone="negative">{item.failures} failed</Tag>{/if}
          {#if usage}<span class="turn-usage">{tokens(usage.input)} → {tokens(usage.output)}</span>{/if}
          {@render copy()}
        {/if}
      </div>
    {/if}
    {#if item.tools.length}
      <Well>
        {#each item.tools as tool, index (index)}
          {@render call(tool, `call/${index}`)}
        {/each}
      </Well>
    {/if}
    {#if launches.length}
      <div class="turn-launches">
        {#each launches as launch (launch.id)}
          <Key
            led
            latched={launch.seated}
            disabled={!launch.runnable}
            title="open {launch.label}"
            onclick={() => onlaunch?.(launch)}>
            <span>{launch.label}</span>
            {#if launch.line}<span class="turn-line">{launch.line}</span>{/if}
          </Key>
        {/each}
      </div>
    {/if}
    {#if item.think && thinking == null}
      <Section label="thinking" rule={false} open={isOpen("think")} ontoggle={() => toggle("think")} />
    {/if}
    {#if item.think && (thinking === true || (thinking == null && isOpen("think")))}
      <div class="turn-thought">{item.think}</div>
    {/if}
    {#if item.text}
      <div class="turn-text" class:turn-bubble={mine}><Markdown text={item.text} /></div>
    {/if}
    {#if item.verdict}
      <div class="turn-verdict"><Tag tone="negative">{item.verdict.state}</Tag> {item.verdict.message}</div>
    {/if}
    {@render artifacts()}
    {#if mine}
      <div class="turn-head">
        <span class="turn-actions">
          {@render copy()}
          <Key size="mini" tone="ghost" label="retry" title="resend" onclick={() => onretry?.(item.turn)} />
        </span>
        <span title={item.date?.toLocaleString()}>you{at ? ` · ${at}` : ""}</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .turn-day {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow-anchor: none;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    font-weight: 600;
    letter-spacing: var(--shape-label-track);
    text-transform: var(--shape-label-case);
    color: var(--text-light);
  }
  .turn-day::before,
  .turn-day::after {
    content: "";
    flex: 1;
    height: var(--size-ring);
    background: var(--boundary);
  }
  .turn {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
    overflow-anchor: none;
  }
  .turn.mine {
    align-self: flex-end;
    align-items: flex-end;
    gap: 4px;
    max-width: 86%;
  }
  .turn-text { max-width: 92%; color: var(--text-strong); word-break: break-word; text-wrap: pretty; }
  .turn-bubble {
    max-width: 100%;
    padding: 8px 12px;
    border-radius: var(--shape-radius-card);
    background: var(--surface-sunk);
  }
  .turn-head {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    font-family: var(--font-family-code);
    font-size: var(--size-type-2xs);
    color: var(--text-light);
    white-space: nowrap;
  }
  .turn-mark {
    flex: none;
    width: 14px;
    height: 14px;
    background: currentColor;
    -webkit-mask: url(/images/pictogram_viket/pic-vinca-viket_white.svg) center / contain no-repeat;
    mask: url(/images/pictogram_viket/pic-vinca-viket_white.svg) center / contain no-repeat;
  }
  .turn-who { flex: none; color: var(--text-ink); }
  .turn-spacer { flex: 1; }
  .turn-manifest,
  .turn-usage,
  .turn-gloss,
  .turn-pair-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .turn-usage { font-variant-numeric: tabular-nums; }
  .turn-actions { display: inline-flex; gap: 4px; opacity: 0; transition: opacity 0.16s; }
  .turn:hover .turn-actions { opacity: 1; }
  .turn-launches { display: flex; flex-wrap: wrap; gap: 8px; padding-bottom: var(--size-depth); }
  .turn-line { font-weight: 400; letter-spacing: 0; text-transform: none; color: var(--control-on-muted); }
  .turn-thought {
    padding-left: 12px;
    border-left: var(--size-ring) solid var(--boundary);
    font-style: italic;
    color: var(--text-ink);
    white-space: pre-wrap;
  }
  .turn-verdict { font-size: var(--size-type-xs); color: var(--text-light); }
  .turn-output,
  .turn-scroll {
    max-width: 100%;
    max-height: 132px;
    overflow: auto;
    overscroll-behavior: contain;
  }
  .turn-output {
    margin: 0;
    font-family: var(--font-family-code);
    line-height: var(--size-leading-loose);
    color: var(--text-ink);
    white-space: pre-wrap;
  }
  .turn-term { flex: none; color: var(--text-strong); }
  .turn-gloss { flex: 1; font-family: var(--font-family-sans-text); color: var(--text-ink); }
  .turn-meter { flex: 0 0 40px; }
  .turn-pairs {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1px 10px;
    min-width: 0;
    padding-left: 8px;
  }
  .turn-pair-key { color: var(--text-light); }
  .turn-pair-value { color: var(--text-strong); }
  .turn-artifacts { display: flex; flex-wrap: wrap; gap: 6px; }
  .turn-artifact { text-decoration: none; }
  .turn-glyph { color: var(--signal-primary-ink); }
  .turn-image {
    max-width: 100%;
    max-height: 220px;
    border-radius: var(--shape-radius-sm);
    box-shadow: 0 0 0 var(--size-ring) var(--boundary);
  }
  .turn-audio { max-width: 100%; height: 28px; }
  @media (pointer: coarse) {
    .turn-actions { opacity: 1; }
  }
</style>

<script>
  import { soma } from "@vivalence/typology";

  let { terminal, daemon, mode, thread } = $props();

  // one cell, one set of state. nothing is shared, so no cell can report another's outcome.
  let terms = $state("");
  let hits = $state(null);
  let searchVia = $state("");
  let searchFault = $state(null);
  let searching = $state(false);

  let brief = $state("");
  let reportMessage = $state(null);
  let researchFault = $state(null);
  let pages = $state([]);
  let trace = $state([]);
  let researching = $state(false);

  // the inner agent's calls in order, runs collapsed. these arrive live off the stream,
  // never off the yield: only message + buffer ever cross the tool boundary.
  let steps = $derived.by(() => {
    const runs = [];
    for (const name of trace) {
      const last = runs.at(-1);
      if (last && last.name === name) last.count += 1;
      else runs.push({ name, count: 1 });
    }
    return runs.map((run) => (run.count > 1 ? run.name + " ×" + run.count : run.name)).join(" · ");
  });

  let report = $state(null);
  let doctorVia = $state("");
  let doctorFault = $state(null);
  let probing = $state(false);

  // each output folds on its own; nothing folds until there is something to fold.
  let showSearch = $state(true);
  let showDoctor = $state(true);

  let faculties = $derived(daemon.cortex.find({}));
  let attached = $derived(faculties.length > 0);
  const contextWindow = (context) =>
    context >= 1_000_000 ? `${(context / 1_000_000).toFixed(context % 1_000_000 ? 1 : 0)}M` : `${Math.round(context / 1000)}k`;

  let owners = $derived.by(() => {
    const seen = new Map();
    for (const held of report?.registry?.modules ?? []) {
      const owner = seen.get(held.owner) ?? { name: held.owner, count: 0, byType: new Map() };
      owner.count += 1;
      owner.byType.set(held.type, [...(owner.byType.get(held.type) ?? []), held.slug]);
      seen.set(held.owner, owner);
    }
    return [...seen.values()]
      .sort((a, b) => b.count - a.count)
      .map(({ name, count, byType }) => ({
        name,
        count,
        types: [...byType]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([type, slugs]) => ({ type, slugs: slugs.sort() })),
      }));
  });

  let alive = $derived(daemon?.status?.reflection?.code ?? "—");

  const hostOf = (url) => URL.parse(url)?.host?.replace(/^www\./, "") ?? "";

  async function probe() {
    probing = true;
    doctorFault = null;
    try {
      report = await mode.call.hello.doctor();
      doctorVia = `via /hello/doctor · ${report.registry.modules.length} modules · ${report.ledger.instances.length} instances`;
    } catch (error) {
      doctorFault = error.message;
    } finally {
      probing = false;
    }
  }

  async function search(event) {
    event.preventDefault();
    const asked = terms.trim();
    if (!asked || searching) return;
    searching = true;
    searchFault = null;
    hits = null;
    try {
      const found = await mode.call.hello.search({ query: asked });
      // a fault is not an empty result — "nothing came back" would blame the index for
      // thin coverage when the real answer is that it never answered.
      if (found.fault) {
        searchFault = found.fault;
        return;
      }
      hits = found.results;
      searchVia = `via /hello/search · ${found.count} result${found.count === 1 ? "" : "s"} for \u201c${asked}\u201d`;
    } catch (error) {
      searchFault = error.message;
    } finally {
      searching = false;
    }
  }

  async function hallucinate(event) {
    event.preventDefault();
    const asked = brief.trim();
    if (!asked || researching || !attached) return;
    researching = true;
    researchFault = null;
    reportMessage = null;
    pages = [];
    trace = [];
    let folded = null;
    try {
      for await (
        const record of mode.call.hello.research({ brief: asked, thread: thread?.id })
      ) {
        folded = soma.transcript(folded, record);
        if (record.event === "/tool/call") trace = [...trace, record.name];
      }
      const { message, buffer = [] } = folded?.output ?? {};
      pages = buffer;
      if (folded?.condition === "NOMINAL") {
        reportMessage = message ??
          "the researcher drew the page and said nothing about it";
      } else {
        researchFault = "the researcher stopped early — " +
          (folded?.meta?.state ?? "no close");
      }
      // an aperture call is not an emit, so nothing merged these into the store for us.
      const merged = [];
      for (const page of pages) {
        try {
          merged.push((await thread?.daemon?.entities?.buffer?.merge?.(page)) ?? page);
        } catch (_) {
          merged.push(page);
        }
      }
      pages = merged;
    } catch (error) {
      researchFault = error.message;
    } finally {
      researching = false;
    }
  }

  function chat() {
    terminal.setDockCollapsed(false);
  }

  const named = (page) => page.label?.name ?? page.trait?.LABELED?.name ?? `buffer ${page.index}`;

  function open(page) {
    if (terminal) terminal.buffer = page;
  }
</script>

<div class="page">
  <div class="column">
    <header>
      <span class="teal">{mode.type}/{mode.slug}</span>
      <span class="dim">·</span>
      <span class="muted">daemon <span class="bright">{daemon.slug}</span></span>
      <span class="dim">·</span>
      <span class="alive"><span class="pip pulse"></span>{alive}</span>
      <span class="spring"></span>
      <a class="quiet" href="https://docs.vivalence.org" target="_blank" rel="noreferrer">docs ↗</a>
    </header>

    <section class="stack">
      <h1>Hello, world.</h1>
      <p class="lede">
        One app, four endpoints, one greeting — and an agent that can read the machine it runs on.
        Ask it about this runtime: it pulls the live record with
        <span class="code">viva_doctor</span> and answers off that, not off a guess.
      </p>

      <div class="lead">
        <a class="cta" href="https://docs.vivalence.org/12.01_slowstart" target="_blank" rel="noreferrer">
          read the slowstart ↗
        </a>
        <span class="aside">or try it right here ↓</span>
      </div>
    </section>

    <section class="interaction">
      <div class="rule">
        <span class="label">interaction</span>
        <span class="line"></span>
        <span class="trace">aperture · 4 routes</span>
      </div>

      <p class="explainer">
        Four ways in, each one self-contained. Chat and the researcher go through a model and are
        locked until a faculty attaches; search and doctor need no model and are always live.
      </p>

      {#if !attached}
        <section class="notice">
          <span class="pip warm top"></span>
          <div class="note">
            <span class="label warm">no hallucinator attached</span>
            <p class="explainer">
              Give the instance either key and they attach on the next boot.
            </p>
            <div class="pre">
              <span>SECRET_VIVA_ANTHROPIC_API_KEY=…</span>
              <span class="trace">or SECRET_VIVA_OPENROUTER_API_KEY</span>
              <span>viva instance/init</span>
              <span class="trace">then instance/run</span>
            </div>
            <a class="amber" href="https://docs.vivalence.org/12.01_slowstart#4--viva-instancesuse--init--lighthouse" target="_blank" rel="noreferrer">how daemons attach hallucinators ↗</a>
          </div>
        </section>
      {/if}

      <div class="avenues">

        <article class="avenue" class:locked={!attached}>
          <div class="avenue-cap">
            <span class="pip" class:current={attached} class:warm={!attached}></span>
            <span class="avenue-name">Chat with the harness.</span>
            <span class="avenue-route">dock · harness</span>
          </div>
          <p class="avenue-brief">
            Opens the terminal dock on this thread — the full harness, with tools, thinking and
            the markdown the model was briefed on.
          </p>
          <div class="avenue-control">
            <button class="verb harness" onclick={chat} disabled={!attached || !terminal || !thread}>
              Start Chat
            </button>
          </div>
        </article>

        <article class="avenue" class:locked={!attached}>
          <div class="avenue-cap">
            <span class="pip" class:current={attached} class:warm={!attached} class:pulse={researching}></span>
            <span class="avenue-name">Hallucinate a research report.</span>
            <span class="avenue-route">/hello/research · nested agent</span>
          </div>
          <p class="avenue-brief">
            Runs the harness on this thread with a research brief and a bigger budget — it
            searches, opens what is worth opening, writes a report and draws it into a buffer
            you can keep. Its turns land in this conversation.
          </p>
          <div class="avenue-control">
            <form class="brief" class:thinking={researching} onsubmit={hallucinate}>
              <textarea
                bind:value={brief}
                rows="3"
                readonly={researching || !attached}
                placeholder="What to research, who is asking, what they already know, and any angle the page should take."
              ></textarea>
              <div class="brief-foot">
                <span class="trace">
                  {researching ? "the researcher is working — this takes about a minute" : "one call, several model turns"}
                </span>
                <button class="submit" type="submit" disabled={researching || !attached || !brief.trim()}>
                  {researching ? "hallucinating…" : "hallucinate ↵"}
                </button>
              </div>
            </form>
          </div>
          {#if researching || researchFault || reportMessage}
          <div class="avenue-reply">
            {#if researching && steps}
              <p class="trace">{steps}</p>
            {/if}
            {#if researchFault}
              <p class="fault">{researchFault}</p>
              {#if steps}<p class="trace">{steps}</p>{/if}
            {:else if reportMessage}
              <p class="said">{reportMessage}</p>
              {#if steps}<p class="trace">{steps}</p>{/if}
              <div class="drawn">
                {#each pages as page (page.id)}
                  <button class="drawn-page" onclick={() => open(page)} disabled={!terminal}>
                    <span class="drawn-name">{named(page)}</span>
                    <span class="drawn-trace">#{page.index} · {page.view?.hash?.slice(0, 8)} · open ↗</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          {/if}
        </article>

        <article class="avenue">
          <div class="avenue-cap">
            <span class="pip good" class:pulse={searching}></span>
            <span class="avenue-name">Search Wikipedia.</span>
            <span class="avenue-route">/hello/search · wikipedia</span>
            {#if hits || searchFault}
              <button class="fold" onclick={() => (showSearch = !showSearch)}>{showSearch ? "hide ▾" : "show ▸"}</button>
            {/if}
          </div>
          <p class="avenue-brief">
            The English encyclopedia, straight from its own search API. No key, no account, and no
            model in the way — the same client <span class="code">web_search</span> arms.
          </p>
          <div class="avenue-control">
            <form class="agent" class:thinking={searching} onsubmit={search}>
              <input
                bind:value={terms}
                readonly={searching}
                placeholder={searching ? "asking wikipedia…" : "search wikipedia…"} />
              <button class="submit" type="submit" disabled={searching || !terms.trim()}>
                {searching ? "searching…" : "search ↵"}
              </button>
            </form>
          </div>
          {#if searching || searchFault || hits}
          <div class="avenue-reply" class:folded={!showSearch}>
            {#if !showSearch}
              <p class="trace">{searchFault ? "fault hidden" : searchVia}</p>
            {:else if searchFault}
              <p class="fault">{searchFault}</p>
            {:else if hits}
              {#if hits.length}
                <ol class="results">
                  {#each hits as hit}
                    <li>
                      <a class="result-link" href={hit.url} target="_blank" rel="noopener noreferrer">{hit.title}</a>
                      <span class="result-host">{hostOf(hit.url)}</span>
                      {#if hit.snippet}<p class="result-snippet">{hit.snippet}</p>{/if}
                    </li>
                  {/each}
                </ol>
              {:else}
                <p class="said">Nothing came back — no article by that name. Ask for the subject as an article would be titled.</p>
              {/if}
              <p class="trace">{searchVia}</p>
            {/if}
          </div>
          {/if}
        </article>

        <article class="avenue">
          <div class="avenue-cap">
            <span class="pip good" class:pulse={probing}></span>
            <span class="avenue-name">Deterministic Doctor</span>
            <span class="avenue-route">/hello/doctor · paladin</span>
            {#if report || doctorFault}
              <button class="fold" onclick={() => (showDoctor = !showDoctor)}>{showDoctor ? "hide ▾" : "show ▸"}</button>
            {/if}
          </div>
          <p class="avenue-brief">
            This machine's own record, read straight off paladin — the same fold
            <span class="code">viva_doctor</span> hands the model. It fills the three displays below.
          </p>
          <div class="avenue-control">
            <button class="verb" onclick={probe} disabled={probing}>
              {probing ? "reading…" : "read the record"}
            </button>
          </div>
          {#if probing || doctorFault || report}
          <div class="avenue-reply" class:folded={!showDoctor}>
            {#if !showDoctor}
              <p class="trace">{doctorFault ? "fault hidden" : doctorVia}</p>
            {:else if doctorFault}
              <p class="fault">{doctorFault}</p>
            {:else if report}
              <p class="said">Record pulled — daemon, ledger and registry are below.</p>
              <p class="trace">{doctorVia}</p>
            {/if}
          </div>
          {/if}
        </article>

      </div>

    </section>

    {#if report && showDoctor}
      <section class="stack wide">
        <div class="rule">
          <span class="label">daemon</span>
          <span class="line"></span>
          <span class="trace">{report.daemon.slug} {report.daemon.manifest?.version ?? ""}</span>
        </div>

        <div class="sheet">
          <div class="face">
            <span class="glyph">{report.daemon.manifest?.icon?.emoji ?? "◆"}</span>
            <div class="who">
              <span class="name">{report.daemon.manifest?.name ?? report.daemon.slug}</span>
              <span class="trace">{report.daemon.manifest?.description ?? "no description declared"}</span>
            </div>
            <span class="spring"></span>
            {#if report.daemon.faults.length}
              <span class="tally warm">{report.daemon.faults.length} faults</span>
            {:else}
              <span class="tally"><span class="pip good"></span>clean</span>
            {/if}
          </div>

          <dl class="facts">
            <dt>mountpoint</dt>
            <dd class="path">{report.daemon.mountpoint}</dd>
            <dt>lighthouse</dt>
            <dd>{report.daemon.lighthouse.module} <span class="trace">{report.daemon.lighthouse.remote}</span></dd>
            <dt>datamap</dt>
            <dd>{report.daemon.datamap.module} <span class="trace">{report.daemon.datamap.statics?.db?.file ?? ""}</span></dd>
            <dt>entities</dt>
            <dd class="tags">
              {#each report.daemon.datamap.entities as entity}<span class="tag">{entity}</span>{/each}
            </dd>
          </dl>
        </div>

        <div class="band">
          <span class="label">kernel · {report.daemon.kernel.length} {report.daemon.kernel.length === 1 ? "mode" : "modes"}</span>
          {#each report.daemon.kernel as held}
            <div class="unit">
              <div class="crest">
                <span class="teal">{held.type}/{held.slug}</span>
                <span class="spring"></span>
                <span class="trace">{held.mount}</span>
              </div>
              <div class="tags">
                {#each held.traits as trait}<span class="tag teal">{trait}</span>{/each}
              </div>
              <div class="tags">
                {#each held.routes as route}<span class="tag mono">{route}</span>{/each}
              </div>
            </div>
          {/each}
        </div>

        <div class="band">
          <span class="label">hallucinators · declared {report.daemon.hallucinators.length + report.daemon.dormant.length}, attached {report.daemon.hallucinators.length}</span>
          {#each report.daemon.hallucinators as held}
            <div class="line-item">
              <span class="pip good"></span>
              <span class="teal">{held.module}</span>
              <span class="spring"></span>
              <span class="trace">secrets {held.secrets.join(" · ")}</span>
            </div>
          {/each}
          {#each report.daemon.dormant as held}
            <div class="unit dormant">
              <div class="crest">
                <span class="pip warm"></span>
                <span class="amber">{held.at}</span>
                <span class="spring"></span>
                <span class="trace">pruned at the pinhole, before the daemon read it</span>
              </div>
              <dl class="facts">
                {#each held.secrets as secret}
                  <dt>{secret.slot}</dt>
                  <dd>
                    <span class="mono" class:amber={secret.unset}>{secret.key}</span>
                    <span class="trace">{secret.unset ? "unset — nothing in any stratum" : "set"}</span>
                  </dd>
                {/each}
              </dl>
            </div>
          {/each}
        </div>

        <div class="band">
          <span class="label">cortex · {report.daemon.cortex.length} {report.daemon.cortex.length === 1 ? "faculty" : "faculties"}</span>
          {#each report.daemon.cortex as faculty}
            <div class="line-item">
              <span class="pip good"></span>
              <span class="bright">{faculty.config?.model ?? faculty.type}</span>
              <span class="trace">{faculty.provider}</span>
              <span class="spring"></span>
              <span class="trace">{contextWindow(faculty.context)} · tune {faculty.tune.join(" ")} · {faculty.via.join(" ")}</span>
            </div>
          {/each}
          {#if !report.daemon.cortex.length}
            <div class="line-item"><span class="pip warm"></span><span class="amber">no faculty registered</span></div>
          {/if}
        </div>

        {#each report.daemon.faults as fault}
          <div class="line-item"><span class="pip warm"></span><span class="amber">{fault}</span></div>
        {/each}
      </section>

      <section class="stack wide">
        <div class="rule">
          <span class="label">ledger</span>
          <span class="line"></span>
          <span class="trace">{report.ledger.mount}</span>
        </div>

        <div class="band">
          <span class="label">instances · {report.ledger.instances.length}</span>
          {#each report.ledger.instances as held}
            {@const on = held.mount === report.ledger.here}
            <div class="line-item" class:on>
              <span class="pip" class:good={on} class:hollow={!on}></span>
              <span class:teal={on} class:muted={!on}>{held.slug}</span>
              {#if on}<span class="tag teal">you are here</span>{/if}
              <span class="spring"></span>
              <span class="trace">{held.valence ?? held.mount}</span>
            </div>
          {/each}
        </div>

        <div class="band">
          <span class="label">this instance declares</span>
          {#each report.ledger.services as held}
            <div class="line-item">
              <span class="pip good"></span>
              <span class="muted">service</span>
              <span class="teal">{held.slug}</span>
              <span class="spring"></span>
              <span class="trace">{held.module} · secrets {held.secrets.join(" · ")}</span>
            </div>
          {/each}
          {#each report.ledger.clients as held}
            <div class="line-item">
              <span class="pip good"></span>
              <span class="muted">client</span>
              <span class="teal">{held.slug}</span>
              <span class="spring"></span>
              <span class="trace">{held.traits.join(" · ")}</span>
            </div>
          {/each}
        </div>

        <div class="band">
          <span class="label">environment · {report.ledger.environment.filter((held) => held.set).length} resolved, {report.ledger.requirements.filter((held) => held.unset).length} unset</span>
          <dl class="facts">
            {#each report.ledger.environment as held}
              <dt class="mono">{held.key}</dt>
              <dd class="path">{held.set ? "set" : "unset"}</dd>
            {/each}
          </dl>
          {#each report.ledger.requirements.filter((held) => held.unset) as held}
            <div class="line-item">
              <span class="pip warm"></span>
              <span class="amber mono">{held.key}</span>
              <span class="spring"></span>
              <span class="trace">read at {held.at}, unset</span>
            </div>
          {/each}
        </div>
      </section>

      <section class="stack wide">
        <div class="rule">
          <span class="label">registry</span>
          <span class="line"></span>
          <span class="trace">{report.registry.modules.length} modules · {owners.length} owners</span>
        </div>

        <div class="band">
          <span class="label">tapped · {report.registry.locations.length}</span>
          {#each report.registry.locations as location}
            <div class="line-item">
              <span class="pip good"></span>
              <span class="path">{location}</span>
            </div>
          {/each}
          {#each report.registry.stale as location}
            <div class="line-item">
              <span class="pip warm"></span>
              <span class="amber path">{location}</span>
              <span class="spring"></span>
              <span class="trace">recorded, nothing on disk</span>
            </div>
          {/each}
        </div>

        {#each owners as owner}
          <div class="band">
            <span class="label">{owner.name} · {owner.count}</span>
            <dl class="facts">
              {#each owner.types as group}
                <dt>{group.type}</dt>
                <dd class="tags">
                  {#each group.slugs as slug}<span class="tag">{slug}</span>{/each}
                </dd>
              {/each}
            </dl>
          </div>
        {/each}
      </section>
    {/if}

  </div>
</div>

<style>
  .page {
    --zoom: 1.15;
    --ground: var(--colors-skeleton-0-surface);
    --sunk: var(--colors-skeleton-2-surface);
    --raised: var(--colors-skeleton-1-surface);
    --edge: var(--colors-skeleton-2-boundary);
    --edge-strong: var(--colors-skeleton-0-boundary);
    --ink: var(--text-primary);
    --ink-soft: var(--text-body);
    --ink-muted: var(--text-support);
    --ink-faint: var(--text-support);
    --ink-dim: var(--colors-skeleton-0-boundary);
    --teal: var(--colors-skeleton-0-primary-base);
    --teal-bright: var(--colors-skeleton-0-primary-hover);
    --green: var(--colors-skeleton-0-success-base);
    --amber: var(--colors-skeleton-0-warning-base);
    --rust: var(--colors-skeleton-0-danger-base);
    --indigo: var(--colors-system-info-contrast);
    --pip-good: var(--signal-positive);
    --pip-warm: var(--signal-caution);
    --wash: color-mix(in srgb, var(--teal) 9%, transparent);
    --wash-hover: color-mix(in srgb, var(--teal) 16%, transparent);
    --hairline: color-mix(in srgb, var(--edge-strong) 90%, transparent);
    --field: var(--colors-skeleton-3-surface);
    min-height: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    padding: 44px 22px 72px;
    background: var(--ground);
    color: var(--ink);
    font-family: var(--font-family-sans-text);
  }
  .column {
    width: 100%;
    max-width: 760px;
    display: flex;
    flex-direction: column;
    gap: 34px;
  }
  header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 14px;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    letter-spacing: 0.04em;
  }
  .spring {
    flex: 1 1 40px;
  }
  .teal {
    color: var(--teal);
  }
  .dim {
    color: var(--ink-dim);
  }
  .muted {
    color: var(--ink-muted);
  }
  .bright {
    color: var(--ink-soft);
  }
  .amber {
    color: var(--amber);
  }
  .alive {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--green);
  }
  a {
    color: var(--teal);
    text-decoration: none;
  }
  a:hover {
    color: var(--teal-bright);
  }
  a.quiet {
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  a.quiet:hover {
    color: var(--teal);
  }
  a.amber:hover {
    color: var(--colors-skeleton-0-warning-hover);
  }
  .pip {
    flex: none;
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--pip-good);
  }
  .pip.warm {
    background: var(--pip-warm);
  }
  .pip.good {
    background: var(--pip-good);
  }
  .pip.current {
    background: currentColor;
  }
  .pip.hollow {
    background: none;
    border: 1px solid var(--ink-muted);
    box-sizing: border-box;
  }
  .pip.top {
    margin-top: 5px;
  }
  .pulse {
    animation: pip-pulse 1.8s ease-in-out infinite;
  }
  @keyframes pip-pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.95;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .pulse {
      animation: none;
    }
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }
  .stack.wide {
    gap: 10px;
  }
  .interaction {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .lead {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 18px;
  }
  .aside {
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    color: var(--ink-faint);
  }
  .explainer {
    margin: 0;
    max-width: 56ch;
    font-size: calc(var(--font-size-sm) * var(--zoom));
    line-height: 1.6;
    color: var(--ink-muted);
    text-wrap: pretty;
  }
  h1 {
    margin: 0;
    font-family: var(--font-family-sans-heading);
    font-weight: 600;
    font-size: calc(clamp(var(--font-size-2xl), 5.6vw, var(--font-size-4xl)) * var(--zoom));
    line-height: 1.18;
    letter-spacing: -0.015em;
  }
  .lede {
    margin: 0;
    max-width: 56ch;
    font-size: calc(var(--font-size-sm) * var(--zoom));
    line-height: 1.6;
    color: var(--ink-soft);
    text-wrap: pretty;
  }
  .code {
    font-family: var(--font-family-code);
    font-size: 0.92em;
    color: var(--ink);
  }
  .verb {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    height: 36px;
    padding: 0 12px;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--teal) 45%, transparent);
    border-radius: 4px;
    color: var(--teal);
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.12s,
      border-color 0.12s,
      color 0.12s;
  }
  .verb:hover {
    background: var(--wash);
    border-color: var(--teal);
  }
  .verb:disabled {
    opacity: 0.45;
    cursor: progress;
  }
  .verb.harness {
    background: var(--wash);
  }
  .agent {
    flex: none;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    height: 36px;
    padding: 0 8px 0 12px;
    /* the two buttons pad 12px and gap 10px too — all four rows share one left rail */
    box-sizing: border-box;
    background: var(--field);
    border: 1px solid var(--edge-strong);
    border-radius: 4px;
    transition:
      border-color 0.12s,
      box-shadow 0.12s;
  }
  .agent:focus-within {
    border-color: var(--teal);
    box-shadow: 0 0 0 3px var(--wash);
  }
  .agent input {
    flex: 1;
    min-width: 0;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: var(--ink);
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
  }
  .agent input::placeholder {
    color: var(--ink-muted);
  }
  .brief {
    flex: none;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 12px;
    box-sizing: border-box;
    background: var(--field);
    border: 1px solid var(--edge-strong);
    border-radius: 4px;
    transition:
      border-color 0.12s,
      box-shadow 0.12s;
  }
  .brief:focus-within,
  .brief.thinking {
    border-color: var(--teal);
    box-shadow: 0 0 0 3px var(--wash);
  }
  .brief textarea {
    width: 100%;
    box-sizing: border-box;
    min-height: 78px;
    resize: vertical;
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--ink);
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    line-height: 1.55;
  }
  .brief textarea::placeholder {
    color: var(--ink-muted);
  }
  .brief.thinking textarea {
    cursor: progress;
  }
  .brief-foot {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .brief-foot .trace {
    flex: 1;
    min-width: 0;
  }
  .agent.thinking {
    border-color: var(--teal);
    box-shadow: 0 0 0 3px var(--wash);
  }
  .agent.thinking input {
    cursor: progress;
  }
  .submit {
    flex: none;
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 12px;
    background: var(--teal);
    border: 1px solid var(--teal);
    border-radius: 3px;
    color: var(--colors-skeleton-3-surface);
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 0.12s,
      border-color 0.12s;
  }
  .submit:hover {
    background: var(--teal-bright);
    border-color: var(--teal-bright);
  }
  .submit:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .results {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .results li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .result-link {
    color: var(--indigo);
    font-family: var(--font-family-sans-text);
    font-size: calc(var(--font-size-sm) * var(--zoom));
    line-height: 1.35;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  .result-link:hover {
    text-decoration: underline;
  }
  .result-link:visited {
    color: color-mix(in srgb, var(--indigo) 70%, var(--ink-muted));
  }
  .result-host {
    color: var(--ink-muted);
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    overflow-wrap: anywhere;
  }
  .result-snippet {
    margin: 2px 0 0;
    color: var(--ink-soft);
    font-family: var(--font-family-sans-text);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    line-height: 1.45;
  }
  .avenues {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .avenue {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 14px;
    background: var(--raised);
    border: 1px solid var(--edge);
    border-radius: 5px;
  }
  .avenue.locked {
    background: transparent;
    border-style: dashed;
    border-color: color-mix(in srgb, var(--edge-strong) 70%, transparent);
  }
  .avenue-cap {
    display: flex;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
  }
  .avenue-name {
    color: var(--teal);
    font-family: var(--font-family-sans-heading);
    font-size: calc(var(--font-size-sm) * var(--zoom));
    font-weight: 600;
    letter-spacing: 0;
    text-transform: none;
  }
  .avenue-route {
    flex: 1;
    min-width: 0;
    color: var(--ink-faint);
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    text-align: right;
    overflow-wrap: anywhere;
  }
  .avenue-brief {
    margin: 0;
    color: var(--ink-soft);
    font-family: var(--font-family-sans-text);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    line-height: 1.5;
  }
  .avenue.locked .avenue-brief {
    opacity: 0.55;
  }
  /* every property is declared, because an unscoped `section .x` global can claim any one
     this rule leaves open — svelte scoping raises specificity, it does not isolate. */
  .avenue-control {
    display: flex;
    height: auto;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
  }
  .avenue-control > * {
    width: 100%;
  }
  .avenue-reply {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
    min-height: 30px;
    padding: 8px 10px;
    background: var(--sunk);
    border: 1px solid var(--hairline);
    border-radius: 4px;
  }
  .avenue-reply.folded {
    min-height: 0;
    padding: 4px 10px;
    background: transparent;
  }
  .fold {
    flex: none;
    margin: 0;
    padding: 0 6px;
    height: 20px;
    background: transparent;
    border: 1px solid var(--hairline);
    border-radius: 3px;
    color: var(--ink-muted);
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.08em;
    white-space: nowrap;
    cursor: pointer;
  }
  .fold:hover {
    color: var(--teal);
    border-color: var(--teal);
  }
  .drawn {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .drawn-page {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    margin: 0;
    padding: 6px 10px;
    background: var(--wash);
    border: 1px solid color-mix(in srgb, var(--teal) 45%, transparent);
    border-radius: 4px;
    color: var(--teal);
    text-align: left;
    cursor: pointer;
  }
  .drawn-page:hover {
    background: var(--wash-hover);
    border-color: var(--teal);
  }
  .drawn-page:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .drawn-name {
    font-family: var(--font-family-sans-heading);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    font-weight: 600;
  }
  .drawn-trace {
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.08em;
    color: var(--ink-faint);
  }
  .sheet {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px;
    background: var(--raised);
    border: 1px solid var(--edge);
    border-radius: 8px;
  }
  .face {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .glyph {
    flex: none;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    background: var(--sunk);
    border: 1px solid var(--edge);
    border-radius: 8px;
    font-size: calc(var(--font-size-sm) * var(--zoom));
  }
  .who {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .name {
    font-family: var(--font-family-sans-heading);
    font-size: calc(var(--font-size-sm) * var(--zoom));
    font-weight: 600;
    color: var(--ink);
  }
  .tally {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }
  .tally.warm {
    color: var(--amber);
  }
  .facts {
    display: grid;
    grid-template-columns: minmax(9ch, max-content) 1fr;
    gap: 6px 16px;
    margin: 0;
    align-items: baseline;
  }
  .facts dt {
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.08em;
    color: var(--ink-faint);
  }
  .facts dd {
    margin: 0;
    min-width: 0;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    color: var(--ink-soft);
  }
  .path {
    overflow-wrap: anywhere;
    color: var(--ink-soft);
  }
  .band {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    background: var(--sunk);
    border: 1px solid var(--edge);
    border-radius: 8px;
  }
  .unit {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
    background: var(--raised);
    border: 1px solid var(--edge);
    border-radius: 6px;
  }
  .crest {
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    background: var(--raised);
    border: 1px solid var(--edge);
    border-radius: 3px;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.06em;
    color: var(--ink-soft);
    white-space: nowrap;
  }
  .tag.teal {
    border-color: var(--wash-hover);
    background: var(--wash);
    color: var(--teal);
  }
  .tag.mono {
    color: var(--ink-muted);
  }
  .line-item {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
  }
  .line-item .pip {
    align-self: center;
  }
  .unit.dormant {
    border-color: var(--edge-strong);
  }
  .unit.dormant .facts {
    padding-left: 16px;
  }
  .said {
    margin: 0;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    line-height: 1.5;
    color: var(--ink);
  }
  .trace {
    margin: 0;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.08em;
    color: var(--ink-faint);
  }
  .label {
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-2xs) * var(--zoom));
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-muted);
    white-space: nowrap;
  }
  .label.warm {
    color: var(--amber);
  }
  .notice {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
    background: color-mix(in srgb, var(--amber) 7%, transparent);
    border: 1px solid color-mix(in srgb, var(--amber) 45%, transparent);
    border-radius: 8px;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }
  .note {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
  }
  .pre {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    gap: 3px 16px;
    padding: 8px 10px;
    background: var(--sunk);
    border: 1px solid var(--edge);
    border-radius: 6px;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre;
  }
  .fault {
    margin: 0;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    color: var(--rust);
  }
  .rule {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .line {
    flex: 1;
    height: 1px;
    background: var(--hairline);
  }
  .cta {
    flex: none;
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 20px;
    background: var(--wash);
    border: 1px solid color-mix(in srgb, var(--teal) 45%, transparent);
    border-radius: 4px;
    font-family: var(--font-family-code);
    font-size: calc(var(--font-size-xs) * var(--zoom));
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
    transition:
      background 0.12s,
      border-color 0.12s;
  }
  .cta:hover {
    background: var(--wash-hover);
    border-color: var(--teal);
  }
</style>

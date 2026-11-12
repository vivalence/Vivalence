import { For, Index, Match, Show, Switch } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Spans, Told } from "./Logger.jsx";

export const CELLS = 16;

const decimals = (step) => (String(step).includes(".") ? String(step).split(".")[1].length : 0);

export const stepped = (value, step) => Number(value.toFixed(decimals(step)));

export const spoken = (edit, value) => (edit.nature === "/set" ? `/set ${edit.path} ${value}` : `${edit.nature} ${value}`);

export const moved = (edit, by) => spoken(edit, stepped(Math.min(edit.max, Math.max(edit.min, edit.value + by)), edit.step));

export const lighted = (edit) => Math.round(((edit.value - edit.min) / (edit.max - edit.min)) * CELLS);

const classed = (...names) => names.filter(Boolean).join(" ");

const pressed = (edit, option) => String(Array.isArray(edit.value) ? edit.value.includes(option) : String(edit.value) === option);

const Choice = (props) => (
  <span class="kit-choice">
    <For each={props.edit.opts}>
      {(option) => (
        <button aria-pressed={pressed(props.edit, option)} onClick={() => props.onLine(spoken(props.edit, option))}>
          {option}
        </button>
      )}
    </For>
  </span>
);

const EDITS = {
  choice: Choice,
  set: Choice,
  select: (props) => (
    <select class="ins-sel" aria-label={props.k} onChange={(event) => props.onLine(spoken(props.edit, event.currentTarget.value))}>
      <For each={props.edit.opts}>
        {(option) => (
          <option value={option} selected={option === props.edit.value}>
            {option}
          </option>
        )}
      </For>
    </select>
  ),
  step: (props) => (
    <>
      <button class="ins-step" aria-label="less" onClick={(event) => props.onLine(moved(props.edit, -props.edit.step * (event.shiftKey ? 10 : 1)))}>
        −
      </button>
      <span class="ins-num">{props.edit.value.toFixed(decimals(props.edit.step))}</span>
      <button class="ins-step" aria-label="more" onClick={(event) => props.onLine(moved(props.edit, props.edit.step * (event.shiftKey ? 10 : 1)))}>
        +
      </button>
      <span class="ins-cells" aria-hidden="true">
        <For each={Array.from({ length: CELLS }, (_, index) => index)}>{(index) => <i class={index < lighted(props.edit) ? "on" : ""} />}</For>
      </span>
    </>
  ),
  field: (props) => {
    const commit = (element) => {
      if (element.value !== props.edit.value) props.onLine(spoken(props.edit, element.value));
    };
    return (
      <label class="kit-field is-repl ins-text">
        <input
          aria-label={props.k}
          placeholder="name, enter"
          value={props.edit.value}
          spellcheck={false}
          onBlur={(event) => commit(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(event.currentTarget);
          }}
        />
      </label>
    );
  },
};

const edited = (kind) => {
  if (!Object.hasOwn(EDITS, kind)) throw new Error(`[drapes] not an inspector edit: ${JSON.stringify(kind)} · ${Object.keys(EDITS).join(" · ")}`);
  return EDITS[kind];
};

const Value = (props) => (
  <Switch fallback={<span class="tx">{props.row.v}</span>}>
    <Match when={props.row.go !== null}>
      <button class="ins-link tx" onClick={() => props.onPick(props.row.go)}>
        {props.row.v}
      </button>
    </Match>
    <Match when={props.row.edit !== null}>
      <Dynamic component={edited(props.row.edit.kind)} k={props.row.k} edit={props.row.edit} onLine={props.onLine} />
    </Match>
  </Switch>
);

const Kv = (props) => (
  <div class={classed("ins-kv", props.row.cls, props.row.edit !== null && ["set", "choice"].includes(props.row.edit.kind) && "is-tall")}>
    <span class="k">{props.row.k}</span>
    <span class="v">
      <Value row={props.row} onPick={props.onPick} onLine={props.onLine} />
      <span class="ins-bang">{props.row.bang ? "!" : ""}</span>
    </span>
    <span class="q">{props.row.q}</span>
  </div>
);

const TAILS = { dot: "kit-dot is-healthy", live: "live", count: "c", "": "" };

const Tree = (props) => (
  <div class="ins-col" role="tree" aria-label="entities">
    <label class="kit-field is-repl ins-filter">
      <span class="p">⌕</span>
      <input aria-label="filter" placeholder="filter" value={props.query} spellcheck={false} onInput={(event) => props.onQuery(event.currentTarget.value)} />
    </label>
    <div class="kit-choice ins-lens" role="tablist" aria-label="index">
      <For each={props.lenses}>
        {(lens) => (
          <button role="tab" aria-pressed={String(lens.cur)} aria-selected={String(lens.cur)} onClick={() => props.onLens(lens.id)}>
            {lens.label}
            <span class="ins-ln">{lens.n}</span>
          </button>
        )}
      </For>
    </div>
    <div class="ins-scroll">
      <Index each={props.nodes}>
        {(held) => (
          <div class="ins-node" role="treeitem" aria-current={String(held().cur)} style={{ "padding-left": `calc(.25rem + ${Math.min(held().depth, 9) * 1.25}ch)` }}>
            <button class="f" aria-label={`${held().kids ? "fold" : "open"} ${held().name}`} onClick={() => (held().kids ? props.onFold(held().id) : props.onPick(held().go))}>
              {held().sign}
            </button>
            <button class="m" onClick={() => props.onPick(held().go)}>
              <span class={classed("nm", held().strong && "is-strong")}>{held().name}</span>
              <span class="q">{held().quiet}</span>
              <span class="ins-bang">{held().bang ? "!" : ""}</span>
              <span class={TAILS[held().tail]}>{held().tail === "dot" ? "" : held().tailText}</span>
            </button>
          </div>
        )}
      </Index>
      <Show when={props.nodes.length === 0}>
        <div class="ins-empty">nothing matches</div>
      </Show>
    </div>
  </div>
);

const Entity = (props) => (
  <div class="ins-col">
    <div class="ins-oh">
      <span class="kit-label">{props.node.kind}</span>
      <b>{props.node.title}</b>
      <span class="kit-quiet">{props.node.ref}</span>
      <span class="ins-gap" />
      <button class="ins-act" onClick={() => props.onAct({ kind: "copy", text: props.node.ref })}>
        copy
      </button>
      <button class="ins-act" aria-pressed={String(props.json)} onClick={() => props.onJson(!props.json)}>
        json
      </button>
      <For each={props.node.acts}>
        {(act) => (
          <button class="ins-act" aria-pressed={String(act.kind === "read" && props.node.peek !== null)} onClick={() => props.onAct(act)}>
            {act.name}
          </button>
        )}
      </For>
    </div>
    <nav class="ins-crumbs" aria-label="path">
      <For each={props.node.crumbs}>
        {(crumb) => (
          <>
            <button class="ins-link" onClick={() => props.onPick(crumb.id)}>
              {crumb.name}
            </button>
            <span>›</span>
          </>
        )}
      </For>
      <span>{props.node.kind}</span>
    </nav>
    <div class="ins-scroll">
      <Show when={props.node.peek !== null}>
        <pre class="ins-pre is-prose">{props.node.peek}</pre>
      </Show>
      <Show when={props.json}>
        <pre class="ins-pre">{JSON.stringify(Object.fromEntries(props.node.sections.map((section) => [section.label, Object.fromEntries(section.rows.map((row) => [row.k, row.v]))])), null, 2)}</pre>
      </Show>
      <Index each={props.node.sections}>
        {(section) => (
          <>
            <div class="ins-sec">
              <span class="kit-label">{section().label}</span>
            </div>
            <Index each={section().rows}>{(row) => <Kv row={row()} onPick={props.onPick} onLine={props.onLine} />}</Index>
          </>
        )}
      </Index>
    </div>
  </div>
);

const Trace = (props) => (
  <div class="ins-col">
    <div class="ins-th">
      <span class="kit-label">trace</span>
      <span class="ins-gap" />
      <span class="kit-choice">
        <button aria-pressed={String(props.trace.only === "all")} onClick={() => props.onOnly("all")}>
          {`all ${props.trace.all}`}
        </button>
        <button aria-pressed={String(props.trace.only === "faults")} onClick={() => props.onOnly("faults")}>
          {`faults ${props.trace.faults}`}
        </button>
      </span>
    </div>
    <div class="ins-spans">
      <Spans rows={props.trace.rows} onPick={props.onSpan} />
      <Show when={props.trace.rows.length === 0}>
        <div class="ins-empty">no span touches this</div>
      </Show>
    </div>
    <Show when={props.trace.detail}>{(detail) => <Told detail={detail()} stack={props.stack} onStack={props.onStack} onLine={props.onLine} />}</Show>
  </div>
);

export const Inspector = (props) => (
  <div class="ins-body">
    <Tree lenses={props.lenses} query={props.query} nodes={props.nodes} onQuery={props.onQuery} onLens={props.onLens} onPick={props.onPick} onFold={props.onFold} />
    <div class="ins-div" />
    <Entity node={props.node} json={props.json} onJson={props.onJson} onAct={props.onAct} onPick={props.onPick} onLine={props.onLine} />
    <div class="ins-div" />
    <Trace trace={props.trace} stack={props.stack} onOnly={props.onOnly} onSpan={props.onSpan} onStack={props.onStack} onLine={props.onLine} />
  </div>
);

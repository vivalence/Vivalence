import { For, Show } from "solid-js";
import { Icon } from "./Icon.jsx";

export const INDENT = 14;
export const SLOW = 500;
export const DEEPEST = 4;
export const TONES = { RUNNING: "pri", PAUSED: "cau", STOPPING: "cau", DONE: "pos", STOPPED: "mut", FAILED: "neg", ABORTED: "neg", IDLE: "mut" };

export const tone = (code) => (Object.hasOwn(TONES, code) ? TONES[code] : "mut");

const SPANS = [
  [(value) => value === null, () => "—"],
  [(value) => value < 1, () => "<1ms"],
  [(value) => value < 1000, (value) => `${Math.round(value)}ms`],
  [(value) => value < 10000, (value) => `${(value / 1000).toFixed(2)}s`],
  [() => true, (value) => `${(value / 1000).toFixed(1)}s`],
];
export const ms = (value) => SPANS.find(([test]) => test(value))[1](value);

const classed = (...names) => names.filter(Boolean).join(" ");

const Bar = (props) => (
  <span class="tbar">
    <i class={tone(props.code)} style={{ left: `${props.l.toFixed(1)}%`, width: `${Math.min(100 - props.l, props.w).toFixed(1)}%` }} />
  </span>
);

const Trow = (props) => (
  <div
    class={classed("trow", props.row.sel && "sel", props.row.fault && "neg", `d${Math.min(props.row.depth, DEEPEST)}`)}
    role="treeitem"
    aria-selected={String(props.row.sel)}
    title={props.row.path}
    onClick={() => props.onSelect(props.row.id)}>
    <span class="tw" style={{ "padding-left": `${props.row.depth * INDENT}px` }}>
      <Show when={props.row.kids} fallback={<span class="tfold" />}>
        <button
          class="tfold"
          aria-label={props.row.open ? "fold" : "unfold"}
          onClick={(event) => {
            event.stopPropagation();
            props.onFold(props.row.id, !props.row.open);
          }}>
          {props.row.open ? "▾" : "▸"}
        </button>
      </Show>
      <span class={classed("tc", tone(props.row.code), props.row.live && "live")} title={props.row.code.toLowerCase()} />
      <span class="tn">{props.row.nature}</span>
      <Show when={props.row.sub}>
        <span class="tbad">!</span>
      </Show>
      <Show when={props.row.kids && !props.row.open}>
        <span class="tk">{props.row.kids}</span>
      </Show>
    </span>
    <Bar code={props.row.code} l={props.row.l} w={props.row.w} />
    <span class={classed("tms", props.row.dur !== null && props.row.dur > SLOW && "cau")}>{ms(props.row.dur)}</span>
  </div>
);

const Detail = (props) => (
  <div class="td">
    <div class="tdh">
      <span class={classed("tc", tone(props.detail.code), props.detail.live && "live")} />
      <b>{props.detail.nature}</b>
      <span class={classed("chip", tone(props.detail.code))}>{props.detail.code.toLowerCase()}</span>
      <span class="sp" />
      <span class="mut">{ms(props.detail.dur)}</span>
      <button class="iconbtn" aria-label="close the detail" onClick={() => props.onSelect(null)}>
        <Icon name="x" size={14} />
      </button>
    </div>
    <div class="tkv">
      <span>path</span>
      <code>{props.detail.path}</code>
      <span>span</span>
      <code>{`${props.detail.id}${props.detail.trace !== "" ? ` · trace ${props.detail.trace}` : ""}`}</code>
      <Show when={props.detail.fault !== null}>
        <span class="neg">fault</span>
        <code class="neg">{[props.detail.fault.code, props.detail.fault.message].filter(Boolean).join(" · ")}</code>
      </Show>
    </div>
    <Show when={props.detail.signals.length}>
      <div class="tsig">
        <For each={props.detail.signals}>
          {(signal) => (
            <button
              disabled={signal.off}
              class={signal.sig === "SIGKILL" || signal.sig === "SIGTERM" ? "neg" : ""}
              onClick={() => props.onLine(signal.signal)}>
              {signal.sig}
            </button>
          )}
        </For>
      </div>
    </Show>
    <Show when={props.detail.entries.length}>
      <div class="tsec">records</div>
      <div class="tents">
        <For each={props.detail.entries}>
          {(entry) => (
            <div class="tent">
              <span class="v">{entry.track}</span>
              <span class="t">+{ms(entry.rel)}</span>
              <code title={entry.data}>{entry.data}</code>
            </div>
          )}
        </For>
      </div>
    </Show>
    <Show when={props.detail.kids.length}>
      <div class="tsec">children · {props.detail.kids.length}</div>
      <div class="twf">
        <For each={props.detail.kids}>
          {(kid) => (
            <div class="twr" onClick={() => props.onSelect(kid.id)}>
              <span class="tn">{kid.nature}</span>
              <Bar code={kid.code} l={kid.l} w={kid.w} />
              <span class="tms">{ms(kid.dur)}</span>
            </div>
          )}
        </For>
      </div>
    </Show>
  </div>
);

export const Logger = (props) => (
  <>
    <div class="tfil">
      <For each={props.filters}>
        {(filter) => (
          <button class={classed(filter.cur && "cur", filter.id === "faults" && filter.n && "neg")} onClick={() => props.onFilter(filter.id)}>
            {filter.id}
            <span>{filter.n}</span>
          </button>
        )}
      </For>
      <span class="sp" />
      <button class="ghost" onClick={() => props.onLine("/telemetry/clear")}>
        clear
      </button>
    </div>
    <div class={classed("tsplit", props.detail !== null && "has")}>
      <div class="tl" role="tree">
        <Show when={props.rows.length} fallback={<div class="tempty">no spans</div>}>
          <For each={props.rows}>{(row) => <Trow row={row} onSelect={props.onSelect} onFold={props.onFold} />}</For>
        </Show>
      </div>
      <Show when={props.detail} keyed>
        {(detail) => <Detail detail={detail} onSelect={props.onSelect} onLine={props.onLine} />}
      </Show>
    </div>
  </>
);

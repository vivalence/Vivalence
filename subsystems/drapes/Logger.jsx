import { For, Index, Show } from "solid-js";

export const DOTS = { fault: "is-fault", live: "is-running", idle: "", done: "is-healthy" };

const SPANS = [
  [(value) => value === null, () => "—"],
  [(value) => value < 1, () => "<1ms"],
  [(value) => value < 1000, (value) => `${Math.round(value)}ms`],
  [(value) => value < 10000, (value) => `${(value / 1000).toFixed(2)}s`],
  [() => true, (value) => `${(value / 1000).toFixed(1)}s`],
];
export const ms = (value) => SPANS.find(([test]) => test(value))[1](value);

const timed = (row) => (row.live ? "live" : ms(row.dur));

const classed = (...names) => names.filter(Boolean).join(" ");

export const Spans = (props) => (
  <Index each={props.rows}>
    {(row) => (
      <button class="ins-span" aria-current={String(row().cur)} onClick={() => props.onPick(row().id)}>
        <span class="n" style={{ "padding-left": `${row().depth * 1.5}ch` }}>
          <span class={classed("kit-dot", DOTS[row().tone])} />
          <span class="nm">{row().name}</span>
          <span class="kit-quiet">{row().quiet}</span>
          <span class="ins-bang">{row().bang ? "!" : ""}</span>
        </span>
        <span class="ins-bar">
          <i
            class={row().tone === "fault" ? "is-fault" : row().live ? "is-live" : ""}
            style={{ left: `${row().l.toFixed(1)}%`, width: `${Math.min(row().w, 100 - row().l).toFixed(1)}%` }}
          />
        </span>
        <span class={classed("ms", row().live && "is-live", row().slow && "is-slow")}>{timed(row())}</span>
      </button>
    )}
  </Index>
);

const said = (fault) => `! ${fault.code === undefined ? fault.type : fault.code}`;

export const Told = (props) => (
  <div class="ins-scroll">
    <div class="ins-path">{props.detail.path}</div>
    <div class="ins-meta">{[props.detail.code, props.detail.live ? "live" : props.detail.dur === null ? "no duration" : ms(props.detail.dur)].join(" · ")}</div>
    <Show when={props.detail.fault}>
      {(fault) => (
        <div class="ins-fault">
          {`${said(fault())} · ${props.detail.nature}`}
          <br />
          {fault().message}
        </div>
      )}
    </Show>
    <Show when={props.detail.signals.length}>
      <div class="ins-th">
        <For each={props.detail.signals}>
          {(held) => (
            <button class="ins-act" disabled={held.off} onClick={() => props.onLine(held.signal)}>
              {held.sig}
            </button>
          )}
        </For>
      </div>
    </Show>
    <Index each={props.detail.entries}>
      {(entry) => (
        <div class="ins-rec">
          <span class="t">{`+${entry().rel.toFixed(1)}`}</span>
          <span>{entry().track}</span>
          <span class={entry().track === "fault" ? "neg" : ""} title={entry().data}>
            {entry().data}
          </span>
        </div>
      )}
    </Index>
    <Show when={props.detail.fault !== null && props.detail.fault.stack !== undefined}>
      <div class="ins-th">
        <button class="ins-act" aria-expanded={String(props.stack)} onClick={() => props.onStack(!props.stack)}>
          {`${props.stack ? "▾" : "▸"} stack`}
        </button>
      </div>
      <Show when={props.stack}>
        <pre class="ins-pre">{props.detail.fault.stack}</pre>
      </Show>
    </Show>
  </div>
);

export const Logger = (props) => (
  <div class="ins-log">
    <div class="ins-col">
      <div class="ins-th">
        <span class="kit-choice" role="tablist" aria-label="filter">
          <For each={props.filters}>
            {(filter) => (
              <button role="tab" aria-pressed={String(filter.cur)} aria-selected={String(filter.cur)} onClick={() => props.onFilter(filter.id)}>
                {`${filter.id} ${filter.n}`}
              </button>
            )}
          </For>
        </span>
      </div>
      <div class="ins-spans">
        <Spans rows={props.rows} onPick={props.onSelect} />
        <Show when={props.rows.length === 0}>
          <div class="ins-empty">no spans · /telemetry/clear moved the watermark</div>
        </Show>
      </div>
    </div>
    <div class="ins-div" />
    <div class="ins-col">
      <Show when={props.detail} fallback={<div class="ins-empty">pick a span</div>}>
        {(detail) => <Told detail={detail()} stack={props.stack} onStack={props.onStack} onLine={props.onLine} />}
      </Show>
    </div>
  </div>
);

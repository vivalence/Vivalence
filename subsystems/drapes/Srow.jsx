import { For, Index, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Dot } from "./Dot.jsx";
import { holding } from "./hold.js";
import { Dset } from "./Pop.jsx";
import { Sbfilter } from "./Sbfilter.jsx";

const words = (...list) => list.filter((word) => word).join(" ");

const Key = (props) => {
  const hold = holding(() => props.onAct({ signal: props.entry.hold }));
  const held = () => props.entry.hold !== undefined && !props.entry.off;
  return (
    <button
      class={words("sk", props.entry.on && "on", props.entry.off && "off", props.entry.tone)}
      disabled={props.entry.off}
      data-signal={props.entry.off ? undefined : props.entry.signal}
      data-hold={held() ? props.entry.hold : undefined}
      title={props.entry.title}
      onClick={() => props.onAct(props.entry)}
      onPointerDown={() => held() && hold.press()}
      onPointerUp={hold.release}
      onPointerLeave={hold.release}>
      {props.entry.label}
    </button>
  );
};

export const ROWS = {
  sub: (props) => (
    <div class="srow sub">
      <span>{props.row.label}</span>
      <span class="c">{props.row.count}</span>
    </div>
  ),
  item: (props) => (
    <button class={words("srow item", props.row.cur && "cur")} data-signal={props.row.signal} title={props.row.title} onClick={() => props.onAct(props.row)}>
      <span class="mk">{props.row.mark}</span>
      <span class="lab">{props.row.label}</span>
      <span class="sub">{props.row.sub}</span>
      <Show when={props.row.dot !== ""}>
        <span class={`dot ${props.row.dot}`} />
      </Show>
    </button>
  ),
  keys: (props) => (
    <div class="srow keys">
      <For each={props.row.keys}>{(entry) => <Key entry={entry} onAct={props.onAct} />}</For>
    </div>
  ),
  choice: (props) => (
    <div class="srow choice">
      <span class="cl">{props.row.label}</span>
      <span class="cc">
        <For each={props.row.chips}>
          {(chip) => (
            <button class={chip.cur ? "cur" : ""} data-signal={chip.signal} title={chip.signal} onClick={() => props.onAct(chip)}>
              {chip.label}
            </button>
          )}
        </For>
      </span>
    </div>
  ),
  chips: (props) => (
    <div class="srow chips">
      <For each={props.row.chips}>
        {(chip) => (
          <button class={chip.on ? "on" : ""} data-signal={chip.signal} title={chip.signal} onClick={() => props.onAct(chip)}>
            {chip.label}
          </button>
        )}
      </For>
    </div>
  ),
  value: (props) => (
    <div class="srow value">
      <Show when={props.row.dot !== ""}>
        <Dot tone={props.row.dot} />
      </Show>
      <span class="lab">{props.row.label}</span>
      <span class="v">{props.row.value}</span>
    </div>
  ),
  meter: (props) => (
    <div class="srow meter">
      <span class="cl">{props.row.label}</span>
      <span class="track">
        <span class={words("fill", props.row.tone)} style={`width:${props.row.pct}%`} />
      </span>
      <span class="v">{props.row.text}</span>
    </div>
  ),
  stepper: (props) => (
    <div class="srow stepper">
      <span class="cl">{props.row.label}</span>
      <button data-signal={props.row.dec} aria-label="less" title={props.row.dec} onClick={() => props.onAct({ signal: props.row.dec })}>
        −
      </button>
      <span class="v">{props.row.value}</span>
      <button data-signal={props.row.inc} aria-label="more" title={props.row.inc} onClick={() => props.onAct({ signal: props.row.inc })}>
        +
      </button>
    </div>
  ),
  check: (props) => (
    <button class="srow check" data-signal={props.row.signal} onClick={() => props.onAct(props.row)}>
      <span class={props.row.on ? "mk pri" : "mk"}>{props.row.on ? "●" : "○"}</span>
      <span class="lab">{props.row.label}</span>
      <span class="v">{props.row.value}</span>
    </button>
  ),
  tags: (props) => (
    <div class="srow tags">
      <For each={props.row.tags}>
        {(tag) => (
          <button class={tag.on ? "on" : ""} data-signal={tag.signal} aria-pressed={tag.on ? "true" : "false"} title={tag.signal} onClick={() => props.onAct(tag)}>
            {tag.label}
          </button>
        )}
      </For>
    </div>
  ),
  filter: (props) => <Sbfilter row={props.row} pre={props.pre} onAct={props.onAct} onFilter={props.onFilter} />,
  display: (props) => (
    <div class="srow dset">
      <Dset dset={props.row} onAct={props.onAct} />
    </div>
  ),
  more: (props) => (
    <button class="srow more" data-signal={props.row.signal} onClick={() => props.onAct(props.row)}>
      {props.row.label}
    </button>
  ),
};

export const shaped = (type) => {
  if (!Object.hasOwn(ROWS, type)) throw new Error(`[drapes] not a sidebar row: ${JSON.stringify(type)} · ${Object.keys(ROWS).join(" · ")}`);
  return ROWS[type];
};

export const Srow = (props) => <Dynamic component={shaped(props.row.type)} row={props.row} pre={props.pre} onAct={props.onAct} onFilter={props.onFilter} />;

export const Section = (props) => (
  <div class={props.section.head ? "subj" : "subj headless"} data-sec={props.section.id}>
    <Show when={props.section.head}>
      <div class="subjh" title={`ctrl-v ${props.section.key}`}>
        <span class="t">{props.section.title}</span>
      </div>
    </Show>
    <div class="subjb">
      <Index each={props.section.rows}>{(row) => <Srow row={row()} pre={props.pre} onAct={props.onAct} onFilter={props.onFilter} />}</Index>
    </div>
  </div>
);

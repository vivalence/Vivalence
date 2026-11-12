import { For, Index, onCleanup, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Dot } from "./Dot.jsx";
import { Meter } from "./Meter.jsx";
import { holding, repeating } from "./hold.js";
import { Dset } from "./Pop.jsx";
import { Sbfilter } from "./Sbfilter.jsx";
import { Toggles } from "./Toggles.jsx";
import { Tune } from "./Tune.jsx";

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

const Step = (props) => {
  const repeat = repeating((coarse) => props.onAct({ signal: coarse ? props.coarse : props.fine }));
  onCleanup(repeat.leave);
  return (
    <button
      data-signal={props.fine}
      aria-label={props.label}
      title={props.fine}
      onClick={(event) => repeat.click(event.shiftKey)}
      onPointerDown={(event) => repeat.press(event.shiftKey)}
      onPointerUp={repeat.release}
      onPointerLeave={repeat.leave}
      onPointerCancel={repeat.leave}>
      {props.glyph}
    </button>
  );
};

const Sub = (props) => (
  <Dynamic component={props.row.fn ? "button" : "div"} class="srow sub" onClick={props.row.fn ? () => props.onAct(props.row) : undefined}>
    <span>{props.row.label}</span>
    <span class="c">{props.row.count}</span>
    <Show when={props.row.fn}>
      <span class="chev">{props.row.open ? "▾" : "▸"}</span>
    </Show>
  </Dynamic>
);

const Item = (props) => (
  <button class={words("srow item", props.row.cur && "cur")} data-signal={props.row.signal} title={props.row.title} onClick={() => props.onAct(props.row)}>
    <span class={words("mk", props.row.mk)}>{props.row.mark}</span>
    <span class="lab">{props.row.label}</span>
    <span class="sub">{props.row.sub}</span>
    <Show when={props.row.dot !== ""}>
      <span class={`dot ${props.row.dot}`} />
    </Show>
  </button>
);

const Pairs = (props) => (
  <span class="tally">
    <For each={props.pairs}>
      {(pair) => (
        <span class="pair">
          <span class={words("g", pair.mk)}>{pair.mark}</span>
          <span>{pair.count}</span>
        </span>
      )}
    </For>
  </span>
);

const Node = (props) => (
  <div
    class={words("srow node", props.row.cur && "cur", props.row.rail >= 0 && "railed")}
    style={`--depth:${props.row.depth};--rail:${props.row.rail}`}>
    <button class="hit" data-signal={props.row.signal} title={props.row.title} onClick={() => props.onAct(props.row)}>
      <span class={words("mk", props.row.mk)}>{props.row.mark}</span>
      <span class={words("lab", props.row.lc)}>{props.row.label}</span>
      <span class="sub">{props.row.sub}</span>
      <Pairs pairs={props.row.tally} />
    </button>
    <span class="set" role="group" aria-label="set">
      <For each={props.row.set}>
        {(entry) => (
          <button
            class={words(entry.on && "on", entry.tone)}
            disabled={entry.off}
            aria-pressed={entry.on ? "true" : "false"}
            aria-label={entry.title}
            data-signal={entry.signal}
            title={entry.title}
            onClick={() => props.onAct(entry)}>
            {entry.mark}
          </button>
        )}
      </For>
    </span>
    <Show when={props.row.fold !== null} fallback={<span class="fold" />}>
      <button class="fold" aria-label="fold" onClick={() => props.onAct(props.row.fold)}>
        {props.row.fold.mark}
      </button>
    </Show>
  </div>
);

export const ROWS = {
  sub: (props) => (
    <Show when={props.row.chips !== undefined} fallback={<Sub row={props.row} onAct={props.onAct} />}>
      <div class="srow sub strip">
        <button class="hit" aria-expanded={props.row.open ? "true" : "false"} onClick={() => props.onAct(props.row)}>
          {props.row.label}
        </button>
        <Pairs pairs={props.row.tally} />
        <span class="view" role="group" aria-label="view">
          <For each={props.row.chips}>
            {(chip) => (
              <button class={chip.cur ? "cur" : ""} aria-pressed={chip.cur ? "true" : "false"} data-signal={chip.signal} title={chip.signal} onClick={() => props.onAct(chip)}>
                {chip.label}
              </button>
            )}
          </For>
        </span>
        <button class="chev" aria-label="fold" onClick={() => props.onAct(props.row)}>
          {props.row.open ? "▾" : "▸"}
        </button>
      </div>
    </Show>
  ),
  item: (props) => (
    <Show when={props.row.set !== undefined} fallback={<Item row={props.row} onAct={props.onAct} />}>
      <Node row={props.row} onAct={props.onAct} />
    </Show>
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
    <Dynamic component={props.row.fn ? "button" : "div"} class="srow value" onClick={props.row.fn ? () => props.onAct(props.row) : undefined}>
      <Show when={props.row.dot !== ""}>
        <Dot tone={props.row.dot} />
      </Show>
      <span class="lab">{props.row.label}</span>
      <span class="v">{props.row.value}</span>
      <Show when={props.row.fn}>
        <span class="chev">{props.row.open ? "▾" : "▸"}</span>
      </Show>
    </Dynamic>
  ),
  meter: (props) => (
    <Dynamic
      component={props.row.fn ? "button" : "div"}
      class="srow meter"
      aria-expanded={props.row.fn ? (props.row.open ? "true" : "false") : undefined}
      onClick={props.row.fn ? () => props.onAct(props.row) : undefined}>
      <span class="cl">{props.row.label}</span>
      <Show
        when={props.row.rings !== undefined}
        fallback={
          <span class="track">
            <span class={words("fill", props.row.tone)} style={`width:${props.row.pct}%`} />
          </span>
        }>
        <Meter pct={props.row.pct} rings={props.row.rings} label={props.row.label} />
        <span class="grow" />
      </Show>
      <span class="v">{props.row.text}</span>
      <Show when={props.row.fn}>
        <span class="chev">{props.row.open ? "▾" : "▸"}</span>
      </Show>
    </Dynamic>
  ),
  stepper: (props) => (
    <div class="srow stepper">
      <span class="cl">{props.row.label}</span>
      <Step label="less" glyph="−" fine={props.row.dec} coarse={props.row.coarse.dec} onAct={props.onAct} />
      <span class="v">{props.row.value}</span>
      <Step label="more" glyph="+" fine={props.row.inc} coarse={props.row.coarse.inc} onAct={props.onAct} />
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
      <Dset set="display" dset={props.row} onAct={props.onAct} />
    </div>
  ),
  more: (props) => (
    <button class="srow more" data-signal={props.row.signal} onClick={() => props.onAct(props.row)}>
      {props.row.label}
    </button>
  ),
  note: (props) => <div class="srow note">{props.row.text}</div>,
  tune: (props) => <Tune row={props.row} onAct={props.onAct} />,
  toggles: (props) => (
    <div class="srow choice">
      <span class="cl">{props.row.label}</span>
      <Toggles
        label={props.row.label}
        options={props.row.options}
        on={props.row.on}
        signal={(option) => `${props.row.signal} ${option}`}
        onPick={(option) => props.onAct({ signal: `${props.row.signal} ${option}` })}
      />
    </div>
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

import { For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Icon } from "./Icon.jsx";

export const grouped = (rows) =>
  rows.reduce((groups, row) => {
    const last = groups.at(-1);
    if (row.kind === "act" && last !== undefined && last.kind === "act") last.rows.push(row);
    else groups.push({ kind: row.kind, rows: [row] });
    return groups;
  }, []);

const decimals = (step) => (String(step).includes(".") ? String(step).split(".")[1].length : 0);

export const stepped = (value, step) => Number(value.toFixed(decimals(step)));

export const setting = (row, value) => `/set ${row.path} ${value}`;

const Key = (props) => <span class="ik">{props.row.k}</span>;

export const KINDS = {
  ro: (props) => (
    <div class="ir">
      <Key row={props.group.rows[0]} />
      <span class="iv ro">{props.group.rows[0].v}</span>
    </div>
  ),
  enum: (props) => (
    <div class="ir">
      <Key row={props.group.rows[0]} />
      <span class="iv">
        <label class="asel">
          <select data-linesel="1" aria-label={props.group.rows[0].k} onChange={(event) => props.onLine(event.currentTarget.value)}>
            <For each={props.group.rows[0].opts}>
              {(option) => (
                <option value={setting(props.group.rows[0], option)} selected={String(option) === props.group.rows[0].v}>
                  {String(option).toLowerCase()}
                </option>
              )}
            </For>
          </select>
          <Icon name="chev" size={12} />
        </label>
      </span>
    </div>
  ),
  bool: (props) => (
    <div class="ir">
      <Key row={props.group.rows[0]} />
      <span class="iv">
        <button
          class={props.group.rows[0].v ? "tog on" : "tog"}
          role="switch"
          aria-checked={String(props.group.rows[0].v)}
          onClick={() => props.onLine(setting(props.group.rows[0], !props.group.rows[0].v))}>
          <i />
        </button>
      </span>
    </div>
  ),
  num: (props) => (
    <div class="ir">
      <Key row={props.group.rows[0]} />
      <span class="iv num">
        <button aria-label="less" onClick={() => props.onLine(setting(props.group.rows[0], Math.max(props.group.rows[0].min, stepped(props.group.rows[0].v - props.group.rows[0].step, props.group.rows[0].step))))}>
          −
        </button>
        <input
          data-setpath={props.group.rows[0].path}
          value={props.group.rows[0].v}
          inputmode="numeric"
          aria-label={props.group.rows[0].k}
          onChange={(event) => props.onLine(setting(props.group.rows[0], event.currentTarget.value))}
        />
        <button aria-label="more" onClick={() => props.onLine(setting(props.group.rows[0], Math.min(props.group.rows[0].max, stepped(props.group.rows[0].v + props.group.rows[0].step, props.group.rows[0].step))))}>
          +
        </button>
      </span>
    </div>
  ),
  text: (props) => (
    <div class="ir">
      <Key row={props.group.rows[0]} />
      <span class="iv">
        <input
          data-setpath={props.group.rows[0].path}
          value={props.group.rows[0].v}
          spellcheck="false"
          aria-label={props.group.rows[0].k}
          onChange={(event) => props.onLine(setting(props.group.rows[0], event.currentTarget.value))}
        />
      </span>
    </div>
  ),
  set: (props) => (
    <div class="ir">
      <Key row={props.group.rows[0]} />
      <span class="iv chips">
        <For each={props.group.rows[0].opts}>
          {(option) => (
            <button
              class={props.group.rows[0].on.includes(option) ? "on" : ""}
              aria-pressed={String(props.group.rows[0].on.includes(option))}
              onClick={() => props.onLine(setting(props.group.rows[0], option))}>
              {option.toLowerCase()}
            </button>
          )}
        </For>
      </span>
    </div>
  ),
  act: (props) => (
    <div class="ir act">
      <For each={props.group.rows}>
        {(row) => (
          <button class={row.tone} disabled={row.off} onClick={() => props.onLine(row.signal)}>
            {row.k}
          </button>
        )}
      </For>
    </div>
  ),
};

const kind = (name) => {
  if (!Object.hasOwn(KINDS, name)) throw new Error(`[drapes] not an inspector row kind: ${JSON.stringify(name)} · ${Object.keys(KINDS).join(" · ")}`);
  return KINDS[name];
};

export const Inspector = (props) => (
  <div class="ti">
    <For each={props.tables}>
      {(table) => (
        <div class="itab">
          <button class="ith" aria-expanded={String(table.open)} onClick={() => props.onTable(table.id, !table.open)}>
            <span class="tf">{table.open ? "▾" : "▸"}</span>
            <b>{table.title}</b>
            <span class="mut">{table.meta}</span>
          </button>
          <Show when={table.open}>
            <div class="itb">
              <For each={grouped(table.rows)}>{(group) => <Dynamic component={kind(group.kind)} group={group} onLine={props.onLine} />}</For>
            </div>
          </Show>
        </div>
      )}
    </For>
  </div>
);

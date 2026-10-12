import { createSignal, For, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import * as form from "./state/form.js";
import { choice, TOGGLES } from "./Confirm.jsx";
import { Input } from "./Input.jsx";
import { Key } from "./Key.jsx";
import { usePalette } from "./palette.js";

const ENTERS = ["return", "linefeed", "enter"];

const KINDS = ["text", "password", "confirm", "select"];

const FIELD = ["name", "label", "kind", "initial"];

const sound = (field) => {
  const missing = FIELD.filter((key) => !Object.hasOwn(field, key));
  if (missing.length) throw new Error(`[tty] form field ${JSON.stringify(field.name)} lacks ${missing.join(" · ")}`);
  if (!KINDS.includes(field.kind)) throw new Error(`[tty] form field kind: ${JSON.stringify(field.kind)} · ${KINDS.join(" · ")}`);
  if (field.kind === "select" && !field.options.some((option) => option.value === field.initial)) {
    throw new Error(`[tty] form field ${field.name}: initial ${JSON.stringify(field.initial)} is not among its options`);
  }
  return field;
};

const cycle = (field, value, delta) => {
  const at = field.options.findIndex((option) => option.value === value);
  return field.options[(at + delta + field.options.length) % field.options.length].value;
};

const STEPS = { left: -1, right: 1, tab: 1, space: 1 };

export function Form(props) {
  const palette = usePalette();
  const fields = props.pages.flatMap((page) => page.fields).map(sound);
  const initial = Object.fromEntries(fields.map((field) => [field.name, field.initial]));
  const [state, setState] = createSignal(form.init({ pages: props.pages, actions: props.actions }));
  const [action, setAction] = createSignal(0);
  const [fault, setFault] = createSignal(null);

  const values = () => ({ ...initial, ...state().values });
  const dispatch = (event) => setState((held) => form.reduce(held, event));
  const active = () => form.activeField(state());
  const page = () => form.page(state());
  const kind = () => (active() === null ? "actions" : active().kind);
  const label = Math.max(...fields.map((field) => field.label.length));

  const advance = () => {
    const field = active();
    const reason = field !== null && Object.hasOwn(field, "check") ? field.check(values()[field.name]) : null;
    setFault(reason === null ? null : { name: field.name, reason });
    if (reason === null) dispatch({ kind: "next" });
  };
  const retreat = () => {
    setFault(null);
    dispatch({ kind: "prev" });
  };
  const set = (value) => dispatch({ kind: "set", value });

  const KEYS = [
    [(key) => key.name === "escape", () => props.release({ aborted: true })],
    [(key) => (key.name === "tab" && key.shift) || key.name === "up", retreat],
    [(key) => key.name === "tab" || key.name === "down", advance],
    [
      (key) => kind() === "actions" && Object.hasOwn(STEPS, key.name),
      (key) => setAction((at) => (at + STEPS[key.name] + props.actions.length) % props.actions.length),
    ],
    [(key) => kind() === "actions" && ENTERS.includes(key.name), () => props.release({ values: values(), action: props.actions[action()] })],
    [(key) => kind() === "confirm" && TOGGLES.includes(key.name), () => set(!values()[active().name])],
    [(key) => kind() === "select" && Object.hasOwn(STEPS, key.name), (key) => set(cycle(active(), values()[active().name], STEPS[key.name]))],
    [(key) => (kind() === "confirm" || kind() === "select") && ENTERS.includes(key.name), advance],
  ];

  useKeyboard((key) => {
    const hit = KEYS.find(([test]) => test(key));
    if (hit === undefined) return;
    key.stopPropagation();
    hit[1](key);
  });

  const focused = (field) => active() !== null && active().name === field.name;
  const marker = (field) => (focused(field) ? palette.signalPrimary : palette.textMuted);
  const shown = (field) => field.options.find((option) => option.value === values()[field.name]).label;

  const CONTROLS = {
    text: (field) => (
      <Input prompt={field.label.padEnd(label)} placeholder="" value={values()[field.name]} onInput={set} onSubmit={advance} focused={focused(field)} />
    ),
    password: (field) => (
      <Input prompt={field.label.padEnd(label)} placeholder="" mask value={values()[field.name]} onInput={set} onSubmit={advance} focused={focused(field)} />
    ),
    confirm: (field) => (
      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg={marker(field)}>{field.label.padEnd(label)}</text>
        {choice(palette, values()[field.name], "yes")}
        {choice(palette, !values()[field.name], "no")}
      </box>
    ),
    select: (field) => (
      <box style={{ flexDirection: "row", gap: 1 }}>
        <text fg={marker(field)}>{field.label.padEnd(label)}</text>
        <text fg={focused(field) ? palette.signalPrimary : palette.textStrong}>{`‹ ${shown(field)} ›`}</text>
      </box>
    ),
  };

  return (
    <box style={{ flexDirection: "column" }}>
      <text fg={palette.textStrong}>
        <b>{props.title}</b>
        <span fg={palette.textMuted}>{`  ${page().title}  ${state().page + 1}/${props.pages.length}`}</span>
      </text>
      <For each={page().fields}>
        {(field) => (
          <box style={{ flexDirection: "column" }}>
            {CONTROLS[field.kind](field)}
            <Show when={focused(field) && Object.hasOwn(field, "hint")}>
              <text fg={palette.textMuted}>{`  ${field.hint}`}</text>
            </Show>
            <Show when={fault() !== null && fault().name === field.name}>
              <text fg={palette.signalNegative}>{`  ✕ ${fault() === null ? "" : fault().reason}`}</text>
            </Show>
          </box>
        )}
      </For>
      <box style={{ flexDirection: "row", gap: 1, marginTop: 1 }}>
        <For each={props.actions}>{(name, at) => choice(palette, kind() === "actions" && at() === action(), name)}</For>
      </box>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <Key name="tab" action="next" />
        <Key name="←→" action="choose" />
        <Key name="esc" action="abort" />
      </box>
    </box>
  );
}

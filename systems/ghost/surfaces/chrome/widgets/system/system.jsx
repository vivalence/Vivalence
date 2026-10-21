import { For, from } from "solid-js";
import { fromm, is } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";

export const STANDING = [
  [(code) => code === "ERROR" || code === "UNAVAILABLE", "negative"],
  [(code) => code === "IDLE" || code === "MOUNTING", "caution"],
  [() => true, "positive"],
];

export const standing = (status) => STANDING.find(([test]) => test(status.code))[1];

export const NAMED = [
  [(user) => is.string(user.slug), (user) => user.slug],
  [() => true, (user) => user.id],
];

export const named = (user) => NAMED.find(([test]) => test(user))[1](user);

const DOTS = {
  positive: (palette) => palette.signalPositive,
  caution: (palette) => palette.signalCaution,
  negative: (palette) => palette.signalNegative,
};

const INKS = [
  [(key) => key.off, (palette) => palette.textMuted],
  [(key) => key.on, (palette) => palette.inverseOn],
  [(key) => key.tone === "negative", (palette) => palette.signalNegativeInk],
  [() => true, (palette) => palette.signalPrimaryInk],
];

const ink = (key, palette) => INKS.find(([test]) => test(key))[1](palette);

function Title(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: 1, paddingRight: 1, backgroundColor: props.palette.surfaceSunk }}>
      <text fg={props.palette.textStrong}>
        <b>{props.label}</b>
      </text>
    </box>
  );
}

function Heading(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, justifyContent: "space-between", paddingLeft: 1, paddingRight: 1, backgroundColor: props.palette.surface }}>
      <text fg={props.palette.textStrong}>
        <b>{props.label}</b>
      </text>
      <text fg={props.palette.textStrong}>
        <b>{props.count}</b>
      </text>
    </box>
  );
}

function Rule(props) {
  return <box style={{ height: 1, border: ["top"], borderColor: props.palette.divider }} />;
}

function Value(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, paddingRight: 1 }}>
      <text fg={DOTS[props.dot](props.palette)}>{" ● "}</text>
      <text fg={props.palette.textInk} style={{ flexGrow: 1 }}>
        {props.label}
      </text>
      <text fg={props.palette.textMuted}>{props.value}</text>
    </box>
  );
}

function Keys(props) {
  const terminal = ambient.terminal.consume();
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: 1, gap: 1 }}>
      <For each={props.keys}>
        {(key) => (
          <text
            cursor={key.off ? undefined : "pointer"}
            fg={ink(key, props.palette)}
            bg={key.on ? props.palette.inverse : undefined}
            onMouseUp={key.off ? undefined : () => terminal.repl.dispatch(key.signal).catch((error) => terminal.controller.stdout.fault(error))}
          >
            {` ${key.label} `}
          </text>
        )}
      </For>
    </box>
  );
}

export function System(props) {
  const terminal = ambient.terminal.consume();
  const app = ambient.app.consume();
  const runtime = terminal.client.runtime;
  const daemons = from(runtime.entities.daemon.$entities);
  const modes = from(runtime.entities.mode.$entities);
  const status = from(runtime.$status);
  const authorized = from(runtime.lighthouse.$isAuthorized);
  const user = from(runtime.lighthouse.$user);
  const beacon = from(runtime.lighthouse.$status);
  const telemetry = from(app.telemetry.$state);
  return (
    <box style={{ flexDirection: "column", backgroundColor: props.palette.surfaceLift }}>
      <Title palette={props.palette} label="system" />

      <Heading palette={props.palette} label="runtime" count={`${daemons().length + 1} hosts`} />
      <Value palette={props.palette} dot={standing(status())} label={runtime.reference.absolute} value={status().code.toLowerCase()} />
      <For each={daemons()}>
        {(daemon) => {
          const daemonStatus = from(daemon.$status);
          return (
            <Value
              palette={props.palette}
              dot={standing(daemonStatus())}
              label={daemon.reference.absolute}
              value={`${modes().filter((mode) => mode.daemon === daemon).length} modes`}
            />
          );
        }}
      </For>
      <Value
        palette={props.palette}
        dot="positive"
        label={terminal.client.mask.reference.absolute}
        value={fromm.modes(terminal.client.modes).flat.map((mode) => `${mode.type} · ${mode.slug}`).join(", ")}
      />
      <Rule palette={props.palette} />

      <Heading palette={props.palette} label="lighthouse" count="" />
      <Value
        palette={props.palette}
        dot={authorized() ? "positive" : "caution"}
        label={authorized() ? named(user()) : "signed out"}
        value={beacon().code.toLowerCase()}
      />
      <Keys
        palette={props.palette}
        keys={
          authorized()
            ? [{ label: "refresh", signal: "/lighthouse/refresh" }, { label: "sign out", signal: "/lighthouse/logout", tone: "negative" }]
            : [{ label: "sign in", signal: "/lighthouse/login", on: true }]
        }
      />
      <Rule palette={props.palette} />

      <Heading palette={props.palette} label="client" count="" />
      <Keys palette={props.palette} keys={[{ label: "telemetry", signal: "/telemetry", on: telemetry().open }, { label: "help", signal: "/help" }]} />
      <Rule palette={props.palette} />
    </box>
  );
}

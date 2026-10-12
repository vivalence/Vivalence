import { createSignal, from, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { Input, Key, Logo, usePalette } from "@vivalence/sheets";

export function Signin(props) {
  const palette = usePalette();
  const lighthouse = props.client.runtime.lighthouse;
  const status = from(lighthouse.$status);
  const fields = ["username", "password", "signin", ...(lighthouse.implements("JOINABLE") ? ["signup"] : [])];
  const [field, setField] = createSignal("username");
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");

  const step = (delta) => setField(fields[(fields.indexOf(field()) + delta + fields.length) % fields.length]);
  const SUBMITS = {
    username: () => step(1),
    password: () => lighthouse.login(username(), password()),
    signin: () => lighthouse.login(username(), password()),
    signup: () => lighthouse.signup(username(), password()),
  };
  const ACTIONS = ["signin", "signup"];
  const ENTERS = ["return", "linefeed", "enter"];

  useKeyboard((key) => {
    if (key.name === "tab") return step(key.shift ? -1 : 1);
    if (key.name === "down") return step(1);
    if (key.name === "up") return step(-1);
    if (ENTERS.includes(key.name) && ACTIONS.includes(field())) SUBMITS[field()]();
  });

  const action = (name, label) => (
    <text
      fg={field() === name ? palette.inverseOn : palette.textInk}
      bg={field() === name ? palette.inverse : palette.surfaceLift}
    >
      {` ${label} `}
    </text>
  );

  return (
    <box style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, gap: 1 }}>
      <Logo variant="word" />
      <box style={{ flexDirection: "column", width: 40, gap: 1, padding: 1, backgroundColor: palette.surfaceLift }}>
        <Input
          prompt="username"
          placeholder="your name"
          value={username()}
          onInput={setUsername}
          onSubmit={SUBMITS.username}
          focused={field() === "username"}
        />
        <Input
          prompt="password"
          placeholder="••••••"
          mask
          value={password()}
          onInput={setPassword}
          onSubmit={SUBMITS.password}
          focused={field() === "password"}
        />
        <box style={{ flexDirection: "row", gap: 2 }}>
          {action("signin", "sign in")}
          <Show when={fields.includes("signup")}>{action("signup", "sign up")}</Show>
        </box>
        <Show when={status().message !== undefined}>
          <text fg={palette.signalNegative}>{status().message}</text>
        </Show>
      </box>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <Key name="tab" action="next" />
        <Key name="enter" action="sign in" />
      </box>
    </box>
  );
}

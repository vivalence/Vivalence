import { createEffect, from, Show } from "solid-js";
import { _render, Dynamic, RendererContext, useRenderer } from "@opentui/solid";
import { tokens } from "@vivalence/dapper";
import { host, pointer } from "@vivalence/sheets";
import * as ambient from "./ambient/index.js";
import * as panels from "./panels/index.js";
import { errored, Layout } from "./layout.jsx";

export const ZONES = { chrome: "0", body: "1", island: "2", telemetry: "3" };

export const zoned = (theme) => ({
  chrome: tokens.camel(theme, ZONES.chrome),
  body: tokens.camel(theme, ZONES.body),
  island: tokens.camel(theme, ZONES.island),
  telemetry: tokens.camel(theme, ZONES.telemetry),
});

export const SETTLING = ["AUTHENTICATING", "VERIFYING", "REFRESHING", "POPULATING"];

export const settled = (lighthouse) =>
  !SETTLING.includes(lighthouse.status.code) && !(lighthouse.status.code === "IDLE" && lighthouse.manifest.traits.includes("AUTOLOGIN"));

export const COVERS = [
  [(app) => !app.client.runtime.lighthouse.isAuthorized && settled(app.client.runtime.lighthouse), panels.authentication.Signin],
  [(app) => !app.client.runtime.lighthouse.isAuthorized || app.client.runtime.entities.terminal.$entities.get().length === 0, panels.booting.Booting],
  [() => true, Layout],
];

export const cover = (app) => COVERS.find(([test]) => test(app))[1];

export function Cover() {
  const app = ambient.app.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const status = from(app.client.runtime.lighthouse.$status);
  const authorized = from(app.client.runtime.lighthouse.$isAuthorized);
  const theme = from(app.bridge.$theme);
  const palettes = () => {
    theme();
    authorized();
    return zoned(app.theme);
  };
  const renderer = useRenderer();
  createEffect(() => {
    renderer.setBackgroundColor(palettes().body.surface);
    renderer.writeOut(`\x1b]11;rgb:${palettes().body.surface.slice(1, 7).match(/../g).join("/")}\x07`);
  });
  const current = () => {
    terminals();
    status();
    authorized();
    return cover(app);
  };
  return (
    <box style={{ flexDirection: "column", flexGrow: 1, width: "100%", height: "100%" }}>
      <Show when={current()} keyed>
        {(component) => <Dynamic component={component} palette={palettes().island} palettes={palettes()} />}
      </Show>
    </box>
  );
}

export const RELAYED = {
  error: (stdout, args) => stdout.fault(errored(args)),
  warn: (stdout, args) => stdout.log({ warn: errored(args).message }),
};

export const relayed = (stdout) => {
  const captured = Object.fromEntries(Object.keys(RELAYED).map((level) => [level, console[level]]));
  for (const level of Object.keys(RELAYED))
    console[level] = (...args) => {
      RELAYED[level](stdout, args);
      captured[level](...args);
    };
  return () => Object.assign(console, captured);
};

export const mount = async (appDie) => {
  const { createCliRenderer } = await host.opentui();
  appDie.display = await host.display();
  const renderer = await createCliRenderer({ exitOnCtrlC: false });
  pointer(renderer);
  const restored = relayed(appDie.client.controller.stdout);
  renderer.keyInput.on("keypress", (event) => {
    if (event.ctrl && !event.shift && event.name === "c") Deno.kill(Deno.pid, "SIGINT");
    if (event.sequence === "`") renderer.console.toggle();
  });
  const dispose = _render(
    () => (
      <RendererContext.Provider value={renderer}>
        <ambient.app.Provider value={appDie}>
          <Cover />
        </ambient.app.Provider>
      </RendererContext.Provider>
    ),
    renderer.root,
  );
  return () => {
    const entries = renderer.console._allLogEntries;
    const cached = renderer.console.getCachedLogs();
    dispose();
    restored();
    for (const renderable of renderer.root.getChildren()) renderable.destroyRecursively();
    renderer.resetTerminalBgColor();
    renderer.destroy();
    for (const [date, level, args] of entries) console.log(date.toISOString(), level, ...args);
    if (cached.length > 0) console.log(cached);
  };
};

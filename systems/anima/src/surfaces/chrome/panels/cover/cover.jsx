import { createEffect, from, Show } from "solid-js";
import * as ambient from "../../ambient/index.js";
import { Booting } from "../booting/booting.jsx";
import { Signin } from "../authentication/signin.jsx";
import { Layout } from "../../layout.jsx";

export const SETTLING = ["AUTHENTICATING", "VERIFYING", "REFRESHING", "POPULATING"];

export const settled = (lighthouse) =>
  !SETTLING.includes(lighthouse.status.code) &&
  !(lighthouse.status.code === "IDLE" && lighthouse.manifest.traits.includes("AUTOLOGIN"));

export const COVERS = [
  [
    (app) => !app.client.runtime.lighthouse.isAuthorized && settled(app.client.runtime.lighthouse),
    Signin,
  ],
  [
    (app) =>
      !app.client.runtime.lighthouse.isAuthorized ||
      app.client.runtime.entities.terminal.$entities.get().length === 0,
    Booting,
  ],
  [() => true, Layout],
];

export const cover = (app) => COVERS.find(([test]) => test(app))[1];

export function Cover() {
  const app = ambient.app.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const status = from(app.client.runtime.lighthouse.$status);
  const authorized = from(app.client.runtime.lighthouse.$isAuthorized);
  const user = from(app.client.runtime.lighthouse.$user);
  const beats = from(app.telemetry.$logger);
  const theme = from(app.bridge.$theme);
  const viewport = from(app.bridge.$viewport);
  const current = () => {
    terminals();
    status();
    authorized();
    beats();
    return cover(app);
  };
  let root;
  createEffect(() => {
    user();
    theme();
    globalThis.document.documentElement.dataset.theme = app.theme;
    root.parentElement.dataset.viva = app.theme;
  });
  return (
    <div ref={root} class="client" classList={{ phone: viewport().narrow }}>
      <Show when={current() === Layout}>
        <Layout />
      </Show>
      <div data-r="island" style={{ display: "contents" }}>
        <Show when={current() !== Layout && current()} keyed>
          {(Pane) => <Pane />}
        </Show>
      </div>
    </div>
  );
}

import { render } from "solid-js/web";
import { emit, scales, THEMES } from "@vivalence/dapper";
import "@vivalence/drapes/parts.css";
import * as ambient from "./ambient/index.js";
import { Cover } from "./panels/cover/cover.jsx";
import { SIDEBAR } from "./panels/sidebar/sidebar.jsx";
import { WINDOW } from "./panels/telemetry/telemetry.jsx";

const dressed = (document) => {
  const style = document.createElement("style");
  style.dataset.dapper = "tokens";
  style.textContent = [
    scales(),
    ...Object.entries(THEMES).map(([name, held]) => emit(name, held)),
  ].join("\n");
  document.head.append(style);
  return style;
};

const painted = (document, appDie) => {
  const root = document.createElement("div");
  root.id = "app";
  document.body.append(root);
  const dispose = render(
    () => (
      <ambient.app.Provider value={appDie}>
        <Cover />
      </ambient.app.Provider>
    ),
    root,
  );
  return () => {
    dispose();
    root.remove();
  };
};

export const mount = (appDie) => {
  const narrow = globalThis.matchMedia("(max-width: 767px)");
  const resized = () =>
    appDie.bridge.$viewport.set({
      width: globalThis.innerWidth,
      height: globalThis.innerHeight,
      narrow: narrow.matches,
    });
  resized();
  globalThis.addEventListener("resize", resized);
  narrow.addEventListener("change", resized);
  appDie.bridge.$sidebar.set({ ...appDie.bridge.sidebar, width: SIDEBAR.width });
  appDie.telemetry.$state.set({ ...appDie.telemetry.state, window: WINDOW, folds: {}, tables: {} });
  const forget = appDie.client.runtime.lighthouse.$status.subscribe((status) => {
    if (status.code === "LOGGED_OUT")
      appDie.bridge.$signin.set({ user: appDie.bridge.signin.user, pass: "" });
  });
  const style = dressed(globalThis.document);
  const erase = painted(globalThis.document, appDie);
  return () => {
    erase();
    style.remove();
    forget();
    narrow.removeEventListener("change", resized);
    globalThis.removeEventListener("resize", resized);
  };
};

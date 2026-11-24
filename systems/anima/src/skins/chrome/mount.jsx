import { render } from "solid-js/web";
import { emit, scales, THEMES } from "@vivalence/dapper";
import "@vivalence/dapper/font.css";
import "@vivalence/drapes/parts.css";
import * as ambient from "./ambient/index.js";
import { Cover } from "./panels/cover/cover.jsx";
import { SIDEBAR } from "./panels/sidebar/sidebar.jsx";
import { SEED } from "./panels/telemetry/telemetry.jsx";

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

const locked = (view) => {
  const style = view.document.documentElement.style;
  let frame = null;
  const paint = () => {
    frame = null;
    style.setProperty("--viva-h", `${view.visualViewport.height}px`);
    style.setProperty("--viva-t", `${view.visualViewport.offsetTop}px`);
  };
  const sync = () => {
    frame ??= view.requestAnimationFrame(paint);
  };
  view.visualViewport.addEventListener("resize", sync);
  view.visualViewport.addEventListener("scroll", sync);
  paint();
  return () => {
    view.visualViewport.removeEventListener("resize", sync);
    view.visualViewport.removeEventListener("scroll", sync);
    view.cancelAnimationFrame(frame);
    style.removeProperty("--viva-h");
    style.removeProperty("--viva-t");
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
  const held = (event) => {
    const holder = event.target.closest("[data-focus]");
    appDie.bridge.$focus.set(holder === null ? null : holder.dataset.focus);
  };
  const dropped = (event) => {
    if (event.relatedTarget === null) appDie.bridge.$focus.set(null);
  };
  globalThis.document.addEventListener("focusin", held);
  globalThis.document.addEventListener("focusout", dropped);
  appDie.bridge.$sidebar.set({ ...appDie.bridge.sidebar, width: SIDEBAR.width });
  const seated = Object.hasOwn(appDie.telemetry.state, "lens") ? {} : SEED;
  appDie.telemetry.$state.set({
    ...appDie.telemetry.state,
    ...seated,
    peeks: {},
    since: 0,
    selection: null,
    trace: null,
  });
  const forget = appDie.client.runtime.lighthouse.$status.subscribe((status) => {
    if (status.code === "LOGGED_OUT")
      appDie.bridge.$signin.set({ user: appDie.bridge.signin.user, pass: "" });
  });
  const unlock = locked(globalThis);
  const style = dressed(globalThis.document);
  const erase = painted(globalThis.document, appDie);
  return () => {
    erase();
    style.remove();
    forget();
    unlock();
    globalThis.document.removeEventListener("focusout", dropped);
    globalThis.document.removeEventListener("focusin", held);
    narrow.removeEventListener("change", resized);
    globalThis.removeEventListener("resize", resized);
  };
};

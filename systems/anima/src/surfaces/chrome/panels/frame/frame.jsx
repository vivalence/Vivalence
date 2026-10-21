import { createResource, For, from, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import { belt } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";
import { lookup, named, reference, short } from "../sidebar/sections.js";
import { frame, framed } from "../../widgets/buffer/view.js";
import { popping } from "../dock/dock.jsx";
import { View } from "./view.jsx";

export const OPENERS = {
  right: "dockopen",
  left: "dockopenl",
  top: "dockopen",
  bottom: "dockopen",
};

export const picks = (buffer, views) =>
  views.map((view) => ({
    label: view.slug,
    current: view === frame(buffer, views),
    signal: `/frame/set ${view.slug}`,
    title: `${view.slug} · frame · ${short(view.mime)}`,
  }));

const Asel = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const [views] = createResource(
    () => props.buffer,
    (buffer) => framed(buffer, app.client.runtime.attach),
  );
  const trait = from(props.buffer.$trait);
  const listed = () => {
    trait();
    return views.state === "ready" ? picks(props.buffer, views()) : [];
  };
  return (
    <label
      class="asel"
      title={listed()
        .map((entry) => entry.title)
        .join("\n")}>
      <select
        data-linesel="1"
        aria-label="artifact"
        onChange={(event) =>
          terminal.repl
            .dispatch(event.currentTarget.value)
            .catch((error) => terminal.controller.stdout.fault(error))
        }>
        <For each={listed()}>
          {(entry) => (
            <option value={entry.signal} selected={entry.current}>
              {entry.label}
            </option>
          )}
        </For>
      </select>
      <parts.Icon name="chev" size={12} />
    </label>
  );
};

const Head = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  return (
    <>
      <Show when={props.phone}>
        <button
          type="button"
          class="iconbtn back"
          aria-label="back to the journal"
          onClick={() => app.bridge.$phonePane.set("dock")}>
          <parts.Icon name="back" />
        </button>
      </Show>
      <span class="fl">◆ artifact</span>
      <span class="fm">{reference(props.buffer.mode)}</span>
      <span class="fa">
        <Asel buffer={props.buffer} />
        <Show when={props.dock.view === "closed" && !props.phone}>
          <button
            type="button"
            class="iconbtn"
            data-hold="pop"
            aria-label="open the dock"
            title="open the dock · /dock docked · hold: display"
            {...popping(app, terminal, "/dock docked")}>
            <parts.Icon name={lookup(OPENERS, props.dock.align, "dock align")} />
          </button>
        </Show>
        <button
          type="button"
          class="iconbtn"
          aria-label="unseat the buffer"
          title="unseat the buffer · /buffer/close"
          onClick={() =>
            terminal.repl
              .dispatch("/buffer/close")
              .catch((error) => terminal.controller.stdout.fault(error))
          }>
          <parts.Icon name="x" />
        </button>
      </span>
    </>
  );
};

const Empty = (props) => (
  <div class="empty">
    <div class="sign">◇</div>
    <div>no buffer in the frame</div>
    <div class="cmd">
      {props.buffers.length === 0 ? "/buffer ‹label›" : `/buffer ${named(props.buffers[0])}`}
    </div>
  </div>
);

export function Frame(props) {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const buffer = from(terminal.$buffer);
  const buffers = from(belt.atom.chain(terminal.$thread, "$buffers"));
  const focus = from(app.bridge.$focus);
  console.log("buffer, buffers", buffer(), buffers(), buffer);
  return (
    <section
      class="pane frame"
      classList={{ focus: focus() === "frame" }}
      style={{ flex: "1 1 0" }}
      onClick={() => buffer() !== null && app.bridge.$focus.set("frame")}>
      <div class="fhead" data-r="fhead">
        <Show when={buffer()} keyed>
          {(held) => <Head buffer={held} dock={props.dock} phone={props.phone} />}
        </Show>
      </div>
      <div class="fbody" data-r="fbody">
        <Show when={buffer()} keyed fallback={<Empty buffers={parts.listing(buffers)} />}>
          {(held) => <View buffer={held} listed={framed} picked={frame} />}
        </Show>
      </div>
    </section>
  );
}

// [vite] connecting... client:789:9
// [vite] connected. client:912:15
// GET
// http://localhost:1794/favicon.ico
// [HTTP/1.1 404 Not Found 0ms]
// anima/client log
// Object { lighthouse: "http://localhost:2501/", traits: (2) […] }
// client.js:22:67
// anima/client log
// Object { user: "localhost" }
// client.js:22:67
// anima/client log
// Object { runtime: "/runtime/runtime" }
// client.js:22:67
// anima/client/runtime/runtime log
// Object { runtime: "/runtime/runtime", modes: (1) […] }
// client.js:22:67
// anima/client/daemon/italian log
// Object { daemon: "/daemon/italian", modes: (9) […] }
// client.js:22:67
// anima/client/daemon/droneaid log
// Object { daemon: "/daemon/droneaid", modes: (12) […] }
// client.js:22:67
// anima/client/daemon/chess log
// Object { daemon: "/daemon/chess", modes: (13) […] }
// client.js:22:67
// FRAME
// Object { props: {…} }
// ​
// props: Object { dock: Getter, phone: Getter }
// ​
// ​
// dock: Object { align: "right", share: 0.2, view: "closed", … }
// ​
// ​
// phone:
// ​
// ​
// <get dock()>: function dock()
// ​
// ​
// <get phone()>: function phone()
// ​
// ​
// <prototype>: Object { … }
// ​
// <prototype>: Object { … }
// frame.jsx:84:11
// [vite] hot updated: /surfaces/chrome/panels/frame/frame.jsx client:883:32
// FRAME
// Object { props: {…} }
// frame.jsx:121:11
// [vite] hot updated: /surfaces/chrome/panels/frame/frame.jsx client:883:32
// buffer, buffers
// Object { views: [], files: [], "$data": {…}, "$bundle": {…}, "$traits": {…}, "$trait": {…}, "$label": {…}, context: null, hooks: {…}, on: {…}, … }
// ​
// "$bundle": Object { get: get(), lc: 0, listen: listen(listener), … }
// ​
// ​
// get: function get()
// ​
// ​
// lc: 0
// ​
// ​
// listen: function listen(listener)
// ​
// ​
// notify: function notify(oldValue, changedKey)
// ​
// ​
// off: function off()
// ​
// ​
// set: function set(newValue)
// ​
// ​
// subscribe: function subscribe(listener)
// ​
// ​
// value: null
// ​
// ​
// Symbol(clean): function clean()
// ​
// ​
// <prototype>: Object { … }
// ​
// "$data": Object { get: get(), lc: 2, listen: listen(listener), … }
// ​
// "$label": Object { get: get(), lc: 0, listen: listen(args), … }
// ​
// "$trait": Object { get: get(), lc: 0, listen: listen(listener), … }
// ​
// "$traits": Object { get: get(), lc: 0, listen: listen(listener), … }
// ​
// context: null
// ​
// createdAt: "2026-10-26T16:00:57.986Z"
// ​
// files: Array []
// ​
// hooks: Object { attach: [], detach: [], release: (1) […] }
// ​
// id: "01a178f1-8a82-716a-9c0f-deb1e41d9700"
// ​
// index: 0
// ​
// mime: "application/json"
// ​
// mode: Object { type: "board", slug: "play", name: "Play", … }
// ​
// ​
// "$buffers": Object { get: get(), lc: 0, listen: listen(args), … }
// ​
// ​
// "$turns": Object { get: get(), lc: 0, listen: listen(args), … }
// ​
// ​
// "$views": Object { get: get(), lc: 0, active: false, … }
// ​
// ​
// ​
// active: false
// ​
// ​
// ​
// events: Object { 5: (1) […], 6: [], 15: onMount() }
// ​
// ​
// ​
// get: function get()
// ​
// ​
// ​
// lc: 0
// ​
// ​
// ​
// listen: function listen(args)
// ​
// ​
// ​
// notify: function notify(oldValue, changedKey)
// ​
// ​
// ​
// off: function off()
// ​
// ​
// ​
// set: function set(newValue)
// ​
// ​
// ​
// subscribe: function subscribe(listener)
// ​
// ​
// ​
// value: Array [ {…}, {…} ]
// ​
// ​
// ​
// ​
// 0: Object { slug: "play", mime: "application/vnd.viva.dom.svelte+javascript", entry: "bundle/5350ac52914deb0d.dom.svelte.mjs", … }
// ​
// ​
// ​
// ​
// 1: Object { slug: "play", mime: "application/vnd.viva.tty.solid+javascript", entry: "bundle/978f9c6087b1b219.tty.solid.mjs", … }
// ​
// ​
// ​
// ​
// length: 2
// ​
// ​
// ​
// ​
// <prototype>: Array []
// ​
// ​
// ​
// Symbol(clean): function clean()
// ​
// ​
// ​
// <prototype>: Object { … }
// ​
// ​
// buffers:
// ​
// ​
// call: Object { status: aim(body, options), manifest: aim(body, options), match: {…}, … }
// ​
// ​
// connection: Object { "$state": {…}, "$error": {…}, carry: [], … }
// ​
// ​
// createdAt: "2026-10-24T18:42:16.976Z"
// ​
// ​
// daemon: Object { type: "daemon", id: "chess", slug: "chess", … }
// ​
// ​
// description: "A board and two seats. The buffer holds the live game — position, moves, clocks, who sits; a seat is a user, the engine, or a hallucinator that may see the engine's assessment before it moves. A finished game seals into the corpus as a literal."
// ​
// ​
// harness: Object { verbatim: {…}, dialogue: {…}, object: {…}, … }
// ​
// ​
// id: "01a16f38-8310-755d-bb51-c620cfb8ad88"
// ​
// ​
// installed: "3393993e"
// ​
// ​
// keymap: Object { effect: null, trie: Map(0), carry: [], … }
// ​
// ​
// metadata: Object { aperture: {…}, harness: {…} }
// ​
// ​
// module: null
// ​
// ​
// name: "Play"
// ​
// ​
// reference: Object { gauges: [], nature: "/mode/board/play", trace: {…}, … }
// ​
// ​
// repl: Object { effect: null, trie: Map(1), carry: [], … }
// ​
// ​
// runtime: Object { type: "runtime", manifest: {…}, reference: {…}, … }
// ​
// ​
// slug: "play"
// ​
// ​
// status: Object { "$transient": {…} }
// ​
// ​
// stdout: Object { gauges: [], nature: "mode", pipe: {…}, … }
// ​
// ​
// traits: Array(6) [ "VIEWABLE", "EXPOSED", "HARNESSED", … ]
// ​
// ​
// turns: Array(6) [ {…}, {…}, {…}, … ]
// ​
// ​
// type: "board"
// ​
// ​
// updatedAt: "2026-10-24T18:42:16.976Z"
// ​
// ​
// version: "0.1.0"
// ​
// ​
// views: Array [ {…}, {…} ]
// ​
// ​
// ​
// 0: Object { slug: "play", mime: "application/vnd.viva.dom.svelte+javascript", entry: "bundle/5350ac52914deb0d.dom.svelte.mjs", … }
// ​
// ​
// ​
// 1: Object { slug: "play", mime: "application/vnd.viva.tty.solid+javascript", entry: "bundle/978f9c6087b1b219.tty.solid.mjs", … }
// ​
// ​
// ​
// length: 2
// ​
// ​
// ​
// <prototype>: Array []
// ​
// ​
// <get buffers()>: function get()
// ​
// ​
// <set buffers()>: function set()
// ​
// ​
// <get turns()>: function get()
// ​
// ​
// <set turns()>: function set()
// ​
// ​
// <get views()>: function get()
// ​
// ​
// <set views()>: function set()
// ​
// ​
// <prototype>: Object { … }
// ​
// on: Object { attach: attach(callback), detach: detach(callback), release: release(callback) }
// ​
// status: "PENDING"
// ​
// thread: Object { id: "01a178f1-8a4b-7306-a14f-c9554b34b9d5", user: "01a16f38-7a77-73fb-a4d9-0135ce8b2077", phase: "manual", … }
// ​
// updatedAt: "2026-10-27T09:21:59.091Z"
// ​
// views: Array []
// ​
// <prototype>: Object { … }

// Array(4) [ {…}, {…}, {…}, {…} ]
// ​
// 0: Object { views: [], files: [], "$data": {…}, … }
// ​
// 1: Object { views: [], files: [], "$data": {…}, … }
// ​
// 2: Object { views: [], files: [], "$data": {…}, … }
// ​
// 3: Object { views: [], files: [], "$data": {…}, … }
// ​
// length: 4
// ​
// <prototype>: Array []

// BoundFunctionObject { … }
// frame.jsx:126:11
// [vite] hot updated: /surfaces/chrome/panels/frame/frame.jsx client:883:32

// ​

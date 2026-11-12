import {
  createEffect,
  createMemo,
  createSignal,
  For,
  from,
  on,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import { belt } from "@vivalence/ghost";
import * as ambient from "../../ambient/index.js";
import { PROMPT } from "../repl/repl.jsx";
import { controlled, elapsed, percent, playback } from "../sidebar/sections.js";

export const CONSENT = { onApprove: "/resume", onSkip: "/stop", onEdit: "/abort" };

export const PLACEHOLDERS = [
  [(draft) => draft.startsWith("/"), "a verb · tab completes · enter runs"],
  [(draft, mode) => mode === null || !mode.implements("HARNESSED"), "/commands only"],
  [() => true, "say it, or / for a command"],
];

const placeholder = (draft, mode) => PLACEHOLDERS.find(([test]) => test(draft, mode))[1];

export const DEAF = [
  [(thread) => thread === null, "dictate · no thread on this terminal"],
  [(thread) => thread.mode === null || !thread.mode.implements("HARNESSED"), "dictate · this thread's mode has no harness"],
  [() => true, "dictate · this mode's harness has no verbatim"],
];

export const deaf = (thread) => DEAF.find(([test]) => test(thread))[1];

export const SECOND = 1000;

export const ticking = (live) => {
  const [now, setNow] = createSignal(Date.now());
  const running = createMemo(live);
  createEffect(() => {
    if (!running()) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), SECOND);
    onCleanup(() => clearInterval(timer));
  });
  return now;
};

export const WORDS = [
  [(call) => call.state !== "listening", (call) => call.state],
  [(call, paused) => paused, () => "muted"],
  [() => true, () => "listening"],
];

export const worded = (call, paused) => WORDS.find(([test]) => test(call, paused))[1](call, paused);

const plain = (event) => !event.ctrlKey && !event.metaKey && !event.altKey;

const lettered = (rows, event) =>
  rows.find(([, key]) => plain(event) && key === event.key.toLowerCase());

const PRESSES = [
  [(event) => event.key === "Escape", (event, menu) => menu.onClose()],
  [
    (event, menu) => lettered(menu.rows, event) !== undefined,
    (event, menu) => menu.onRun(lettered(menu.rows, event)[4]),
  ],
];

const Menu = (props) => {
  let menu;
  onMount(() => menu.focus({ preventScroll: true }));
  const pressed = (event) => {
    const press = PRESSES.find(([test]) => test(event, props));
    if (press === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    press[1](event, props);
  };
  return (
    <div
      ref={menu}
      class="ctlmenu"
      data-zone="0"
      role="menu"
      aria-label="control"
      tabindex="-1"
      onKeyDown={pressed}>
      <For each={props.rows}>
        {([, key, name, value, signal]) => (
          <parts.Row
            key={key}
            name={name}
            value={value}
            selected={value !== ""}
            onPick={() => props.onRun(signal)}
          />
        )}
      </For>
    </div>
  );
};

const Control = (props) => {
  const app = ambient.app.consume();
  const [open, setOpen] = createSignal(false);
  const shown = () => open() && props.rows.length > 0;
  const close = () => {
    setOpen(false);
    app.bridge.$focus.set("dock.input");
  };
  const run = (signal) => {
    close();
    props.onSignal(signal);
  };
  return (
    <>
      <button
        class="pc"
        classList={{ on: shown(), repl: props.repl }}
        aria-label="control"
        aria-haspopup="menu"
        aria-expanded={String(shown())}
        title="control · ctrl-v c"
        onClick={() => setOpen(!open())}>
        <parts.Icon name="chev2" size={14} />
      </button>
      <Show when={shown()}>
        <div class="scrim" onClick={close} />
        <Menu rows={props.rows} onRun={run} onClose={close} />
      </Show>
    </>
  );
};

export const MUTING = { true: ["unmute", "/mic on"], false: ["mute", "/mic mute"] };

const Callline = (props) => {
  const app = ambient.app.consume();
  const level = from(app.box.device.microphone.$level);
  const paused = from(app.box.device.microphone.$paused);
  const playing = from(app.box.device.speaker.$playing);
  const now = ticking(() => true);
  return (
    <div class="field call">
      <span class="pcw">
        <Control repl={false} rows={props.rows} onSignal={props.onSignal} />
      </span>
      <button
        class="mic"
        classList={{ paused: paused() }}
        aria-label={MUTING[paused()][0]}
        title={`${MUTING[paused()][0]} · ${MUTING[paused()][1]}`}
        onClick={() => props.onSignal(MUTING[paused()][1])}>
        <parts.Icon name="mic" />
      </button>
      <parts.Meter pct={percent(level())} rings={4} label="microphone" caution={false} />
      <span class="word">{worded(props.call, paused())}</span>
      <span class="sp" />
      <span class="speaker" classList={{ live: props.call.state === "speaking" }}>
        <parts.Icon name="speaker" />
      </span>
      <parts.Meter pct={playback(playing())} rings={4} label="speaker" caution={false} />
      <span class="dur">{elapsed((now() - props.call.since) / SECOND)}</span>
      <button
        class="end"
        aria-label="end the call"
        title="end · /call/end"
        onClick={() => props.onSignal("/call/end")}>
        <parts.Icon name="stop" size={12} />
        end
      </button>
    </div>
  );
};

export const Textarea = () => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const thread = from(terminal.$thread);
  const activities = from(app.client.runtime.entities.activity.$entities);
  const draft = from(app.bridge.$draft);
  const focus = from(app.bridge.$focus);
  const catalog = from(terminal.repl.$catalog);
  const dictation = from(app.bridge.$dictation);
  const call = from(app.bridge.$call);
  const hosted = createMemo(() =>
    thread() === null || thread().mode === null
      ? () => null
      : from((thread().mode.daemon === null ? app.client.runtime : thread().mode.daemon).$status),
  );
  const commands = createMemo(on([thread, () => hosted()()], () => terminal.repl.commands));

  const controls = () => controlled(commands(), dictation(), call());
  const microphone = () => controls().find(([, key]) => key === "d");
  const owned = () => parts.listing(activities).filter((activity) => thread() !== null && activity.thread === thread());
  const waiting = () => owned().find((activity) => activity.status === "PAUSED");
  const running = () => owned().some((activity) => activity.status === "RUNNING");
  const sent = (signal) => terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  const submit = (text) => {
    if (dictation() !== null) return sent("/dictate/send");
    if (text.trim() === "") return;
    app.bridge.$draft.set("");
    sent(text);
  };
  const typed = (text) => {
    app.bridge.$draft.set(text);
    app.bridge.$selected.set(0);
    if (text === "/") {
      terminal.legend.dispatch("leader");
      terminal.legend.dispatch("leader");
    }
  };

  return (
    <Show
      when={waiting()}
      keyed
      fallback={
        <>
          <parts.Atts attachments={[]} onDrop={(attachment) => sent(`/detach ${attachment.name}`)} />
          <Show when={dictation()}>
            {(held) => (
              <parts.Dictline
                text={belt.dictation.spoken(held())}
                tail={belt.dictation.tail(held())}
                onTrash={() => sent("/dictate/trash")}
              />
            )}
          </Show>
          <Show
            when={catalog() === null && call() === null}
            fallback={
              <Show
                when={catalog() === null}
                fallback={
                  <div class="field repl">
                    <span class="pc">{`${PROMPT}${draft()}`}</span>
                  </div>
                }>
                <Callline call={call()} rows={controls()} onSignal={sent} />
              </Show>
            }>
            <parts.Field
              id="textarea"
              data-focus="dock.input"
              kind="turn"
              focus={focus() === "dock.input"}
              dictating={dictation() !== null}
              value={draft()}
              placeholder={placeholder(draft(), thread() === null ? null : thread().mode)}
              lead={<Control repl={draft().startsWith("/")} rows={controls()} onSignal={sent} />}
              onInput={typed}
              onSubmit={submit}>
              <Show
                when={microphone()}
                fallback={
                  <button class="mic off" aria-disabled="true" aria-label="dictate" title={deaf(thread())}>
                    <parts.Icon name="mic" />
                  </button>
                }>
                {(row) => (
                  <button
                    class="mic"
                    classList={{ live: row()[3] !== "" }}
                    aria-label={row()[2]}
                    title={`${row()[2]} · ${row()[4]}`}
                    onClick={() => sent(row()[4])}>
                    <parts.Icon name="mic" />
                  </button>
                )}
              </Show>
              <Show
                when={running() && dictation() === null}
                fallback={
                  <button class="send" aria-label="send" title="send · enter" onClick={() => submit(draft())}>
                    <parts.Icon name="up" />
                  </button>
                }>
                <button class="stop" aria-label="stop" title="stop · esc · /stop" onClick={() => sent("/stop")}>
                  <parts.Icon name="stop" />
                </button>
              </Show>
            </parts.Field>
          </Show>
        </>
      }>
      {(activity) => (
        <parts.Consent
          data-focus="dock.consent"
          focus={focus() === "dock.consent"}
          call={{ name: activity.type.toLowerCase(), argument: `#${activity.id.slice(0, 8)}` }}
          onApprove={() => sent(CONSENT.onApprove)}
          onSkip={() => sent(CONSENT.onSkip)}
          onEdit={() => sent(CONSENT.onEdit)}
        />
      )}
    </Show>
  );
};

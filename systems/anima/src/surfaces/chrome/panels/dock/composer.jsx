import { createSignal, from, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../../ambient/index.js";
import { enter } from "../repl/repl.jsx";

export const CONSENT = { onApprove: "/resume", onSkip: "/stop", onEdit: "/abort" };

export const PLACEHOLDERS = [
  [(draft) => draft.startsWith("/"), "a verb · tab completes · enter runs"],
  [() => true, "say it, or / for a command"],
];

const placeholder = (draft) => PLACEHOLDERS.find(([test]) => test(draft))[1];

const Control = (props) => {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <button
        class="pc"
        classList={{ on: open(), repl: props.repl }}
        aria-label="control"
        aria-haspopup="menu"
        aria-expanded={String(open())}
        title="control · upload · dictate"
        onClick={() => setOpen(!open())}>
        <parts.Icon name="chev2" size={14} />
      </button>
      <Show when={open()}>
        <span class="ctlmenu" role="menu">
          <button role="menuitem" disabled>
            <parts.Icon name="clip" size={14} />
            <span>upload</span>
            <i>ctrl-v c a</i>
          </button>
          <button role="menuitem" onClick={() => props.onLine("/dictate")}>
            <parts.Icon name="mic" size={14} />
            <span>dictate</span>
            <i>ctrl-v c d</i>
          </button>
        </span>
      </Show>
    </>
  );
};

export const Composer = () => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const thread = from(terminal.$thread);
  const activities = from(app.client.runtime.entities.activity.$entities);
  const focus = from(app.bridge.$focus);
  const draft = from(app.bridge.$draft);

  const owned = () => parts.listing(activities).filter((activity) => thread() !== null && activity.thread === thread());
  const waiting = () => owned().find((activity) => activity.status === "PAUSED");
  const running = () => owned().some((activity) => activity.status === "RUNNING");
  const sent = (signal) => terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  const submit = (text) => {
    if (text.trim() === "") return;
    if (terminal.repl.catalog !== null) return enter(app, terminal, terminal.repl.catalog, text);
    app.bridge.$draft.set("");
    sent(text);
  };
  const typed = (text) => {
    app.bridge.$draft.set(text);
    if (text === "/") {
      terminal.legend.dispatch("leader");
      terminal.legend.dispatch("leader");
    }
    if (!text.startsWith("/")) terminal.repl.$catalog.set(null);
  };

  return (
    <Show
      when={waiting()}
      keyed
      fallback={
        <>
          <parts.Atts attachments={[]} onDrop={(attachment) => sent(`/detach ${attachment.name}`)} />
          <parts.Field
            id="composer"
            kind="turn"
            value={draft()}
            placeholder={placeholder(draft())}
            focus={focus() === "composer"}
            lead={<Control repl={draft().startsWith("/")} onLine={sent} />}
            onInput={typed}
            onFocus={() => app.bridge.$focus.set("composer")}
            onSubmit={submit}>
            <Show
              when={running()}
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
        </>
      }>
      {(activity) => (
        <parts.Consent
          call={{ name: activity.type.toLowerCase(), argument: `#${activity.id.slice(0, 8)}` }}
          onApprove={() => sent(CONSENT.onApprove)}
          onSkip={() => sent(CONSENT.onSkip)}
          onEdit={() => sent(CONSENT.onEdit)}
        />
      )}
    </Show>
  );
};

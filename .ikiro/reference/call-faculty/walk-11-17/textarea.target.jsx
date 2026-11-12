import { createSignal, from, Show } from "solid-js";
import { belt } from "./ghost.shim.js";
import * as parts from "./parts.target.js";
import * as ambient from "./ambient.shim.js";
const PROMPT = "<< ";

export const CONSENT = { onApprove: "/resume", onSkip: "/stop", onEdit: "/abort" };

export const PLACEHOLDERS = [
  [(draft) => draft.startsWith("/"), "a verb · tab completes · enter runs"],
  [(draft, mode) => mode === null || !mode.implements("HARNESSED"), "/commands only"],
  [() => true, "say it, or / for a command"],
];

const placeholder = (draft, mode) => PLACEHOLDERS.find(([test]) => test(draft, mode))[1];

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

export const Textarea = () => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const thread = from(terminal.$thread);
  const activities = from(app.client.runtime.entities.activity.$entities);
  const draft = from(app.bridge.$draft);
  const focus = from(app.bridge.$focus);
  const catalog = from(terminal.repl.$catalog);
  const dictation = from(app.bridge.$dictation);
  const level = from(app.box.device.microphone.$level);

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
                level={level()}
                text={belt.dictation.spoken(held())}
                tail={belt.dictation.tail(held())}
                onStop={() => sent("/dictate/stop")}
                onTrash={() => sent("/dictate/trash")}
              />
            )}
          </Show>
          <Show
            when={catalog() === null}
            fallback={
              <div class="field repl">
                <span class="pc">{`${PROMPT}${draft()}`}</span>
              </div>
            }>
            <parts.Field
              id="textarea"
              data-focus="dock.input"
              kind="turn"
              focus={focus() === "dock.input"}
              dictating={dictation() !== null}
              value={draft()}
              placeholder={placeholder(draft(), thread() === null ? null : thread().mode)}
              lead={<Control repl={draft().startsWith("/")} onLine={sent} />}
              onInput={typed}
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

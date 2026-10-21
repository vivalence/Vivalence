import { For, from } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../../ambient/index.js";
import { loudness, reference, UNCLAIMED } from "../sidebar/sections.js";

export const titled = (thread, index) => `${thread === null ? UNCLAIMED : thread.word} · ${thread === null ? UNCLAIMED : reference(thread.mode)} · /terminal ${index}`;

const Tabbed = (props) => {
  const terminal = ambient.terminal.consume();
  const thread = from(props.held.$thread);
  return (
    <parts.Tab
      index={props.held.index}
      label={thread() === null ? UNCLAIMED : thread().word}
      current={props.current}
      mirrored={thread() !== null && props.threads.filter((other) => other === thread()).length > 1}
      dot={thread() === null ? "none" : loudness(props.activities.filter((activity) => activity.thread === thread())).tab}
      title={titled(thread(), props.held.index)}
      signal={`/terminal ${props.held.index}`}
      onPick={() => terminal.repl.dispatch(`/terminal ${props.held.index}`).catch((error) => terminal.controller.stdout.fault(error))}
    />
  );
};

export function Headline() {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const activities = from(app.client.runtime.entities.activity.$entities);
  const threads = () => terminals().map((held) => held.thread);
  return (
    <nav class="tabs" data-zone="0" aria-label="terminals">
      <For each={terminals()}>{(held) => <Tabbed held={held} current={held === terminal} threads={threads()} activities={activities()} />}</For>
      <button class="plus" data-signal="/terminal/new" aria-label="new terminal" title="new terminal · /terminal/new" onClick={() => terminal.repl.dispatch("/terminal/new").catch((error) => terminal.controller.stdout.fault(error))}>
        <parts.Icon name="plus" />
      </button>
    </nav>
  );
}

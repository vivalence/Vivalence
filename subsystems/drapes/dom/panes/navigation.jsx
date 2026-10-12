import { createMemo, createSignal, For, on, Show } from "solid-js";
import { Button } from "../Button.jsx";
import { Pip } from "../Pip.jsx";
import { Row } from "../Row.jsx";
import { Strip } from "../Strip.jsx";
import { watch } from "../watch.js";
import * as reading from "./reading.js";

export const RAIL = 264;

const label = (thread) => (thread.label === "" ? `#${thread.id}` : thread.label.name);

const Mode = (props) => {
  const seated = () => props.thread() !== null && props.thread() !== undefined && props.thread().mode === props.mode;
  const [open, setOpen] = createSignal(seated());
  const threads = () => props.threads().filter((thread) => thread.mode === props.mode);
  return (
    <div class="navigation-mode" data-mode={props.mode.slug}>
      <Row selected={seated()} title={props.mode.slug} onClick={() => setOpen(!open())}>
        <span class="navigation-arrow" classList={{ "navigation-open": open() }}>▸</span>
        <span class="navigation-name">{props.mode.name ?? props.mode.slug}</span>
        <span class="navigation-count">{threads().length}</span>
      </Row>
      <Show when={open()}>
        <div class="navigation-threads">
          <For each={threads()}>
            {(thread) => (
              <Row
                selected={props.thread() === thread}
                title={String(thread.id)}
                onClick={() => props.dispatch(`/thread/${thread.id}`)}>
                <span class="navigation-thread">{label(thread)}</span>
              </Row>
            )}
          </For>
          <Row onClick={() => props.dispatch(`/thread/new ${props.mode.reference.absolute}`)}>
            <span class="navigation-new">＋ new thread</span>
          </Row>
        </div>
      </Show>
    </div>
  );
};

const Daemon = (props) => {
  const status = watch(props.daemon.$status);
  const modes = watch(props.daemon.$modes);
  const [open, setOpen] = createSignal(true);
  const groups = createMemo(() => reading.groups(modes()));
  const held = () => reading.status(status());
  return (
    <section class="navigation-daemon" data-daemon={props.daemon.slug}>
      <Row onClick={() => setOpen(!open())} title={held().mark}>
        <Pip tone={held().tone} pulse={held() === reading.PENDING} />
        <span class="navigation-slug">{props.daemon.slug}</span>
        <span class="navigation-kind">{props.kind}</span>
      </Row>
      <Show when={open()}>
        <For each={groups()}>
          {([signature, modes]) => (
            <div class="navigation-group">
              <div class="navigation-trait">{signature}</div>
              <For each={modes}>
                {(mode) => <Mode mode={mode} thread={props.thread} threads={props.threads} dispatch={props.dispatch} />}
              </For>
            </div>
          )}
        </For>
      </Show>
    </section>
  );
};

export const Navigation = (props) => {
  const runtime = props.client.runtime;
  const active = watch(props.client.terminals.$active);
  const thread = watch(props.client.terminals.$active, "$thread");
  const terminals = watch(props.client.terminals.$entities);
  const threads = watch(runtime.entities.thread.$entities);
  const listed = watch(runtime.entities.daemon.$entities);
  const daemons = createMemo(on(listed, () => reading.daemons(runtime)));
  const kind = (daemon) => (daemon === runtime.daemon ? "runtime" : "daemon");
  const [folded, setFolded] = createSignal(false);

  const tabs = () =>
    terminals().map((terminal, index) => ({
      name: String(terminal.id),
      label: `terminal ${index + 1}`,
      short: String(index + 1),
      latched: active() === terminal,
    }));
  const pick = (name) => {
    const terminal = terminals().find((held) => String(held.id) === name);
    props.dispatch(`/terminal/${terminal.id}`);
  };

  return (
    <nav class="navigation-pane" classList={{ "navigation-folded": folded() }} style={{ "--navigation-rail": `${RAIL}px` }}>
      <div class="navigation-head">
        <Button
          size="mini"
          square
          tone="ghost"
          label={folded() ? "»" : "«"}
          title={folded() ? "unfold navigation" : "fold navigation"}
          onClick={() => setFolded(!folded())}
        />
        <Show when={!folded()}>
          <div class="navigation-tabs">
            <Strip keys={tabs()} width={RAIL - 40} onPick={pick} />
          </div>
        </Show>
      </div>
      <Show when={!folded()}>
        <div class="navigation-tree">
          <For each={daemons()}>
            {(daemon) => <Daemon daemon={daemon} kind={kind(daemon)} thread={thread} threads={threads} dispatch={props.dispatch} />}
          </For>
        </div>
      </Show>
    </nav>
  );
};

export const style = `
.navigation-pane {
  display: flex;
  flex-direction: column;
  width: var(--navigation-rail);
  min-height: 0;
  color: var(--text-ink);
}
.navigation-pane.navigation-folded {
  width: auto;
}
.navigation-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
}
.navigation-tabs {
  flex: 1;
  min-width: 0;
}
.navigation-tree {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 6px 12px;
}
.navigation-daemon {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: var(--size-space-sm);
}
.navigation-slug {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  color: var(--text-strong);
}
.navigation-kind {
  color: var(--text-muted);
}
.navigation-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-left: 12px;
}
.navigation-trait {
  padding: 6px 8px 2px;
  font-family: var(--font-family-code);
  font-size: var(--size-type-2xs);
  letter-spacing: var(--shape-label-track);
  text-transform: var(--shape-label-case);
  color: var(--text-muted);
}
.navigation-arrow {
  display: inline-block;
  width: 9px;
  color: var(--text-muted);
  transition: transform 0.1s;
}
.navigation-arrow.navigation-open {
  transform: rotate(90deg);
}
.navigation-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.navigation-count {
  color: var(--text-muted);
}
.navigation-threads {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-left: 18px;
}
.navigation-thread {
  overflow: hidden;
  text-overflow: ellipsis;
}
.navigation-new {
  color: var(--signal-primary-ink);
}
`;

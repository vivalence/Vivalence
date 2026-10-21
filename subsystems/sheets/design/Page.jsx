import { For, Show } from "solid-js";
import { Bar, Choice, Consent, Dot, Field, JsonTree, Mark, Meter, Panel, Row, Split, Tab, Turn } from "../index.js";

const Composer = (props) => (
  <Show
    when={props.world.composer.kind === "consent"}
    fallback={
      <Field
        palette={props.palette}
        prompt={props.world.composer.prompt}
        value={props.world.composer.value}
        placeholder={props.world.composer.placeholder}
        keys={props.world.composer.keys}
      />
    }
  >
    <Consent palette={props.palette} name={props.world.composer.name} argument={props.world.composer.argument} onApprove={() => {}} onSkip={() => {}} onEdit={() => {}} />
  </Show>
);

const Entry = (props) => (
  <Row palette={props.palette} key={props.row.key} label={props.row.label} value={props.row.value} selected={props.row.selected} off={props.row.off}>
    <Show when={props.row.choices}>
      <Choice palette={props.palette} options={props.row.choices.options} value={props.row.choices.value} />
    </Show>
  </Row>
);

export const World = (props) => (
  <box style={{ flexDirection: "column", backgroundColor: props.palette.surface }}>
    <box style={{ flexDirection: "row", height: 1, gap: 1 }}>
      <Mark palette={props.palette} fault={props.world.mark.fault} />
      <text fg={props.palette.textStrong}>
        <b>{props.world.name}</b>
      </text>
      <For each={props.world.dots}>{(signal) => <Dot palette={props.palette} signal={signal} />}</For>
      <For each={props.world.meters}>{(value) => <Meter palette={props.palette} value={value} />}</For>
    </box>
    <box style={{ flexDirection: "row", height: 1, backgroundColor: props.palette.surfaceSunk }}>
      <For each={props.world.tabs}>{(tab) => <Tab palette={props.palette} {...tab} />}</For>
      <text fg={props.palette.textMuted}> +</text>
    </box>
    <box style={{ flexDirection: "column", height: 16 }}>
    <Split
      palette={props.palette}
      align={props.world.split.align}
      share={props.world.split.share}
      dragging={props.world.split.dragging}
      frame={<JsonTree palette={props.palette} data={{ buffer: props.world.entity.label, mode: props.world.entity.mode }} />}
      dock={
        <box style={{ flexDirection: "column" }}>
          <For each={props.world.journal}>{(turn) => <Turn palette={props.palette} {...turn} />}</For>
          <Composer palette={props.palette} world={props.world} />
        </box>
      }
    />
    </box>
    <Panel palette={props.palette} tag={props.world.panel.tag} crumbs={props.world.panel.crumbs} hint={props.world.panel.hint}>
      <For each={props.world.panel.rows}>{(row) => <Entry palette={props.palette} row={row} />}</For>
    </Panel>
    <Bar
      palette={props.palette}
      entity={props.world.entity}
      harness={props.world.harness}
      activity={props.world.activity}
      display={props.world.display}
      system={props.world.system}
      lens={props.world.lens}
      hint={props.world.hint}
      chord={props.world.chord}
      open={props.world.open}
    />
  </box>
);

export const Page = (props) => (
  <box style={{ flexDirection: "column", gap: 1 }}>
    <For each={props.worlds}>{(world) => <World palette={props.palette} world={world} />}</For>
  </box>
);

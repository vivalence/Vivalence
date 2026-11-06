import { mergeProps, Show } from "solid-js";
import { Dot } from "./Dot.jsx";
import { Icon } from "./Icon.jsx";
import { Mark } from "./Mark.jsx";
import { Meter } from "./Meter.jsx";
import { Segment } from "./Segment.jsx";

export const SUBJECTS = [
  { k: "e", id: "entity", valence: "where am I" },
  { k: "a", id: "activity", valence: "is it working" },
  { k: "h", id: "harness", valence: "what is it given" },
  { k: "d", id: "display", valence: "how do I see it" },
  { k: "x", id: "box", valence: "mic · speaker · theme" },
  { k: "s", id: "system", valence: "what does it run on" },
  { k: "c", id: "control", valence: "how do I say it" },
  { k: "g", id: "go", valence: "focus a region" },
  { k: "m", id: "mode", valence: "the seated mode’s keys" },
];

export const chordOf = (id) => SUBJECTS.find((subject) => subject.id === id).k;

export const ACTIVITY = {
  idle: { cls: "idle", dot: "" },
  primary: { cls: "pri", dot: "pri live" },
  caution: { cls: "cau", dot: "cau breathe" },
  negative: { cls: "neg", dot: "neg" },
  muted: { cls: "mut", dot: "" },
};

const MIC = { off: "light", muted: "cau", live: "neg" };

const STANDING = [
  [(system) => system.standing !== "VERIFIED", "cau"],
  [(system) => system.health === "HEALTHY", "pos"],
  [() => true, "neg"],
];
export const standing = (system) => STANDING.find(([test]) => test(system))[1];

const HALF = { right: [14, 2.5, 12.5, 11], left: [1.5, 2.5, 12.5, 11], top: [1.5, 2.5, 25, 5.5], bottom: [1.5, 8, 25, 5.5] };
const SOLID = {
  closed: () => null,
  full: () => [1.5, 2.5, 25, 11],
  docked: (align) => HALF[align],
  messenger: (align) => (align === "left" ? [4, 6.5, 9, 4.5] : [15, 6.5, 9, 4.5]),
};
export const Glyph = (props) => (
  <svg class="dispg" width="28" height="16" viewBox="0 0 28 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <rect x="1.5" y="2.5" width="25" height="11" />
    <Show when={SOLID[props.view](props.align)} keyed>
      {([x, y, width, height]) => <rect x={x} y={y} width={width} height={height} fill="currentColor" />}
    </Show>
  </svg>
);

export const Bar = (props) => {
  const held = mergeProps({ open: null, keys: false, fault: false, live: false, phone: false, delay: 500 }, props);
  const activity = () => ACTIVITY[held.activity.tone];
  const pick = (subject, event) => held.onPick && held.onPick(subject, event);
  const segment = (subject, cls, children, extra = {}) => (
    <Segment subject={subject} chord={chordOf(subject)} cls={cls} open={held.open === subject} onPick={pick} {...extra}>
      {children}
    </Segment>
  );
  const spoken = () => held.activity.text !== "";
  const glyphs = () => (
    <>
      {segment(
        "entity",
        "ent",
        <>
          <span class="lab">{`[${held.entity.label}`}</span>
          <span class="q">{`‹${held.entity.mode}›]`}</span>
        </>,
      )}
      <span class="seg sp" />
      {segment("harness", "har", <Meter pct={held.harness.pct} rings={4} />)}
      {segment("display", "disp", <Glyph view={held.display.view} align={held.display.align} />, { onHold: held.onHold, delay: held.delay })}
      {segment(
        "box",
        "box",
        <span class={MIC[held.box.mic]}>
          <Icon name="cube" size={18} />
        </span>,
      )}
    </>
  );
  const worded = () => (
    <>
      {segment(
        "entity",
        "ent",
        <>
          <span class="lab">{`[${held.entity.label}`}</span>
          <span class="q">{`‹${held.entity.mode}›]`}</span>
        </>,
      )}
      <span class="seg sp" />
      {segment(
        "harness",
        "har",
        <>
          <span class="q">
            <Icon name="brace" size={14} />
          </span>
          <span>{held.harness.tier}</span>
          <span class="q">·</span>
          <span class="v">{held.harness.effort}</span>
          <Meter pct={held.harness.pct} rings={6} />
          <span class="q">
            <Icon name="bracer" size={14} />
          </span>
        </>,
      )}
      {segment(
        "activity",
        `proc ${activity().cls}`,
        <>
          <Dot tone={activity().dot} dim={activity().dot === ""} />
          <span class="lab">{spoken() ? held.activity.text : "idle"}</span>
        </>,
      )}
      {segment(
        "display",
        "disp",
        <>
          <Glyph view={held.display.view} align={held.display.align} />
          <span class="q">{held.display.lens}</span>
        </>,
        { onHold: held.onHold, delay: held.delay },
      )}
      {segment(
        "box",
        "box",
        <>
          <span class={MIC[held.box.mic]}>
            <Icon name="cube" size={18} />
          </span>
          <Show when={held.box.mic !== "off"}>
            <span class={MIC[held.box.mic]}>
              <Icon name="mic" size={13} />
            </span>
          </Show>
          <Show when={held.box.voice}>
            <span class="pri">
              <Icon name="speaker" size={13} />
            </span>
          </Show>
        </>,
      )}
    </>
  );
  return (
    <nav class="modebar" data-zone="0" aria-label="mode bar">
      <Mark size={held.phone ? 24 : 20} live={held.live} fault={held.fault} open={held.keys} delay={held.delay} onPick={held.onMark} onHold={held.onSidebar} />
      {held.phone ? glyphs() : worded()}
      {segment(
        "system",
        "sys",
        <>
          <span class="light">
            <Icon name="sys" size={22} />
          </span>
          <Dot tone={standing(held.system)} />
        </>,
      )}
    </nav>
  );
};

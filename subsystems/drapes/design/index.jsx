import { createSignal, For } from "solid-js";
import { render } from "solid-js/web";
import * as parts from "../parts.js";
import { WORLDS, NAMES } from "./worlds.js";
import { SPECIMENS } from "./specimens.js";

const THEMES = ["northsea", "parchment", "porcelain", "datasette"];
const ZONES = ["0", "1", "2", "3"];

const READS = {
  Bar: ["the mode bar: mark · entity · activity · harness · display · box · system, specific to global", "surface · boundary · text-ink"],
  Segment: ["one subject's state in the bar; a click opens its widget; display answers a hold", "text-strong · control-selected (open) · signal-*-tint + -ink · text-muted · text-disabled (off)"],
  Dot: ["one signal, no words", "signal-positive · signal-primary · signal-caution · signal-negative · text-muted"],
  Meter: ["a fraction over six rings; caution at 85 %", "divider (track) · text-ink (fill) · signal-caution"],
  Tab: ["one terminal; the label is the thread's; ∥ marks a shared thread", "surface-sunk · text-strong 600 (current) · text-muted · boundary · signal-primary (live)"],
  Mark: ["the viket as a mask in the ink; tap · double · hold; the fault dot sits on it", "brand-filter · text-strong · signal-negative"],
  Panel: ["the held node of the keymap: tag · crumbs · hint over rows", "surface-lift · boundary · divider · text-strong · signal-primary-ink"],
  Row: ["key · name · icon · value on a grid; a row with choices latches one", "signal-primary-ink (key) · text-strong (name) · text-muted (value) · control-selected · text-disabled"],
  Choice: ["inline options, one latched", "control-contrast-pressed + control-on-pressed (latched) · text-muted"],
  Field: ["the composer, the repl line, the filter; › a turn · << a line", "control-field · control-field-placeholder · control-field-caret · control-focus · text-light · signal-negative (dictating)"],
  Turn: ["one journal entry by register: you · agent · tool · command · fault · trace", "text-muted · text-strong (you) · text-ink (agent) · surface-sunk (tool) · signal-primary-ink · signal-negative-ink"],
  Consent: ["takes the composer's place while a call waits; y · n · e are bindings", "signal-caution-tint · signal-caution-ink · signal-caution · control-contrast + control-on"],
  Split: ["one BSP split; the seam drags, double-click resets, 20–80", "boundary · boundary-strong (dragging)"],
  Markdown: ["a markdown body", "text-ink · text-strong · text-link · text-code · surface-sunk"],
  JsonTree: ["a json value, two levels open", "text-ink · text-strong · signal-positive-ink · signal-primary-ink · signal-caution-ink · text-muted"],
  Image: ["an image, contain or cover", "surface-sunk"],
  Html: ["a sandboxed html fragment", "surface · boundary"],
};

const Switch = (props) => (
  <span class="page-switch" role="radiogroup" aria-label={props.label}>
    <For each={props.options}>
      {(option) => (
        <button type="button" role="radio" aria-checked={props.value() === option} classList={{ current: props.value() === option }} onClick={() => props.set(option)}>
          {option}
        </button>
      )}
    </For>
  </span>
);

const Page = () => {
  const [theme, setTheme] = createSignal("northsea");
  const [zone, setZone] = createSignal("1");
  const apply = (name) => {
    document.documentElement.setAttribute("data-theme", name);
    setTheme(name);
  };
  return (
    <>
      <header class="page-chrome" data-zone="0">
        <span class="page-title">
          vivalence<span>drapes · parts · {theme()} · zone {zone()}</span>
        </span>
        <Switch label="theme" options={THEMES} value={theme} set={apply} />
        <Switch label="zone" options={ZONES} value={zone} set={setZone} />
      </header>
      <main class="page-body">
        <For each={SPECIMENS}>
          {([name, build]) => (
            <section class="page-part" id={name.toLowerCase()}>
              <h2>{name}</h2>
              <p class="page-valence">{READS[name][0]}</p>
              <p class="page-reads">{READS[name][1]}</p>
              <div class="page-worlds">
                <For each={NAMES}>
                  {(world) => (
                    <div class="page-world">
                      <div class="page-label">{world}</div>
                      <div class="page-specimen" data-zone={zone()}>
                        {build(parts, WORLDS[world])}
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </section>
          )}
        </For>
      </main>
    </>
  );
};

render(() => <Page />, document.getElementById("page"));

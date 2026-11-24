import { from, Show } from "solid-js";
import { computed } from "nanostores";
import * as parts from "@vivalence/drapes/solid";
import * as ambient from "../../ambient/index.js";

export const BEATS = ["lighthouse", "user", "runtime"];

export const spoken = (records) => records.map((record) => Object.keys(record.data)[0]);

export const Brandline = (props) => (
  <div class="brandline">
    <parts.Viket size={40} live={!props.fault} />
    <span class="wm caps">
      <span class="v">VIVALENCE</span>
      {`/${props.host.toUpperCase()}`}
    </span>
  </div>
);

export const Island = (props) => (
  <div class="island" data-zone="2">
    {props.children}
  </div>
);

export function Booting() {
  const app = ambient.app.consume();
  const messages = from(computed(app.telemetry.$logger, (held) => held.filter((record) => record.track === "log")));
  const faults = from(computed(app.telemetry.$logger, (held) => held.filter((record) => record.track === "fault")));
  const named = () => spoken(messages()).filter((name) => BEATS.includes(name));
  const last = () => (messages().length === 0 ? "booting" : spoken(messages()).at(-1));
  const fault = () => faults().length > 0;
  const reaching = () => last() === "reaching" && messages().at(-1).data;
  return (
    <Island>
      <div class="card plain boot">
        <Brandline host={app.client.mask.manifest.slug} fault={fault()} />
        <div class="bootbar">
          <i style={{ width: `${Math.round((named().length / BEATS.length) * 100)}%` }} />
        </div>
        <div class="bootst">{last()}</div>
        <Show when={reaching()} keyed>
          {(held) => (
            <div class="fine" classList={{ neg: held.attempt > 1 }}>
              {held.attempt > 1
                ? `${held.reaching} unreachable · attempt ${held.attempt}`
                : held.reaching}
            </div>
          )}
        </Show>
        <Show when={fault()}>
          <div class="fine neg">{faults().at(-1).data.message}</div>
        </Show>
      </div>
    </Island>
  );
}

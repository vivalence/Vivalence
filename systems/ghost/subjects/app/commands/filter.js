import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const KINDS = ["thread", "mode"];

const Typed = v.object({
  kind: v.enum(KINDS).desc('The entity list the search narrows. Example: "mode"'),
  query: v.string().optional().desc('What the list is narrowed to, the rest of the signal; absent keeps what was typed. Example: "chess"'),
});

const Kind = v.object({ kind: v.enum(KINDS).desc('The entity list. Example: "thread"') });

const Hosted = v.object({
  kind: v.enum(KINDS).desc('The entity list. Example: "mode"'),
  host: v.string().desc('A host whose rows the list hides or shows again. Example: "/daemon/chess"'),
});

const Traited = v.object({
  kind: v.enum(KINDS).desc('The entity list. Example: "mode"'),
  trait: v.string().desc('A trait a row must implement to stay in the list, or no longer must. Example: "VIEWABLE"'),
});

const toggled = (list, item) => (list.includes(item) ? list.filter((held) => held !== item) : [...list, item]);

const lined = (signal) => ({ ...signal, body: signal.body.length < 2 ? signal.body : [signal.body[0], signal.body.slice(1).join(" ")] });

const flipped = (held, key) => (key in held ? Object.fromEntries(Object.entries(held).filter(([kept]) => kept !== key)) : { ...held, [key]: true });

const QUERIED = [
  [(query) => query === undefined, (filter) => filter],
  [() => true, (filter, kind, query) => ({ ...filter, [kind]: query })],
];

const CLOSED = [
  [(filter, kind) => kind in filter && filter[kind] !== "", (ctx, kind) => {
    ctx.client.app.bridge.$sections.set({ ...ctx.client.app.bridge.sections, filter: { ...ctx.client.app.bridge.sections.filter, [kind]: "" } });
    return `${kind}s unfiltered`;
  }],
  [() => true, (ctx) => {
    ctx.client.app.bridge.$focus.set("composer");
    return "search closed";
  }],
];

const searched = (focus) => KINDS.find((kind) => focus === `filter/${kind}`);

export const filter = new Vector()
  .open(
    { nature: "/filter", valence: "search an entity list — the keys go to its search, the list narrows to rows whose label or detail holds the query. Example: /filter mode chess", input: Typed },
    (ctx) => {
      const { kind, query } = belt.input.cast(Typed, lined(ctx.signal));
      ctx.client.app.bridge.$sections.set({ ...ctx.client.app.bridge.sections, filter: QUERIED.find(([test]) => test(query))[1](ctx.client.app.bridge.sections.filter, kind, query) });
      ctx.client.app.bridge.$focus.set(`filter/${kind}`);
      return `searching ${kind}s`;
    },
  )
  .open(
    { nature: "/filter/close", valence: "the search typed into steps back — a query is cleared first, an empty search hands the keys back to the composer. Example: /filter/close" },
    (ctx) => {
      const kind = searched(ctx.client.app.bridge.focus);
      if (kind === undefined) return "no search open";
      return CLOSED.find(([test]) => test(ctx.client.app.bridge.sections.filter, kind))[1](ctx, kind);
    },
  )
  .open(
    { nature: "/filter/expand", valence: "an entity list past six rows shown whole, or cut back to six. Example: /filter/expand mode", input: Kind },
    (ctx) => {
      const { kind } = belt.input.cast(Kind, ctx.signal);
      ctx.client.app.bridge.$sections.set({ ...ctx.client.app.bridge.sections, expand: flipped(ctx.client.app.bridge.sections.expand, kind) });
      return kind in ctx.client.app.bridge.sections.expand ? `${kind}s whole` : `${kind}s cut`;
    },
  )
  .open(
    { nature: "/filter/pick", valence: "the host chips under an entity list's search, shown or hidden — ◈. Example: /filter/pick mode", input: Kind },
    (ctx) => {
      const { kind } = belt.input.cast(Kind, ctx.signal);
      const pick = ctx.client.app.bridge.sections.pick === kind ? null : kind;
      ctx.client.app.bridge.$sections.set({ ...ctx.client.app.bridge.sections, pick });
      return pick === null ? "hosts hidden" : `hosts of ${kind}s`;
    },
  )
  .open(
    { nature: "/filter/daemon", valence: "a host's rows hidden from one entity list, or shown again. Example: /filter/daemon mode /daemon/chess", input: Hosted },
    (ctx) => {
      const { kind, host } = belt.input.cast(Hosted, ctx.signal);
      const hostsOff = { ...ctx.client.app.bridge.sections.hostsOff, [kind]: toggled(ctx.client.app.bridge.sections.hostsOff[kind], host) };
      ctx.client.app.bridge.$sections.set({ ...ctx.client.app.bridge.sections, hostsOff });
      return hostsOff[kind].includes(host) ? `${host} hidden from ${kind}s` : `${host} shown in ${kind}s`;
    },
  )
  .open(
    { nature: "/filter/trait", valence: "one entity list narrowed to rows implementing a trait, or widened again. Example: /filter/trait mode VIEWABLE", input: Traited },
    (ctx) => {
      const { kind, trait } = belt.input.cast(Traited, ctx.signal);
      const traits = { ...ctx.client.app.bridge.sections.traits, [kind]: toggled(ctx.client.app.bridge.sections.traits[kind], trait) };
      ctx.client.app.bridge.$sections.set({ ...ctx.client.app.bridge.sections, traits });
      return traits[kind].includes(trait) ? `${kind}s ${trait}` : `${kind}s any ${trait}`;
    },
  );

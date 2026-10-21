import { Vector, traits, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const toggled = (list, item) => (list.includes(item) ? list.filter((held) => held !== item) : [...list, item]);

const at = (path, value, write) => [(held) => held === path, { path, value, write }];

const WRITABLE = [
  at("terminal.dock.view", v.enum(belt.dock.VIEWS).desc('How the dock shows. Example: "closed"'), async (ctx, view) => {
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED: { view } }));
    return { DOCKED: { view } };
  }),
  at("terminal.dock.align", v.enum(belt.dock.SIDES).desc('The side the dock sits. Example: "left"'), async (ctx, align) => {
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED: { align } }));
    return { DOCKED: { align } };
  }),
  at("terminal.dock.lens", v.enum(belt.dock.LENSES).desc('Which stream the dock paints. Example: "trace"'), async (ctx, lens) => {
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED: { lens } }));
    return { DOCKED: { lens } };
  }),
  at("terminal.dock.share", v.number({ minimum: 0.1, maximum: 0.9 }).desc("The dock's share of the chrome. Example: 0.38"), async (ctx, share) => {
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED: { share } }));
    return { DOCKED: { share } };
  }),
  at("terminal.dock.markdown", v.enum(belt.dock.MARKDOWNS).desc('How the journal paints a reply\'s markdown. Example: "plain"'), async (ctx, markdown) => {
    await ctx.client.runtime.entities.terminal.updateOne({ id: ctx.terminal.id }, traits.patch(ctx.terminal, { DOCKED: { markdown } }));
    return { DOCKED: { markdown } };
  }),
  at("thread.label", v.string().desc('The label the seated thread shows. Example: "flamingo — six species"'), async (ctx, name) => {
    await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { LABELED: { name } }));
    return { LABELED: { name } };
  }),
  at("thread.tune", v.primitives.hallucination.Tier.desc('A tier. Example: "fast"'), async (ctx, tune) => {
    await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { INTELLIGENT: { tune } }));
    return { INTELLIGENT: { tune } };
  }),
  at("thread.effort", v.enum(belt.intelligent.EFFORTS).desc('Reasoning effort. Example: "high"'), async (ctx, effort) => {
    await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { INTELLIGENT: { effort } }));
    return { INTELLIGENT: { effort } };
  }),
  at("thread.rounds", v.integer({ minimum: 1, maximum: 50 }).desc("The round budget. Example: 12"), async (ctx, rounds) => {
    await ctx.client.runtime.entities.thread.updateOne({ id: ctx.terminal.thread.id }, traits.patch(ctx.terminal.thread, { INTELLIGENT: { rounds } }));
    return { INTELLIGENT: { rounds } };
  }),
];

const BRIDGE = [
  at("bridge.sidebar", v.boolean().desc("The sidebar shown or not. Example: true"), (ctx, open) => {
    ctx.client.app.bridge.$sidebar.set({ ...ctx.client.app.bridge.sidebar, open });
    return `bridge.sidebar ${open}`;
  }),
  at("bridge.hidden", v.string().desc('A sidebar group; set toggles it hidden. Example: "modes"'), (ctx, group) => {
    ctx.client.app.bridge.$hidden.set(toggled(ctx.client.app.bridge.hidden, group));
    return `bridge.hidden ${ctx.client.app.bridge.hidden.join(" · ") || "none"}`;
  }),
];

const writable = (ctx, path) => {
  const paths = ctx.client.app === null ? WRITABLE : [...WRITABLE, ...BRIDGE];
  const found = paths.find(([test]) => test(path));
  if (found === undefined) throw new Error(`[set] ${JSON.stringify(path)} is not a writable path — ${paths.map(([, entry]) => entry.path).join(" · ")}`);
  return found[1];
};

const lined = (signal) => ({ ...signal, body: signal.body.length > 2 ? [signal.body[0], signal.body.slice(1).join(" ")] : signal.body });

export const set = new Vector().open(
  { nature: "/set", valence: "inspector: write one path of the client's state — the terminal's dock, the seated thread, the screen; a list toggles membership. Example: /set terminal.dock.view closed" },
  (ctx) => {
    const entry = writable(ctx, String(ctx.signal.body[0]));
    const Setting = v.object({ path: v.string().desc('A writable path. Example: "terminal.dock.view"'), value: entry.value });
    const { value } = belt.input.cast(Setting, lined(ctx.signal));
    return entry.write(ctx, value);
  },
);

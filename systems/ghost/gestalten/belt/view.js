import process from "node:process";
import { plain as kinds } from "@vivalence/sheets/plain";

const PIPE = 80;

const FOOTER = { emit: 1, hold: 16 };

const encoder = new TextEncoder();

export const terminal = { held: null };

const mount = async () => {
  const sheets = await import("@vivalence/sheets");
  const { tty } = await import("../../chrome/surface.js");
  const { createCliRenderer } = await sheets.opentui();
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    screenMode: "split-footer",
    externalOutputMode: "capture-stdout",
    footerHeight: FOOTER.emit,
  });
  const surface = tty(renderer, { credentials: null });
  (async () => {
    for await (const press of surface.keys) void press;
  })();
  return { renderer, surface };
};

export const open = () => {
  if (terminal.held === null) terminal.held = mount();
  return terminal.held;
};

export const close = async () => {
  if (terminal.held === null) return;
  const { renderer } = await terminal.held;
  terminal.held = null;
  renderer.destroy();
};

const write = (text) => {
  const bytes = encoder.encode(`${text}\n`);
  for (let written = 0; written < bytes.length;) written += Deno.stdout.writeSync(bytes.subarray(written));
};

const known = (table, kind, where) => {
  if (!Object.hasOwn(table, kind)) throw new Error(`[view] ${where} knows no kind ${JSON.stringify(kind)} · ${Object.keys(table).join(" · ")}`);
  return table[kind];
};

const width = () => {
  if (!Deno.stdout.isTerminal()) return PIPE;
  const { columns } = Deno.consoleSize();
  return columns > 0 ? columns : PIPE;
};

export const plain = {
  name: "plain",
  interactive: Deno.stdin.isTerminal() && Deno.stdout.isTerminal(),
  viewport: () => ({ width: width(), height: 40 }),
  emit: (kind, props) => write(known(kinds, kind, "emit")({ ...props, width: width() })),
  hold: async (kind, props) => {
    const { renderer, surface } = await open();
    renderer.footerHeight = FOOTER.hold;
    const released = await surface.hold(kind, props);
    renderer.footerHeight = FOOTER.emit;
    return released;
  },
};

export const view = (surface, { json = false } = {}) => ({
  interactive: surface.interactive && !json,
  stdin: process.stdin,
  json,
  painted: false,
  width: () => surface.viewport().width,
  async emit(kind, props) {
    this.painted = true;
    if (this.json) return;
    await surface.emit(kind, props);
  },
  async hold(kind, props) {
    if (!this.interactive) throw new Error(`${kind}: needs a terminal — run it in one, or pass its inputs as parameters`);
    return surface.hold(kind, props);
  },
});

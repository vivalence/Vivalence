import paladin from "@vivalence/paladin";
import { host } from "@vivalence/sheets";
import { mime } from "@vivalence/typology";
import * as gestalten from "../../../gestalten/index.js";

const encoder = new TextEncoder();

export const ledger = async (shellDie, next) => {
  const file = await paladin.ledger.log(shellDie.instance.manifest.slug).open("ghost", "spans");
  const untap = shellDie.controller.stdout.pipe.tap((record) => file.writeSync(encoder.encode(`${JSON.stringify(record)}\n`)));
  try {
    await next();
  } finally {
    untap();
    file.close();
  }
};

const mounted = async (view) => {
  const dir = await Deno.makeTempDir({ prefix: "viva-hold-" });
  try {
    const bundle = await paladin.bundler(dir).bundle({ mime: mime.tty.solid, entry: view });
    return await import(`file://${dir}/bundle${bundle.entries[0].mount}`);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
};

const hold = async (view, props) => {
  const module = await mounted(view);
  const { createCliRenderer } = await host.opentui();
  const renderer = await createCliRenderer({ screenMode: "split-footer", exitOnCtrlC: false });
  const answered = Promise.withResolvers();
  const handle = module.default(renderer.root, { ...props, renderer, answer: answered.resolve });
  try {
    return await answered.promise;
  } finally {
    handle.destroy();
    renderer.destroy();
  }
};

const BOLD = (text) => `\x1b[1m${text}\x1b[0m`;

const PLAIN = (text) => text;

export const commanding = async (shellDie, next) => {
  if (paladin.is.tty && shellDie.signal.flags.json !== true) shellDie.hold = hold;
  await next();
  if (shellDie.output === undefined) return;
  if (shellDie.signal.flags.json === true) return console.log(JSON.stringify(shellDie.output, null, 2));
  console.log(gestalten.belt.outline(shellDie.output, paladin.is.tty ? BOLD : PLAIN));
};

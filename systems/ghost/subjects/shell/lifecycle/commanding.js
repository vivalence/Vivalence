import paladin from "@vivalence/paladin";
import { host } from "@vivalence/sheets";
import { Argv, is, mime, steer } from "@vivalence/typology";

const scalar = (value) => (!is.object(value) && !is.array(value)) || (is.object(value) && Object.keys(value).length === 0);

const shown = (value) => (value === null || value === undefined || value === "" || is.object(value) ? "—" : String(value));

const bold = (text) => (paladin.is.tty ? `\x1b[1m${text}\x1b[0m` : text);

const table = (rows, depth) => {
  const indent = "  ".repeat(depth);
  const keys = [...new Set(rows.flatMap((each) => Object.keys(each)))];
  const columns = keys.filter((key) => rows.every((each) => scalar(each[key])));
  const nested = keys.filter((key) => !columns.includes(key));
  const widths = columns.map((key) => Math.max(key.length, ...rows.map((each) => shown(each[key]).length)));
  const printed = (cells) => indent + cells.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [
    printed(columns),
    ...rows.flatMap((each) => [
      printed(columns.map((key) => shown(each[key]))),
      ...outline(Object.fromEntries(nested.filter((key) => !scalar(each[key])).map((key) => [key, each[key]])), depth + 1),
    ]),
  ];
};

const outline = (value, depth = 0) => {
  const indent = "  ".repeat(depth);
  if (is.array(value) && value.length === 0) return [`${indent}—`];
  if (is.array(value) && value.every(scalar)) return [`${indent}${value.map(shown).join(" · ")}`];
  if (is.array(value) && value.every(is.object)) return table(value, depth);
  if (is.array(value)) return value.flatMap((each) => [...outline(each, depth), ""]);
  if (!is.object(value)) return [`${indent}${shown(value)}`];
  const width = Math.max(0, ...Object.keys(value).map((key) => key.length));
  return Object.entries(value).flatMap(([key, held]) => {
    if (scalar(held)) return [`${indent}${key.padEnd(width)}  ${shown(held)}`];
    if (is.array(held) && held.every(scalar)) return [`${indent}${key.padEnd(width)}  ${held.length === 0 ? "—" : held.map(shown).join(" · ")}`];
    if (depth === 0) return [bold(key), ...outline(held, depth + 1), ""];
    return [`${indent}${key}`, ...outline(held, depth + 1)];
  });
};

const mounted = async (view) => {
  const dir = await Deno.makeTempDir({ prefix: "viva-hold-" });
  try {
    const bundle = await paladin.bundler(dir).bundle({ mime: mime.tty.solid, entry: view });
    const text = await Deno.readTextFile(`${dir}/bundle${bundle.entries[0].mount}`);
    const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
    try {
      return await import(url);
    } finally {
      URL.revokeObjectURL(url);
    }
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

export const commanding = async (shellDie, next) => {
  const [effect] = steer.dispatch.traverse(paladin.commands, shellDie.signal);
  if (!effect) return next();
  if (paladin.is.tty && shellDie.signal.flags.json !== true) shellDie.hold = hold;
  shellDie.call = async (argv) => {
    const signal = new Argv(argv);
    const inner = { ...shellDie, signal, output: undefined };
    await steer.dispatch.execute(paladin.commands, inner, signal);
    return inner.output;
  };
  await next();
  if (shellDie.output === undefined) return;
  console.log(shellDie.signal.flags.json === true ? JSON.stringify(shellDie.output, null, 2) : outline(shellDie.output).join("\n").replace(/\n{3,}/g, "\n\n").trimEnd());
};

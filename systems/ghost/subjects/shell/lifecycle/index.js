import paladin from "@vivalence/paladin";
import { Argv, Vector, shape, shard, steer } from "@vivalence/typology";
import * as gestalten from "../../../gestalten/index.js";
import { commands } from "../commands/index.js";
import { commanding } from "./commanding.js";
import { flagged, mounts, recipe } from "./mounts.js";

const fragments = (text, width) =>
  text.split(" ").reduce((held, word) => {
    const last = held.at(-1);
    if (last === "") return [word];
    if (last.length + 1 + word.length > width) return [...held, word];
    return [...held.slice(0, -1), `${last} ${word}`];
  }, [""]);

const dim = (text) => (paladin.is.tty ? `\x1b[2m${text}\x1b[0m` : text);

const said = (description) => description.split(" Example: ")[0];

const PARAMS = [
  [(input, name) => Array.isArray(input.required) && input.required.includes(name), (name) => `<${name}>`],
  [() => true, (name) => `[${name}]`],
];

const FLAGS = [
  [(property) => property.type === "boolean", (name) => `--${name}`],
  [() => true, (name, property) => `--${name}=<${property.type}>`],
];

const takes = (input) =>
  input === undefined
    ? []
    : [
        ...Object.entries(input.properties)
          .filter(([, property]) => property.group !== "flags")
          .map(([name, property]) => [PARAMS.find(([test]) => test(input, name))[1](name), said(property.description)]),
        ...Object.entries(input.properties)
          .filter(([, property]) => property.group === "flags")
          .map(([name, property]) => [FLAGS.find(([test]) => test(property))[1](name, property), said(property.description)]),
      ];

const EVERYWHERE = [
  ["--json", "print the command's output as JSON"],
  ["--help", "this listing"],
  ["--env=<file>", "load VIVA_* · SECRET_VIVA_* from a .env file"],
];

const everywhere = () => [
  ...EVERYWHERE,
  ...Object.entries(paladin.mounts.properties).map(([key, property]) => [`--${flagged(key)}=<path>`, property.description]),
];

const columned = (pairs, indent, columns) => {
  const widest = Math.max(...pairs.map(([name]) => name.length));
  const gutter = " ".repeat(indent + widest + 2);
  return pairs.flatMap(([name, description]) => {
    const [first, ...rest] = fragments(description, columns - gutter.length);
    return [`${" ".repeat(indent)}${name.padEnd(widest)}  ${first}`, ...rest.map((fragment) => gutter + fragment)];
  });
};

const listed = (catalog, columns) => {
  const widest = Math.max(...catalog.map((command) => command.nature.length));
  const gutter = " ".repeat(widest + 4);
  return catalog.map((command) => {
    const [body, example] = command.valence.split(" Example: ");
    const [first, ...rest] = fragments(body, columns - gutter.length);
    const taken = takes(command.input);
    return [
      `  ${command.nature.padEnd(widest)}  ${first}`,
      ...rest.map((fragment) => gutter + fragment),
      ...(taken.length === 0 ? [] : columned(taken, gutter.length + 2, columns)),
      gutter + dim(example),
    ].join("\n");
  });
};

const UNSIZED = 100;

const columns = () => (paladin.is.tty && Deno.consoleSize().columns > 0 ? Deno.consoleSize().columns : UNSIZED);

const help = (shellDie) => {
  if (shellDie.signal.flags.json === true) return console.log(JSON.stringify(shape.strip(execution), null, 2));
  const catalog = gestalten.shard.keymap.catalog(execution);
  console.log([`viva · ${catalog.length} commands`, "", "every command takes", ...columned(everywhere(), 2, columns()), "", listed(catalog, columns()).join("\n\n")].join("\n"));
};

export const execution = new Vector()
  .use(shard.controller.open)
  .use((shellDie, next) => (shellDie.signal.flags.help === true ? help(shellDie) : next()))
  .use(recipe)
  .use(mounts)
  .use(commanding)
  .use((shellDie, next) => {
    shellDie.dispatch = (signal) => steer.dispatch.execute(commands, shellDie, new Argv(signal));
    return next();
  })
  .open({ nature: "/help", valence: "the shell's commands. Example: viva help" }, help)
  .graft(commands)
  .do((shellDie) => shellDie.dispatch("/chrome"));

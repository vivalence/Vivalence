import { Vector, is, steer } from "@vivalence/typology";

const line = (steps) => "/" + steps.map((step) => step.nature).join("/");

const chord = (steps) => (is.string(steps.at(-1).chord) ? steps.at(-1).chord : null);

export const fromRepl = (repl) =>
  steer.trie.leaves(repl)
    .filter(({ steps }) => chord(steps) !== null)
    .reduce((keymap, { steps }) => keymap.open({ nature: chord(steps), valence: line(steps) }, line(steps)), new Vector());

const OPTIONS = [
  [(input) => input === undefined, () => []],
  [(input) => Object.values(input.properties).length === 0, () => []],
  [(input) => Object.values(input.properties)[0].anyOf === undefined, () => []],
  [() => true, (input) => Object.values(input.properties)[0].anyOf.filter((member) => Object.hasOwn(member, "const")).map((member) => member.const)],
];

const options = (input) => OPTIONS.find(([test]) => test(input))[1](input);

const ARGS = [
  [(input) => input === undefined, () => false],
  [(input) => !Array.isArray(input.required), () => false],
  [() => true, (input) => input.required.length > 0],
];

const args = (input) => ARGS.find(([test]) => test(input))[1](input);

const row = (steps) => ({ nature: line(steps), valence: steps.at(-1).valence, chord: chord(steps) === null ? "" : chord(steps), options: options(steps.at(-1).input), args: args(steps.at(-1).input), input: steps.at(-1).input });

export const catalog = (repl) =>
  steer.trie.fold(repl, {
    node: (f) => [
      ...(f.effect === undefined || f.signature === null || f.signature.rank === "hidden"
        ? []
        : [row(f.steps)]),
      ...f.trajectories.flat(),
    ],
  });

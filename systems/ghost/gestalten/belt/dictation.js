import { Signal, soma, steer } from "@vivalence/typology";

export const offered = (commands, nature) => steer.trie.at(commands, new Signal(nature).absolute) !== null;

export const { spoken } = soma;

export const tail = (dictation) =>
  (dictation.open ? dictation.open.parts : []).map((part) => (part.draft ? part.draft.text : "")).join(" ");

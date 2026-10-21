import { mime } from "@vivalence/typology";
import * as belt from "../../../../gestalten/belt/index.js";

export const RUNS = [mime.tty.solid];

export const runs = (view) => RUNS.includes(view.mime);

export const candidates = async (buffer, attach) => (await belt.view.candidates(buffer, attach)).filter(runs);

export const framed = async (buffer, attach) => (await candidates(buffer, attach)).filter((view) => view.traits.includes("FRAME"));

export const cells = async (buffer, attach) => (await candidates(buffer, attach)).filter((view) => view.traits.includes("CELL"));

const FRAMING = [
  [(buffer, views) => views.some((view) => view.slug === buffer.trait.RENDERED.frame), (buffer, views) => views.find((view) => view.slug === buffer.trait.RENDERED.frame)],
  [() => true, (buffer, views) => belt.view.pick(views)],
];

export const frame = (buffer, views) => FRAMING.find(([test]) => test(buffer, views))[1](buffer, views);

const CELLED = [
  [(buffer, views) => views.some((view) => view.slug === buffer.trait.RENDERED.cell), (buffer, views) => views.find((view) => view.slug === buffer.trait.RENDERED.cell)],
  [() => true, (buffer, views) => views[0]],
];

export const cell = (buffer, views) => CELLED.find(([test]) => test(buffer, views))[1](buffer, views);

export const following = (view, views) => views[(views.indexOf(view) + 1) % views.length].slug;

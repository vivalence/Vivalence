import { computed } from "nanostores";
import { mime } from "@vivalence/typology";
import * as belt from "../../../../gestalten/belt/index.js";

export const RUNS = [mime.tty.solid];

export const runs = (surface) => RUNS.includes(surface.mime);

export const candidates = (buffer, files) =>
  computed([belt.surface.candidates(buffer.$surfaces, buffer.mode.$surfaces), files], (surfaces) => surfaces);

export const framed = (surfaces) => surfaces.filter(runs).filter((surface) => surface.traits.includes("FRAME"));

export const cells = (surfaces) => surfaces.filter(runs).filter((surface) => surface.traits.includes("CELL"));

const FRAMING = [
  [(buffer, surfaces) => surfaces.some((surface) => surface.slug === buffer.trait.RENDERED.frame), (buffer, surfaces) => surfaces.find((surface) => surface.slug === buffer.trait.RENDERED.frame)],
  [() => true, (buffer, surfaces) => belt.surface.pick(surfaces)],
];

export const frame = (buffer, surfaces) => FRAMING.find(([test]) => test(buffer, surfaces))[1](buffer, surfaces);

const CELLED = [
  [(buffer, surfaces) => surfaces.some((surface) => surface.slug === buffer.trait.RENDERED.cell), (buffer, surfaces) => surfaces.find((surface) => surface.slug === buffer.trait.RENDERED.cell)],
  [() => true, (buffer, surfaces) => surfaces[0]],
];

export const cell = (buffer, surfaces) => CELLED.find(([test]) => test(buffer, surfaces))[1](buffer, surfaces);

export const following = (surface, surfaces) => surfaces[(surfaces.indexOf(surface) + 1) % surfaces.length].slug;

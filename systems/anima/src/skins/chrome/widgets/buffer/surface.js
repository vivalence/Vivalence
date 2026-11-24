import { mime } from "@vivalence/typology";
import { computed } from "nanostores";
import { belt } from "@vivalence/ghost";

export const RUNS = [mime.dom.svelte, mime.dom.solid];

export const runs = (surface) => RUNS.includes(surface.mime);

export const candidates = (buffer, files) =>
  computed([belt.surface.candidates(buffer.$surfaces, buffer.mode.$surfaces), files], (surfaces) => surfaces);

export const framed = (surfaces) => surfaces.filter(runs).filter((surface) => surface.traits.includes("FRAME"));

export const cells = (surfaces) => surfaces.filter(runs).filter((surface) => surface.traits.includes("CELL"));

const latest = (left, right) => new Date(right.updatedAt) - new Date(left.updatedAt);

export const pick = (surfaces) => surfaces.toSorted(latest)[0];

export const frame = (buffer, surfaces) => surfaces.find((surface) => surface.slug === buffer.trait.RENDERED.frame) ?? pick(surfaces);

export const cell = (buffer, surfaces) => surfaces.find((surface) => surface.slug === buffer.trait.RENDERED.cell) ?? surfaces[0];

export const href = (file, runtime) => runtime.attached(`/file/${belt.surface.identity(file)}`);

export const { bytes, load } = belt.surface;

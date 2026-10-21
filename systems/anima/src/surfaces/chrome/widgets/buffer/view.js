import { mime } from "@vivalence/typology";
import { belt } from "@vivalence/ghost";

export const RUNS = [mime.dom.svelte, mime.dom.solid];

export const runs = (view) => RUNS.includes(view.mime);

export const candidates = async (buffer, attach) => (await belt.view.candidates(buffer, attach)).filter(runs);

export const framed = async (buffer, attach) => (await candidates(buffer, attach)).filter((view) => view.traits.includes("FRAME"));

export const cells = async (buffer, attach) => (await candidates(buffer, attach)).filter((view) => view.traits.includes("CELL"));

const compiled = (view) => belt.view.entry(view).mime === mime.javascript;

const compiledFirstThenLatest = (left, right) => compiled(right) - compiled(left) || new Date(right.updatedAt) - new Date(left.updatedAt);

export const pick = (views) => views.toSorted(compiledFirstThenLatest)[0];

export const frame = (buffer, views) => views.find((view) => view.slug === buffer.trait.RENDERED.frame) ?? pick(views);

export const cell = (buffer, views) => views.find((view) => view.slug === buffer.trait.RENDERED.cell) ?? views[0];

export const href = (file, attach) => attach.url.branch(`/file/${belt.view.identity(file)}`).absolute;

export const { bytes, load } = belt.view;

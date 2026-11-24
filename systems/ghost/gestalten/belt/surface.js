import { computed } from "nanostores";
import { crypto, is } from "@vivalence/typology";

const verified = new Map();

export const identity = (reference) => (is.string(reference) ? reference : reference.id);

export const candidates = (...pools) =>
  computed(pools, (...held) =>
    held.flat().filter((surface, index, merged) => merged.indexOf(surface) === index),
  );

export const entry = (surface) => {
  const held = surface.files.find((file) => file.path === surface.entry);
  if (held === undefined) throw new Error(`[surface] ${surface.slug}: no file at its entry ${surface.entry} — its files: ${surface.files.map((file) => file.path).join(" · ") || "none"}`);
  return held;
};

export const pick = (surfaces) => surfaces[0];

export const bytes = async (file, runtime) => {
  const response = await fetch(runtime.attached(`/file/${identity(file)}`));
  if (!response.ok) throw new Error(`[surface] /attached/file/${identity(file)}: ${response.status}`);
  const text = await response.text();
  const digested = `sha256-${await crypto.digest(text)}`;
  const served = response.headers.get("x-viva-integrity");
  const claimed = "integrity" in file ? file.integrity : served;
  if (digested !== served || digested !== claimed)
    throw new Error(`[surface] file ${identity(file)}: sha256 ${digested.slice(7, 19)} is not the header's ${String(served).slice(7, 19)} · the row's ${String(claimed).slice(7, 19)}`);
  return text;
};

const evaluate = async (text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
  try {
    return await import(url);
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const load = async (surface, runtime) => {
  const known = verified.get(surface.id);
  const response = await fetch(runtime.attached(`/surface/${surface.id}`), {
    headers: known === undefined ? {} : { "if-none-match": `"${known.integrity}"` },
  });
  if (response.status === 304) return known.module;
  if (!response.ok) throw new Error(`[surface] /attached/surface/${surface.id}: ${response.status}`);
  const text = await response.text();
  const digested = `sha256-${await crypto.digest(text)}`;
  const served = response.headers.get("x-viva-integrity");
  if (digested !== served)
    throw new Error(`[surface] ${surface.slug}: sha256 ${digested.slice(7, 19)} is not the header's ${String(served).slice(7, 19)}`);
  const module = await evaluate(text);
  verified.set(surface.id, { integrity: served, module });
  return module;
};
